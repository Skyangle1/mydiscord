const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_chat_me',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 });

            // Extract target user ID and determine type from the original button custom ID
            // The custom ID format is: modal_chat_me_{type}_{userId}
            const parts = interaction.customId.split('_');
            if (parts.length < 4) {
                await interaction.editReply({
                    content: 'Format custom ID tidak valid.',
                    flags: 64
                });
                return;
            }

            const type = parts[3]; // Either 'jodoh' or 'teman'
            const targetUserId = parts[4]; // The actual user ID

            // Validate that targetUserId is a valid Discord Snowflake
            if (!targetUserId || targetUserId === 'undefined' || !/^\d{17,19}$/.test(targetUserId)) {
                await interaction.editReply({
                    content: 'ID pengguna tujuan tidak valid.',
                    flags: 64
                });
                return;
            }

            const messageContent = interaction.fields.getTextInputValue('chat_me_message');

            // Get the target user
            const targetUser = await interaction.client.users.fetch(targetUserId);
            if (!targetUser) {
                await interaction.editReply({
                    content: 'Pengguna yang dituju tidak ditemukan.',
                    flags: 64
                });
                return;
            }

            // Create embed for the message with different titles based on context
            let title, color, dmContent;
            if (type === 'teman') {
                title = '🤝 Pesan Kenalan Baru';
                color = '#007bff';
                dmContent = `👋 Kamu menerima pesan kenalan dari <@${interaction.user.id}>! Seseorang tertarik untuk menjadi teman barumu.`;
            } else {
                // Default to jodoh context
                title = '💌 Pesan Perkenalan Baru';
                color = '#811331';
                dmContent = `💬 Kamu menerima pesan perkenalan dari <@${interaction.user.id}>! Seseorang tertarik untuk mengenalimu lebih dekat.`;
            }

            const messageEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(messageContent)
                .setColor(color)
                .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            try {
                // Send DM to the target user with context-appropriate message
                await targetUser.send({
                    embeds: [messageEmbed],
                    content: dmContent
                });

                // Confirm to the sender with context-appropriate message
                const confirmationMessage = type === 'teman'
                    ? `Pesan kenalanmu telah dikirim ke <@${targetUser.id}>!`
                    : `Pesan perkenalanmu telah dikirim ke <@${targetUser.id}>!`;

                await interaction.editReply({
                    content: confirmationMessage,
                    flags: 64
                });
            } catch (dmError) {
                console.error('Error sending DM:', dmError);
                try {
                    await interaction.editReply({
                        content: 'Gagal mengirim pesan. Mungkin pengguna menonaktifkan pesan pribadi.',
                        flags: 64
                    });
                } catch (editError) {
                    console.error('Failed to edit reply after DM error:', editError);
                }
            }
        } catch (error) {
            console.error('Error in chat me modal submission:', error);
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
                        flags: 64
                    });
                } catch (replyError) {
                    console.error('Failed to send error message:', replyError);
                }
            } else if (!interaction.replied) {
                try {
                    await interaction.editReply({
                        content: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
                        flags: 64
                    });
                } catch (replyError) {
                    console.error('Failed to send error message:', replyError);
                }
            }
        }
    }
};
