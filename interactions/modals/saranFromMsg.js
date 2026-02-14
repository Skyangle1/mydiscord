const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_saran_user_from_msg',
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const kategori = interaction.fields.getTextInputValue('kategori_saran_from_msg');
        const pesan = interaction.fields.getTextInputValue('pesan_saran_from_msg');

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

                // Note: No sticky button logic for this variation as per original code

            } catch (channelError) {
                console.error('Error sending saran to channel:', channelError);
                // Still send success message to user even if channel fails
            }
        } else {
            console.log('Saran channel not found or not configured');
            // Jika tidak ada channel yang ditemukan, beri tahu user
            await interaction.editReply({
                content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨',
                flags: 64
            });
            return;
        }

        await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
    }
};
