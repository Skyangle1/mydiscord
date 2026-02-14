const { db } = require('../../database/db');

module.exports = {
    customId: 'btn_list_families',
    async execute(interaction) {
        // Defer reply immediately to handle potential delays (>3s)
        await interaction.deferReply({ fetchReply: true });

        try {
            // Query to get all families
            const families = [];
            db.each('SELECT family_name, slogan, owner_id FROM families ORDER BY family_name ASC', [], (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                } else {
                    families.push(row);
                }
            }, async () => {
                // After all rows are processed, organize the list
                let households = [];
                let circles = [];

                // Crown Landlord Role ID
                const crownLandlordRoleId = process.env.CROWN_LANDLORD_ROLE_ID;

                if (families.length > 0) {
                    // Fetch all owners to check their roles
                    // Optimization: We could fetch only if role ID exists
                    try {
                        const ownerIds = families.map(f => f.owner_id);
                        // Fetch members (max 100 per fetch usually, but here we just try fetching all involved)
                        // If many families, this might need batching. For now, simple fetch.
                        const members = await interaction.guild.members.fetch({ user: ownerIds });

                        for (const family of families) {
                            const ownerMember = members.get(family.owner_id);
                            const isHousehold = ownerMember && crownLandlordRoleId && ownerMember.roles.cache.has(crownLandlordRoleId);

                            const entry = `• **${family.family_name}**\n   "${family.slogan || '...'}"`;

                            if (isHousehold) {
                                households.push(entry);
                            } else {
                                circles.push(entry);
                            }
                        }
                    } catch (fetchError) {
                        console.error('Error fetching family owners:', fetchError);
                        // Fallback: put everyone in Circles if fetch fails
                        families.forEach(f => {
                            circles.push(`• **${family.family_name}**\n   "${family.slogan || '...'}"`);
                        });
                    }
                }

                // Construct Message
                let messageContent = '📋 **Daftar Keluarga Mɣralune**\n\n';

                if (households.length > 0) {
                    messageContent += `🏰 **Grand Households** (Crown Landlords)\n${households.join('\n')}\n\n`;
                }

                if (circles.length > 0) {
                    messageContent += `🫂 **Bonded Circles**\n${circles.join('\n')}\n\n`;
                }

                if (families.length === 0) {
                    messageContent += '*Belum ada keluarga yang terdaftar.*';
                }

                // Send the list as a reply (editReply because deferred)
                /* eslint-disable no-unused-vars */
                let sentMessage;
                try {
                    sentMessage = await interaction.editReply({
                        content: messageContent,
                        fetchReply: true
                    });
                } catch (replyErr) {
                    console.error('Error sending family list:', replyErr);
                    return;
                }

                // Auto-delete after 60 seconds (60000 ms)
                setTimeout(async () => {
                    try {
                        if (sentMessage) await sentMessage.delete();
                    } catch (err) {
                        // Ignore delete errors (e.g. already deleted)
                    }
                }, 60000);
            });
        } catch (error) {
            console.error('Error listing families:', error);
            // If error before defer, reply. If after, editReply.
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat mengambil daftar keluarga. Silakan coba lagi.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'Terjadi kesalahan saat mengambil daftar keluarga. Silakan coba lagi.'
                });
            }
        }
    }
};
