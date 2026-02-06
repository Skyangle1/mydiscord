const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Function to send or update the bonded house panel with sticky button
 */
async function updateBondedHousePanel(channel) {
    try {
        // Find the latest bonded house panel message in the channel
        const messages = await channel.messages.fetch({ limit: 20 });
        const bondedPanelMessage = messages.find(msg =>
            msg.author.id === channel.client.user.id &&
            msg.embeds.length > 0 &&
            msg.embeds[0].title &&
            msg.embeds[0].title.includes('Bangun Keluargamu')
        );

        // Delete the old bonded house panel if found
        if (bondedPanelMessage) {
            await bondedPanelMessage.delete();
        }

        // Create the embed with bonded house description
        const embed = new EmbedBuilder()
            .setTitle('🏠 Bangun Keluargamu')
            .setDescription('Kamu bisa membangun keluargamu sendiri di sini! Klik tombol di bawah untuk memulai membangun keluarga.')
            .setColor('#FF69B4')
            .setTimestamp();

        // Create the button
        const buildButton = new ButtonBuilder()
            .setLabel('Bangun Keluarga')
            .setStyle(ButtonStyle.Success)
            .setCustomId('btn_build_family')
            .setEmoji('🏠');

        const row = new ActionRowBuilder()
            .addComponents(buildButton);

        // Send the bonded house panel to the target channel
        await channel.send({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error('Error in updateBondedHousePanel:', error);
    }
}

module.exports = {
    updateBondedHousePanel
};