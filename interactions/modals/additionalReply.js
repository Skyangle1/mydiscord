const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^modal_additional_reply_submit_\d+$/,
    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });

        try {
            // Extract letter ID from custom ID
            const letterId = interaction.customId.split('_')[4];

            // Get values from modal
            const inputFromValue = interaction.fields.getTextInputValue('input_from');
            const inputContentValue = interaction.fields.getTextInputValue('input_content');
            const inputImageValue = interaction.fields.getTextInputValue('input_image');

            // Determine if anonymous
            const isAnonymous = !inputFromValue || inputFromValue.trim() === '';
            const displayName = isAnonymous ? '👤 Sang Pengagum Rahasia' : inputFromValue;

            // Get the original letter from database to get recipient and other details
            const getOriginalLetter = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT * FROM letters WHERE id = ?`;
                    db.get(query, [letterId], (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
            };

            const originalLetter = await getOriginalLetter();

            if (!originalLetter) {
                await interaction.editReply({ content: 'Surat asli tidak ditemukan.' });
                return;
            }

            // Insert reply into database
            const insertQuery = `
                INSERT INTO letters (sender_id, recipient_name, sender_name, content, is_anonymous)
                VALUES (?, ?, ?, ?, ?)
            `;

            const insertPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Database operation timed out'));
                }, 10000);

                db.run(insertQuery, [
                    interaction.user.id,
                    originalLetter.sender_id, // Original sender becomes recipient of reply
                    displayName,
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

            let replyId;
            try {
                replyId = await insertPromise;
            } catch (dbError) {
                console.error('Database error:', dbError);
                await interaction.editReply({ content: 'Database error occurred while saving your reply. Please try again.' });
                return;
            }

            // Find the original recipient (the person who sent the original letter)
            const originalRecipient = await client.users.fetch(originalLetter.sender_id).catch(() => null);
            
            if (!originalRecipient) {
                await interaction.editReply({ content: 'Tidak dapat menemukan pengguna yang menerima balasan ini.' });
                return;
            }

            // Create reply embed
            const replyEmbed = new EmbedBuilder()
                .setTitle('💌 Balasan Surat Cinta')
                .setDescription(`${inputContentValue}\n\nDari: ${displayName}`)
                .setColor('#9370DB') // Different color for replies
                .setFooter({ text: '📜 Arsip Balasan Hati' })
                .setTimestamp();

            if (inputImageValue && inputImageValue.trim() !== '') {
                replyEmbed.setImage(inputImageValue);
            }

            const replyButton = new ButtonBuilder()
                .setLabel('✉️ Reply')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`btn_additional_reply_${letterId}`);

            const buttonRow = new ActionRowBuilder().addComponents(replyButton);

            // Send reply to confession setup channel
            const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
            if (!targetChannel) {
                console.error('Confession setup channel not found in cache');
                await interaction.editReply({ content: 'Confession channel not found! Please check bot configuration.' });
                return;
            }

            try {
                // Get the original thread ID from the original letter
                const getOriginalThread = () => {
                    return new Promise((resolve, reject) => {
                        const query = `SELECT reply_message_id FROM letters WHERE id = ?`;
                        db.get(query, [letterId], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row ? row.reply_message_id : null); // reply_message_id stores thread_id
                            }
                        });
                    });
                };

                const threadId = await getOriginalThread();

                if (threadId) {
                    // Send reply to the existing thread
                    const thread = await client.channels.fetch(threadId).catch(() => null);
                    
                    if (thread) {
                        await thread.send({ embeds: [replyEmbed], components: [buttonRow] });
                        
                        // Update database with reply_message_id
                        db.run('UPDATE letters SET reply_message_id = ? WHERE id = ?', [threadId, replyId], (err) => {
                            if (err) console.error('Error updating reply_message_id:', err);
                        });
                    } else {
                        // If thread doesn't exist, send to main channel
                        const sentMessage = await targetChannel.send({ embeds: [replyEmbed], components: [buttonRow] });
                        
                        // Update database with reply_message_id
                        db.run('UPDATE letters SET reply_message_id = ? WHERE id = ?', [sentMessage.id, replyId], (err) => {
                            if (err) console.error('Error updating reply_message_id:', err);
                        });
                    }
                } else {
                    // If no thread exists, send to main channel
                    const sentMessage = await targetChannel.send({ embeds: [replyEmbed], components: [buttonRow] });
                    
                    // Update database with reply_message_id
                    db.run('UPDATE letters SET reply_message_id = ? WHERE id = ?', [sentMessage.id, replyId], (err) => {
                        if (err) console.error('Error updating reply_message_id:', err);
                    });
                }

                // Send DM to original sender (now recipient of reply)
                try {
                    const notifyEmbed = new EmbedBuilder()
                        .setTitle('📨 Balasan Surat Masuk!')
                        .setDescription(`Seseorang telah membalas suratmu di <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>.\n\n" *${inputContentValue.substring(0, 50)}${inputContentValue.length > 50 ? '...' : ''}* "`)
                        .setColor('#9370DB')
                        .setFooter({ text: 'Cek thread untuk melihat balasan!' });

                    await originalRecipient.send({ embeds: [notifyEmbed] });
                } catch (dmError) {
                    console.log(`Could not send DM to ${originalRecipient.tag}`);
                }

                await interaction.editReply({ content: 'Balasan suratmu telah terkirim! 🕊️' });

            } catch (sendError) {
                console.error('Error sending reply message to confession channel:', sendError);
                await interaction.editReply({ content: 'Failed to send reply to the confession channel.' });
            }

        } catch (error) {
            console.error('Error processing additional reply submission:', error);
            await interaction.editReply({ content: 'There was an error submitting your reply. Please try again later.' });
        }
    }
};