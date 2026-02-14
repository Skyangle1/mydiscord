const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

// Config
const ALLOWED_ADMIN_ROLES = process.env.CLAIM_ADMIN_ROLE_ID ? process.env.CLAIM_ADMIN_ROLE_ID.split(',') : [];

module.exports = {
    customId: 'btn_admin_delete_family_menu',
    async execute(interaction) {
        // 1. Check Permissions
        // Since we don't have a specific family admin role, uses CLAIM_ADMIN for now as general admin
        const hasPermission = interaction.member.permissions.has('Administrator') ||
            interaction.member.roles.cache.some(role => ALLOWED_ADMIN_ROLES.includes(role.id));

        if (!hasPermission) {
            return await interaction.reply({
                content: '🚫 Hanya Administrator yang dapat menggunakan tombol ini.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // 2. Fetch Families
            const families = await new Promise((resolve, reject) => {
                db.all('SELECT family_name, owner_id FROM families ORDER BY family_name ASC', [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            if (families.length === 0) {
                return await interaction.editReply({ content: 'Belum ada keluarga yang terdaftar.' });
            }

            // 3. Setup Select Menu
            const options = families.map(f => ({
                label: f.family_name.substring(0, 100),
                description: `Owner ID: ${f.owner_id}`,
                value: f.owner_id // Use Owner ID as unique identifier for deletion
            })).slice(0, 25); // Limit to 25 for Discord Select Menu

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_delete_family')
                .setPlaceholder('Pilih keluarga yang akan dihapus')
                .addOptions(options);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.editReply({
                content: '⚠️ **MODE PENGHAPUSAN KELUARGA** ⚠️\nPilih keluarga yang ingin dihapus dari daftar di bawah ini.\nTindakan ini akan menghapus Role dan Data Database.',
                components: [row]
            });

        } catch (error) {
            console.error('Error opening delete menu:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat memuat daftar keluarga.' });
        }
    }
};
