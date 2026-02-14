const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_saran_from_msg',
    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_saran_user_from_msg')
                .setTitle('Saran Terkait Pesan');

            const inputKategori = new TextInputBuilder()
                .setCustomId('kategori_saran_from_msg')
                .setLabel('Subjek / Kategori')
                .setPlaceholder('Contoh: Saran Fitur / Laporan Bug')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputPesan = new TextInputBuilder()
                .setCustomId('pesan_saran_from_msg')
                .setLabel('Detail Masukan')
                .setPlaceholder('Tuliskan masukanmu di sini...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputKategori),
                new ActionRowBuilder().addComponents(inputPesan)
            );

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error showing feedback modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }
};
