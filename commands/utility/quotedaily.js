const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quotedaily')
        .setDescription('Check the daily love quotes channel setup'),
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

        const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

        if (!dailyQuoteChannelId) {
            await interaction.reply({
                content: `Daily love quotes channel has not been configured yet. Please set DAILY_QUOTE_CHANNEL_ID in the .env file to the channel ID where you want daily quotes to be sent.`,
                ephemeral: true
            });
        } else {
            const channel = interaction.client.channels.cache.get(dailyQuoteChannelId);
            if (channel) {
                await interaction.reply({
                    content: `Daily love quotes are configured to be sent to: ${channel.toString()} (ID: ${dailyQuoteChannelId}). The bot will send a love quote every 30 seconds (currently in testing mode).`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `Daily love quotes channel ID is set in .env file (ID: ${dailyQuoteChannelId}), but the channel could not be found. Please verify the channel ID is correct.`,
                    ephemeral: true
                });
            }
        }
    },
};