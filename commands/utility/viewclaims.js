const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewclaims')
        .setDescription('View all claims (Admin only)'),
    async execute(interaction) {
        // Check if user is authorized to use this feature
        const authorizedIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!authorizedIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Perintah ini hanya dapat digunakan oleh Admin/Developer!',
                ephemeral: true
            });
        }

        const { db } = require('../../database/db');

        try {
            // Get all claims
            const getClaims = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        SELECT c.id, c.user_id, c.description, c.status, c.created_at, c.wallet_number, c.address, c.reward_amount, c.user_id as username
                        FROM claims c
                        ORDER BY c.created_at DESC
                        LIMIT 10
                    `;
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
            };

            const claims = await getClaims();

            if (claims.length === 0) {
                await interaction.reply({
                    content: 'Belum ada klaim apapun.',
                    ephemeral: true
                });
                return;
            }

            let description = 'Berikut adalah 10 klaim terbaru:\n\n';
            claims.forEach(claim => {
                const statusEmojis = {
                    'PENDING': '⏳',
                    'APPROVED': '✅',
                    'REJECTED': '❌'
                };
                const emoji = statusEmojis[claim.status] || '❓';
                description += `${emoji} **#${claim.id}** - User ID: ${claim.user_id} - ${claim.status} - ${new Date(claim.created_at).toLocaleDateString('id-ID')}\n`;
                description += `> ${claim.description.substring(0, 50)}${claim.description.length > 50 ? '...' : ''}\n`;
                description += `**Hadiah:** ${claim.reward_amount || 'Menunggu konfirmasi'} | **E-Wallet:** ${claim.wallet_number || 'Belum diisi'}\n\n`;
            });

            const claimsEmbed = new EmbedBuilder()
                .setTitle('Daftar Semua Klaim (10 Terbaru)')
                .setDescription(description)
                .setTimestamp();

            await interaction.reply({ embeds: [claimsEmbed], ephemeral: true });
        } catch (error) {
            console.error('Error viewing claims:', error);
            await interaction.reply({
                content: 'Terjadi kesalahan saat melihat daftar klaim.',
                ephemeral: true
            });
        }
    },
};