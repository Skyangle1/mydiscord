const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_saran_user',
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const kategori = interaction.fields.getTextInputValue('kategori_saran');
        const pesan = interaction.fields.getTextInputValue('pesan_saran');

        // Gunakan saluran saran utama, fallback ke log channel jika tidak ditemukan
        let saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_CHANNEL_ID);
        if (!saranChannel) {
            saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_LOG_CHANNEL_ID);
        }

        // Buat embed untuk menampilkan saran user
        const userSuggestionEmbed = new EmbedBuilder()
            .setTitle('✨ Saran Baru Mɣralune')
            .setColor('#811331')
            .addFields(
                { name: '👤 Pengirim', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                { name: '📂 Kategori', value: kategori, inline: true },
                { name: '💬 Isi Saran', value: `\`\`\`${pesan}\`\`\`` }
            )
            .setTimestamp();

        // Check if saran channel exists and bot has permissions
        if (saranChannel) {
            try {
                // Check if bot has permissions to send messages in the channel
                const botPermissions = saranChannel.permissionsFor(interaction.client.user);

                if (!botPermissions?.has('SendMessages')) {
                    console.log('ERROR: Bot lacks SendMessages permission in saran channel');
                    await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                    return;
                }

                if (!botPermissions?.has('ViewChannel')) {
                    console.log('ERROR: Bot lacks ViewChannel permission in saran channel');
                    await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                    return;
                }

                if (!botPermissions?.has('EmbedLinks')) {
                    console.log('ERROR: Bot lacks EmbedLinks permission in saran channel');
                    // Send without embed if no embed permission
                    const messageContent = `**Saran Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`;

                    await saranChannel.send(messageContent);
                } else {
                    // Kirim pesan saran user tanpa men-tag staff
                    await saranChannel.send({ embeds: [userSuggestionEmbed] });
                }

                // STICKY BUTTON LOGIC: Find and delete the old button-only message, then send a new one to keep it at the bottom
                try {
                    // Find the latest button-only message in the channel
                    const messages = await saranChannel.messages.fetch({ limit: 20 });
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
                            .setCustomId('btn_open_saran') // ID Tombol
                            .setLabel('Ajukan Saran')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📝')
                    );

                    await saranChannel.send({ components: [newRow] });
                } catch (stickyError) {
                    console.error('Error in sticky button logic:', stickyError);

                    // If sticky button logic fails, send a new button-only message anyway
                    try {
                        const fallbackRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Ajukan Saran')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('📝')
                        );

                        await saranChannel.send({ components: [fallbackRow] });
                    } catch (fallbackError) {
                        console.error('Error in fallback sticky button logic:', fallbackError);
                    }
                }
            } catch (channelError) {
                console.error('Error sending saran to channel:', channelError);
                // Still send success message to user even if channel fails
            }
        } else {
            console.log('Saran channel not found or not configured');
            // Jika tidak ada channel yang ditemukan, beri tahu user
            await interaction.editReply({
                content: 'Terjadi kesalahan: Channel saran tidak ditemukan. Hubungi administrator server.',
                flags: 64
            });
            return;
        }

        await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
    }
};
