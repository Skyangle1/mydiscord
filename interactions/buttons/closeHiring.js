const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^close_hiring_\d+$/,
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

            // Permission Check - Only applicant or admin can close
            const authorizedIds = process.env.CLIENT_OWNER_ID ?
                Array.isArray(process.env.CLIENT_OWNER_ID) ?
                    process.env.CLIENT_OWNER_ID :
                    process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                : [];

            const isAdmin = authorizedIds.includes(interaction.user.id);
            const isApplicant = application.user_id === interaction.user.id;

            if (!isAdmin && !isApplicant) {
                return await interaction.reply({
                    content: '❌ Hanya applicant atau admin yang bisa menutup aplikasi ini.',
                    ephemeral: true
                });
            }

            // Update application status to CLOSED
            await new Promise((resolve, reject) => {
                db.run('UPDATE hiring_applications SET status = ? WHERE id = ?', ['CLOSED', applicationId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Fetch thread messages for history log
            const thread = interaction.channel;
            let messages = [];
            try {
                const fetchedMessages = await thread.messages.fetch({ limit: 100 });
                messages = fetchedMessages.reverse().map(msg => ({
                    author: msg.author ? msg.author.tag : 'Unknown',
                    authorId: msg.author ? msg.author.id : 'unknown',
                    content: msg.content,
                    createdAt: msg.createdAt
                }));
            } catch (error) {
                console.error('Error fetching thread messages:', error);
            }

            // Send history log to archive channel
            const historyChannelId = process.env.HIRING_HISTORY_CHANNEL_ID;
            if (historyChannelId) {
                const historyChannel = interaction.guild.channels.cache.get(historyChannelId);
                if (historyChannel) {
                    // Create history log embed
                    const historyEmbed = new EmbedBuilder()
                        .setTitle(`📋 Application #${application.unique_code} - CLOSED`)
                        .setColor('#FF0000')
                        .addFields(
                            { name: 'Position', value: application.position_name, inline: true },
                            { name: 'Applicant', value: `<@${application.user_id}>`, inline: true },
                            { name: 'Status', value: 'CLOSED', inline: true },
                            { name: 'Opened', value: new Date(application.created_at).toLocaleString('id-ID'), inline: true },
                            { name: 'Closed', value: new Date().toLocaleString('id-ID'), inline: true }
                        )
                        .setTimestamp();

                    // Format conversation as plain text
                    const conversationLog = messages.map(msg => 
                        `[${msg.createdAt.toLocaleString('id-ID')}] @${msg.author}: ${msg.content.substring(0, 500)}`
                    ).join('\n\n');

                    // Send embed + conversation log
                    await historyChannel.send({
                        embeds: [historyEmbed],
                        content: `**=== CONVERSATION LOG ===**\n\n${conversationLog || 'No messages'}\n\n**========================**`
                    });
                }
            }

            // Update original message embed
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.setColor('#FF0000');
            embed.setFooter({ text: `Closed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            embed.setTimestamp(new Date());

            // Update fields to show closed status
            const fields = embed.data.fields || [];
            const statusFieldIndex = fields.findIndex(f => f.name === 'Status');
            if (statusFieldIndex >= 0) {
                fields[statusFieldIndex].value = 'CLOSED';
            }

            await interaction.message.edit({
                embeds: [embed],
                components: [] // Remove buttons
            });

            // Set thread to archived
            await thread.setArchived(true);

            await interaction.reply({ content: `Application #${application.unique_code} has been **CLOSED**.`, ephemeral: true });

        } catch (error) {
            console.error('Error closing hiring application:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error closing application.', ephemeral: true });
            }
        }
    }
};
