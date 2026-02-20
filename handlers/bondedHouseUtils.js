const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Updates the Bonded House panel in the configured channel.
 * Ensures the panel is always the last message.
 * @param {import('discord.js').Client} client 
 */
async function updateBondedHousePanel(client) {
    try {
        const bondedChannelId = process.env.BONDED_CHANNEL_ID;
        if (!bondedChannelId) return;

        const channel = client.channels.cache.get(bondedChannelId);
        if (!channel) return;

        // Fetch the last few messages to check if the panel is already there
        const messages = await channel.messages.fetch({ limit: 5 });
        const lastMessage = messages.first();

        // Define the panel content (Must match commands/utility/bonded-house.js)
        const embed = new EmbedBuilder()
            .setTitle('<:pinkcrown:1464766248054161621> BONDED HOUSE')
            .setDescription('<:pinkcrown:1464766248054161621> BONDED HOUSE\n\nThis desk is dedicated for Crownfolk who wish to form or join virtual families and or households within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Establishing a new House\n> b. Requesting to join an existing House\n> c. Exploring registered Houses and Households\nEach House operates under Kingdom regulations and Crown Landlord authority.\nKindly ensure clarity of intent when building or joining a House.\n\n> 🕰️ Operating Hours: Always Available\n> 🚫 Misuse of house and household systems may result in removal.\n> 📜 Managed by the Royal Moderation Council.')
            .setColor('#FF69B4')
            .setFooter({ text: 'Keluarga adalah komunitas kecil dalam komunitas besar Mɣralune' })
            .setTimestamp();

        const buildButton = new ButtonBuilder()
            .setLabel('Bangun Keluarga')
            .setStyle(ButtonStyle.Success)
            .setCustomId('btn_build_family')
            .setEmoji('🏗️');

        const listButton = new ButtonBuilder()
            .setLabel('Daftar Keluarga')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('btn_list_families')
            .setEmoji('📋');

        const row = new ActionRowBuilder()
            .addComponents(buildButton, listButton);

        // Check if the last message is already our panel
        // We identify it by the author (bot) and the embed title
        if (lastMessage && lastMessage.author.id === client.user.id &&
            lastMessage.embeds.length > 0 &&
            (lastMessage.embeds[0].title === '🏠 Keluarga Mɣralune' ||
                lastMessage.embeds[0].title === '<:pinkcrown:1464766248054161621> BONDED HOUSE')) {
            // Panel is already at the bottom, do nothing
            return;
        }

        // If we are here, we need to send a new panel
        // First, try to delete any recent panels sent by the bot to avoid duplicates
        // We only check the fetched messages (last 5) to save API calls
        const oldPanels = messages.filter(msg =>
            msg.author.id === client.user.id &&
            msg.embeds.length > 0 &&
            (msg.embeds[0].title === '🏠 Keluarga Mɣralune' ||
                msg.embeds[0].title === '<:pinkcrown:1464766248054161621> BONDED HOUSE')
        );

        for (const oldPanel of oldPanels.values()) {
            try {
                await oldPanel.delete();
            } catch (err) {
                console.error('Failed to delete old panel:', err.message);
            }
        }

        // Send the new panel
        await channel.send({ embeds: [embed], components: [row] });
        // console.log('Bonded House panel updated/moved to bottom.');

    } catch (error) {
        console.error('Error updating Bonded House panel:', error);
    }
}

module.exports = { updateBondedHousePanel };