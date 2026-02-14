const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_build_family',
    async execute(interaction) {
        try {
            // Create a modal
            const buildFamilyModal = new ModalBuilder()
                .setCustomId('modal_build_family')
                .setTitle('Bangun Keluargamu');

            // Input for family name (required)
            const familyNameInput = new TextInputBuilder()
                .setCustomId('family_name')
                .setLabel('Nama Keluarga')
                .setPlaceholder('Contoh: Keluarga Bahagia, Tim Hebat, dll')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(25)
                .setRequired(true);

            // Input for family slogan (optional)
            const sloganInput = new TextInputBuilder()
                .setCustomId('family_slogan')
                .setLabel('Slogan Keluarga')
                .setPlaceholder('Slogan singkat keluargamu (opsional)')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)
                .setRequired(false);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(familyNameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(sloganInput);

            buildFamilyModal.addComponents(firstActionRow, secondActionRow);

            await interaction.showModal(buildFamilyModal);
        } catch (modalError) {
            console.error('Error showing build family modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form pembuatan keluarga. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
