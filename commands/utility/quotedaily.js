const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GroqService = require('../../myralune/groq-service');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quotedaily')
        .setDescription('Send a random daily love quote from Groq AI'),
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
            // Get the daily quote channel from environment variable
            const dailyQuoteChannelId = process.env.DAILY_QUOTE_CHANNEL_ID;

            if (!dailyQuoteChannelId) {
                await interaction.editReply({
                    content: 'Daily quote channel has not been configured. Please set DAILY_QUOTE_CHANNEL_ID in the .env file.',
                    ephemeral: true
                });
                return;
            }

            const dailyQuoteChannel = interaction.client.channels.cache.get(dailyQuoteChannelId);

            if (!dailyQuoteChannel) {
                await interaction.editReply({
                    content: `Daily quote channel (ID: ${dailyQuoteChannelId}) could not be found. Please verify the channel ID is correct.`,
                    ephemeral: true
                });
                return;
            }

            // Get Groq API key from environment variable
            const groqApiKey = process.env.GROQ_API_KEY;
            if (!groqApiKey) {
                await interaction.editReply({
                    content: 'Groq API key has not been configured. Please set GROQ_API_KEY in the .env file.',
                    ephemeral: true
                });
                return;
            }

            // Initialize Groq service
            const groqService = new GroqService(groqApiKey);

            try {
                const quoteText = await groqService.getDailyLoveQuote();

                // Create the embed with the generated quote
                const embed = new EmbedBuilder()
                    .setTitle('💖 Daily Love Quotes')
                    .setDescription(quoteText || 'Love is in the air... Let these words warm your heart today.')
                    .setColor('#FF69B4')
                    .setTimestamp();

                // Send the quote to the target channel (no buttons)
                await dailyQuoteChannel.send({ embeds: [embed] });

                await interaction.editReply({
                    content: `Daily love quote has been sent successfully to ${dailyQuoteChannel.toString()}.`,
                    ephemeral: true
                });
            } catch (apiError) {
                console.error('Error calling Groq API:', apiError);

                // Create the embed with a default message if API fails
                const embed = new EmbedBuilder()
                    .setTitle('💖 Daily Love Quotes')
                    .setDescription('Love is in the air... Let these words warm your heart today.')
                    .setColor('#FF69B4')
                    .setTimestamp();

                // Send the quote to the target channel (no buttons)
                await dailyQuoteChannel.send({ embeds: [embed] });

                await interaction.editReply({
                    content: `Daily love quote has been sent successfully to ${dailyQuoteChannel.toString()}. (Note: Groq API failed, using default message)`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in daily love command:', error);
            await interaction.editReply({ content: 'There was an error sending the daily love quote.', ephemeral: true });
        }
    },
};