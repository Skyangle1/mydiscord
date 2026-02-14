const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_chat_me',
    async execute(interaction) {
        try {
            // Extract user ID and type from custom ID
            // Format: btn_chat_me_{type}_{userId}
            const parts = interaction.customId.split('_');
            if (parts.length < 4) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Format custom ID tidak valid.',
                        ephemeral: true
                    });
                }
                return;
            }

            const type = parts[3]; // Either 'jodoh' or 'teman'
            const targetUserId = parts.slice(4).join('_'); // The actual user ID (handle cases where ID might have underscores)

            // Validate that targetUserId is a valid Discord Snowflake
            if (!targetUserId || targetUserId === 'undefined' || !/^\d{17,19}$/.test(targetUserId)) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'ID pengguna tujuan tidak valid.',
                        ephemeral: true
                    });
                }
                return;
            }

            // Determine title based on type
            const title = type === 'teman' ? 'Tuliskan Pesan Kenalanmu' : 'Tuliskan Pesan Perkenalanmu';

            // Determine placeholder based on type
            const placeholder = type === 'teman'
                ? 'Halo, aku melihat profilmu di komunitas Folk... bolehkah kita berkenalan?'
                : 'Halo, aku melihat profilmu di Velvet... bolehkah kita berkenalan?';

            // Show modal for the message
            const modal = new ModalBuilder()
                .setCustomId(`modal_chat_me_${type}_${targetUserId}`)
                .setTitle(title);

            // Input for the introduction message
            const messageInput = new TextInputBuilder()
                .setCustomId('chat_me_message')
                .setLabel(type === 'teman' ? 'Tuliskan Pesan Kenalanmu' : 'Tuliskan Pesan Perkenalanmu')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder(placeholder);

            const actionRow = new ActionRowBuilder().addComponents(messageInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        } catch (modalError) {
            console.error('Error showing chat me modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form pesan. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
