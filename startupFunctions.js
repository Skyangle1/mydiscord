const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class StartupFunctions {
    constructor(client) {
        this.client = client;
    }

    async sendAutoPanels() {
        // Wait a bit for the client to be fully ready
        setTimeout(async () => {
            console.log('Sending automatic panels...');

            // Clear old panels first to prevent spam
            await this.clearOldPanels();

            // Send panels only if they don't exist or update existing ones
            await this.sendClaimPanel();
            await this.sendBondedHousePanel();
            await this.sendConfessionPanel();
            await this.sendMatchmakingPanel();
            await this.sendFriendFindingPanel();
            await this.sendFeedbackPanel();
            await this.sendSaranPanel();
            await this.sendSocialSharingPanel();
            await this.sendReflectionPanel();
            await this.sendCurhatPanel();
            await this.sendFamilyDirectory();
            await this.sendFamilyDirectory();

            console.log('Automatic panels sent.');
        }, 5000); // Wait 5 seconds after startup
    }

    async clearOldPanels() {
        try {
            const { db } = require('./database/db');

            // Get all saved panel message IDs from the database
            const getAllPanels = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT * FROM auto_panels`;
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist yet');
                                resolve([]);
                            } else {
                                console.error('Error fetching panels from database:', err);
                                reject(err);
                            }
                        } else {
                            resolve(rows);
                        }
                    });
                });
            };

            const panels = await getAllPanels();

            // Delete each old panel message
            for (const panel of panels) {
                try {
                    const channel = this.client.channels.cache.get(panel.channel_id);
                    if (channel) {
                        try {
                            const message = await channel.messages.fetch(panel.message_id);
                            await message.delete();
                            console.log(`Deleted old panel message with ID: ${panel.message_id}`);
                        } catch (fetchError) {
                            // Message might already be deleted
                            console.log(`Could not fetch old panel message with ID: ${panel.message_id}, possibly already deleted`);
                        }
                    }
                } catch (channelError) {
                    console.error(`Error accessing channel ${panel.channel_id}:`, channelError);
                }
            }

            // Clear the auto_panels table after deleting messages
            const clearTable = () => {
                return new Promise((resolve, reject) => {
                    const query = `DELETE FROM auto_panels`;
                    db.run(query, [], (err) => {
                        if (err) {
                            console.error('Error clearing auto_panels table:', err);
                            reject(err);
                        } else {
                            console.log('Cleared auto_panels table');
                            resolve();
                        }
                    });
                });
            };

            await clearTable();
        } catch (error) {
            console.error('Error clearing old panels:', error);
        }
    }

    async sendClaimPanel() {
        try {
            const claimChannelId = process.env.CLAIM_LOG_CHANNEL_ID;
            if (!claimChannelId) {
                console.log('CLAIM_LOG_CHANNEL_ID not configured, skipping claim panel.');
                return;
            }

            const claimChannel = this.client.channels.cache.get(claimChannelId);
            if (!claimChannel) {
                console.error(`Claim channel (ID: ${claimChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Get the saved message ID for claim panel
            const getSavedMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT message_id FROM auto_panels WHERE panel_type = ?`;
                    db.get(query, ['claim_panel'], (err, row) => {
                        if (err) {
                            // If table doesn't exist, return null
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist yet, will create a new message');
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(row ? row.message_id : null);
                        }
                    });
                });
            };

            let savedMessageId = await getSavedMessageId();

            // Create the embed with claim description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> REWARD CENTER')
                .setDescription('This desk is dedicated to rewards, acknowledgements, and Kingdom benefits for Crownfolk.\n\nPlease use this service for the following purposes:\na. Claimable perks or benefits\nc. Recognition for contributions and achievements\nRewards are granted based on eligibility, activity, or royal decisions.\nKindly follow instructions carefully when claiming any reward.\n\n🕰️ Operating Hours: 08:00 am – 12:00 am (WIB) (UTC +7)\n🚫 Abuse, duplication, or false claims will result in restrictions.\n📜 Managed by the Royal Secretaries.')
                .setColor('#FFD700')
                .setFooter({ text: 'Sistem Klaim Hadiah', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_claim')
                    .setLabel('Ajukan Klaim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎁')
            );

            if (savedMessageId) {
                // Try to edit the existing message
                try {
                    const existingMessage = await claimChannel.messages.fetch(savedMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row] });
                    console.log(`Claim panel updated in channel ${claimChannelId}`);
                } catch (editError) {
                    // If message not found or other error, send a new message
                    console.log('Updating claim panel failed, sending new message...');
                    const newMessage = await claimChannel.send({ embeds: [embed], components: [row] });

                    // Save the new message ID to database
                    const saveMessageId = () => {
                        return new Promise((resolve, reject) => {
                            const query = `
                                INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                                VALUES (?, ?, ?)
                            `;
                            db.run(query, ['claim_panel', newMessage.id, claimChannelId], (err) => {
                                if (err) {
                                    if (err.message.includes('no such table')) {
                                        console.log('auto_panels table does not exist, message ID not saved');
                                    } else {
                                        console.error('Error saving message ID to database:', err);
                                    }
                                    // Resolve anyway to continue execution
                                    resolve();
                                } else {
                                    resolve();
                                }
                            });
                        });
                    };

                    await saveMessageId();
                    console.log(`New claim panel sent and saved with ID ${newMessage.id}`);
                }
            } else {
                // Send a new message
                const newMessage = await claimChannel.send({ embeds: [embed], components: [row] });

                // Save the new message ID to database
                const saveMessageId = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                            VALUES (?, ?, ?)
                        `;
                        db.run(query, ['claim_panel', newMessage.id, claimChannelId], (err) => {
                            if (err) {
                                if (err.message.includes('no such table')) {
                                    console.log('auto_panels table does not exist, message ID not saved');
                                } else {
                                    console.error('Error saving message ID to database:', err);
                                }
                                // Resolve anyway to continue execution
                                resolve();
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await saveMessageId();
                console.log(`Claim panel sent and saved with ID ${newMessage.id}`);
            }
        } catch (error) {
            console.error('Error sending claim panel:', error);
        }
    }

    async sendBondedHousePanel() {
        try {
            const bondedChannelId = process.env.BONDED_CHANNEL_ID;
            if (!bondedChannelId) {
                console.log('BONDED_CHANNEL_ID not configured, skipping bonded house panel.');
                return;
            }

            const bondedChannel = this.client.channels.cache.get(bondedChannelId);
            if (!bondedChannel) {
                console.error(`Bonded house channel (ID: ${bondedChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Get the saved message ID for bonded house panel
            const getSavedMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT message_id FROM auto_panels WHERE panel_type = ?`;
                    db.get(query, ['bonded_house_panel'], (err, row) => {
                        if (err) {
                            // If table doesn't exist, return null
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist yet, will create a new message');
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(row ? row.message_id : null);
                        }
                    });
                });
            };

            let savedMessageId = await getSavedMessageId();

            // Create the embed with bonded house description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> BONDED HOUSE')
                .setDescription('<:pinkcrown:1464766248054161621> BONDED HOUSE\nThis desk is dedicated for Crownfolk who wish to form or join virtual families and or households within the Kingdom.\n\nPlease use this service for the following purposes:\na. Establishing a new House\nb. Requesting to join an existing House\nc. Exploring registered Houses and Households\nEach House operates under Kingdom regulations and Crown Landlord authority.\nKindly ensure clarity of intent when building or joining a House.\n\n🕰️ Operating Hours: Always Available\n🚫 Misuse of house and household systems may result in removal.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#FF69B4')
                .setFooter({ text: 'Keluarga adalah komunitas kecil dalam komunitas besar Mɣralune' })
                .setTimestamp();

            // Create the buttons
            const buildButton = new ButtonBuilder()
                .setLabel('Bangun Keluarga')
                .setStyle(ButtonStyle.Success)
                .setCustomId('btn_build_family')
                .setEmoji('🏗️');

            const listButton = new ButtonBuilder()
                .setLabel('Daftar Keluarga')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('btn_list_families')
                .setEmoji('📋');

            const row = new ActionRowBuilder()
                .addComponents(buildButton, listButton);

            if (savedMessageId) {
                // Try to edit the existing message
                try {
                    const existingMessage = await bondedChannel.messages.fetch(savedMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row] });
                    console.log(`Bonded house panel updated in channel ${bondedChannelId}`);
                } catch (editError) {
                    // If message not found or other error, send a new message
                    console.log('Updating bonded house panel failed, sending new message...');
                    const newMessage = await bondedChannel.send({ embeds: [embed], components: [row] });

                    // Save the new message ID to database
                    const saveMessageId = () => {
                        return new Promise((resolve, reject) => {
                            const query = `
                                INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                                VALUES (?, ?, ?)
                            `;
                            db.run(query, ['bonded_house_panel', newMessage.id, bondedChannelId], (err) => {
                                if (err) {
                                    if (err.message.includes('no such table')) {
                                        console.log('auto_panels table does not exist, message ID not saved');
                                    } else {
                                        console.error('Error saving message ID to database:', err);
                                    }
                                    // Resolve anyway to continue execution
                                    resolve();
                                } else {
                                    resolve();
                                }
                            });
                        });
                    };

                    await saveMessageId();
                    console.log(`New bonded house panel sent and saved with ID ${newMessage.id}`);
                }
            } else {
                // Send a new message
                const newMessage = await bondedChannel.send({ embeds: [embed], components: [row] });

                // Save the new message ID to database
                const saveMessageId = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                            VALUES (?, ?, ?)
                        `;
                        db.run(query, ['bonded_house_panel', newMessage.id, bondedChannelId], (err) => {
                            if (err) {
                                if (err.message.includes('no such table')) {
                                    console.log('auto_panels table does not exist, message ID not saved');
                                } else {
                                    console.error('Error saving message ID to database:', err);
                                }
                                // Resolve anyway to continue execution
                                resolve();
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await saveMessageId();
                console.log(`Bonded house panel sent and saved with ID ${newMessage.id}`);
            }
        } catch (error) {
            console.error('Error sending bonded house panel:', error);
        }
    }

    async sendConfessionPanel() {
        try {
            const confessionChannelId = process.env.CONFESSION_SETUP_CHANNEL_ID;
            if (!confessionChannelId) {
                console.log('CONFESSION_SETUP_CHANNEL_ID not configured, skipping confession panel.');
                return;
            }

            const confessionChannel = this.client.channels.cache.get(confessionChannelId);
            if (!confessionChannel) {
                console.error(`Confession channel (ID: ${confessionChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Get the saved message ID for confession panel
            const getSavedMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT message_id FROM auto_panels WHERE panel_type = ?`;
                    db.get(query, ['confession_panel'], (err, row) => {
                        if (err) {
                            // If table doesn't exist, return null
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist yet, will create a new message');
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(row ? row.message_id : null);
                        }
                    });
                });
            };

            let savedMessageId = await getSavedMessageId();

            // Create the embed with romantic description for Maestro bot
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> VELVET CONFESSION')
                .setDescription('<:pinkcrown:1464766248054161621>VELVET CONFESSION\nThis desk is dedicated for Crownfolk who wish to express feelings, admiration, or affection.\n\nPlease use this service for the following purposes:\na. Sending confessions openly or anonymously\nb. Expressing appreciation or heartfelt messages\nc. Emotional expression within safe boundaries\nAll submissions are delivered as written, without moderation of feelings.\nKindly write respectfully and avoid coercive or inappropriate content.\n\n🕰️ Operating Hours: Always Available\n🚫 Harassment, pressure, or explicit content is prohibited.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#FF69B4')
                .setTimestamp();

            // Create the button with love letter emoji
            const writeButton = new ButtonBuilder()
                .setLabel('💌 Love Letter')
                .setStyle('Primary')
                .setCustomId('btn_open_letter_modal');

            const row = new ActionRowBuilder()
                .addComponents(writeButton);

            if (savedMessageId) {
                // Try to edit the existing message
                try {
                    const existingMessage = await confessionChannel.messages.fetch(savedMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row] });
                    console.log(`Confession panel updated in channel ${confessionChannelId}`);
                } catch (editError) {
                    // If message not found or other error, send a new message
                    console.log('Updating confession panel failed, sending new message...');
                    const newMessage = await confessionChannel.send({ embeds: [embed], components: [row] });

                    // Save the new message ID to database
                    const saveMessageId = () => {
                        return new Promise((resolve, reject) => {
                            const query = `
                                INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                                VALUES (?, ?, ?)
                            `;
                            db.run(query, ['confession_panel', newMessage.id, confessionChannelId], (err) => {
                                if (err) {
                                    if (err.message.includes('no such table')) {
                                        console.log('auto_panels table does not exist, message ID not saved');
                                    } else {
                                        console.error('Error saving message ID to database:', err);
                                    }
                                    // Resolve anyway to continue execution
                                    resolve();
                                } else {
                                    resolve();
                                }
                            });
                        });
                    };

                    await saveMessageId();
                    console.log(`New confession panel sent and saved with ID ${newMessage.id}`);
                }
            } else {
                // Send a new message
                const newMessage = await confessionChannel.send({ embeds: [embed], components: [row] });

                // Save the new message ID to database
                const saveMessageId = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                            VALUES (?, ?, ?)
                        `;
                        db.run(query, ['confession_panel', newMessage.id, confessionChannelId], (err) => {
                            if (err) {
                                if (err.message.includes('no such table')) {
                                    console.log('auto_panels table does not exist, message ID not saved');
                                } else {
                                    console.error('Error saving message ID to database:', err);
                                }
                                // Resolve anyway to continue execution
                                resolve();
                            } else {
                                resolve();
                            }
                        });
                    });
                };

                await saveMessageId();
                console.log(`Confession panel sent and saved with ID ${newMessage.id}`);
            }
        } catch (error) {
            console.error('Error sending confession panel:', error);
        }
    }

    async sendMatchmakingPanel() {
        try {
            const matchmakingChannelId = process.env.MATCHMAKING_CHANNEL_ID;
            if (!matchmakingChannelId) {
                console.log('MATCHMAKING_CHANNEL_ID not configured, skipping matchmaking panel.');
                return;
            }

            const matchmakingChannel = this.client.channels.cache.get(matchmakingChannelId);
            if (!matchmakingChannel) {
                console.error(`Matchmaking channel (ID: ${matchmakingChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Create the embed with matchmaking description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> FOLK COURTSHIP')
                .setDescription('<:pinkcrown:1464766248054161621>FOLK COURTSHIP\nThis desk is dedicated for Crownfolk seeking deeper romantic connections and long-term companionship.\n\nPlease use this service for the following purposes:\na. Seeking potential partners\nb. Expressing romantic intentions respectfully\nc. Building sincere courtship connections\nThis service does not guarantee matchmaking outcomes.\nKindly approach courtship with honesty, respect, and emotional maturity.\n\n🕰️ Operating Hours: Always Available\n🚫 Manipulative behavior or exploitation is strictly prohibited.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#811331')
                .setTimestamp();

            // Create the button with heart emoji
            const findMatchButton = new ButtonBuilder()
                .setLabel('❤️ Find Match')
                .setStyle('Primary')
                .setCustomId('btn_cari_jodoh');

            const row = new ActionRowBuilder()
                .addComponents(findMatchButton);

            // Send the matchmaking panel to the target channel
            const newMessage = await matchmakingChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['matchmaking_panel', newMessage.id, matchmakingChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();
            console.log(`Matchmaking panel sent and saved with ID ${newMessage.id}`);
        } catch (error) {
            console.error('Error sending matchmaking panel:', error);
        }
    }

    async sendFriendFindingPanel() {
        try {
            const friendFindingChannelId = process.env.FRIEND_FINDING_CHANNEL_ID;
            if (!friendFindingChannelId) {
                console.log('FRIEND_FINDING_CHANNEL_ID not configured, skipping friend finding panel.');
                return;
            }

            const friendFindingChannel = this.client.channels.cache.get(friendFindingChannelId);
            if (!friendFindingChannel) {
                console.error(`Friend finding channel (ID: ${friendFindingChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Create the embed with friend-finding description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> FOLK COMPANION')
                .setDescription('<:pinkcrown:1464766248054161621>FOLK COMPANION\nThis desk is dedicated for Crownfolk seeking friendship and meaningful companionship within the Kingdom.\n\nPlease use this service for the following purposes:\na. Finding new friends\nb. Social connection and support\nc. Reducing loneliness within the realm\nAll introductions are community-based and not guaranteed.\nKindly be respectful, sincere, and mindful of others boundaries.\n\n🕰️ Operating Hours: Always Available\n🚫 Harassment or inappropriate behavior will result in action.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#007bff')
                .setTimestamp();

            // Create the button with friendship emoji
            const findFriendButton = new ButtonBuilder()
                .setLabel('👥 Find Friend')
                .setStyle('Primary')
                .setCustomId('btn_cari_teman');

            const row = new ActionRowBuilder()
                .addComponents(findFriendButton);

            // Send the friend finding panel to the target channel
            const newMessage = await friendFindingChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['friend_finding_panel', newMessage.id, friendFindingChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();
            console.log(`Friend finding panel sent and saved with ID ${newMessage.id}`);
        } catch (error) {
            console.error('Error sending friend finding panel:', error);
        }
    }

    async sendFeedbackPanel() {
        try {
            const feedbackChannelId = process.env.FEEDBACK_LOG_CHANNEL_ID;
            if (!feedbackChannelId) {
                console.log('FEEDBACK_LOG_CHANNEL_ID not configured, skipping feedback panel.');
                return;
            }

            const feedbackChannel = this.client.channels.cache.get(feedbackChannelId);
            if (!feedbackChannel) {
                console.error(`Feedback channel (ID: ${feedbackChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Create the embed with feedback description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> ROYAL FEEDBACK')
                .setDescription('This desk is dedicated for Crownfolk to share feedback regarding their experience within the Kingdom.\n\nPlease use this service for the following purposes:\na. Service satisfaction feedback\nb. System or moderation evaluation\nc. Community experience review\nAll feedback is documented to support continuous improvement.\nKindly provide honest, respectful, and constructive feedback to help us improve effectively.\n\n🕰️ Operating Hours: 08:00 – 24:00 (WIB) (UTC +7)\n🚫 Abuse or manipulation of ratings will result in restrictions.\n📜 Reviewed by the Royal Staff.')
                .setColor('#0099ff')
                .setFooter({ text: 'Feedback Anda sangat berharga bagi perkembangan komunitas Mɣralune', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_feedback') // ID Tombol
                    .setLabel('Kirim Feedback')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('💬')
            );

            // Send the feedback panel to the target channel
            const newMessage = await feedbackChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['feedback_panel', newMessage.id, feedbackChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();
            console.log(`Feedback panel sent and saved with ID ${newMessage.id}`);
        } catch (error) {
            console.error('Error sending feedback panel:', error);
        }
    }

    async sendSaranPanel() {
        try {
            const saranChannelId = process.env.SARAN_CHANNEL_ID;
            if (!saranChannelId) {
                console.log('SARAN_CHANNEL_ID not configured, skipping saran panel.');
                return;
            }

            const saranChannel = this.client.channels.cache.get(saranChannelId);
            if (!saranChannel) {
                console.error(`Saran channel (ID: ${saranChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Create the embed with professional description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> ROYAL SUGGESTIONS')
                .setDescription('This desk is dedicated for Crownfolk to submit ideas, proposals, and improvements for the Kingdom.\n\nPlease use this service for the following purposes:\na. Feature or system suggestions\nb. Community improvement ideas\nEach submission will be recorded and reviewed by the Royal Moderation Council.\nKindly write your suggestion clearly, starting with a concise subject, followed by detailed explanation.\n\n🕰️ Operating Hours: 24 hours\n🚫 Spam may be ignored.\n📜 Reviewed by the Royal Moderation Council.')
                .setColor('#811331')
                .setFooter({ text: 'Saran Anda sangat berharga bagi perkembangan komunitas Mɣralune', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_saran') // ID Tombol
                    .setLabel('Ajukan Saran')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
            );

            // Send the suggestion panel to the target channel
            const newMessage = await saranChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['saran_panel', newMessage.id, saranChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();
            console.log(`Saran panel sent and saved with ID ${newMessage.id}`);
        } catch (error) {
            console.error('Error sending saran panel:', error);
        }
    }

    async sendSocialSharingPanel() {
        try {
            const socialSharingChannelId = process.env.SOCIAL_SHARING_CHANNEL_ID;
            if (!socialSharingChannelId) {
                console.log('SOCIAL_SHARING_CHANNEL_ID not configured, skipping social sharing panel.');
                return;
            }

            const socialSharingChannel = this.client.channels.cache.get(socialSharingChannelId);
            if (!socialSharingChannel) {
                console.error(`Social sharing channel (ID: ${socialSharingChannelId}) could not be found.`);
                return;
            }

            // Get the database connection
            const { db } = require('./database/db');

            // Create the embed with social sharing description
            const embed = new EmbedBuilder()
                .setTitle('🔗 Bagikan Profil Sosial Media')
                .setDescription('<:pinkcrown:1464766248054161621> FOLK NETWORK\nThis desk is dedicated for Crownfolk to share social media profiles and connect beyond the realm.\n\nPlease use this service for the following purposes:\na. Share Instagram or TikTok profiles\nb. Build social connections with other Crownfolk\nc. Encourage healthy real-life networking\nParticipation is voluntary and based on mutual respect.\nKindly share only accounts you own and are comfortable making public.\n\n🕰️ Operating Hours: Always Available\n🚫 Fake accounts, spam links, or forced promotion are prohibited.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#90EE90')
                .setFooter({ text: 'Social Sharing System', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_share_profile')
                    .setLabel('Bagikan Profil')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📱')
            );

            // Send the social sharing panel to the target channel
            const newMessage = await socialSharingChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['social_sharing_panel', newMessage.id, socialSharingChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();
            console.log(`Social sharing panel sent and saved with ID ${newMessage.id}`);
        } catch (error) {
            console.error('Error sending social sharing panel:', error);
        }
    }

    async sendReflectionPanel() {
        try {
            const reflectionChannelId = process.env.REFLECTION_LOG_CHANNEL_ID;
            if (!reflectionChannelId) {
                console.log('REFLECTION_LOG_CHANNEL_ID not configured, skipping reflection panel.');
                return;
            }

            const reflectionChannel = this.client.channels.cache.get(reflectionChannelId);
            if (!reflectionChannel) {
                console.error(`Reflection channel (ID: ${reflectionChannelId}) could not be found.`);
                return;
            }

            const { db } = require('./database/db');

            const getSavedMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT message_id FROM auto_panels WHERE panel_type = ?`;
                    db.get(query, ['reflection_panel'], (err, row) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(row ? row.message_id : null);
                        }
                    });
                });
            };

            let savedMessageId = await getSavedMessageId();

            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> REFLECTION TICKET')
                .setDescription(
                    'This desk is dedicated to private reflection sessions and personal support requests.\n\n' +
                    'Please use this service for the following purposes:\n' +
                    'a. Requesting private reflection sessions\n' +
                    'b. Emotional or mental support inquiries\n' +
                    'c. One-on-one guidance with appointed counselors\n' +
                    'All tickets are handled discreetly and with respect to personal boundaries.\n' +
                    'Kindly share only what you are comfortable disclosing.\n\n' +
                    '🕰️ Operating Hours: By Appointment\n' +
                    '🚫 Misuse or false requests may lead to access limitations.'
                )
                .setColor('#FF99CC')
                .setFooter({ text: '📜 Managed by the Royal Counsel.', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_reflection')
                    .setLabel('Request Session')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🕯️')
            );

            if (savedMessageId) {
                try {
                    const existingMessage = await reflectionChannel.messages.fetch(savedMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row] });
                    console.log(`Reflection panel updated in channel ${reflectionChannelId}`);
                } catch (editError) {
                    console.log('Updating reflection panel failed, sending new message...');
                    const newMessage = await reflectionChannel.send({ embeds: [embed], components: [row] });

                    const saveMessageId = () => {
                        return new Promise((resolve, reject) => {
                            const query = `INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id) VALUES (?, ?, ?)`;
                            db.run(query, ['reflection_panel', newMessage.id, reflectionChannelId], (err) => {
                                if (err) console.error('Error saving reflection panel ID:', err);
                                resolve();
                            });
                        });
                    };
                    await saveMessageId();
                    console.log(`New reflection panel sent and saved with ID ${newMessage.id}`);
                }
            } else {
                const newMessage = await reflectionChannel.send({ embeds: [embed], components: [row] });

                const saveMessageId = () => {
                    return new Promise((resolve, reject) => {
                        const query = `INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id) VALUES (?, ?, ?)`;
                        db.run(query, ['reflection_panel', newMessage.id, reflectionChannelId], (err) => {
                            if (err) console.error('Error saving reflection panel ID:', err);
                            resolve();
                        });
                    });
                };
                await saveMessageId();
                console.log(`Reflection panel sent and saved with ID ${newMessage.id}`);
            }

        } catch (error) {
            console.error('Error sending reflection panel:', error);
        }
    }

    async sendCurhatPanel() {
        try {
            const curhatChannelId = process.env.CURHAT_CHANNEL_ID;
            if (!curhatChannelId) {
                console.log('CURHAT_CHANNEL_ID not configured, skipping curhat panel.');
                return;
            }

            const curhatChannel = this.client.channels.cache.get(curhatChannelId);
            if (!curhatChannel) {
                console.error(`Curhat channel (ID: ${curhatChannelId}) could not be found.`);
                return;
            }

            const { db } = require('./database/db');

            const getSavedMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT message_id FROM auto_panels WHERE panel_type = ?`;
                    db.get(query, ['curhat_panel'], (err, row) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                resolve(null);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(row ? row.message_id : null);
                        }
                    });
                });
            };

            let savedMessageId = await getSavedMessageId();

            const embed = new EmbedBuilder()
                .setTitle('💭 Curhat Awan Kelabu')
                .setDescription('Platform aman untuk berbagi perasaan, pengalaman, atau unek-unek secara anonim.\n\nCeritakan apa yang ingin kamu sampaikan, dan biarkan angin membawa perasaanmu mengalir bebas.')
                .setColor('#4A90E2')
                .setFooter({ text: 'Curhatmu akan tiba secara anonim, tanpa jejak identitasmu', iconURL: this.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_curhat')
                    .setLabel('Curhat Aja')
                    .setEmoji('💭')
                    .setStyle(ButtonStyle.Primary)
            );

            if (savedMessageId) {
                try {
                    const existingMessage = await curhatChannel.messages.fetch(savedMessageId);
                    await existingMessage.edit({ embeds: [embed], components: [row] });
                    console.log(`Curhat panel updated in channel ${curhatChannelId}`);
                } catch (editError) {
                    console.log('Updating curhat panel failed, sending new message...');
                    const newMessage = await curhatChannel.send({ embeds: [embed], components: [row] });

                    const saveMessageId = () => {
                        return new Promise((resolve, reject) => {
                            const query = `INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id) VALUES (?, ?, ?)`;
                            db.run(query, ['curhat_panel', newMessage.id, curhatChannelId], (err) => {
                                if (err) console.error('Error saving curhat panel ID:', err);
                                resolve();
                            });
                        });
                    };
                    await saveMessageId();
                    console.log(`New curhat panel sent and saved with ID ${newMessage.id}`);
                }
            } else {
                const newMessage = await curhatChannel.send({ embeds: [embed], components: [row] });

                const saveMessageId = () => {
                    return new Promise((resolve, reject) => {
                        const query = `INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id) VALUES (?, ?, ?)`;
                        db.run(query, ['curhat_panel', newMessage.id, curhatChannelId], (err) => {
                            if (err) console.error('Error saving curhat panel ID:', err);
                            resolve();
                        });
                    });
                };
                await saveMessageId();
                console.log(`Curhat panel sent and saved with ID ${newMessage.id}`);
            }

        } catch (error) {
            console.error('Error sending curhat panel:', error);
        }
    }

    async sendFamilyDirectory() {
        try {
            const { updateFamilyDirectory } = require('./handlers/familyDirectoryUtils');
            await updateFamilyDirectory(this.client);
            console.log('Family Directory updated on startup.');
        } catch (error) {
            console.error('Error updating Family Directory on startup:', error);
        }
    }
}

module.exports = StartupFunctions;