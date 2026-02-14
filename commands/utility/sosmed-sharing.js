const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sosmed-sharing')
        .setDescription('Setup panel social sharing (Owner & Developer only)'),
    async execute(interaction) {
        // Check if user is developer or owner (using CLIENT_OWNER_ID environment variable)
        const ownerIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!ownerIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Akses ditolak. Hanya Developer dan Owner yang memiliki izin untuk melakukan tindakan ini.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true }); // Defer reply to extend response time

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.SOCIAL_SHARING_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel untuk social sharing belum dikonfigurasi. Silakan setel SOCIAL_SHARING_CHANNEL_ID di file .env.',
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

            // Create the embed with social sharing description
            const embed = new EmbedBuilder()
                .setTitle('🔗 Bagikan Profil Sosial Media')
                .setDescription('<:pinkcrown:1464766248054161621> FOLK NETWORK\nThis desk is dedicated for Crownfolk to share social media profiles and connect beyond the realm.\n\nPlease use this service for the following purposes:\na. Share Instagram or TikTok profiles\nb. Build social connections with other Crownfolk\nc. Encourage healthy real-life networking\nParticipation is voluntary and based on mutual respect.\nKindly share only accounts you own and are comfortable making public.\n\n🕰️ Operating Hours: Always Available\n🚫 Fake accounts, spam links, or forced promotion are prohibited.\n📜 Managed by the Royal Moderation Council.')
                .setColor('#90EE90')
                .setFooter({ text: 'Social Sharing System', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            // Create the button
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_share_profile')
                    .setLabel('Bagikan Profil')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📱')
            );

            // Send the social sharing panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });
            
            await interaction.editReply({
                content: `Panel social sharing telah berhasil dikirim ke ${targetChannel.toString()}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in sosmed-sharing command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat menyiapkan panel social sharing.', ephemeral: true });
        }
    },
};