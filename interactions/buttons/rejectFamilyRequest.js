const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: /^btn_reject_join_family_\d+$/, // Matches btn_reject_join_family_userId
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            const parts = interaction.customId.split('_');
            const requesterId = parts[4]; // btn_reject_join_family_USERID -> index 4

            // 1. Update DM Embed
            const oldEmbed = interaction.message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setColor(0xFF0000) // Red
                .setTitle('❌ Permohonan Ditolak')
                .setFooter({ text: 'Permohonan ini telah ditolak.' });

            // Disable buttons
            const oldRows = interaction.message.components;
            const newRows = oldRows.map(row => {
                const newRow = new ActionRowBuilder();
                row.components.forEach(comp => {
                    const btn = ButtonBuilder.from(comp);
                    btn.setDisabled(true);
                    newRow.addComponents(btn);
                });
                return newRow;
            });

            await interaction.editReply({ embeds: [newEmbed], components: newRows });

            // 2. Notify Requester
            try {
                const requester = await interaction.client.users.fetch(requesterId);
                await requester.send('Maaf, permohonan bergabungmu telah ditolak oleh Kepala Keluarga.');
            } catch (dmErr) {
                console.warn('Failed to DM requester rejection:', dmErr);
            }

        } catch (error) {
            console.error('Error rejecting family:', error);
            await interaction.followUp({ content: 'Terjadi kesalahan saat menolak.', ephemeral: true });
        }
    }
};
