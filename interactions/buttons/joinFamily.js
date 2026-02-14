const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_join_family',
    async execute(interaction) {
        try {
            // Create a modal
            const joinFamilyModal = new ModalBuilder()
                .setCustomId('modal_join_family')
                .setTitle('Masuk Keluarga');

            // Input for family name (required)
            const familyNameInput = new TextInputBuilder()
                .setCustomId('join_family_name')
                .setLabel('Nama Keluarga')
                .setPlaceholder('Masukkan nama keluarga yang ingin kamu masuki')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for reason to join (required)
            const reasonInput = new TextInputBuilder()
                .setCustomId('join_reason')
                .setLabel('Alasan Bergabung')
                .setPlaceholder('Jelaskan mengapa kamu ingin bergabung dengan keluarga ini...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(familyNameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);

            joinFamilyModal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(joinFamilyModal);
        } catch (modalError) {
            console.error('Error showing join family modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form masuk keluarga. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
