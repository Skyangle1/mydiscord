const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkclaim')
        .setDescription('Check the status of your claim requests')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Claim ID to check')
                .setRequired(false)),
    async execute(interaction) {
        const claimId = interaction.options.getInteger('id');
        const { db } = require('../../database/db');

        try {
            if (claimId) {
                // Check specific claim
                const getClaim = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            SELECT id, user_id, description, status, created_at
                            FROM claims
                            WHERE id = ?
                        `;
                        db.get(query, [claimId], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                const claim = await getClaim();

                if (!claim) {
                    await interaction.reply({
                        content: `Klaim dengan ID #${claimId} tidak ditemukan.`,
                        ephemeral: true
                    });
                    return;
                }

                // Check if user is authorized to view this claim
                const authorizedIds = process.env.CLIENT_OWNER_ID ?
                    Array.isArray(process.env.CLIENT_OWNER_ID) ?
                        process.env.CLIENT_OWNER_ID :
                        process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                    : [];

                if (claim.user_id !== interaction.user.id && !authorizedIds.includes(interaction.user.id)) {
                    await interaction.reply({
                        content: 'Kamu hanya bisa melihat status klaim milikmu sendiri.',
                        ephemeral: true
                    });
                    return;
                }

                const claimEmbed = new EmbedBuilder()
                    .setTitle(`Status Klaim #${claim.id}`)
                    .setDescription(claim.description)
                    .addFields(
                        { name: 'Status', value: claim.status, inline: true },
                        { name: 'Dibuat pada', value: new Date(claim.created_at).toLocaleString('id-ID'), inline: true },
                        { name: 'Pemilik Klaim', value: `<@${claim.user_id}>`, inline: false }
                    )
                    .setTimestamp();

                // Set color based on status
                switch (claim.status) {
                    case 'APPROVED':
                        claimEmbed.setColor('#00FF00'); // Green
                        break;
                    case 'REJECTED':
                        claimEmbed.setColor('#FF0000'); // Red
                        break;
                    case 'PENDING':
                        claimEmbed.setColor('#FFFF00'); // Yellow
                        break;
                    default:
                        claimEmbed.setColor('#808080'); // Gray
                }

                await interaction.reply({ embeds: [claimEmbed], ephemeral: true });
            } else {
                // Check all claims for the user
                const getClaims = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            SELECT id, description, status, created_at
                            FROM claims
                            WHERE user_id = ?
                            ORDER BY created_at DESC
                            LIMIT 10
                        `;
                        db.all(query, [interaction.user.id], (err, rows) => {
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
                        content: 'Kamu belum memiliki klaim apapun.',
                        ephemeral: true
                    });
                    return;
                }

                let description = 'Berikut adalah 10 klaim terakhirmu:\n\n';
                claims.forEach(claim => {
                    const statusEmojis = {
                        'PENDING': '⏳',
                        'APPROVED': '✅',
                        'REJECTED': '❌'
                    };
                    const emoji = statusEmojis[claim.status] || '❓';
                    description += `${emoji} **#${claim.id}** - ${claim.status} - ${new Date(claim.created_at).toLocaleDateString('id-ID')}\n`;
                    description += `> ${claim.description.substring(0, 50)}${claim.description.length > 50 ? '...' : ''}\n\n`;
                });

                const claimsEmbed = new EmbedBuilder()
                    .setTitle('Daftar Klaimmu')
                    .setDescription(description)
                    .setFooter({ text: 'Gunakan /checkclaim id:<nomor_id> untuk melihat detail klaim' })
                    .setTimestamp();

                await interaction.reply({ embeds: [claimsEmbed], ephemeral: true });
            }
        } catch (error) {
            console.error('Error checking claim:', error);
            await interaction.reply({
                content: 'Terjadi kesalahan saat memeriksa status klaim.',
                ephemeral: true
            });
        }
    },
};