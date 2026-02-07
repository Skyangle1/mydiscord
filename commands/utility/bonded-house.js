const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bonded-house')
        .setDescription('Setup bonded house dashboard message (Owner & Admin only)'),
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
            // Get the target channel from environment variable
            const targetChannelId = process.env.BONDED_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for bonded house panel has not been configured. Please set BONDED_CHANNEL_ID in the .env file.',
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

            // Create the embed with bonded house description
            const embed = new EmbedBuilder()
                .setTitle('🏠 Keluarga Mɣralune')
                .setDescription('Platform resmi untuk mengelola keluarga di server Mɣralune.\n\nGunakan tombol-tombol di bawah untuk membangun, bergabung, atau melihat daftar keluarga.')
                .setColor('#FF69B4')
                .setFooter({ text: 'Keluarga adalah komunitas kecil dalam komunitas besar Mɣralune' })
                .setTimestamp();

            // Create the buttons
            const buildButton = new ButtonBuilder()
                .setLabel('Bangun Keluarga')
                .setStyle(ButtonStyle.Success)
                .setCustomId('btn_build_family')
                .setEmoji('🏗️');

            const joinButton = new ButtonBuilder()
                .setLabel('Masuk Keluarga')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('btn_join_family')
                .setEmoji('👥');

            const listButton = new ButtonBuilder()
                .setLabel('Daftar Keluarga')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId('btn_list_families')
                .setEmoji('📋');

            const row = new ActionRowBuilder()
                .addComponents(buildButton, joinButton, listButton);

            // Send the bonded house panel to the target channel
            await targetChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({
                content: `Bonded house panel has been set up successfully in ${targetChannel.toString()}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in bonded house command:', error);
            await interaction.editReply({ content: 'There was an error setting up the bonded house panel.', ephemeral: true });
        }
    },
};