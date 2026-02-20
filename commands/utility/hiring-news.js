const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hiring-news')
        .setDescription('Setup hiring news dashboard message (Owner & Developer only)'),
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

        await interaction.deferReply({ ephemeral: true });

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.HIRING_NEWS_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel untuk panel hiring news belum dikonfigurasi. Silakan setel HIRING_NEWS_CHANNEL_ID di file .env.',
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

            // Create the embed with hiring news description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621>  HIRING NEWS')
                .setDescription('<:pinkcrown:1464766248054161621> HIRING NEWS\n\nThis desk is dedicated to official recruitment and role openings within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Volunteer and staff recruitment updates\n> b. Internal role expansion notices\nAll hiring information shared here is official and issued by the Kingdom.\nKindly review requirements carefully before applying or responding.\n\n> 🕰️ Operating Hours: 08:00 am – 10:00 pm (WIB) (UTC +7)\n> 🚫 Unofficial offers or impersonation are strictly prohibited.\n> 📜 Managed by the Royal Secretaries')
                .setColor('#FFD700')
                .setFooter({ text: '📜 Managed by the Royal Secretaries.', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_hiring_news')
                    .setLabel('Apply Position')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝')
            );

            // Send the hiring news panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({
                content: `Panel Hiring News berhasil dikirim ke ${targetChannel.toString()}! Formulir aplikasi siap digunakan.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in hiring-news command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur panel hiring news.', ephemeral: true });
        }
    },
};
