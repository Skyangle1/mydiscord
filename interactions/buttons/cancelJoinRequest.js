const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: 'btn_cancel_join_request',
    async execute(interaction) {
        try {
            // Extract family head ID and requester ID from custom ID
            // Format: btn_cancel_join_request_{familyHeadId}_{requesterId}
            const parts = interaction.customId.split('_');
            if (parts.length < 5) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Format ID permintaan tidak valid.',
                        ephemeral: true
                    });
                }
                return;
            }

            const familyHeadId = parts[4]; // family head ID
            const requesterId = parts[5]; // requester ID

            // Verify that the person clicking is indeed the family head
            if (interaction.user.id !== familyHeadId) {
                await interaction.reply({
                    content: 'Hanya kepala keluarga yang dapat menolak permintaan ini.',
                    ephemeral: true
                });
                return;
            }

            // Get the family info using async method
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [familyHeadId], (err, row) => {
                    if (err) {
                        console.error('Database error getting family:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!family) {
                await interaction.reply({
                    content: 'Keluarga tidak ditemukan.',
                    ephemeral: true
                });
                return;
            }

            // Get the request info using async method
            const request = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM family_requests WHERE requester_id = ? AND family_id = ? AND status = ?',
                    [requesterId, familyHeadId, 'PENDING'], (err, row) => {
                        if (err) {
                            console.error('Database error getting request:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
            });

            if (!request) {
                await interaction.reply({
                    content: 'Permintaan tidak ditemukan atau sudah diproses.',
                    ephemeral: true
                });
                return;
            }

            // Update the request status to REJECTED using async method
            await new Promise((resolve, reject) => {
                db.run('UPDATE family_requests SET status = ? WHERE requester_id = ? AND family_id = ?',
                    ['REJECTED', requesterId, familyHeadId], (err) => {
                        if (err) {
                            console.error('Database error updating request:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            });

            // Update the embed to show rejected status
            const updatedEmbed = new EmbedBuilder()
                .setTitle(`💌 Permintaan Bergabung Keluarga - DITOLAK`)
                .setDescription(`Pengguna **${interaction.user.tag}** ingin bergabung dengan keluargamu "${family.family_name}".\n\n**Alasan bergabung:** ${request.reason}`)
                .setColor('#FF0000') // Red color for rejected
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Status', value: 'DITOLAK', inline: true },
                    { name: 'Ditolak oleh', value: interaction.user.tag, inline: true },
                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setTimestamp();

            // Remove the buttons
            await interaction.update({ embeds: [updatedEmbed], components: [] });

            // Send success message to family head
            await interaction.followUp({
                content: `Permintaan dari **${interaction.user.tag}** untuk bergabung dengan keluarga "${family.family_name}" telah ditolak.`,
                ephemeral: true
            });

            // Notify the requester that their request was rejected
            try {
                const requester = await interaction.client.users.fetch(requesterId);
                await requester.send(`😔 Permintaanmu untuk bergabung dengan keluarga "${family.family_name}" telah **ditolak** oleh kepala keluarga.`);
            } catch (dmError) {
                console.error('Could not send DM to requester:', dmError);
            }
        } catch (error) {
            console.error('Error handling cancel join request button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat menolak permintaan bergabung keluarga. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
