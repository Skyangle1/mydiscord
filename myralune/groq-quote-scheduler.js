const { EmbedBuilder } = require('discord.js');
const GroqService = require('./groq-service');

class GroqQuoteScheduler {
    constructor(client) {
        this.client = client;
        this.interval = null;
        this.isEnabled = false;
        this.groqService = null;
    }

    async start() {
        if (this.isEnabled) {
            console.log('Groq quote scheduler is already running');
            return;
        }

        // Inisialisasi Groq service
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.log('Groq API key not configured in .env file');
            return;
        }

        try {
            this.groqService = new GroqService(groqApiKey);
        } catch (error) {
            console.error('Error initializing Groq service:', error.message);
            return;
        }

        // Jalankan sekali segera setelah bot siap
        await this.sendRandomQuote();

        // Atur interval untuk mengirim setiap 12 jam (12 * 60 * 60 * 1000 = 43,200,000 milidetik)
        this.interval = setInterval(async () => {
            await this.sendRandomQuote();
        }, 43200000); // 12 jam dalam milidetik

        this.isEnabled = true;
        console.log('Groq quote scheduler started - sending quotes every 12 hours');
    }

    async stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isEnabled = false;
        console.log('Groq quote scheduler stopped');
    }

    async sendRandomQuote() {
        try {
            // Dapatkan channel dari environment variable
            const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;
            if (!dailyQuoteChannelId) {
                console.log('Daily quote channel not configured');
                return;
            }

            const dailyQuoteChannel = this.client.channels.cache.get(dailyQuoteChannelId);
            if (!dailyQuoteChannel) {
                console.log(`Daily quote channel (ID: ${dailyQuoteChannelId}) not found`);
                return;
            }

            // Generate kutipan acak menggunakan Groq
            const quoteText = await this.groqService.getDailyLoveQuote();

            // Buat embed dengan kutipan yang dihasilkan
            const embed = new EmbedBuilder()
                .setTitle('💖 Daily Love Quotes')
                .setDescription(quoteText || 'Love is in the air... Let these words warm your heart today.')
                .setColor('#FF69B4')
                .setTimestamp();

            // Kirim kutipan ke channel (tanpa tombol)
            await dailyQuoteChannel.send({ embeds: [embed] });

            console.log(`Quote sent to channel ${dailyQuoteChannel.name} (${dailyQuoteChannelId})`);
        } catch (error) {
            console.error('Error sending random quote:', error);

            // Jika API gagal, kirim pesan default
            try {
                const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;
                if (dailyQuoteChannelId) {
                    const dailyQuoteChannel = this.client.channels.cache.get(dailyQuoteChannelId);
                    if (dailyQuoteChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle('💖 Daily Love Quotes')
                            .setDescription('Love is in the air... Let these words warm your heart today.')
                            .setColor('#FF69B4')
                            .setTimestamp();

                        await dailyQuoteChannel.send({ embeds: [embed] });
                    }
                }
            } catch (fallbackError) {
                console.error('Error sending fallback quote:', fallbackError);
            }
        }
    }
}

module.exports = GroqQuoteScheduler;