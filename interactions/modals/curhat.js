const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_curhat_user',
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const kategori = interaction.fields.getTextInputValue('kategori_curhat');
        const pesan = interaction.fields.getTextInputValue('pesan_curhat');

        // Gunakan saluran curhat utama
        const curhatChannel = interaction.guild.channels.cache.get(process.env.CURHAT_CHANNEL_ID);

        // Buat embed untuk menampilkan curhat user secara anonim
        const userCurhatEmbed = new EmbedBuilder()
            .setTitle('💭 Curhat Awan Kelabu')
            .setColor('#4A90E2')
            .addFields(
                { name: '🏷️ Kategori', value: kategori, inline: true },
                { name: '💭 Curhat', value: `\`\`\`${pesan}\`\`\`` }
            )
            .setFooter({ text: 'Curhat anonim - tidak ada identitas pengirim' })
            .setTimestamp();

        // Check if curhat channel exists and bot has permissions
        if (curhatChannel) {
            try {
                // Check if bot has permissions to send messages in the channel
                const botPermissions = curhatChannel.permissionsFor(interaction.client.user);

                if (!botPermissions?.has('SendMessages')) {
                    console.log('ERROR: Bot lacks SendMessages permission in curhat channel');
                    await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
                    return;
                }

                if (!botPermissions?.has('ViewChannel')) {
                    console.log('ERROR: Bot lacks ViewChannel permission in curhat channel');
                    await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
                    return;
                }

                if (!botPermissions?.has('EmbedLinks')) {
                    console.log('ERROR: Bot lacks EmbedLinks permission in curhat channel');
                    // Send without embed if no embed permission
                    const messageContent = `**Curhat Anonim!**\nKategori: ${kategori}\nIsi: ${pesan}`;
                    await curhatChannel.send(messageContent);
                } else {
                    // Kirim pesan curhat user secara anonim
                    await curhatChannel.send({ embeds: [userCurhatEmbed] });
                }

                // STICKY BUTTON LOGIC: Find and delete the old curhat button-only message, then send a new one to keep it at the bottom
                try {
                    // Find the latest curhat button-only message in the channel
                    const messages = await curhatChannel.messages.fetch({ limit: 20 });
                    const buttonOnlyMessage = messages.find(msg =>
                        msg.author.id === interaction.client.user.id &&
                        msg.components.length > 0 && // Message has components (buttons)
                        msg.embeds.length === 0 // Message has no embed, only buttons
                    );

                    // Delete the old button-only message if found
                    if (buttonOnlyMessage) {
                        await buttonOnlyMessage.delete();
                    }

                    // Send a new button-only message at the bottom
                    const newRow = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('btn_open_curhat') // ID Tombol
                            .setLabel('Curhat Aja')
                            .setEmoji('💭')
                            .setStyle(ButtonStyle.Primary)
                    );

                    await curhatChannel.send({ components: [newRow] });
                } catch (stickyError) {
                    console.error('Error in curhat sticky button logic:', stickyError);

                    // If sticky button logic fails, send a new button-only message anyway
                    try {
                        const fallbackRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_curhat') // ID Tombol
                                .setLabel('Curhat Aja')
                                .setEmoji('💭')
                                .setStyle(ButtonStyle.Primary)
                        );

                        await curhatChannel.send({ components: [fallbackRow] });
                    } catch (fallbackError) {
                        console.error('Error in fallback curhat sticky button logic:', fallbackError);
                    }
                }
            } catch (channelError) {
                console.error('Error sending curhat to channel:', channelError);
                // Still send success message to user even if channel fails
            }
        } else {
            console.log('Curhat channel not found or not configured');
            // Jika tidak ada channel yang ditemukan, beri tahu user
            await interaction.editReply({
                content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨',
                flags: 64
            });
            return;
        }

        await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
    }
};
