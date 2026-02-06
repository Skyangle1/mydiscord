const { updateBondedHousePanel } = require('../handlers/bondedHouseUtils');

module.exports = async (client, message) => {
    try {
        // Check if message is in the bonded house channel
        const bondedChannelId = process.env.BONDED_CHANNEL_ID;
        if (!bondedChannelId) {
            // If no bonded channel is configured, skip
            return;
        }

        if (message.channel.id === bondedChannelId && !message.author.bot) {
            // If the message is in the bonded channel and not from a bot
            // Update the bonded house panel to keep the button at the bottom
            await updateBondedHousePanel(message.channel);
        }
    } catch (error) {
        console.error('Error in messageCreate event for bonded house:', error);
    }
};