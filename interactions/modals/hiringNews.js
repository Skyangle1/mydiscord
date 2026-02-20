const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const crypto = require('crypto');
const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_hiring_news',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 }); // Ephemeral defer

            // 1. Get Values
            const positionName = interaction.fields.getTextInputValue('position_name');
            const reason = interaction.fields.getTextInputValue('reason');
            const availability = interaction.fields.getTextInputValue('availability');
            const experience = interaction.fields.getTextInputValue('experience') || 'Not provided';

            // 2. Generate Unique Code
            const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();

            // 3. Insert to Database
            const applicationId = await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO hiring_applications (user_id, position_id, position_name, reason, availability, experience, status, unique_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [interaction.user.id, uniqueCode, positionName, reason, availability, experience, 'OPEN', uniqueCode],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            // 4. Get Channel
            const hiringChannelId = process.env.HIRING_NEWS_CHANNEL_ID;
            if (!hiringChannelId) {
                console.error('HIRING_NEWS_CHANNEL_ID not set in .env');
                return await interaction.editReply({ content: 'Konfigurasi server belum lengkap. Hubungi Admin.', flags: 64 });
            }

            const hiringChannel = interaction.guild.channels.cache.get(hiringChannelId);
            if (!hiringChannel) {
                console.error(`Hiring channel ${hiringChannelId} not found`);
                return await interaction.editReply({ content: 'Channel hiring news tidak ditemukan.', flags: 64 });
            }

            // 5. Create Private Thread (NOT Public Thread!)
            let thread;
            try {
                thread = await hiringChannel.threads.create({
                    name: `📋 Application #${uniqueCode} - ${positionName}`,
                    type: ChannelType.PrivateThread, // IMPORTANT: PrivateThread, not PublicThread!
                    autoArchiveDuration: 60,
                    invitable: false, // Staff cannot invite others
                    reason: `New Hiring Application by ${interaction.user.tag}`
                });
                console.log(`Private thread created: ${thread.id} for user ${interaction.user.id}`);
            } catch (threadErr) {
                console.error('Failed to create private thread:', threadErr);
                return await interaction.editReply({ 
                    content: '❌ Gagal membuat private thread. Pastikan Bot memiliki izin:\n- Create Private Threads\n- Manage Threads\n\nDi channel settings: Settings > Permissions > Advanced > Create Private Threads', 
                    flags: 64 
                });
            }

            // 6. Access Control - Add User to Private Thread
            try {
                await thread.members.add(interaction.user.id);
                console.log(`User ${interaction.user.id} added to thread ${thread.id}`);
            } catch (e) {
                console.error('Failed to add user to thread:', e);
                // Continue anyway, user might be able to see thread via other means
            }

            // 6b. Add Admin/Staff roles to thread so they can see it
            try {
                const staffRoleIds = [];
                if (process.env.HIRING_ADMIN_ROLE_ID) {
                    process.env.HIRING_ADMIN_ROLE_ID.split(',').forEach(id => staffRoleIds.push(id.trim()));
                }
                if (process.env.HIRING_STAFF_ROLE_ID) {
                    process.env.HIRING_STAFF_ROLE_ID.split(',').forEach(id => staffRoleIds.push(id.trim()));
                }
                
                for (const roleId of staffRoleIds) {
                    try {
                        await thread.members.add(roleId);
                        console.log(`Staff role ${roleId} added to thread ${thread.id}`);
                    } catch (e) {
                        console.error(`Failed to add role ${roleId} to thread:`, e);
                    }
                }
            } catch (e) {
                console.error('Failed to add staff roles to thread:', e);
            }

            // 7. Notify Staff (via ping in thread, not adding them)
            let pings = [];
            const addRoles = (envVar) => {
                if (process.env[envVar]) {
                    process.env[envVar].split(',').forEach(id => {
                        if (id.trim()) pings.push(`<@&${id.trim()}>`);
                    });
                }
            };
            addRoles('HIRING_ADMIN_ROLE_ID');
            addRoles('HIRING_STAFF_ROLE_ID');

            if (pings.length === 0) {
                const staffRole = interaction.guild.roles.cache.find(r => r.name === 'Staff' || r.name === 'Admin');
                if (staffRole) pings.push(`<@&${staffRole.id}>`);
            }

            // 8. Send Initial Message to Thread
            const initialEmbed = new EmbedBuilder()
                .setTitle(`📋 Hiring Application #${uniqueCode}`)
                .setColor('#FFD700')
                .addFields(
                    { name: 'Position', value: positionName, inline: true },
                    { name: 'Applicant', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Code', value: `\`${uniqueCode}\``, inline: true },
                    { name: 'Availability', value: availability, inline: false },
                    { name: 'Motivation', value: reason.substring(0, 1000) || 'N/A', inline: false },
                    { name: 'Experience', value: experience.substring(0, 1000) || 'N/A', inline: false },
                    { name: 'Status', value: 'OPEN', inline: true },
                    { name: 'Opened', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`close_hiring_${applicationId}`).setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`claim_hiring_${applicationId}`).setLabel('Claim').setStyle(ButtonStyle.Success)
            );

            const initialMessage = await thread.send({
                content: `🚨 **NEW APPLICATION** ${pings.join(' ')}\n<@${interaction.user.id}> has applied for **${positionName}**.`,
                embeds: [initialEmbed],
                components: [actionRow]
            });

            // 9. Update DB with Thread ID and History Message ID
            db.run(`UPDATE hiring_applications SET thread_id = ?, channel_id = ?, history_message_id = ? WHERE id = ?`, [thread.id, hiringChannel.id, initialMessage.id, applicationId]);

            // 10. Reply to Interaction (Ephemeral)
            await interaction.editReply({
                content: `✅ **Application Submitted!**\nSilakan cek Private Thread baru: <#${thread.id}>\n(Hanya kamu & staff yang bisa lihat)`,
                flags: 64
            });

        } catch (error) {
            console.error('Error in hiringNews modal:', error);
            const msg = 'Terjadi kesalahan sistem. Hubungi administrator.';
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: msg, ephemeral: true });
            } else {
                await interaction.editReply({ content: msg, flags: 64 });
            }
        }
    }
};
