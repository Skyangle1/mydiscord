const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_share_profile',
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 }); // Using flags for ephemeral response

            // Get values from modal
            const instagramUsername = interaction.fields.getTextInputValue('instagram_username');
            const tiktokUsername = interaction.fields.getTextInputValue('tiktok_username');
            const socialDescription = interaction.fields.getTextInputValue('social_description');

            // Security check: validate input for potential phishing links
            if (instagramUsername.includes('http') || instagramUsername.includes('.com') ||
                tiktokUsername.includes('http') || tiktokUsername.includes('.com')) {
                await interaction.editReply({
                    content: 'Mohon masukkan username saja, tanpa link lengkap (tidak boleh mengandung "http" atau ".com").',
                    flags: 64
                });
                return;
            }

            // Convert to proper links
            const instagramLink = `https://instagram.com/${instagramUsername}`;
            const tiktokLink = `https://tiktok.com/@${tiktokUsername}`;

            // Create embed with user's social media info
            const socialEmbed = new EmbedBuilder()
                .setTitle(`📱 Profil Sosial Media - ${interaction.user.username}`)
                .setDescription(socialDescription)
                .setColor('#90EE90')
                .addFields(
                    { name: '📷 Instagram', value: `[${instagramUsername}](${instagramLink})`, inline: true },
                    { name: '🎵 TikTok', value: `[${tiktokUsername}](${tiktokLink})`, inline: true }
                )
                .setFooter({ text: `Dibagikan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Create link buttons
            const linkButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Instagram')
                    .setURL(instagramLink)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📸'),
                new ButtonBuilder()
                    .setLabel('TikTok')
                    .setURL(tiktokLink)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🎵')
            );

            // Send the embed to the user (ephemeral)
            await interaction.editReply({
                content: 'Profil sosial media kamu telah dibagikan:',
                embeds: [socialEmbed],
                components: [linkButtons],
                flags: 64
            });

            // Create link buttons with share button
            const linkButtonsWithShare = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_share_profile')
                    .setLabel('Bagikan Profil')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📱'),
                new ButtonBuilder()
                    .setLabel('Instagram')
                    .setURL(instagramLink)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📸'),
                new ButtonBuilder()
                    .setLabel('TikTok')
                    .setURL(tiktokLink)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🎵')
            );

            // Send to the target social sharing channel
            const socialSharingChannelId = process.env.SOCIAL_SHARING_CHANNEL_ID;
            if (socialSharingChannelId) {
                const socialSharingChannel = interaction.client.channels.cache.get(socialSharingChannelId);
                if (socialSharingChannel) {
                    await socialSharingChannel.send({
                        content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                        embeds: [socialEmbed],
                        components: [linkButtonsWithShare]
                    });
                } else {
                    // If target channel is not found, send to current channel as fallback
                    await interaction.channel.send({
                        content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                        embeds: [socialEmbed],
                        components: [linkButtonsWithShare]
                    });
                }
            } else {
                // If no target channel is configured, send to current channel
                await interaction.channel.send({
                    content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                    embeds: [socialEmbed],
                    components: [linkButtonsWithShare]
                });
            }
        } catch (error) {
            console.error('Error processing share profile modal:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat memproses profil sosial media kamu. Silakan coba lagi.',
                    ephemeral: true
                });
            } else {
                await interaction.editReply({
                    content: 'Terjadi kesalahan saat memproses profil sosial media kamu. Silakan coba lagi.',
                    flags: 64
                });
            }
        }
    }
};
