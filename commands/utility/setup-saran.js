const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-saran')
        .setDescription('Setup saran dashboard message'),
    async execute(interaction) {
        // Check if user has admin permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return await interaction.reply({
                content: 'Perintah ini hanya dapat digunakan oleh Administrator!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true }); // Defer reply to extend response time

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.FEEDBACK_LOG_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for suggestion panel has not been configured. Please set FEEDBACK_LOG_CHANNEL_ID in the .env file.',
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

            // Create the embed with saran description
            const embed = new EmbedBuilder()
                .setTitle('📝 Kotak Aspirasi Mɣralune')
                .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                .setColor('#811331')
                .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_saran') // ID Tombol
                    .setLabel('Beri Masukan ✨')
                    .setStyle(ButtonStyle.Primary)
            );

            // Try to find and edit the latest suggestion message from the bot in the channel
            const messages = await targetChannel.messages.fetch({ limit: 20 });
            const latestSaranMessage = messages.find(msg => msg.author.id === interaction.client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0].title &&
                (msg.embeds[0].title.includes('Kotak Aspirasi') || msg.embeds[0].title.includes('Saran')));

            if (latestSaranMessage) {
                // Edit the existing message with updated content
                await latestSaranMessage.edit({ embeds: [embed], components: [row] });
                await interaction.editReply({
                    content: `Dashboard Saran berhasil diperbarui di ${targetChannel.toString()}! (Memperbarui pesan sebelumnya)`,
                    ephemeral: true
                });
            } else {
                // If no existing message found, send a new one at the top
                await targetChannel.send({ embeds: [embed], components: [row] });
                await interaction.editReply({
                    content: `Dashboard Saran berhasil dikirim ke ${targetChannel.toString()}!`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error in setup saran command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard saran.', ephemeral: true });
        }
    },
};
