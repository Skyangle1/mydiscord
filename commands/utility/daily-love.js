const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily-love')
        .setDescription('Check the daily love quotes channel setup'),
    async execute(interaction) {
        const requiredRoleId = process.env.SETUP_ROLE_ID;
        if (!requiredRoleId) {
            return await interaction.reply({
                content: 'Role untuk menggunakan perintah ini belum disetel!',
                ephemeral: true
            });
        }

        const member = interaction.member;
        const hasRole = member.roles.cache.has(requiredRoleId);

        if (!hasRole) {
            return await interaction.reply({
                content: `Anda tidak memiliki role yang diperlukan untuk menggunakan perintah ini!`,
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
                    content: `Daily love quotes are configured to be sent to: ${channel.toString()} (ID: ${dailyQuoteChannelId}). The bot will send a love quote every day at 9:00 AM server time.`,
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