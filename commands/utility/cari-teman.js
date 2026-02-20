const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cariteman')
        .setDescription('Setup teman dashboard message'),
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
            // Get the friend-finding channel from environment variable
            const friendFindingChannelId = process.env.FRIEND_FINDING_CHANNEL_ID;

            if (!friendFindingChannelId) {
                await interaction.editReply({
                    content: 'Kanal cari teman belum dikonfigurasi. Silakan set FRIEND_FINDING_CHANNEL_ID di .env file.',
                    flags: 64
                });
                return;
            }

            const friendFindingChannel = interaction.client.channels.cache.get(friendFindingChannelId);

            if (!friendFindingChannel) {
                await interaction.editReply({
                    content: `Kanal cari teman (ID: ${friendFindingChannelId}) tidak ditemukan. Silakan verifikasi ID kanal sudah benar.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to send messages in the friend-finding channel
            if (!friendFindingChannel.permissionsFor(interaction.client.user)?.has('SendMessages')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk mengirim pesan di kanal cari teman ${friendFindingChannel.toString()}. Mohon berikan izin "Send Messages" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to view the channel
            if (!friendFindingChannel.permissionsFor(interaction.client.user)?.has('ViewChannel')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk melihat kanal cari teman ${friendFindingChannel.toString()}. Mohon berikan izin "View Channel" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Check if the bot has permission to embed links (for embeds)
            if (!friendFindingChannel.permissionsFor(interaction.client.user)?.has('EmbedLinks')) {
                await interaction.editReply({
                    content: `Bot tidak memiliki izin untuk menyematkan tautan di kanal cari teman ${friendFindingChannel.toString()}. Mohon berikan izin "Embed Links" terlebih dahulu.`,
                    flags: 64
                });
                return;
            }

            // Create the embed with friend-finding description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> FOLK COMPANION')
                .setDescription('<:pinkcrown:1464766248054161621> FOLK COMPANION\n\nThis desk is dedicated for Crownfolk seeking friendship and meaningful companionship within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Finding new friends\n> b. Social connection and support\n> c. Reducing loneliness within the realm\nAll introductions are community-based and not guaranteed.\nKindly be respectful, sincere, and mindful of others boundaries.\n\n> 🕰️ Operating Hours: Always Available\n> 🚫 Harassment or inappropriate behavior will result in action.\n> 📜 Managed by the Royal Moderation Council.')
                .setColor('#007bff')
                .setTimestamp();

            // Create the button with friendship emoji
            const friendButton = new ButtonBuilder()
                .setLabel('Gabung Komunitas Folk')
                .setEmoji('🤝')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('btn_cari_teman');

            const row = new ActionRowBuilder()
                .addComponents(friendButton);

            // Send the message with button to the friend-finding channel
            await friendFindingChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({
                content: `Dashboard cari teman telah diatur di ${friendFindingChannel.toString()}.`,
                flags: 64
            });
        } catch (error) {
            console.error('Error in setup cari teman command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard cari teman.', flags: 64 });
        }
    },
};