const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('curhat')
        .setDescription('Setup curhat dashboard message (Developer & Owner only)'),
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
            // Get the target channel from environment variable (specific for curhat)
            const targetChannelId = process.env.CURHAT_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for curhat panel has not been configured. Please set CURHAT_CHANNEL_ID in the .env file.',
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
                .setTitle('💭 Curhat Awan Kelabu')
                .setDescription('Platform aman untuk berbagi perasaan, pengalaman, atau unek-unek secara anonim.\n\nCeritakan apa yang ingin kamu sampaikan, dan biarkan angin membawa perasaanmu mengalir bebas.')
                .setColor('#4A90E2')
                .setFooter({ text: 'Curhatmu akan tiba secara anonim, tanpa jejak identitasmu', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_curhat') // ID Tombol
                    .setLabel('Curhat Aja')
                    .setEmoji('💭')
                    .setStyle(ButtonStyle.Primary)
            );

            // Send the curhat panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });
            await interaction.editReply({
                content: `Dashboard Curhat berhasil dikirim ke ${targetChannel.toString()}! Panel curhat anonim siap digunakan.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in curhat command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard curhat.', ephemeral: true });
        }
    },
};