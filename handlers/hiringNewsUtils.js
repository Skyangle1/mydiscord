const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Updates the Hiring News panel.
 * Ensures the panel is always the last message in HIRING_NEWS_CHANNEL_ID.
 * @param {import('discord.js').Client} client
 */
async function updateHiringNewsPanel(client) {
    try {
        const channelId = process.env.HIRING_NEWS_CHANNEL_ID;
        if (!channelId) return;

        const channel = client.channels.cache.get(channelId);
        if (!channel) return;

        // Fetch last few messages
        const messages = await channel.messages.fetch({ limit: 5 });
        const lastMessage = messages.first();

        // Content (Must match commands/utility/hiring-news.js)
        const embed = new EmbedBuilder()
            .setTitle('<:pinkcrown:1464766248054161621>  HIRING NEWS')
            .setDescription('<:pinkcrown:1464766248054161621> HIRING NEWS\n\nThis desk is dedicated to official recruitment and role openings within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Volunteer and staff recruitment updates\n> b. Internal role expansion notices\nAll hiring information shared here is official and issued by the Kingdom.\nKindly review requirements carefully before applying or responding.\n\n> 🕰️ Operating Hours: 08:00 am – 10:00 pm (WIB) (UTC +7)\n> 🚫 Unofficial offers or impersonation are strictly prohibited.\n> 📜 Managed by the Royal Secretaries')
            .setColor('#FFD700')
            .setFooter({ text: '📜 Managed by the Royal Secretaries.', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_open_hiring_news')
                .setLabel('Apply Position')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📝')
        );

        // Check if last message is already our panel
        let isSame = false;
        if (lastMessage && lastMessage.author.id === client.user.id &&
            lastMessage.embeds.length > 0 &&
            lastMessage.embeds[0].title === '<:pinkcrown:1464766248054161621>  HIRING NEWS') {
            isSame = true;
        }

        if (isSame) return;

        // Cleanup old panels
        const oldPanels = messages.filter(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title === '<:pinkcrown:1464766248054161621>  HIRING NEWS'
        );

        for (const oldPanel of oldPanels.values()) {
            try { await oldPanel.delete(); } catch (e) { console.error('Failed to delete old hiring news panel:', e.message); }
        }

        // Send new
        await channel.send({ embeds: [embed], components: [row] });
        // console.log('Hiring News Panel updated.');

    } catch (error) {
        console.error('Error updating Hiring News Panel:', error);
    }
}

module.exports = { updateHiringNewsPanel };
