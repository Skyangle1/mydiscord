const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: 'claim_room', // STARTSWITH logic handles specific ID
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
            const claimId = interaction.customId.split('_')[2]; // Format: claim_room_{id}

            // Get the claim details to find the channel/thread ID and other info
            const getClaimDetails = () => {
                return new Promise((resolve, reject) => {
                    const query = `SELECT channel_id, thread_id, user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
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

            // Update the embed to show who claimed the room
            const updatedEmbed = new EmbedBuilder()
                .setTitle(`🔐 Detail Klaim #${claimId}`)
                .setDescription(`Klaim ini sedang ditangani oleh ${interaction.user.tag}`)
                .setColor('#0000FF') // Blue color for claimed
                .addFields(
                    { name: 'Dibuat oleh', value: `<@${claimDetails.user_id}>`, inline: true },
                    { name: 'Status', value: 'CLAIMED', inline: true },
                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setTimestamp();

            // Disable the claim button and keep the close button enabled
            const claimButton = new ButtonBuilder()
                .setCustomId(`claim_room_${claimId}`)
                .setLabel('Room Sudah Diambil')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🙋')
                .setDisabled(true);

            const closeButton = new ButtonBuilder()
                .setCustomId(`close_claim_${claimId}`)
                .setLabel('Tutup Locket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒');

            const updatedRow = new ActionRowBuilder().addComponents(claimButton, closeButton);

            // Update the message
            await interaction.update({
                embeds: [updatedEmbed],
                components: [updatedRow]
            });

            // Send confirmation message
            await interaction.followUp({
                content: `Kamu telah mengambil klaim #${claimId}. Sekarang kamu bisa menangani klaim ini.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error handling claim room button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat mengambil room klaim. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
