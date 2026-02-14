const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const crypto = require('crypto');
const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_enhanced_claim',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 }); // Ephemeral defer

            // 1. Get Values
            const receiverName = interaction.fields.getTextInputValue('receiver_name');
            const winnerCategory = interaction.fields.getTextInputValue('winner_category');
            const rewardAmount = interaction.fields.getTextInputValue('reward_amount');
            const walletNumber = interaction.fields.getTextInputValue('wallet_number');
            const address = interaction.fields.getTextInputValue('address');

            // 2. Validation & Config
            const maxPendingClaims = parseInt(process.env.MAX_PENDING_CLAIMS_PER_USER) || 5;

            // Check pending count
            const checkPending = new Promise((resolve, reject) => {
                db.get(`SELECT COUNT(*) as count FROM claims WHERE user_id = ? AND status = 'PENDING'`, [interaction.user.id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.count);
                });
            });

            const pendingCount = await checkPending;
            if (pendingCount >= maxPendingClaims) {
                return await interaction.editReply({
                    content: `Kamu memiliki terlalu banyak klaim pending (${maxPendingClaims} max). Selesaikan dulu yang ada.`,
                    flags: 64
                });
            }

            // 3. Generate Codes & DB Insert
            const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();

            // Insert FIRST to get ID (though we use uniqueCode for display)
            // We need to know if DB insert fails before creating thread
            const listId = await new Promise((resolve, reject) => {
                db.run(`INSERT INTO claims (user_id, description, status, wallet_number, address, reward_amount, unique_code) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [interaction.user.id, `Klaim: ${winnerCategory}`, 'PENDING', walletNumber, address, rewardAmount, uniqueCode],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.lastID);
                    }
                );
            });

            // 4. Get Channel
            const claimChannelId = process.env.CLAIM_LOG_CHANNEL_ID;
            if (!claimChannelId) {
                console.error('CLAIM_LOG_CHANNEL_ID not set in .env');
                return await interaction.editReply({ content: 'Konfigurasi server belum lengkap. Hubungi Admin.', flags: 64 });
            }

            const claimChannel = interaction.guild.channels.cache.get(claimChannelId);
            if (!claimChannel) {
                console.error(`Claim channel ${claimChannelId} not found`);
                return await interaction.editReply({ content: 'Channel klaim tidak ditemukan.', flags: 64 });
            }

            // 5. Create STANDALONE Private Thread
            // "invitable: false" means only mods can invite people. Good for privacy.
            let thread;
            try {
                thread = await claimChannel.threads.create({
                    name: `🔒 Klaim ${uniqueCode} - ${receiverName}`,
                    type: ChannelType.PrivateThread,
                    autoArchiveDuration: 60,
                    invitable: false,
                    reason: `New Claim by ${interaction.user.tag}`
                });
            } catch (threadErr) {
                console.error('Failed to create private thread:', threadErr);
                return await interaction.editReply({ content: 'Gagal membuat private thread. Pastikan Bot memiliki izin "Create Private Threads" & "Manage Threads".', flags: 64 });
            }

            // 6. Access Control
            // Add User
            try {
                await thread.members.add(interaction.user.id);
            } catch (e) {
                console.error('Failed to add user to thread:', e);
            }

            // Notify Staff (Ping Scheme)
            let pings = [];
            const addRoles = (envVar) => {
                if (process.env[envVar]) {
                    process.env[envVar].split(',').forEach(id => {
                        if (id.trim()) pings.push(`<@&${id.trim()}>`);
                    });
                }
            };
            addRoles('CLAIM_ADMIN_ROLE_ID');
            addRoles('CLAIM_STAFF_ROLE_ID');

            if (pings.length === 0) {
                const staffRole = interaction.guild.roles.cache.find(r => r.name === 'Staff');
                if (staffRole) pings.push(`<@&${staffRole.id}>`);
            }

            // 7. Send Content to THREAD
            const detailedEmbed = new EmbedBuilder()
                .setTitle(`🔐 Detail Klaim #${uniqueCode}`)
                .setColor('#9370DB')
                .addFields(
                    { name: 'Kode Unik', value: `\`${uniqueCode}\``, inline: true },
                    { name: 'Penerima', value: receiverName, inline: true },
                    { name: 'Kategori', value: winnerCategory, inline: true },
                    { name: 'Hadiah', value: rewardAmount, inline: true },
                    { name: 'E-Wallet', value: walletNumber, inline: true },
                    { name: 'Alamat', value: address || '-', inline: false },
                    { name: 'Status', value: 'PENDING', inline: true },
                    { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setTimestamp();

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`claim_room_${listId}`).setLabel('Process').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`close_claim_${listId}`).setLabel('Close').setStyle(ButtonStyle.Danger)
            );

            await thread.send({
                content: `🚨 **TIKET BARU** ${pings.join(' ')}\n<@${interaction.user.id}> telah membuat klaim baru.`,
                embeds: [detailedEmbed],
                components: [actionRow]
            });

            // 8. Update DB with Thread ID
            db.run(`UPDATE claims SET thread_id = ?, channel_id = ? WHERE id = ?`, [thread.id, claimChannel.id, listId]);

            // 9. Reply to Interaction (Ephemeral)
            await interaction.editReply({
                content: `✅ **Berhasil!** Tiket klaim dibuat.\nSilakan cek Private Thread baru: <#${thread.id}>\n(Hanya kamu & staff yang bisa lihat)`,
                flags: 64
            });

        } catch (error) {
            console.error('Error in enhancedClaim:', error);
            // Safe Error Reply
            const msg = 'Terjadi kesalahan sistem. Hubungi administrator.';
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: msg, ephemeral: true });
            } else {
                await interaction.editReply({ content: msg, flags: 64 });
            }
        }
    }
};
