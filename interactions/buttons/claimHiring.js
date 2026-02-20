const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: /^claim_hiring_\d+$/,
    async execute(interaction) {
        try {
            // Authorized Check (Staff Only) - SAME AS REFLECTION
            const staffRoles = process.env.HIRING_STAFF_ROLE_ID ? process.env.HIRING_STAFF_ROLE_ID.split(',') : [];
            const adminRoles = process.env.HIRING_ADMIN_ROLE_ID ? process.env.HIRING_ADMIN_ROLE_ID.split(',') : [];

            let isAuthorized = false;
            if (interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) isAuthorized = true;
            if (interaction.member.roles.cache.some(r => adminRoles.includes(r.id))) isAuthorized = true;

            if (!isAuthorized) {
                return await interaction.reply({ content: 'Only staff can claim this application.', ephemeral: true });
            }

            // Acknowledge - SAME AS REFLECTION
            await interaction.reply({ content: `✅ Application claimed by ${interaction.user}.`, ephemeral: false });

            // Update Thread Name (SAME AS REFLECTION)
            const thread = interaction.channel;
            if (thread.isThread()) {
                const oldName = thread.name;
                // Avoid double tagging
                if (!oldName.includes('✅')) {
                    await thread.setName(`✅ ${oldName}`);
                }
            }

            // Disable Claim Button - SAME AS REFLECTION
            const message = interaction.message;
            if (message) {
                const oldEmbed = message.embeds[0];
                const oldComponents = message.components[0]; // ActionRow

                // Rebuild components: Disable Claim, Keep Close enabled
                const newRow = new ActionRowBuilder();

                oldComponents.components.forEach(comp => {
                    const builder = ButtonBuilder.from(comp);
                    if (builder.data.custom_id.startsWith('claim_hiring')) {
                        builder.setDisabled(true);
                        builder.setLabel(`Claimed by ${interaction.user.username}`);
                        builder.setStyle(ButtonStyle.Secondary);
                    }
                    newRow.addComponents(builder);
                });

                await message.edit({ embeds: [oldEmbed], components: [newRow] });
            }

        } catch (error) {
            console.error('Error claiming hiring application:', error);
            if (!interaction.replied) await interaction.reply({ content: 'Error claiming application.', ephemeral: true });
        }
    }
};
