const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^btn_reject_claim_\d+$/,
    async execute(interaction) {
        // Check permissions
        const authorizedIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!authorizedIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                ephemeral: true
            });
        }

        const claimId = interaction.customId.split('_')[3];

        // Database helper
        const updateClaim = () => {
            return new Promise((resolve, reject) => {
                const query = `UPDATE claims SET status = ? WHERE id = ?`;
                db.run(query, ['REJECTED', claimId], function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                });
            });
        };

        try {
            const changes = await updateClaim();
            if (changes === 0) {
                return await interaction.reply({
                    content: 'Klaim tidak ditemukan.',
                    ephemeral: true
                });
            }

            // Database helper to get claim details
            const getClaimDetails = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT user_id FROM claims WHERE id = ?`;
                    db.get(query, [claimId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            };

            const claimDetails = await getClaimDetails();
            const originalEmbed = interaction.message.embeds[0];

            const updatedEmbed = new EmbedBuilder()
                .setTitle(`🎫 Tiket Klaim #${claimId} - DITOLAK`)
                .setDescription(originalEmbed.data.description || ' ')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Dibuat oleh', value: originalEmbed.data.fields.find(f => f.name === 'Dibuat oleh')?.value || 'Unknown', inline: true },
                    { name: 'Status', value: 'DITOLAK', inline: true },
                    { name: 'Tanggal', value: originalEmbed.data.fields.find(f => f.name === 'Tanggal')?.value || new Date().toLocaleString('id-ID'), inline: true },
                    { name: 'Ditolak oleh', value: interaction.user.tag, inline: false }
                )
                .setTimestamp();

            await interaction.update({ embeds: [updatedEmbed], components: [] });
            await interaction.followUp({
                content: `Tiket klaim #${claimId} telah ditolak.`,
                ephemeral: true
            });

            // Handle Thread Notification
            try {
                const thread = interaction.message.thread;
                if (thread) {
                    await thread.send({
                        content: `❌ **TIKET DITOLAK** ❌\n\nTiket ini telah ditolak oleh admin.\nSilakan hubungi admin jika ada pertanyaan atau ajukan klaim baru jika diperlukan.`
                    });

                    if (claimDetails) {
                        await thread.send({
                            content: `<@${claimDetails.user_id}> Tiket klaimmu telah ditolak. Maaf atas ketidaknyamanannya.`
                        });
                    }
                }
            } catch (threadError) {
                console.error('Error sending to thread for claim rejection:', threadError);
            }

        } catch (error) {
            console.error('Error rejecting claim:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan saat memproses klaim.', ephemeral: true });
            }
        }
    }
};
