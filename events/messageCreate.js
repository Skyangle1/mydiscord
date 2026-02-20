const { updateBondedHousePanel } = require('../handlers/bondedHouseUtils');
const { updateReflectionPanel } = require('../handlers/reflectionUtils');
const { updateHiringNewsPanel } = require('../handlers/hiringNewsUtils');

module.exports = async (client, message) => {
    try {
        // Bonded House Auto-Update
        const bondedChannelId = process.env.BONDED_CHANNEL_ID;
        if (bondedChannelId && message.channel.id === bondedChannelId && !message.author.bot) {
            await updateBondedHousePanel(client);
        }

        // Reflection Ticket Auto-Update
        const reflectionChannelId = process.env.REFLECTION_LOG_CHANNEL_ID;
        if (reflectionChannelId && message.channel.id === reflectionChannelId && !message.author.bot) {
            await updateReflectionPanel(client);
        }

        // Hiring News Auto-Update
        const hiringNewsChannelId = process.env.HIRING_NEWS_CHANNEL_ID;
        if (hiringNewsChannelId && message.channel.id === hiringNewsChannelId && !message.author.bot) {
            await updateHiringNewsPanel(client);
        }

    } catch (error) {
        console.error('Error in messageCreate event:', error);
    }
};