const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_hiring_news',
    async execute(interaction) {
        try {
            // Create a modal for hiring news application
            const hiringNewsModal = new ModalBuilder()
                .setCustomId('modal_hiring_news')
                .setTitle('Apply for Position');

            // Input for position name (required)
            const positionInput = new TextInputBuilder()
                .setCustomId('position_name')
                .setLabel('Position Applied For')
                .setPlaceholder('Example: Moderator, Event Coordinator, etc.')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for reason/motivation (required)
            const reasonInput = new TextInputBuilder()
                .setCustomId('reason')
                .setLabel('Why do you want to join?')
                .setPlaceholder('Explain your motivation and what you can contribute...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Input for availability (required)
            const availabilityInput = new TextInputBuilder()
                .setCustomId('availability')
                .setLabel('Availability (Hours/Day)')
                .setPlaceholder('Example: 4-6 hours per day, Weekends only, etc.')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for previous experience (optional)
            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('Previous Experience (Optional)')
                .setPlaceholder('Describe any relevant experience you have...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(positionInput);
            const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(availabilityInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(experienceInput);

            hiringNewsModal.addComponents(
                firstActionRow,
                secondActionRow,
                thirdActionRow,
                fourthActionRow
            );

            await interaction.showModal(hiringNewsModal);
        } catch (modalError) {
            console.error('Error showing hiring news modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form aplikasi. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
