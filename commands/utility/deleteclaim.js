const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleteclaim')
        .setDescription('Delete a claim (Admin only)')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('Claim ID to delete')
                .setRequired(true)),
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

        const claimId = interaction.options.getInteger('id');
        const { db } = require('../../database/db');

        try {
            // Delete the claim
            const deleteClaim = () => {
                return new Promise((resolve, reject) => {
                    const query = `DELETE FROM claims WHERE id = ?`;
                    db.run(query, [claimId], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.changes); // Number of affected rows
                        }
                    });
                });
            };

            const changes = await deleteClaim();
            if (changes === 0) {
                await interaction.reply({
                    content: `Klaim dengan ID #${claimId} tidak ditemukan.`,
                    ephemeral: true
                });
                return;
            }

            await interaction.reply({
                content: `Klaim dengan ID #${claimId} telah dihapus.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error deleting claim:', error);
            await interaction.reply({
                content: 'Terjadi kesalahan saat menghapus klaim.',
                ephemeral: true
            });
        }
    },
};