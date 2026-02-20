const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^claim_hiring_\d+$/,
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

            // Permission Check - Only admin/staff can claim
            const authorizedIds = process.env.CLIENT_OWNER_ID ?
                Array.isArray(process.env.CLIENT_OWNER_ID) ?
                    process.env.CLIENT_OWNER_ID :
                    process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                : [];

            const isAdmin = authorizedIds.includes(interaction.user.id);

            // Check if user has staff/admin role
            let isStaff = false;
            const member = await interaction.guild.members.fetch(interaction.user.id);
            
            const staffRoleIds = [];
            if (process.env.HIRING_ADMIN_ROLE_ID) {
                process.env.HIRING_ADMIN_ROLE_ID.split(',').forEach(id => staffRoleIds.push(id.trim()));
            }
            if (process.env.HIRING_STAFF_ROLE_ID) {
                process.env.HIRING_STAFF_ROLE_ID.split(',').forEach(id => staffRoleIds.push(id.trim()));
            }

            isStaff = staffRoleIds.some(roleId => member.roles.cache.has(roleId));

            if (!isAdmin && !isStaff) {
                return await interaction.reply({
                    content: '❌ Hanya admin atau staff yang bisa claim aplikasi ini.',
                    ephemeral: true
                });
            }

            // Update application status to CLAIMED
            await new Promise((resolve, reject) => {
                db.run('UPDATE hiring_applications SET status = ?, claimed_by = ? WHERE id = ?', ['CLAIMED', interaction.user.id, applicationId], (err) => {
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
                        .setTitle(`📋 Application #${application.unique_code} - CLAIMED`)
                        .setColor('#00FF00')
                        .addFields(
                            { name: 'Position', value: application.position_name, inline: true },
                            { name: 'Applicant', value: `<@${application.user_id}>`, inline: true },
                            { name: 'Claimed By', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Status', value: 'CLAIMED', inline: true },
                            { name: 'Opened', value: new Date(application.created_at).toLocaleString('id-ID'), inline: true },
                            { name: 'Claimed', value: new Date().toLocaleString('id-ID'), inline: true }
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
            embed.setColor('#00FF00');
            embed.setFooter({ text: `Claimed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
            embed.setTimestamp(new Date());

            // Update fields to show claimed status
            const fields = embed.data.fields || [];
            const statusFieldIndex = fields.findIndex(f => f.name === 'Status');
            if (statusFieldIndex >= 0) {
                fields[statusFieldIndex].value = 'CLAIMED';
            }

            await interaction.message.edit({
                embeds: [embed],
                components: [] // Remove buttons
            });

            // Set thread to archived
            await interaction.channel.setArchived(true);

            await interaction.reply({ content: `Application #${application.unique_code} has been **CLAIMED** by ${interaction.user.tag}.`, ephemeral: true });

        } catch (error) {
            console.error('Error claiming hiring application:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Error claiming application.', ephemeral: true });
            }
        }
    }
};
