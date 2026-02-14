const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: /^(btn_reply|btn_additional_reply)_\d+$/,
    async execute(interaction) {
        try {
            // Extract letter ID from custom ID
            const parts = interaction.customId.split('_');
            const letterId = parts[parts.length - 1]; // Get the last part which should be the ID

            const modal = new ModalBuilder()
                .setCustomId(`modal_reply_submit_${letterId}`)
                .setTitle('Balas Surat Cinta');

            // Input for "From" (optional, for anonymity)
            const inputFrom = new TextInputBuilder()
                .setCustomId('input_from')
                .setLabel('Nama Pengirim (Kosongkan Jika Ingin Anonim)')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            // Input for content (required)
            const inputContent = new TextInputBuilder()
                .setCustomId('input_content')
                .setLabel('Isi Balasan')
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
            const secondActionRow = new ActionRowBuilder().addComponents(inputContent);
            const thirdActionRow = new ActionRowBuilder().addComponents(inputImage);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error opening reply modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan saat membuka form balasan.', ephemeral: true });
            }
        }
    }
};