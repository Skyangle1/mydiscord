const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_letter_submit',
    async execute(interaction, client) { // Recieve client as argument
        await interaction.deferReply({ flags: 64 });

        try {
            // Debug logging for letter submission
            console.log('--- LETTER SUBMISSION DEBUG ---');
            console.log('Processing modal submission:', interaction.customId);

            // Get values from modal
            const inputFromValue = interaction.fields.getTextInputValue('input_from');
            const inputToValue = interaction.fields.getTextInputValue('input_to');
            const inputContentValue = interaction.fields.getTextInputValue('input_content');
            const inputImageValue = interaction.fields.getTextInputValue('input_image');

            console.log('Input values retrieved:');
            console.log('- From:', inputFromValue);
            console.log('- To:', inputToValue);
            console.log('- Content length:', inputContentValue?.length || 0);

            // Clean the input to remove @ symbol if present
            let cleanInput = inputToValue;
            if (cleanInput.startsWith('@')) {
                cleanInput = cleanInput.substring(1); // Remove the @ symbol
            }

            // Also try to extract username from a mention format like <@user_id> or <@!user_id>
            const mentionRegex = /^<@!?(\d+)>$/;
            const mentionMatch = inputToValue.match(mentionRegex);
            let mentionedUserId = null;
            let targetUser = null;
            let foundBy = '';

            if (mentionMatch) {
                mentionedUserId = mentionMatch[1];
                // Try to find the user by ID first
                targetUser = await client.users.fetch(mentionedUserId).catch(() => null);
                if (targetUser) {
                    foundBy = 'user mention';
                }
            }

            // Try to find the user by username with flexible validation
            let targetUserLocal = targetUser || null;
            let foundByLocal = foundBy || '';

            try {
                // If it's a mention, we already tried fetching by ID above
                if (!targetUserLocal && mentionedUserId) {
                    // If fetching by ID failed, try to find in guild members
                    const guildMember = await interaction.guild.members.fetch(mentionedUserId).catch(() => null);
                    if (guildMember) {
                        targetUserLocal = guildMember.user;
                        foundByLocal = 'user mention (from guild)';
                    }
                }

                // If not a mention or user not found by ID, proceed with username search
                if (!targetUserLocal) {
                    // First, try to find by exact username#discriminator
                    if (cleanInput.includes('#')) {
                        targetUserLocal = client.users.cache.find(user =>
                            `${user.username}#${user.discriminator}` === cleanInput
                        );
                        if (targetUserLocal) foundByLocal = 'username#discriminator';
                    }

                    // If not found by discriminator, try exact username match (case-insensitive)
                    if (!targetUserLocal) {
                        targetUserLocal = client.users.cache.find(user =>
                            user.username.toLowerCase() === cleanInput.toLowerCase()
                        );
                        if (targetUserLocal) foundByLocal = 'username';
                    }

                    // If still not found, try partial match
                    if (!targetUserLocal) {
                        targetUserLocal = client.users.cache.find(user =>
                            user.username.toLowerCase().includes(cleanInput.toLowerCase())
                        );
                        if (targetUserLocal) foundByLocal = 'partial username match';
                    }

                    // If still not found, try to find by nickname in the current guild
                    if (!targetUserLocal) {
                        const guild = interaction.guild;
                        const member = guild.members.cache.find(m =>
                            m.user.username.toLowerCase() === cleanInput.toLowerCase() ||
                            (m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase())
                        );
                        if (member) {
                            targetUserLocal = member.user;
                            foundByLocal = m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase() ? 'nickname' : 'username in guild';
                        }
                    }

                    // If still not found, try partial nickname match in the current guild
                    if (!targetUserLocal) {
                        const guild = interaction.guild;
                        const member = guild.members.cache.find(m =>
                            m.user.username.toLowerCase().includes(cleanInput.toLowerCase()) ||
                            (m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase()))
                        );
                        if (member) {
                            targetUserLocal = member.user;
                            foundByLocal = m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase()) ? 'partial nickname match' : 'partial username match in guild';
                        }
                    }

                    // If still not found in cache, try fetching all members from the current guild
                    if (!targetUserLocal) {
                        try {
                            const guild = interaction.guild;
                            const guildMembers = await guild.members.fetch();

                            let member = guildMembers.find(m =>
                                m.user.username.toLowerCase() === cleanInput.toLowerCase()
                            );

                            if (!member) {
                                member = guildMembers.find(m =>
                                    m.user.username.toLowerCase().includes(cleanInput.toLowerCase())
                                );
                            }

                            if (!member) {
                                member = guildMembers.find(m =>
                                    m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase()
                                );
                            }

                            if (!member) {
                                member = guildMembers.find(m =>
                                    m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase())
                                );
                            }

                            if (member) {
                                targetUserLocal = member.user;
                                foundByLocal = member.nickname && member.nickname.toLowerCase().includes(cleanInput.toLowerCase()) ?
                                    'partial nickname match (fetched)' : 'partial username match (fetched)';
                            }
                        } catch (fetchError) {
                            console.error('Error fetching guild members:', fetchError);
                        }
                    }
                }

                if (!targetUserLocal) {
                    await interaction.editReply({
                        content: `Tidak dapat menemukan pengguna dengan username "${inputToValue}".\n\nCara pencarian yang didukung:\n• @mention langsung (lebih disarankan)\n• Username lengkap (cth: johndoe, john.doe, user_name)\n• Sebagian dari username atau nickname\n• Gunakan @mention untuk hasil terbaik`
                    });
                    return;
                }

                targetUser = targetUserLocal;
            } catch (error) {
                console.error('Error finding user:', error);
                await interaction.editReply({
                    content: `Terjadi kesalahan saat mencari pengguna "${inputToValue}". Silakan coba lagi.`
                });
                return;
            }

            // Determine if anonymous
            const isAnonymous = !inputFromValue || inputFromValue.trim() === '';
            const displayName = isAnonymous ? '👤 Sang Pengagum Rahasia' : inputFromValue;

            // Insert into database
            const insertQuery = `
                            INSERT INTO letters (sender_id, recipient_name, content, is_anonymous)
                            VALUES (?, ?, ?, ?)
                        `;

            const insertPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Database operation timed out'));
                }, 10000);

                db.run(insertQuery, [
                    interaction.user.id,
                    targetUser.username,
                    inputContentValue,
                    isAnonymous ? 1 : 0
                ], function (err) {
                    clearTimeout(timeout);
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                });
            });

            let letterId;
            try {
                letterId = await insertPromise;
            } catch (dbError) {
                console.error('Database error:', dbError);
                await interaction.editReply({ content: 'Database error occurred while saving your letter. Please try again.' });
                return;
            }

            // Create embed
            const letterEmbed = new EmbedBuilder()
                .setTitle('💌｜velvet-confession')
                .setDescription(`${inputContentValue}\n\nDari: ${displayName}`)
                .setColor('#FF69B4')
                .setFooter({ text: '📜 Arsip Hati' })
                .setTimestamp();

            if (inputImageValue && inputImageValue.trim() !== '') {
                letterEmbed.setImage(inputImageValue);
            }

            const replyButton = new ButtonBuilder()
                .setLabel('✉️ Reply')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`btn_reply_${letterId}`);

            const buttonRow = new ActionRowBuilder().addComponents(replyButton);

            // Send to confession setup channel
            const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
            if (!targetChannel) {
                console.error('Confession setup channel not found in cache');
                await interaction.editReply({ content: 'Confession channel not found! Please check bot configuration.' });
                return;
            }

            try {
                const sentMessage = await targetChannel.send({ embeds: [letterEmbed], components: [buttonRow] });

                // Create a thread for the message
                const thread = await sentMessage.startThread({
                    name: `Letter to ${targetUser.username}`,
                    autoArchiveDuration: 60, // Auto archive after 1 hour
                });

                // Update database with original_message_id and thread_id
                db.run('UPDATE letters SET original_message_id = ?, reply_message_id = ? WHERE id = ?', [sentMessage.id, thread.id, letterId], (err) => {
                    if (err) console.error('Error updating original_message_id and thread_id:', err);
                });

                // Send DM to target user
                try {
                    const notifyEmbed = new EmbedBuilder()
                        .setTitle('📨 Surat Baru Masuk!')
                        .setDescription(`Seseorang telah mengirim surat untukmu di <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>.\n\n" *${inputContentValue.substring(0, 50)}${inputContentValue.length > 50 ? '...' : ''}* "`)
                        .setColor('#FF69B4')
                        .setFooter({ text: `Gabung thread untuk membalas: ${thread.name}` });

                    await targetUser.send({ embeds: [notifyEmbed] });
                } catch (dmError) {
                    console.log(`Could not send DM to ${targetUser.tag}`);
                }

                await interaction.editReply({ content: 'Suratmu telah terkirim! 🕊️' });

            } catch (sendError) {
                console.error('Error sending message to confession channel:', sendError);
                await interaction.editReply({ content: 'Failed to send letter to the confession channel.' });
            }

        } catch (error) {
            console.error('Error processing letter submission:', error);
            await interaction.editReply({ content: 'There was an error submitting your letter. Please try again later.' });
        }
    }
};
