const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jodoh')
        .setDescription('Setup matchmaking dashboard message'),
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
                flags: 64
            });
        }

        await interaction.deferReply({ flags: 64 }); // Defer reply to extend response time

        try {
            // Get the matchmaking channel from environment variable
            const matchmakingChannelId = process.env.MATCHMAKING_CHANNEL_ID;

            if (!matchmakingChannelId) {
                await interaction.editReply({
                    content: 'Kanal cari jodoh belum dikonfigurasi. Silakan set MATCHMAKING_CHANNEL_ID di .env file.',
                    flags: 64
                });
                return;
            }

            const matchmakingChannel = interaction.client.channels.cache.get(matchmakingChannelId);

            if (!matchmakingChannel) {
                await interaction.editReply({
                    content: `Kanal cari jodoh (ID: ${matchmakingChannelId}) tidak ditemukan. Silakan verifikasi ID kanal sudah benar.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to send messages in the matchmaking channel
            if (!matchmakingChannel.permissionsFor(interaction.client.user)?.has('SendMessages')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk mengirim pesan di kanal cari jodoh ${matchmakingChannel.toString()}. Mohon berikan izin "Send Messages" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to view the channel
            if (!matchmakingChannel.permissionsFor(interaction.client.user)?.has('ViewChannel')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk melihat kanal cari jodoh ${matchmakingChannel.toString()}. Mohon berikan izin "View Channel" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to embed links (for embeds)
            if (!matchmakingChannel.permissionsFor(interaction.client.user)?.has('EmbedLinks')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk menyematkan tautan di kanal cari jodoh ${matchmakingChannel.toString()}. Mohon berikan izin "Embed Links" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Create the embed with matchmaking description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> FOLK COURTSHIP')
                .setDescription('<:pinkcrown:1464766248054161621> FOLK COURTSHIP\n\nThis desk is dedicated for Crownfolk seeking deeper romantic connections and long-term companionship.\n\nPlease use this service for the following purposes:\n> a. Seeking potential partners\n> b. Expressing romantic intentions respectfully\n> c. Building sincere courtship connections\nThis service does not guarantee matchmaking outcomes.\nKindly approach courtship with honesty, respect, and emotional maturity.\n\n> 🕰️ Operating Hours: Always Available\n> 🚫 Manipulative behavior or exploitation is strictly prohibited.\n> 📜 Managed by the Royal Moderation Council.')
                .setColor('#811331')
                .setTimestamp();

            // Create the button with heart emoji
            const jodohButton = new ButtonBuilder()
                .setLabel('Isi Form Cari Jodoh')
                .setEmoji('💌')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('btn_cari_jodoh');

            const row = new ActionRowBuilder()
                .addComponents(jodohButton);

            // Send the message with button to the matchmaking channel
            await matchmakingChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({
                content: `Dashboard cari jodoh telah diatur di ${matchmakingChannel.toString()}.`,
                flags: 64
            });
        } catch (error) {
            console.error('Error in setup jodoh command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard cari jodoh.', flags: 64 });
        }
    },
};