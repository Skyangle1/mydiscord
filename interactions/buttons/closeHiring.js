const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^close_hiring_\d+$/,
    async execute(interaction) {
        try {
            // Check Authorization (Staff Only) - SAME AS REFLECTION
            const authorizedIds = process.env.CLIENT_OWNER_ID ? process.env.CLIENT_OWNER_ID.split(',') : [];
            const staffRoles = process.env.HIRING_STAFF_ROLE_ID ? process.env.HIRING_STAFF_ROLE_ID.split(',') : [];
            const adminRoles = process.env.HIRING_ADMIN_ROLE_ID ? process.env.HIRING_ADMIN_ROLE_ID.split(',') : [];

            let isAuthorized = false;
            // Check Owner
            if (authorizedIds.includes(interaction.user.id)) isAuthorized = true;
            // Check Staff Role
            if (interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) isAuthorized = true;
            if (interaction.member.roles.cache.some(r => adminRoles.includes(r.id))) isAuthorized = true;

            if (!isAuthorized) {
                return await interaction.reply({ content: 'Only staff can close this application.', ephemeral: true });
            }

            const applicationId = interaction.customId.split('_')[2];

            // Update DB Status - SAME AS REFLECTION
            await new Promise((resolve, reject) => {
                db.run(`UPDATE hiring_applications SET status = 'CLOSED' WHERE id = ?`, [applicationId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Archive/Lock Thread - SAME AS REFLECTION
            // Reply BEFORE archiving/locking
            await interaction.reply({ content: 'Application closed & archived.', ephemeral: true });

            // Archive/Lock Thread
            const thread = interaction.channel;
            if (thread.isThread()) {
                await thread.setLocked(true);
                await thread.setArchived(true);
            }

        } catch (error) {
            console.error('Error closing hiring application:', error);
            if (!interaction.replied) await interaction.reply({ content: 'Error closing application.', ephemeral: true });
        }
    }
};
