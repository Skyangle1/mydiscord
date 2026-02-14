const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saran')
        .setDescription('Setup saran dashboard message (Developer & Owner only)'),
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
            // Get the target channel from environment variable (specific for suggestions)
            const targetChannelId = process.env.SARAN_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for suggestion panel has not been configured. Please set SARAN_CHANNEL_ID in the .env file.',
                    ephemeral: true
                });
                return;
            }

            const targetChannel = interaction.client.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                await interaction.editReply({
                    content: `Target channel (ID: ${targetChannelId}) could not be found. Please verify the channel ID is correct.`,
                    ephemeral: true
                });
                return;
            }

            // Create the embed with professional description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> ROYAL SUGGESTIONS')
                .setDescription('This desk is dedicated for Crownfolk to submit ideas, proposals, and improvements for the Kingdom.\n\nPlease use this service for the following purposes:\na. Feature or system suggestions\nb. Community improvement ideas\nEach submission will be recorded and reviewed by the Royal Moderation Council.\nKindly write your suggestion clearly, starting with a concise subject, followed by detailed explanation.\n\n🕰️ Operating Hours: 24 hours\n🚫 Spam may be ignored.\n📜 Reviewed by the Royal Moderation Council.')
                .setColor('#811331')
                .setFooter({ text: 'Saran Anda sangat berharga bagi perkembangan komunitas Mɣralune', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_saran') // ID Tombol
                    .setLabel('Ajukan Saran')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
            );

            // Send the suggestion panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({
                content: `Dashboard Saran berhasil dikirim ke ${targetChannel.toString()}! Formulir saran siap digunakan oleh anggota server.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in setup saran command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard saran.', ephemeral: true });
        }
    },
};
