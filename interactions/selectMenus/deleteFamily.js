const { db } = require('../../database/db');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'select_delete_family',
    async execute(interaction, client) {
        const ownerId = interaction.values[0]; // The selected family's owner ID
        console.log(`[DEBUG] Delete Family Select: Received OwnerID "${ownerId}" from values:`, interaction.values);

        try {
            // Fetch family details before deleting to get stats
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [ownerId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!family) {
                return await interaction.update({ content: '❌ Keluarga tidak ditemukan (mungkin sudah dihapus).', components: [] });
            }

            // Confirmation Step
            const confirmEmbed = new EmbedBuilder()
                .setTitle('⚠️ Konfirmasi Penghapusan')
                .setDescription(`Apakah Anda yakin ingin menghapus keluarga **${family.family_name}**?\n\n**Data yang akan dihapus:**\n- Role Discord: <@&${family.role_id}>\n- Data Database\n- Anggota Keluarga`)
                .setColor('#FF0000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`btn_confirm_delete_family_${ownerId}`)
                    .setLabel('YA, HAPUS PERMANEN')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('btn_cancel_delete_family')
                    .setLabel('Batal')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.update({ content: '', embeds: [confirmEmbed], components: [row] });

        } catch (error) {
            console.error('Error in select delete family:', error);
            await interaction.reply({ content: 'Terjadi kesalahan.', ephemeral: true });
        }
    }
};
