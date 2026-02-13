const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanup-claims')
        .setDescription('Cleanup invalid claims (admin only)'),
    async execute(interaction) {
        // Check if user is admin/owner
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

        await interaction.deferReply({ ephemeral: true });

        try {
            const { db } = require('../../database/db');
            
            // Get all pending claims
            const getAllPendingClaims = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT id, user_id, channel_id, thread_id FROM claims WHERE status = 'PENDING'`;
                    db.all(query, [], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rows);
                        }
                    });
                });
            };

            const allPendingClaims = await getAllPendingClaims();
            let cleanedCount = 0;

            for (const claim of allPendingClaims) {
                let channelExists = true;
                
                if (claim.channel_id) {
                    // Check if the channel still exists
                    try {
                        const channel = await interaction.guild.channels.fetch(claim.channel_id);
                        if (!channel) {
                            channelExists = false;
                        }
                    } catch (channelError) {
                        // Channel doesn't exist
                        channelExists = false;
                    }
                } else if (claim.thread_id) {
                    // Check if the thread still exists
                    try {
                        const thread = await interaction.guild.channels.fetch(claim.thread_id);
                        if (!thread) {
                            channelExists = false;
                        }
                    } catch (threadError) {
                        // Thread doesn't exist
                        channelExists = false;
                    }
                }
                
                // If the channel/thread doesn't exist, update the claim status to ARCHIVED
                if (!channelExists) {
                    try {
                        const updateQuery = `UPDATE claims SET status = 'ARCHIVED' WHERE id = ?`;
                        db.run(updateQuery, [claim.id], (updateErr) => {
                            if (updateErr) {
                                console.error(`Error updating claim ${claim.id} status to ARCHIVED:`, updateErr);
                            } else {
                                console.log(`Claim ${claim.id} status updated to ARCHIVED (channel/thread no longer exists)`);
                                cleanedCount++;
                            }
                        });
                    } catch (updateError) {
                        console.error(`Error in updating claim ${claim.id}:`, updateError);
                    }
                }
            }

            await interaction.editReply({
                content: `Pembersihan selesai. ${cleanedCount} klaim tidak valid telah diarsipkan.`
            });
        } catch (error) {
            console.error('Error in cleanup-claims command:', error);
            await interaction.editReply({
                content: 'Terjadi kesalahan saat membersihkan klaim.',
                ephemeral: true
            });
        }
    },
};