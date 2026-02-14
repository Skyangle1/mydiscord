const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_saran',
    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_saran_user')
                .setTitle('^\n\nKirim Saran Mɣralune');

            const inputKategori = new TextInputBuilder()
                .setCustomId('kategori_saran')
                .setLabel('Subjek / Kategori')
                .setPlaceholder('Contoh: Saran Fitur / Laporan Bug')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const inputPesan = new TextInputBuilder()
                .setCustomId('pesan_saran')
                .setLabel('Detail Masukan')
                .setPlaceholder('Tuliskan masukanmu di sini...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputKategori),
                new ActionRowBuilder().addComponents(inputPesan)
            );

            await interaction.showModal(modal);
        } catch (modalError) {
            console.error('Error showing saran modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form saran. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
