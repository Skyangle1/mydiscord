const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class StartupFunctions {
    constructor(client) {
        this.client = client;
    }

    async sendAutoPanels() {
        // Wait a bit for the client to be fully ready
        setTimeout(async () => {
            console.log('Sending automatic panels...');
            
            // Send claim panel if configured
            await this.sendClaimPanel();
            
            // Send bonded house panel if configured
            await this.sendBondedHousePanel();
            
            console.log('Automatic panels sent.');
        }, 5000); // Wait 5 seconds after startup
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
                .setTitle('🎁 Sistem Klaim Hadiah')
                .setDescription('Klik tombol di bawah untuk mengajukan klaim hadiahmu.\nGunakan `/checkclaim` untuk melihat status klaimmu.')
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
                .setTitle('🏠 Keluarga Mɣralune')
                .setDescription('Platform resmi untuk mengelola keluarga di server Mɣralune.\n\nGunakan tombol-tombol di bawah untuk membangun, bergabung, atau melihat daftar keluarga.')
                .setColor('#FF69B4')
                .setFooter({ text: 'Keluarga adalah komunitas kecil dalam komunitas besar Mɣralune' })
                .setTimestamp();

            // Create the buttons
            const buildButton = new ButtonBuilder()
                .setLabel('Bangun Keluarga')
                .setStyle(ButtonStyle.Success)
                .setCustomId('btn_build_family')
                .setEmoji('🏗️');

            const joinButton = new ButtonBuilder()
                .setLabel('Masuk Keluarga')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('btn_join_family')
                .setEmoji('👥');

            const listButton = new ButtonBuilder()
                .setLabel('Daftar Keluarga')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('btn_list_families')
                .setEmoji('📋');

            const row = new ActionRowBuilder()
                .addComponents(buildButton, joinButton, listButton);

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
}

module.exports = StartupFunctions;