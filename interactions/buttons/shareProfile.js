const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_share_profile',
    async execute(interaction) {
        try {
            // Create a modal
            const shareProfileModal = new ModalBuilder()
                .setCustomId('modal_share_profile')
                .setTitle('Bagikan Profil Sosial Media');

            // Input for Instagram username (required)
            const instagramInput = new TextInputBuilder()
                .setCustomId('instagram_username')
                .setLabel('Instagram Username')
                .setPlaceholder('Contoh: johndoe, tidak perlu pakai @')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for TikTok username (required)
            const tiktokInput = new TextInputBuilder()
                .setCustomId('tiktok_username')
                .setLabel('TikTok Username')
                .setPlaceholder('Contoh: johndoe, tidak perlu pakai @')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for description (required, max 100 chars)
            const descriptionInput = new TextInputBuilder()
                .setCustomId('social_description')
                .setLabel('Deskripsi Singkat')
                .setPlaceholder('Ceritakan sedikit tentang dirimu...')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(100)
                .setRequired(true);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(instagramInput);
            const secondActionRow = new ActionRowBuilder().addComponents(tiktokInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);

            shareProfileModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

            await interaction.showModal(shareProfileModal);
        } catch (modalError) {
            console.error('Error showing share profile modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form bagikan profil. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
