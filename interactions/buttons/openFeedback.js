const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_feedback',
    async execute(interaction) {
        try {
            // Create a modal
            const feedbackModal = new ModalBuilder()
                .setCustomId('feedbackModal')
                .setTitle('Feedback Form');

            // Add star rating input (required)
            const starRatingInput = new TextInputBuilder()
                .setCustomId('starRating')
                .setLabel('Rate your experience (1-5 stars)')
                .setPlaceholder('Enter a number from 1 to 5')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(1)
                .setRequired(true);

            // Add feedback title input (optional)
            const feedbackTitleInput = new TextInputBuilder()
                .setCustomId('feedbackTitle')
                .setLabel('Feedback Title')
                .setPlaceholder('Briefly summarize your feedback (optional)')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(100)
                .setRequired(false);

            // Add detailed feedback input (optional)
            const feedbackDetailInput = new TextInputBuilder()
                .setCustomId('feedbackDetail')
                .setLabel('Detailed Feedback')
                .setPlaceholder('Please provide detailed feedback... (optional)')
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(4000)
                .setRequired(false);

            // Add feedback type selection (optional)
            const feedbackTypeInput = new TextInputBuilder()
                .setCustomId('feedbackType')
                .setLabel('Feedback Type')
                .setPlaceholder('Bug Report, Feature Request, or General Comment (optional)')
                .setStyle(TextInputStyle.Short)
                .setMaxLength(50)
                .setRequired(false);

            // Add action rows for inputs
            const firstActionRow = new ActionRowBuilder().addComponents(starRatingInput);
            const secondActionRow = new ActionRowBuilder().addComponents(feedbackTitleInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(feedbackDetailInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(feedbackTypeInput);

            feedbackModal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

            // Show the modal to the user
            await interaction.showModal(feedbackModal);
        } catch (modalError) {
            console.error('Error showing feedback modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form feedback. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
