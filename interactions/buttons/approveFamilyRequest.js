const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

// Config
const ALLOWED_GUILD_IDS = process.env.ALLOWED_GUILD_ID ? process.env.ALLOWED_GUILD_ID.split(',') : [];

module.exports = {
    customId: /^btn_approve_join_family_(\d+)_(\d+)$/, // Regex: btn_approve_join_family_USERID_FAMILYID
    async execute(interaction) {
        // Parse IDs from customId
        const parts = interaction.customId.split('_');
        const requesterId = parts[4];
        const familyOwnerId = parts[5];

        await interaction.deferReply({ ephemeral: true });

        try {
            // 1. Get Family Details (Need role_id)
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [familyOwnerId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!family) {
                return await interaction.editReply({ content: 'Keluarga tidak ditemukan.' });
            }

            // 2. Add User to DB (family_members)
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO family_members (user_id, family_id) VALUES (?, ?)',
                    [requesterId, familyOwnerId],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            // 3. Assign Role to User
            // Loop through allowed guilds to find the member and assign role
            let roleAssigned = false;
            for (const guildId of ALLOWED_GUILD_IDS) {
                try {
                    const guild = await interaction.client.guilds.fetch(guildId);
                    const member = await guild.members.fetch(requesterId);

                    if (member) {
                        // Assign Member Role (member_role_id)
                        if (family.member_role_id) {
                            await member.roles.add(family.member_role_id);
                            roleAssigned = true;
                            console.log(`Assigned member role ${family.member_role_id} to ${member.user.tag} in guild ${guild.name}`);
                        } else {
                            // Fallback for old families without member_role_id (assign role_id)
                            await member.roles.add(family.role_id);
                            roleAssigned = true;
                            console.log(`Assigned legacy role ${family.role_id} to ${member.user.tag} in guild ${guild.name} (No member role)`);
                        }
                    }
                } catch (err) {
                    console.error(`Failed to assign role in guild ${guildId}:`, err);
                    // Continue to next guild
                }
            }

            if (!roleAssigned) {
                await interaction.editReply({ content: '✅ User berhasil ditambahkan ke database, namun Gagal memberikan Role Discord (User tidak ditemukan di server/Bot kurang izin).' });
            } else {
                await interaction.editReply({ content: `✅ Permintaan bergabung diterima! <@${requesterId}> telah menjadi anggota keluarga **${family.family_name}**.` });
            }

            // 4. Update Family Directory
            try {
                const { updateFamilyDirectory } = require('../../handlers/familyDirectoryUtils');
                await updateFamilyDirectory(interaction.client);
            } catch (dirError) {
                console.error('Error updating directory:', dirError);
            }

            // 5. Notify Requester (DM)
            try {
                const user = await interaction.client.users.fetch(requesterId);
                await user.send(`🎉 Selamat! Permintaan kamu untuk bergabung dengan keluarga **${family.family_name}** telah disetujui!`);
            } catch (dmError) {
                console.log('Could not DM user:', dmError);
            }

            // 6. Disable Buttons on the request message (in DM)
            await interaction.message.edit({ components: [] });

        } catch (error) {
            console.error('Error approving join request:', error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                await interaction.editReply({ content: 'User tersebut sudah menjadi anggota keluarga ini.' });
            } else {
                await interaction.editReply({ content: 'Terjadi kesalahan saat memproses persetujuan.' });
            }
        }
    }
};
