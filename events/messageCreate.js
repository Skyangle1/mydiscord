
module.exports = async (client, message) => {
    try {
        // Check if message is in the bonded house channel
        const bondedChannelId = process.env.BONDED_CHANNEL_ID;
        if (!bondedChannelId) {
            // If no bonded channel is configured, skip
            return;
        }

        // Skip updating the bonded house panel to prevent disturbance
        // The panel should only be placed once when the /bonded-house command is used
        // This prevents the panel from moving every time someone sends a message
    } catch (error) {
        console.error('Error in messageCreate event for bonded house:', error);
    }
};