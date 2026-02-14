const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^modal_join_request_\d+$/, // Matches modal_join_request_123456789
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const ownerId = interaction.customId.split('_')[3];
            const reason = interaction.fields.getTextInputValue('join_reason');
            const requester = interaction.user;

            // Fetch Family Name for context
            const getFamily = () => {
                return new Promise((resolve, reject) => {
                    db.get('SELECT family_name, owner_id FROM families WHERE owner_id = ?', [ownerId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            };

            const family = await getFamily();
            if (!family) {
                return await interaction.editReply({ content: 'Keluarga tidak ditemukan. Mungkin sudah bubar.' });
            }

            // Send DM to Owner for Approval
            try {
                const ownerUser = await interaction.client.users.fetch(ownerId);

                const dmEmbed = new EmbedBuilder()
                    .setTitle('🚪 Permohonan Masuk Keluarga')
                    .setDescription(`**${requester.tag}** ingin bergabung dengan keluarga **${family.family_name}**.\n\n**Alasan:**\n"${reason}"`)
                    .setColor('#FFD700')
                    .setTimestamp();

                const dmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`btn_approve_join_family_${requester.id}_${ownerId}`) // Matches approveFamilyRequest.js
                        .setLabel('Setujui')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅'),
                    new ButtonBuilder()
                        .setCustomId(`btn_reject_join_family_${requester.id}`) // Matches rejectFamilyRequest.js (to be verified)
                        .setLabel('Tolak')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('❌')
                );

                await ownerUser.send({ embeds: [dmEmbed], components: [dmRow] });

                // Also save request to DB? Ideally yes for tracking, but DM is primary flow as requested.
                // "penerima pesan hanya di berikan akses untuk menekan tombol saja" -> DM focus.
                // I will skip saving to `family_requests` table unless needed for persistence if bot restarts.
                // For simplicity and matching exact request, I rely on the DM buttons which contain all needed info.

                await interaction.editReply({ content: `✅ Permohonan dikirim ke Kepala Keluarga **${family.family_name}**. Tunggu persetujuan ya!` });

            } catch (dmError) {
                console.error('Failed to DM family owner:', dmError);
                await interaction.editReply({ content: 'Gagal mengirim pesan ke Kepala Keluarga. Pastikan DM mereka terbuka.' });
            }

        } catch (error) {
            console.error('Error handling join family modal:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan internal.' });
        }
    }
};
