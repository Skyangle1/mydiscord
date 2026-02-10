const cron = require('node-cron');
const GroqService = require('./groq-service');
require('dotenv').config();

class GroqDailyQuoteScheduler {
    constructor(client) {
        this.client = client;

        // Inisialisasi Groq service
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.log('Groq API key not configured in .env file');
            this.groqService = null;
        } else {
            try {
                this.groqService = new GroqService(groqApiKey);
            } catch (error) {
                console.error('Error initializing Groq service:', error.message);
                this.groqService = null;
            }
        }

        this.task = null;
        // this.suggestionRefreshTask = null; // Disabled to prevent disturbance
    }

    start() {
        // Schedule the task to run twice daily - at 7:00 AM and 7:00 PM WIB (UTC+7)
        this.task = cron.schedule('0 7,19 * * *', () => {
            this.sendDailyQuote();
        }, {
            scheduled: false // We'll start it after checking if it should run
        });

        // The suggestion panel refresh scheduler has been disabled to prevent disturbance
        // this.suggestionRefreshTask = cron.schedule('0 * * * *', () => {
        //     this.refreshSuggestionPanel();
        // }, {
        //     scheduled: false
        // });

        // Check if the channel is configured in .env and start the schedulers
        this.checkEnvAndStart();
    }

    checkEnvAndStart() {
        const dailyQuoteChannelIds = process.env.DAILY_QUOTE_CHANNEL_ID ?
            process.env.DAILY_QUOTE_CHANNEL_ID.split(',').map(id => id.trim()) : [];

        if (dailyQuoteChannelIds && dailyQuoteChannelIds.length > 0 && !dailyQuoteChannelIds.includes('your_daily_quote_channel_id_here')) {
            this.task.start();
            console.log(`Daily quote scheduler started for channels ${dailyQuoteChannelIds.join(', ')}. Running twice daily at 7:00 AM and 7:00 PM WIB.`);
        } else {
            console.log('Daily quote channel not configured in .env file, scheduler not started.');
        }

        // Skip the suggestion panel refresh task to prevent disturbance
        // Stop the suggestion refresh task if it was previously started
        if (this.suggestionRefreshTask) {
            this.suggestionRefreshTask.stop();
        }
        console.log('Suggestion panel refresh scheduler disabled to prevent disturbance.');
    }

    async sendDailyQuote() {
        const dailyQuoteChannelIds = process.env.DAILY_QUOTE_CHANNEL_ID ?
            process.env.DAILY_QUOTE_CHANNEL_ID.split(',').map(id => id.trim()) : [];

        if (!dailyQuoteChannelIds || dailyQuoteChannelIds.length === 0 || dailyQuoteChannelIds.includes('your_daily_quote_channel_id_here')) {
            console.log('Daily quote channel not configured in .env file, skipping daily quote.');
            return;
        }

        if (!this.groqService) {
            console.error('Groq service not initialized, cannot send daily quote.');
            return;
        }

        try {
            // Get the quote from Groq API
            const quote = await this.groqService.getDailyLoveQuote();

            // Get all valid channels
            const validChannels = dailyQuoteChannelIds
                .map(id => this.client.channels.cache.get(id))
                .filter(channel => channel !== undefined);

            if (validChannels.length === 0) {
                console.error(`Could not find any valid channels with IDs ${dailyQuoteChannelIds.join(', ')}`);
                return;
            }

            // Create the embed
            const { EmbedBuilder } = require('discord.js');
            const embed = new EmbedBuilder()
                .setTitle('💖 Daily Love Quote')
                .setDescription(`"${quote}"`)
                .setColor('#FF69B4')
                .setTimestamp()
                .setFooter({ text: 'Powered by Groq AI ❤️' });

            // Send the embed to all valid channels
            for (const channel of validChannels) {
                await channel.send({ embeds: [embed] });
            }
            
            console.log(`Daily love quote sent successfully to ${validChannels.length} channel(s)!`);
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

    // refreshSuggestionPanel() has been disabled to prevent disturbance
    // The suggestion panel is only sent once when the /saran command is used
}

module.exports = GroqDailyQuoteScheduler;