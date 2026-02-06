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
        this.suggestionRefreshTask = null;
    }

    start() {
        // Schedule the task to run twice daily (every 12 hours) - at 7:00 AM and 7:00 PM WIB (UTC+7)
        this.task = cron.schedule('0 7,19 * * *', () => {
            this.sendDailyQuote();
        }, {
            scheduled: false // We'll start it after checking if it should run
        });

        // Schedule the suggestion panel refresh to run every hour to keep it visible
        this.suggestionRefreshTask = cron.schedule('0 * * * *', () => {
            this.refreshSuggestionPanel();
        }, {
            scheduled: false
        });

        // Check if the channel is configured in .env and start the schedulers
        this.checkEnvAndStart();
    }

    checkEnvAndStart() {
        const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

        if (dailyQuoteChannelId && dailyQuoteChannelId !== 'your_daily_quote_channel_id_here') {
            this.task.start();
            console.log(`Daily quote scheduler started for channel ${dailyQuoteChannelId}. Running twice daily at 7:00 AM and 7:00 PM WIB.`);
        } else {
            console.log('Daily quote channel not configured in .env file, scheduler not started.');
        }

        // Start the suggestion panel refresh task if the channel is configured
        const feedbackChannelId = process.env.FEEDBACK_LOG_CHANNEL_ID;
        if (feedbackChannelId && feedbackChannelId !== 'your_feedback_log_channel_id_here') {
            this.suggestionRefreshTask.start();
            console.log(`Suggestion panel refresh scheduler started for channel ${feedbackChannelId}. Running every hour to keep button visible.`);
        } else {
            console.log('Feedback channel not configured in .env file, suggestion refresh scheduler not started.');
        }
    }

    async sendDailyQuote() {
        const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

        if (!dailyQuoteChannelId || dailyQuoteChannelId === 'your_daily_quote_channel_id_here') {
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
                .setFooter({ text: 'Powered by Groq AI ❤️' });

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

    async refreshSuggestionPanel() {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const feedbackChannelId = process.env.FEEDBACK_LOG_CHANNEL_ID;

        if (!feedbackChannelId || feedbackChannelId === 'your_feedback_log_channel_id_here') {
            console.log('Feedback channel not configured in .env file, skipping suggestion panel refresh.');
            return;
        }

        try {
            // Get the channel
            const channel = this.client.channels.cache.get(feedbackChannelId);

            if (!channel) {
                console.error(`Could not find feedback channel with ID ${feedbackChannelId}`);
                return;
            }

            // Create the embed with saran description
            const embed = new EmbedBuilder()
                .setTitle('📝 Kotak Aspirasi Mɣralune')
                .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                .setColor('#811331')
                .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_saran') // ID Tombol
                    .setLabel('Beri Masukan ✨')
                    .setStyle(ButtonStyle.Primary)
            );

            // Send the message with button to the target channel
            await channel.send({ embeds: [embed], components: [row] });
            console.log('Suggestion panel refreshed successfully!');
        } catch (error) {
            console.error('Error refreshing suggestion panel:', error);
        }
    }
}

module.exports = GroqDailyQuoteScheduler;