const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: /^claim_reflection_\d+$/,
    async execute(interaction) {
        try {
            // Authorized Check (Staff Only)
            const staffRoles = process.env.REFLECTION_COUNSELOR_ROLE_ID ? process.env.REFLECTION_COUNSELOR_ROLE_ID.split(',') : [];
            const authorizedIds = process.env.CLIENT_OWNER_ID ? process.env.CLIENT_OWNER_ID.split(',') : [];

            let isAuthorized = false;
            if (interaction.member.roles.cache.some(r => staffRoles.includes(r.id))) isAuthorized = true;
            if (authorizedIds.includes(interaction.user.id)) isAuthorized = true;

            if (!isAuthorized) {
                return await interaction.reply({ content: 'Only Royal Counsel can claim this session.', ephemeral: true });
            }

            // Acknowledge
            await interaction.reply({ content: `✅ Session claimed by ${interaction.user}.`, ephemeral: false });

            // Update Thread Name (Optional, but nice)
            const thread = interaction.channel;
            if (thread.isThread()) {
                const oldName = thread.name;
                // Avoid double tagging
                if (!oldName.includes('✅')) {
                    await thread.setName(`✅ ${oldName}`);
                }
            }

            // Disable Claim Button
            const message = interaction.message;
            if (message) {
                const oldEmbed = message.embeds[0];
                const oldComponents = message.components[0]; // ActionRow

                // Rebuild components: Disable Claim, Keep Close enabled
                const newRow = new ActionRowBuilder();

                oldComponents.components.forEach(comp => {
                    const builder = ButtonBuilder.from(comp);
                    if (builder.data.custom_id.startsWith('claim_reflection')) {
                        builder.setDisabled(true);
                        builder.setLabel(`Claimed by ${interaction.user.username}`);
                        builder.setStyle(ButtonStyle.Secondary);
                    }
                    newRow.addComponents(builder);
                });

                await message.edit({ embeds: [oldEmbed], components: [newRow] });
            }

        } catch (error) {
            console.error('Error claiming reflection:', error);
            if (!interaction.replied) await interaction.reply({ content: 'Error claiming session.', ephemeral: true });
        }
    }
};
