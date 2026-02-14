const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^close_reflection_\d+$/,
    async execute(interaction) {
        try {
            // Check Authorization (User or Staff)
            // Ideally only Staff should close? Or User too? Let's say User too.
            // But usually counseling is closed by Staff.
            // Let's allow Staff + Owner.

            const authorizedIds = process.env.CLIENT_OWNER_ID ? process.env.CLIENT_OWNER_ID.split(',') : [];
            const staffRoles = process.env.REFLECTION_COUNSELOR_ROLE_ID ? process.env.REFLECTION_COUNSELOR_ROLE_ID.split(',') : [];

            let isAuthorized = false;
            // Check Owner
            if (authorizedIds.includes(interaction.user.id)) isAuthorized = true;
            // Check Staff Role
            if (interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) isAuthorized = true;
            // Check User (Author)? Maybe? Let's restrict to Staff for now as per "Counsel" vibe.

            if (!isAuthorized) {
                return await interaction.reply({ content: 'Only Royal Counsel can close this session.', ephemeral: true });
            }

            const reflectionId = interaction.customId.split('_')[2];

            // Update DB Status
            await new Promise((resolve, reject) => {
                db.run(`UPDATE reflections SET status = 'CLOSED' WHERE id = ?`, [reflectionId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Archive/Lock Thread
            // Reply BEFORE archiving/locking
            await interaction.reply({ content: 'Session closed & archived.', ephemeral: true });

            // Archive/Lock Thread
            const thread = interaction.channel;
            if (thread.isThread()) {
                await thread.setLocked(true);
                await thread.setArchived(true);
            }

        } catch (error) {
            console.error('Error closing reflection:', error);
            if (!interaction.replied) await interaction.reply({ content: 'Error closing session.', ephemeral: true });
        }
    }
};
