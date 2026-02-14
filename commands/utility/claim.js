const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('claim')
        .setDescription('Setup panel klaim hadiah (Owner & Developer only)'),
    async execute(interaction) {
        // Check if user is developer or owner (using CLIENT_OWNER_ID environment variable)
        const authorizedIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!authorizedIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true }); // Defer reply to extend response time

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.CLAIM_LOG_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel untuk panel klaim belum dikonfigurasi. Silakan setel CLAIM_LOG_CHANNEL_ID di file .env.',
                    ephemeral: true
                });
                return;
            }

            const targetChannel = interaction.client.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                await interaction.editReply({
                    content: `Target channel (ID: ${targetChannelId}) tidak ditemukan. Pastikan ID channel benar.`,
                    ephemeral: true
                });
                return;
            }

            // Create the embed with claim description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621>  REWARD CENTER')
                .setDescription('This desk is dedicated to rewards, acknowledgements, and Kingdom benefits for Crownfolk.\n\nPlease use this service for the following purposes:\na. Claimable perks or benefits\nc. Recognition for contributions and achievements\nRewards are granted based on eligibility, activity, or royal decisions.\nKindly follow instructions carefully when claiming any reward.\n\n🕰️ Operating Hours: 08:00 am – 12:00 am (WIB) (UTC +7)\n🚫 Abuse, duplication, or false claims will result in restrictions.')
                .setColor('#FFD700')
                .setFooter({ text: '📜 Managed by the Royal Secretaries.', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_claim')
                    .setLabel('Ajukan Klaim')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎁')
            );

            // Send the claim panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({
                content: `Panel Klaim berhasil dikirim ke ${targetChannel.toString()}! Formulir klaim siap digunakan.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in claim command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur panel klaim.', ephemeral: true });
        }
    },
};