const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^modal_reject_hiring_\d+$/,
    async execute(interaction) {
        try {
            // Extract application ID from custom ID
            const parts = interaction.customId.split('_');
            const applicationId = parts[parts.length - 1];

            // Get rejection reason
            const rejectionReason = interaction.fields.getTextInputValue('rejection_reason');

            // Update application status in database
            await new Promise((resolve, reject) => {
                db.run('UPDATE hiring_applications SET status = ? WHERE id = ?', ['REJECTED', applicationId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

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

            // Update embed to show rejected status
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.setColor('#FF0000');
            embed.setFooter({ text: `❌ Rejected by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            embed.setTimestamp(new Date());

            // Add rejection reason field
            embed.addFields({ name: 'Rejection Reason', value: rejectionReason.substring(0, 1000) });

            // Update the message
            await interaction.message.edit({
                embeds: [embed],
                components: [] // Remove buttons after rejection
            });

            // Notify user
            try {
                const user = await interaction.client.users.fetch(application.user_id);
                const notifyEmbed = new EmbedBuilder()
                    .setTitle('❌ Application Update')
                    .setDescription(`Your application for **${application.position_name}** has not been approved at this time.`)
                    .addFields({ name: 'Feedback', value: rejectionReason.substring(0, 1000) })
                    .setColor('#FF0000')
                    .setTimestamp();
                await user.send({ embeds: [notifyEmbed] }).catch(() => {});
            } catch (error) {
                console.log('Could not notify user about rejection');
            }

            await interaction.reply({ content: `Application #${application.unique_code} has been **REJECTED**.`, ephemeral: true });

        } catch (error) {
            console.error('Error rejecting hiring application:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error rejecting application.', ephemeral: true });
            }
        }
    }
};
