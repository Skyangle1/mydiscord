const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const crypto = require('crypto');
const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_submit_reflection',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 });

            // 1. Get Inputs
            const topic = interaction.fields.getTextInputValue('reflection_topic');
            const content = interaction.fields.getTextInputValue('reflection_content');

            // 2. Config & Validation
            const logChannelId = process.env.REFLECTION_LOG_CHANNEL_ID;
            const historyChannelId = process.env.REFLECTION_HISTORY_CHANNEL_ID;

            if (!logChannelId) {
                return await interaction.editReply({ content: 'Configuration Error: REFLECTION_LOG_CHANNEL_ID not set.', flags: 64 });
            }

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (!logChannel) {
                return await interaction.editReply({ content: 'Log Channel not found.', flags: 64 });
            }

            // 3. Generate Code & DB Insert
            const uniqueCode = `REF-${crypto.randomBytes(2).toString('hex').toUpperCase()}`; // e.g., REF-A1B2

            const dbId = await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO reflections (user_id, topic, content, unique_code) VALUES (?, ?, ?, ?)`,
                    [interaction.user.id, topic, content, uniqueCode],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            // 4. Create Standalone Private Thread
            let thread;
            try {
                thread = await logChannel.threads.create({
                    name: `🕯️ ${uniqueCode} - ${interaction.user.username}`,
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: 1440, // 24 hours
                    invitable: false,
                    reason: `Reflection Session for ${interaction.user.tag}`
                });
            } catch (err) {
                console.error('Thread creation failed:', err);
                return await interaction.editReply({ content: 'Failed to create session thread.', flags: 64 });
            }

            // 5. Access Control
            try {
                await thread.members.add(interaction.user.id);
            } catch (e) {
                console.error('Failed to add user to thread:', e);
            }

            // Pings
            let pings = [];
            const roleId = process.env.REFLECTION_COUNSELOR_ROLE_ID;
            if (roleId) {
                roleId.split(',').forEach(id => {
                    if (id.trim()) pings.push(`<@&${id.trim()}>`);
                });
            }

            // 6. Send Embed to THREAD
            const embed = new EmbedBuilder()
                .setTitle(`<:pinkcrown:1464766248054161621> REFLECTION TICKET #${uniqueCode}`)
                .setColor('#FF99CC')
                .setDescription(`**Topic:** ${topic}\n\n**Story:**\n${content}`)
                .addFields(
                    { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Status', value: 'OPEN', inline: true },
                    { name: 'Created At', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setFooter({ text: 'Trusted & Private' })
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim_reflection_${dbId}`)
                    .setLabel('Claim Session')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🙋'),
                new ButtonBuilder()
                    .setCustomId(`close_reflection_${dbId}`)
                    .setLabel('End Session')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒')
            );

            await thread.send({
                content: `🚨 **NEW SESSION** ${pings.join(' ')}\n<@${interaction.user.id}> requests a reflection session.`,
                embeds: [embed],
                components: [actionRow]
            });

            // 7. Send Log to HISTORY CHANNEL (If configured)
            // User requested "history menyimpan curhatan"
            if (historyChannelId) {
                const historyChannel = interaction.guild.channels.cache.get(historyChannelId);
                if (historyChannel) {
                    const historyEmbed = EmbedBuilder.from(embed)
                        .setTitle(`📜 ARCHIVE: REFLECTION #${uniqueCode}`)
                        .setColor('#808080') // Grey for archive/record
                        .addFields({ name: 'Thread Link', value: `<#${thread.id}>`, inline: false });

                    try {
                        const historyMsg = await historyChannel.send({ embeds: [historyEmbed] });

                        // Update DB with details
                        db.run(`UPDATE reflections SET thread_id = ?, history_message_id = ? WHERE id = ?`,
                            [thread.id, historyMsg.id, dbId]);
                    } catch (histErr) {
                        console.error('Failed to send history log:', histErr);
                        // Still continue, simpler fallback
                        db.run(`UPDATE reflections SET thread_id = ? WHERE id = ?`, [thread.id, dbId]);
                    }
                } else {
                    db.run(`UPDATE reflections SET thread_id = ? WHERE id = ?`, [thread.id, dbId]);
                }
            } else {
                db.run(`UPDATE reflections SET thread_id = ? WHERE id = ?`, [thread.id, dbId]);
            }

            // 8. Reply
            await interaction.editReply({
                content: `✅ **Session Created!**\nPlease join your private room here: <#${thread.id}>`,
                flags: 64
            });

        } catch (error) {
            console.error('Error submitting reflection:', error);
            await interaction.editReply({ content: 'System Error.', flags: 64 });
        }
    }
};
