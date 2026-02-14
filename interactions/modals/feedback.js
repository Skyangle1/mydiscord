const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    customId: 'feedbackModal',
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

        try {
            // Get the values from the modal
            const starRating = interaction.fields.getTextInputValue('starRating');
            const feedbackTitle = interaction.fields.getTextInputValue('feedbackTitle');
            const feedbackDetail = interaction.fields.getTextInputValue('feedbackDetail');
            const feedbackType = interaction.fields.getTextInputValue('feedbackType');

            // Validate star rating
            const rating = parseInt(starRating);
            if (isNaN(rating) || rating < 1 || rating > 5) {
                await interaction.editReply({
                    content: '❌ Invalid star rating. Please enter a number between 1 and 5.',
                    flags: 64
                });
                return;
            }

            // Create star rating display
            const starDisplay = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

            // Use default values if optional fields are empty
            const title = feedbackTitle.trim() || 'No title provided';
            const detail = feedbackDetail.trim() || 'No details provided';
            const type = feedbackType.trim() || 'General Feedback';

            // Use feedback channel from environment variable, fallback to log channel if not found
            let feedbackChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_CHANNEL_ID);
            if (!feedbackChannel) {
                feedbackChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
            }

            // Get staff role for tagging
            const staffRole = interaction.guild.roles.cache.get(process.env.STAFF_ROLE_ID);

            // Create embed for feedback
            const feedbackEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(`💬 Feedback Baru Mɣralune - ${type}`)
                .addFields(
                    { name: 'Rating', value: `${starDisplay} (${rating}/5)`, inline: true },
                    { name: 'Title', value: title, inline: true },
                    { name: 'Details', value: detail },
                    { name: 'Submitted by', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                    { name: 'Date', value: new Date().toLocaleDateString(), inline: true }
                )
                .setTimestamp();

            // Check if feedback channel exists and bot has permissions
            if (feedbackChannel) {
                try {
                    // Check if bot has permissions to send messages in the channel
                    const botPermissions = feedbackChannel.permissionsFor(interaction.client.user);

                    if (!botPermissions?.has('SendMessages')) {
                        console.log('ERROR: Bot lacks SendMessages permission in feedback channel');
                        await interaction.editReply({ content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                        return;
                    }

                    if (!botPermissions?.has('ViewChannel')) {
                        console.log('ERROR: Bot lacks ViewChannel permission in feedback channel');
                        await interaction.editReply({ content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                        return;
                    }

                    if (!botPermissions?.has('EmbedLinks')) {
                        console.log('ERROR: Bot lacks EmbedLinks permission in feedback channel');
                        // Send without embed if no embed permission
                        const messageContent = staffRole ?
                            `<@&${staffRole.id}>\n**Feedback Baru!**\nPengirim: ${interaction.user.tag}\nRating: ${rating}/5\nTipe: ${type}\nJudul: ${title}\nDetail: ${detail}` :
                            `**Feedback Baru!**\nPengirim: ${interaction.user.tag}\nRating: ${rating}/5\nTipe: ${type}\nJudul: ${title}\nDetail: ${detail}`;

                        await feedbackChannel.send(messageContent);
                    } else {
                        // Send feedback with staff tag if role exists
                        const messageContent = staffRole ?
                            { content: `<@&${staffRole.id}>`, embeds: [feedbackEmbed] } :
                            { embeds: [feedbackEmbed] };
                        await feedbackChannel.send(messageContent);
                    }

                    // STICKY BUTTON LOGIC: Find and delete the old feedback button-only message, then send a new one to keep it at the bottom
                    try {
                        // Find the latest feedback button-only message in the channel
                        const messages = await feedbackChannel.messages.fetch({ limit: 20 });
                        const feedbackButtonMessage = messages.find(msg =>
                            msg.author.id === interaction.client.user.id &&
                            msg.components.length > 0 && // Message has components (buttons)
                            msg.embeds.length === 0 // Message has no embed, only buttons
                        );

                        // Delete the old feedback button-only message if found
                        if (feedbackButtonMessage) {
                            await feedbackButtonMessage.delete();
                        }

                        // Send a new feedback button-only message at the bottom
                        const newRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_feedback') // ID Tombol
                                .setLabel('Kirim Feedback')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('💬')
                        );

                        await feedbackChannel.send({ components: [newRow] });
                    } catch (stickyError) {
                        console.error('Error in feedback sticky button logic:', stickyError);

                        // If sticky button logic fails, send a new button-only message anyway
                        try {
                            const fallbackRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('btn_open_feedback') // ID Tombol
                                    .setLabel('Kirim Feedback')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('💬')
                            );

                            await feedbackChannel.send({ components: [fallbackRow] });
                        } catch (fallbackError) {
                            console.error('Error in fallback feedback sticky button logic:', fallbackError);
                        }
                    }
                } catch (channelError) {
                    console.error('Error sending feedback to channel:', channelError);
                    // Still send success message to user even if channel fails
                }
            } else {
                console.log('Feedback channel not found or not configured');
                // If no specific channel is set, send to the same channel where command was used
                await interaction.channel.send({ embeds: [feedbackEmbed] });
            }

            // Reply to the user
            await interaction.editReply({
                content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨',
                flags: 64
            });

            // Log feedback to a file for record keeping
            const feedbackLog = {
                userId: interaction.user.id,
                userTag: interaction.user.tag,
                rating: rating,
                title: title,
                details: detail,
                type: type,
                timestamp: new Date().toISOString()
            };

            // Create logs directory if it doesn't exist
            const logsDir = path.join(__dirname, '../../logs'); // Adjusted path from original logic
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }

            // Append feedback to log file
            const logFilePath = path.join(logsDir, 'feedback.log');
            fs.appendFileSync(logFilePath, JSON.stringify(feedbackLog) + '\n');

        } catch (error) {
            console.error('Error processing feedback modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ There was an error submitting your feedback. Please try again later.',
                    flags: 64
                });
            }
        }
    }
};
