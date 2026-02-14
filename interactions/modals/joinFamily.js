const { db } = require('../../database/db');

module.exports = {
    customId: 'modal_join_family',
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        try {
            // Get values from modal
            const familyName = interaction.fields.getTextInputValue('join_family_name');
            const joinReason = interaction.fields.getTextInputValue('join_reason');

            console.log(`Nama keluarga yang diminta: ${familyName}`);
            console.log(`Alasan bergabung: ${joinReason}`);

            // Check if user is already a family head
            const userFamilyHead = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [interaction.user.id], (err, row) => {
                    if (err) {
                        console.error('Database error checking family head:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (userFamilyHead) {
                await interaction.editReply({
                    content: 'Kamu sudah menjadi kepala dari sebuah keluarga. Tidak bisa bergabung ke keluarga lain sebagai anggota.',
                    flags: 64
                });
                return;
            }

            // Check if user is already in a family
            const userFamily = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM family_members WHERE user_id = ?', [interaction.user.id], (err, row) => {
                    if (err) {
                        console.error('Database error checking family member:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (userFamily) {
                await interaction.editReply({
                    content: 'Kamu sudah menjadi anggota dari sebuah keluarga.',
                    flags: 64
                });
                return;
            }

            // Check if the family exists
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE family_name = ?', [familyName], (err, row) => {
                    if (err) {
                        console.error('Database error checking family:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!family) {
                await interaction.editReply({
                    content: `Keluarga dengan nama "${familyName}" tidak ditemukan. Pastikan penulisan nama benar (case-sensitive).`,
                    flags: 64
                });
                return;
            }

            // Check if request already exists
            const existingRequest = await new Promise((resolve, reject) => {
                // Assuming 'family_requests' table exists based on context, though not explicitly seen in db.js view
                // Step 128 showed db.js creates 'family_requests' in initializeDatabase? 
                // Yes, db.js snippet: "Create family_requests table...".
                // I need to be sure about the table structure.
                // Assuming (user_id, family_id, reason)
                db.get('SELECT * FROM family_requests WHERE user_id = ? AND family_id = ?',
                    [interaction.user.id, family.owner_id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
            });

            if (existingRequest) {
                await interaction.editReply({
                    content: 'Kamu sudah mengirim permintaan bergabung ke keluarga ini. Tunggu konfirmasi dari kepala keluarga.',
                    flags: 64
                });
                return;
            }

            // Store the request
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO family_requests (user_id, family_id, reason) VALUES (?, ?, ?)',
                    [interaction.user.id, family.owner_id, joinReason],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this);
                    }
                );
            });

            // Notify user
            await interaction.editReply({
                content: `Permintaan bergabung ke keluarga **${familyName}** telah dikirim. Menunggu persetujuan kepala keluarga.`,
                flags: 64
            });

            // Notify Family Head (if possible via DM or channel)
            const familyHeadUser = await interaction.client.users.fetch(family.owner_id).catch(() => null);
            if (familyHeadUser) {
                try {
                    await familyHeadUser.send({
                        content: `📢 **Permintaan Anggota Baru!**\n\nUser **${interaction.user.tag}** ingin bergabung ke keluargamu.\n\n**Alasan:** ${joinReason}\n\nAntrean persetujuan belum diimplementasikan di versi ini (Gunakan /family-manage nanti).`
                    });
                } catch (dmError) {
                    console.error('Failed to DM family head:', dmError);
                }
            }

        } catch (error) {
            console.error('Error handling join family modal:', error);
            await interaction.editReply({
                content: 'Terjadi kesalahan internal. Silakan coba lagi.',
                flags: 64
            });
        }
    }
};
