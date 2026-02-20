const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^approve_hiring_\d+$/,
    async execute(interaction) {
        try {
            // Extract application ID from custom ID
            const parts = interaction.customId.split('_');
            const applicationId = parts[parts.length - 1];

            // Update application status in database
            await new Promise((resolve, reject) => {
                db.run('UPDATE hiring_applications SET status = ? WHERE id = ?', ['APPROVED', applicationId], (err) => {
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

            // Update embed to show approved status
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.setColor('#00FF00');
            embed.setFooter({ text: `✅ Approved by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            embed.setTimestamp(new Date());

            // Update the message
            await interaction.message.edit({
                embeds: [embed],
                components: [] // Remove buttons after approval
            });

            // Notify user
            try {
                const user = await interaction.client.users.fetch(application.user_id);
                const notifyEmbed = new EmbedBuilder()
                    .setTitle('✅ Application Approved!')
                    .setDescription(`Congratulations! Your application for **${application.position_name}** has been approved.`)
                    .setColor('#00FF00')
                    .setTimestamp();
                await user.send({ embeds: [notifyEmbed] }).catch(() => {});
            } catch (error) {
                console.log('Could not notify user about approval');
            }

            await interaction.reply({ content: `Application #${application.unique_code} has been **APPROVED**!`, ephemeral: true });

        } catch (error) {
            console.error('Error approving hiring application:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error approving application.', ephemeral: true });
            }
        }
    }
};
