const cron = require('node-cron');
const GeminiService = require('./gemini-service');
require('dotenv').config();

class DailyQuoteScheduler {
    constructor(client) {
        this.client = client;

        try {
            this.geminiService = new GeminiService(process.env.GEMINI_API_KEY);
        } catch (error) {
            console.error('Error initializing Gemini service:', error.message);
            this.geminiService = null;
        }

        this.task = null;
    }

    start() {
        // Schedule the task to run every day at 9:00 AM server time
        this.task = cron.schedule('0 9 * * *', () => {
            this.sendDailyQuote();
        }, {
            scheduled: false // We'll start it after checking if it should run
        });

        // Check if the channel is configured in .env and start the scheduler
        this.checkEnvAndStart();
    }

    checkEnvAndStart() {
        const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

        if (dailyQuoteChannelId && dailyQuoteChannelId !== 'your_daily_quote_channel_id_here') {
            this.task.start();
            console.log(`Daily quote scheduler started for channel ${dailyQuoteChannelId}`);
        } else {
            console.log('Daily quote channel not configured in .env file, scheduler not started.');
        }
    }

    async sendDailyQuote() {
        const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

        if (!dailyQuoteChannelId || dailyQuoteChannelId === 'your_daily_quote_channel_id_here') {
            console.log('Daily quote channel not configured in .env file, skipping daily quote.');
            return;
        }

        if (!this.geminiService) {
            console.error('Gemini service not initialized, cannot send daily quote.');
            return;
        }

        try {
            // Get the quote from Gemini API
            const quote = await this.geminiService.getDailyLoveQuote();

            // Get the channel
            const channel = this.client.channels.cache.get(dailyQuoteChannelId);

            if (!channel) {
                console.error(`Could not find channel with ID ${dailyQuoteChannelId}`);
                return;
            }

            // Create and send the embed
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle('💖 Daily Love Quote')
                .setDescription(`"${quote}"`)
                .setColor('#FF69B4')
                .setTimestamp()
                .setFooter({ text: 'Powered by Google Gemini ❤️' });

            await channel.send({ embeds: [embed] });
            console.log('Daily love quote sent successfully!');
        } catch (error) {
            // Handle specific Discord API errors
            if (error.code === 50013) { // Missing Permissions
                console.error('Bot lacks permissions to send messages in the daily quote channel:', error.message);
            } else if (error.code === 10003) { // Unknown Channel
                console.error('Daily quote channel does not exist or is inaccessible:', error.message);
            } else if (error.code === 50001) { // Missing Access
                console.error('Bot lacks access to view the daily quote channel:', error.message);
            } else {
                console.error('Error sending daily quote:', error);
            }
        }
    }
}

module.exports = DailyQuoteScheduler;