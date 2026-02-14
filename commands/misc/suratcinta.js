const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suratcinta')
        .setDescription('Setup the confession panel'),
    async execute(interaction) {
        // Check if user is developer or owner (using CLIENT_OWNER_ID environment variable)
        const ownerIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!ownerIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Perintah ini hanya dapat digunakan oleh Developer dan Owner!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true }); // Defer reply to extend response time

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.CONFESSION_SETUP_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for confession panel has not been configured. Please set CONFESSION_SETUP_CHANNEL_ID in the .env file.',
                    ephemeral: true
                });
                return;
            }

            const targetChannel = interaction.client.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                await interaction.editReply({
                    content: `Target channel (ID: ${targetChannelId}) could not be found. Please verify the channel ID is correct.`,
                    ephemeral: true
                });
                return;
            }

            // Create the embed with romantic description for Maestro bot
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> VELVET CONFESSION')
                .setDescription('<:pinkcrown:1464766248054161621>VELVET CONFESSION\nThis desk is dedicated for Crownfolk who wish to express feelings, admiration, or affection.\n\nPlease use this service for the following purposes:\na. Sending confessions openly or anonymously\nb. Expressing appreciation or heartfelt messages\nc. Emotional expression within safe boundaries\nAll submissions are delivered as written, without moderation of feelings.\nKindly write respectfully and avoid coercive or inappropriate content.\n\n🕰️ Operating Hours: Always Available\n🚫 Harassment, pressure, or explicit content is prohibited.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#FF69B4')
                .setTimestamp();

            // Create the button with love letter emoji
            const writeButton = new ButtonBuilder()
                .setLabel('💌 Love Letter')
                .setStyle('Primary')
                .setCustomId('btn_open_letter_modal');

            const row = new ActionRowBuilder()
                .addComponents(writeButton);

            // Send the confession panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({
                content: `Confession panel has been set up successfully in ${targetChannel.toString()}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in setup command:', error);
            await interaction.editReply({ content: 'There was an error setting up the confession panel.', ephemeral: true });
        }
    },
};