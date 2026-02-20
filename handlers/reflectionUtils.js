const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Updates the Reflection Ticket panel.
 * Ensures the panel is always the last message in REFLECTION_LOG_CHANNEL_ID.
 * @param {import('discord.js').Client} client 
 */
async function updateReflectionPanel(client) {
    try {
        const channelId = process.env.REFLECTION_LOG_CHANNEL_ID;
        if (!channelId) return;

        const channel = client.channels.cache.get(channelId);
        if (!channel) return;

        // Fetch last few messages
        const messages = await channel.messages.fetch({ limit: 5 });
        const lastMessage = messages.first();

        // Content (Must match commands/utility/reflection.js)
        const embed = new EmbedBuilder()
            .setTitle('<:pinkcrown:1464766248054161621> REFLECTION TICKET')
            .setDescription(
                '<:pinkcrown:1464766248054161621> REFLECTION TICKET\n\n' +
                'This desk is dedicated to private reflection sessions and personal support requests.\n\n' +
                'Please use this service for the following purposes:\n' +
                '> a. Requesting private reflection sessions\n' +
                '> b. Emotional or mental support inquiries\n' +
                '> c. One-on-one guidance with appointed counselors\n' +
                'All tickets are handled discreetly and with respect to personal boundaries.\n' +
                'Kindly share only what you are comfortable disclosing.\n\n' +
                '> 🕰️ Operating Hours: By Appointment\n' +
                '> 🚫 Misuse or false requests may lead to access limitations.'
            )
            .setColor('#FF99CC')
            .setFooter({ text: '📜 Managed by the Royal Counsel.', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_open_reflection')
                .setLabel('Request Session')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🕯️')
        );

        // Check if last message is already our panel
        // We identify it by the author (bot) and embed title AND button style (to be safe)
        let isSame = false;
        if (lastMessage && lastMessage.author.id === client.user.id &&
            lastMessage.embeds.length > 0 &&
            lastMessage.embeds[0].title === '<:pinkcrown:1464766248054161621> REFLECTION TICKET') {
            isSame = true;
        }

        if (isSame) return;

        // Cleanup old panels
        const oldPanels = messages.filter(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title === '<:pinkcrown:1464766248054161621> REFLECTION TICKET'
        );

        for (const oldPanel of oldPanels.values()) {
            try { await oldPanel.delete(); } catch (e) { console.error('Failed to delete old reflection panel:', e.message); }
        }

        // Send new
        await channel.send({ embeds: [embed], components: [row] });
        // console.log('Reflection Panel updated.');

    } catch (error) {
        console.error('Error updating Reflection Panel:', error);
    }
}

module.exports = { updateReflectionPanel };
