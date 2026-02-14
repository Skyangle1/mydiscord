const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_reflection',
    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_submit_reflection')
                .setTitle('Reflection Session Request');

            const topicInput = new TextInputBuilder()
                .setCustomId('reflection_topic')
                .setLabel('Session Topic')
                .setPlaceholder('Daily Check-in, Venting, Advice, etc.')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const contentInput = new TextInputBuilder()
                .setCustomId('reflection_content')
                .setLabel('What\'s on your mind?')
                .setPlaceholder('Share your thoughts here (Private)...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const firstRow = new ActionRowBuilder().addComponents(topicInput);
            const secondRow = new ActionRowBuilder().addComponents(contentInput);

            modal.addComponents(firstRow, secondRow);

            await interaction.showModal(modal);
        } catch (error) {
            console.error('Error opening reflection modal:', error);
            await interaction.reply({ content: 'Failed to open form.', ephemeral: true });
        }
    }
};
