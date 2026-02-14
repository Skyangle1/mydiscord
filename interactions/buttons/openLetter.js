const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_letter_modal',
    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_letter_submit')
                .setTitle('Tulis Surat Cinta');

            // Input for "From" (optional)
            const inputFrom = new TextInputBuilder()
                .setCustomId('input_from')
                .setLabel('Dari (Kosongkan Jika Ingin Anonim)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            // Input for "To" (required)
            const inputTo = new TextInputBuilder()
                .setCustomId('input_to')
                .setLabel('Untuk (Masukkan Username)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for content (required)
            const inputContent = new TextInputBuilder()
                .setCustomId('input_content')
                .setLabel('Isi Surat')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Input for image URL (optional)
            const inputImage = new TextInputBuilder()
                .setCustomId('input_image')
                .setLabel('Link Gambar (opsional)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(inputFrom);
            const secondActionRow = new ActionRowBuilder().addComponents(inputTo);
            const thirdActionRow = new ActionRowBuilder().addComponents(inputContent);
            const fourthActionRow = new ActionRowBuilder().addComponents(inputImage);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error opening letter modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan saat membuka form surat.', ephemeral: true });
            }
        }
    }
};
