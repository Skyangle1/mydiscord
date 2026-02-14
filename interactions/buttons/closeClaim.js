const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^close_claim_\d+$/, // Regex to handle specific ID pattern
    async execute(interaction) {
        try {
            // Check if user is authorized to use this feature
            const authorizedIds = process.env.CLIENT_OWNER_ID ?
                Array.isArray(process.env.CLIENT_OWNER_ID) ?
                    process.env.CLIENT_OWNER_ID :
                    process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                : [];

            // Check if user has admin permissions
            const isAdmin = interaction.member.permissions.has('Administrator');
            const isOwner = authorizedIds.includes(interaction.user.id);

            if (!isAdmin && !isOwner) {
                return await interaction.reply({
                    content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                    ephemeral: true
                });
            }

            // Extract claim ID from custom ID
            const claimId = interaction.customId.split('_')[2]; // Format: close_claim_{id}

            // Get the claim details to find the channel/thread ID
            const getClaimDetails = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT channel_id, thread_id, status FROM claims WHERE id = ?`;
                    db.get(query, [claimId], (err, row) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
            };

            const claimDetails = await getClaimDetails();

            if (!claimDetails) {
                await interaction.reply({
                    content: 'Klaim tidak ditemukan.',
                    ephemeral: true
                });
                return;
            }

            // Check if claim is already closed
            if (claimDetails.status === 'APPROVED' || claimDetails.status === 'REJECTED' || claimDetails.status === 'CLOSED') {
                await interaction.reply({
                    content: 'Klaim ini sudah ditutup atau diproses.',
                    ephemeral: true
                });
                return;
            }

            // Update claim status to CLOSED
            const updateClaimStatus = () => {
                return new Promise((resolve, reject) => {
                    const query = `UPDATE claims SET status = ? WHERE id = ?`;
                    db.run(query, ['CLOSED', claimId], function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.changes); // Number of affected rows
                        }
                    });
                });
            };

            try {
                const changes = await updateClaimStatus();
                if (changes === 0) {
                    await interaction.reply({
                        content: 'Klaim tidak ditemukan.',
                        ephemeral: true
                    });
                    return;
                }

                // Try to delete the channel/thread if it exists
                let deletionSuccess = false;

                if (claimDetails && claimDetails.thread_id) {
                    // Try to delete the thread
                    try {
                        const threadToDelete = await interaction.guild.channels.fetch(claimDetails.thread_id);
                        if (threadToDelete) {
                            await threadToDelete.delete();
                            deletionSuccess = true;
                        }
                    } catch (threadError) {
                        console.error('Error deleting claim thread:', threadError);
                    }
                }

                // Update the button to show it's closed (only if the original message still exists)
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(`🔐 Detail Klaim #${claimId} - DITUTUP`)
                    .setColor('#808080') // Gray color for closed
                    .setDescription('Klaim ini telah ditutup oleh admin.')
                    .setTimestamp();

                // Disable both buttons
                const disabledClaimButton = new ButtonBuilder()
                    .setCustomId(`claim_room_${claimId}`)
                    .setLabel('Room Sudah Diambil')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🙋')
                    .setDisabled(true);

                const disabledCloseButton = new ButtonBuilder()
                    .setCustomId(`close_claim_${claimId}`)
                    .setLabel('Locket Ditutup')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒')
                    .setDisabled(true);

                const updatedRow = new ActionRowBuilder().addComponents(disabledClaimButton, disabledCloseButton);

                // Update the message if possible
                try {
                    await interaction.update({
                        embeds: [updatedEmbed],
                        components: [updatedRow]
                    });
                } catch (updateError) {
                    console.error('Error updating message after closing claim:', updateError);
                    // If update fails, send a new ephemeral message instead
                    try {
                        await interaction.followUp({
                            content: `Klaim #${claimId} telah ditutup.${deletionSuccess ? ' Channel/thread terkait telah dihapus.' : ''}`,
                            ephemeral: true
                        });
                    } catch (followUpError) {
                        console.error('Error sending follow-up message:', followUpError);
                    }
                }
            } catch (dbError) {
                console.error('Database error updating claim status:', dbError);
                await interaction.reply({
                    content: 'Terjadi kesalahan saat menutup klaim.',
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error handling close claim button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat menutup klaim. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
