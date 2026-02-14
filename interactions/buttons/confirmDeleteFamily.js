const { db } = require('../../database/db');
const { updateFamilyDirectory } = require('../../handlers/familyDirectoryUtils');

module.exports = {
    customId: /^btn_confirm_delete_family_(\d+)$/, // Regex to capture Owner ID
    async execute(interaction) {
        // Extract Owner ID from customId
        const ownerId = interaction.customId.split('_')[4]; // "btn_confirm_delete_family_12345" -> index 4

        await interaction.deferReply({ ephemeral: true });

        try {
            // 1. Get Family Data (to get Role IDs)
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [ownerId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!family) {
                return await interaction.editReply({ content: '❌ Keluarga tidak ditemukan or sudah dihapus.' });
            }

            // 2. Delete Roles from Discord
            // Delete Head Role
            try {
                if (family.role_id) {
                    const headRole = await interaction.guild.roles.fetch(family.role_id);
                    if (headRole) await headRole.delete(`Family deleted by Admin ${interaction.user.tag}`);
                }
            } catch (roleError) {
                console.error('Error deleting head role:', roleError);
            }

            // Delete Member Role
            try {
                if (family.member_role_id) {
                    const memberRole = await interaction.guild.roles.fetch(family.member_role_id);
                    if (memberRole) await memberRole.delete(`Family deleted by Admin ${interaction.user.tag}`);
                }
            } catch (roleError) {
                console.error('Error deleting member role:', roleError);
            }

            // 3. Delete from Database 
            // Delete Members
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM family_members WHERE family_id = (SELECT owner_id FROM families WHERE owner_id = ?)', [ownerId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Delete Requests
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM family_requests WHERE family_id = ?', [ownerId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Delete Family
            await new Promise((resolve, reject) => {
                db.run('DELETE FROM families WHERE owner_id = ?', [ownerId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // 4. Update Directory
            await updateFamilyDirectory(interaction.client);

            // 5. Notify Admin
            await interaction.editReply({ content: `✅ Keluarga **${family.family_name}** telah berhasil dihapus secara permanen (Role & Database).` });

            // 6. Update the confirmation message (remove buttons)
            if (interaction.message) {
                try {
                    await interaction.message.edit({ components: [], embeds: [], content: `✅ Keluarga **${family.family_name}** dihapus oleh ${interaction.user.tag}.` });
                } catch (msgError) {
                    console.log('Could not edit confirmation message (likely already deleted or ephemeral mismatch):', msgError.message);
                }
            }

        } catch (error) {
            console.error('Error deleting family:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat menghapus keluarga.' });
        }
    }
};
