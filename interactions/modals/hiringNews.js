const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const crypto = require('crypto');
const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_hiring_news',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 });

            // 1. Get Inputs
            const positionName = interaction.fields.getTextInputValue('position_name');
            const reason = interaction.fields.getTextInputValue('reason');
            const availability = interaction.fields.getTextInputValue('availability');
            const experience = interaction.fields.getTextInputValue('experience') || 'Not provided';

            // 2. Config & Validation
            const logChannelId = process.env.HIRING_NEWS_CHANNEL_ID;

            if (!logChannelId) {
                return await interaction.editReply({ content: 'Configuration Error: HIRING_NEWS_CHANNEL_ID not set.', flags: 64 });
            }

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                return await interaction.editReply({ content: 'Hiring Channel not found.', flags: 64 });
            }

            // 3. Generate Code & DB Insert
            const uniqueCode = `HIR-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

            const dbId = await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO hiring_applications (user_id, position_id, position_name, reason, availability, experience, unique_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [interaction.user.id, uniqueCode, positionName, reason, availability, experience, uniqueCode, 'OPEN'],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            // 4. Create Standalone Private Thread (SAME AS REFLECTION)
            let thread;
            try {
                thread = await logChannel.threads.create({
                    name: `📋 ${uniqueCode} - ${positionName}`,
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: 1440, // 24 hours
                    invitable: false,
                    reason: `Hiring Application by ${interaction.user.tag}`
                });
            } catch (err) {
                console.error('Thread creation failed:', err);
                return await interaction.editReply({ content: 'Failed to create private thread.', flags: 64 });
            }

            // 5. Access Control (SAME AS REFLECTION)
            try {
                await thread.members.add(interaction.user.id);
            } catch (e) {
                console.error('Failed to add user to thread:', e);
            }

            // Pings (SAME AS REFLECTION)
            let pings = [];
            const adminRoleId = process.env.HIRING_ADMIN_ROLE_ID;
            const staffRoleId = process.env.HIRING_STAFF_ROLE_ID;
            
            if (adminRoleId) {
                adminRoleId.split(',').forEach(id => {
                    if (id.trim()) pings.push(`<@&${id.trim()}>`);
                });
            }
            if (staffRoleId) {
                staffRoleId.split(',').forEach(id => {
                    if (id.trim()) pings.push(`<@&${id.trim()}>`);
                });
            }

            // 6. Send Embed to THREAD (SAME AS REFLECTION)
            const embed = new EmbedBuilder()
                .setTitle(`<:pinkcrown:1464766248054161621> HIRING APPLICATION #${uniqueCode}`)
                .setColor('#FFD700')
                .setDescription(`**Position:** ${positionName}\n\n**Motivation:**\n${reason}`)
                .addFields(
                    { name: 'Availability', value: availability, inline: true },
                    { name: 'Experience', value: experience.substring(0, 500) || 'N/A', inline: true },
                    { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Status', value: 'OPEN', inline: true },
                    { name: 'Created At', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setFooter({ text: 'Private Application' })
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim_hiring_${dbId}`)
                    .setLabel('Claim Application')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🙋'),
                new ButtonBuilder()
                    .setCustomId(`close_hiring_${dbId}`)
                    .setLabel('Close Application')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒')
            );

            await thread.send({
                content: `🚨 **NEW APPLICATION** ${pings.join(' ')}\n<@${interaction.user.id}> applied for **${positionName}**.`,
                embeds: [embed],
                components: [actionRow]
            });

            // 7. Update DB with thread_id (SAME AS REFLECTION)
            db.run(`UPDATE hiring_applications SET thread_id = ? WHERE id = ?`, [thread.id, dbId]);

            // 8. Reply (SAME AS REFLECTION)
            await interaction.editReply({
                content: `✅ **Application Submitted!**\nPlease join your private thread here: <#${thread.id}>`,
                flags: 64
            });

        } catch (error) {
            console.error('Error submitting hiring application:', error);
            await interaction.editReply({ content: 'System Error.', flags: 64 });
        }
    }
};
