const { EmbedBuilder } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: 'btn_approve_join_request',
    async execute(interaction) {
        try {
            // Extract family head ID and requester ID from custom ID
            // Format: btn_approve_join_request_{familyHeadId}_{requesterId}
            const parts = interaction.customId.split('_');
            if (parts.length < 5) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Format ID permintaan tidak valid.',
                        ephemeral: true
                    });
                }
                return;
            }

            const familyHeadId = parts[4]; // family head ID
            const requesterId = parts[5]; // requester ID

            // Verify that the person clicking is indeed the family head
            if (interaction.user.id !== familyHeadId) {
                await interaction.reply({
                    content: 'Hanya kepala keluarga yang dapat menyetujui permintaan ini.',
                    ephemeral: true
                });
                return;
            }

            // Get the family info using async method
            const family = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM families WHERE owner_id = ?', [familyHeadId], (err, row) => {
                    if (err) {
                        console.error('Database error getting family:', err);
                        reject(err);
                    } else {
                        resolve(row);
                    }
                });
            });

            if (!family) {
                await interaction.reply({
                    content: 'Keluarga tidak ditemukan.',
                    ephemeral: true
                });
                return;
            }

            // Get the request info using async method
            const request = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM family_requests WHERE requester_id = ? AND family_id = ? AND status = ?',
                    [requesterId, familyHeadId, 'PENDING'], (err, row) => {
                        if (err) {
                            console.error('Database error getting request:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
            });

            if (!request) {
                await interaction.reply({
                    content: 'Permintaan tidak ditemukan atau sudah diproses.',
                    ephemeral: true
                });
                return;
            }

            // Update the request status to APPROVED using async method
            await new Promise((resolve, reject) => {
                db.run('UPDATE family_requests SET status = ? WHERE requester_id = ? AND family_id = ?',
                    ['APPROVED', requesterId, familyHeadId], (err) => {
                        if (err) {
                            console.error('Database error updating request:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
            });

            // Add the user to the family_members table using async method
            try {
                await new Promise((resolve, reject) => {
                    db.run('INSERT INTO family_members (user_id, family_id, join_date) VALUES (?, ?, ?)',
                        [requesterId, familyHeadId, new Date().toISOString()], (err) => {
                            if (err) {
                                // If user is already in the family, continue anyway
                                if (err.errno !== 19) { // SQLITE_CONSTRAINT error code
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            } else {
                                resolve();
                            }
                        });
                });
            } catch (insertError) {
                console.error('Error inserting to family_members:', insertError);
            }

            // Get the guild and member
            // Since interaction happens in DM, interaction.guild is null
            // So we need to get the guild from the client
            const guild = interaction.client.guilds.cache.get(interaction.guildId) ||
                interaction.client.guilds.cache.first(); // fallback to first guild if needed
            if (!guild) {
                await interaction.reply({
                    content: 'Server tidak ditemukan. Tidak dapat menyelesaikan permintaan.',
                    ephemeral: true
                });
                return;
            }

            let member;
            try {
                member = await guild.members.fetch(requesterId);
            } catch (memberFetchError) {
                // If member is not in the guild, fetch the user instead
                if (memberFetchError.code === 10007) { // Unknown Member
                    console.log(`User ${requesterId} tidak ditemukan di guild, mengambil data user biasa`);
                    member = await interaction.client.users.fetch(requesterId);
                } else {
                    throw memberFetchError; // Re-throw if it's a different error
                }
            }

            // Find the family role by name (the general family role, not the head role)
            if (family && family.family_name) {
                // Refresh the guild roles cache to ensure we have the latest roles
                await guild.roles.fetch();

                // Look for the general family role (without "(Ketua)" suffix)
                const familyRole = guild.roles.cache.find(role =>
                    role.name === family.family_name &&
                    !role.name.includes('(Ketua)')
                );

                if (familyRole) {
                    try {
                        // Only add role if member is actually a guild member
                        if (member && member.joinedAt) {
                            await member.roles.add(familyRole);
                            console.log(`Role "${familyRole.name}" added to user ${requesterId}`);
                        } else {
                            console.log(`User ${requesterId} bukan anggota guild, tidak bisa menambahkan role`);
                        }
                    } catch (roleError) {
                        console.error('Error adding family role to user:', roleError);
                    }
                } else {
                    console.error(`Family role "${family.family_name}" not found`);
                    // Try to find a role that contains the family name (as fallback)
                    const similarRole = guild.roles.cache.find(role =>
                        role.name.includes(family.family_name) &&
                        !role.name.includes('(Ketua)')
                    );

                    if (similarRole) {
                        console.log(`Found similar role: "${similarRole.name}", trying to use this instead`);
                        try {
                            if (member && member.joinedAt) {
                                await member.roles.add(similarRole);
                                console.log(`Similar role "${similarRole.name}" added to user ${requesterId}`);
                            }
                        } catch (roleError) {
                            console.error('Error adding similar family role to user:', roleError);
                        }
                    }
                }
            } else {
                console.error('Family data or family name is undefined');
            }

            // Update the embed to show approved status
            // Handle both user and member objects for tag and avatar
            let requesterTag, requesterAvatar;

            if (member) {
                requesterTag = member.tag || member.username || 'Unknown User';
                requesterAvatar = member.displayAvatarURL ? member.displayAvatarURL({ dynamic: true }) :
                    member.avatarURL ? member.avatarURL({ dynamic: true }) :
                        'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
            } else {
                requesterTag = 'Unknown User';
                requesterAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
            }

            const updatedEmbed = new EmbedBuilder()
                .setTitle(`💌 Permintaan Bergabung Keluarga - DISETUJUI`)
                .setDescription(`Pengguna **${requesterTag}** ingin bergabung dengan keluargamu "${family.family_name}".\n\n**Alasan bergabung:** ${request.reason}`)
                .setColor('#00FF00') // Green color for approved
                .setThumbnail(requesterAvatar)
                .addFields(
                    { name: 'Status', value: 'DISETUJUI', inline: true },
                    { name: 'Disetujui oleh', value: interaction.user.tag, inline: true },
                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                )
                .setTimestamp();

            // Remove the buttons
            await interaction.update({ embeds: [updatedEmbed], components: [] });

            // Send success message to family head
            await interaction.followUp({
                content: `Permintaan dari **${requesterTag}** untuk bergabung dengan keluarga "${family.family_name}" telah disetujui.`,
                ephemeral: true
            });

            // Notify the requester that their request was approved
            try {
                const requester = await interaction.client.users.fetch(requesterId);
                await requester.send(`🎉 Permintaanmu untuk bergabung dengan keluarga "${family.family_name}" telah **disetujui** oleh kepala keluarga! Selamat datang di keluargamu yang baru!`);
            } catch (dmError) {
                console.error('Could not send DM to requester:', dmError);
            }
        } catch (error) {
            console.error('Error handling approve join request button:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat menyetujui permintaan bergabung keluarga. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
