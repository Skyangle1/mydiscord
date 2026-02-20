const { EmbedBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^reject_hiring_\d+$/,
    async execute(interaction) {
        try {
            // Extract application ID from custom ID
            const parts = interaction.customId.split('_');
            const applicationId = parts[parts.length - 1];

            // Get application details
            const application = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM hiring_applications WHERE id = ?', [applicationId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!application) {
                return await interaction.reply({ content: 'Application not found.', ephemeral: true });
            }

            // Show modal for rejection reason
            const modal = new ModalBuilder()
                .setCustomId(`modal_reject_hiring_${applicationId}`)
                .setTitle('Reject Application');

            const reasonInput = new TextInputBuilder()
                .setCustomId('rejection_reason')
                .setLabel('Reason for Rejection')
                .setPlaceholder('Explain why this application is being rejected...')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);

        } catch (error) {
            console.error('Error rejecting hiring application:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error rejecting application.', ephemeral: true });
            }
        }
    }
};
