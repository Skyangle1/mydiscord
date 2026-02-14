const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_curhat',
    async execute(interaction) {
        try {
            // Create a modal
            const curhatModal = new ModalBuilder()
                .setCustomId('modal_curhat_user')
                .setTitle('Curhat Aman & Anonim');

            // Input for category (required)
            const categoryInput = new TextInputBuilder()
                .setCustomId('kategori_curhat')
                .setLabel('Kategori Curhat')
                .setPlaceholder('Contoh: Curhat Harian, Curhat Galau, Curhat Cerita, dll')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for message (required)
            const messageInput = new TextInputBuilder()
                .setCustomId('pesan_curhat')
                .setLabel('Isi Curhatmu')
                .setPlaceholder('Ceritakan apa yang ingin kamu sampaikan... (semuanya anonim)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(categoryInput);
            const secondActionRow = new ActionRowBuilder().addComponents(messageInput);

            curhatModal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(curhatModal);
        } catch (modalError) {
            console.error('Error showing curhat modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form curhat. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
