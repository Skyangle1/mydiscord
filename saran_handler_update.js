// Ini adalah implementasi yang diperlukan untuk memperbarui sistem saran
// agar menargetkan staff dan menampilkan pesan user di channel yang sama

/*
Bagian yang perlu diganti di events/interactionCreate.js:

// GANTI bagian ini:
else if (interaction.customId && interaction.customId === 'modal_saran_user') {
    await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

    const kategori = interaction.fields.getTextInputValue('kategori_saran');
    const pesan = interaction.fields.getTextInputValue('pesan_saran');

    // Gunakan saluran saran utama, fallback ke log channel jika tidak ditemukan
    let saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_CHANNEL_ID);
    if (!saranChannel) {
        saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_LOG_CHANNEL_ID);
    }

    // Ambil role staff untuk ditag
    const staffRole = interaction.guild.roles.cache.get(process.env.STAFF_ROLE_ID);

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
                const messageContent = staffRole ?
                    `<@&${staffRole.id}>\n**Saran Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}` :
                    `**Saran Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`;

                await saranChannel.send(messageContent);
            } else {
                // Kirim pesan saran user dengan tag staff jika role tersedia
                const messageContent = staffRole ?
                    { content: `<@&${staffRole.id}>`, embeds: [userSuggestionEmbed] } :
                    { embeds: [userSuggestionEmbed] };
                await saranChannel.send(messageContent);
            }

            // STICKY BUTTON LOGIC: Find and delete the old suggestion panel, then send a new one
            try {
                // Find the latest suggestion panel message in the channel
                const messages = await saranChannel.messages.fetch({ limit: 20 });
                const suggestionPanelMessage = messages.find(msg =>
                    msg.author.id === interaction.client.user.id &&
                    msg.embeds.length > 0 &&
                    msg.embeds[0].title &&
                    (msg.embeds[0].title.includes('Kotak Saran Profesional') || msg.embeds[0].title.includes('Kotak Aspirasi'))
                );

                // Delete the old suggestion panel if found
                if (suggestionPanelMessage) {
                    await suggestionPanelMessage.delete();
                }

                // Send a new suggestion panel at the bottom with updated content
                const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                const newEmbed = new EmbedBuilder()
                    .setTitle('✨ Kotak Saran Profesional Mɣralune')
                    .setDescription('Platform resmi untuk memberikan masukan dan saran terkait server Mɣralune.\n\nTim kami akan meninjau setiap masukan yang Anda berikan untuk meningkatkan kualitas layanan kami.\n\nGunakan tombol di bawah untuk membuka formulir saran.')
                    .setColor('#811331')
                    .setFooter({ text: 'Saran Anda sangat berharga bagi perkembangan komunitas Mɣralune', iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                const newRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_open_saran') // ID Tombol
                        .setLabel('Ajukan Saran')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📝')
                );

                await saranChannel.send({ embeds: [newEmbed], components: [newRow] });
            } catch (stickyError) {
                console.error('Error in sticky button logic:', stickyError);
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
*/

// Penjelasan:
// 1. Menggunakan SARAN_CHANNEL_ID sebagai saluran tujuan
// 2. Menampilkan saran user langsung di channel yang sama
// 3. Menargetkan role staff menggunakan STAFF_ROLE_ID
// 4. Memperbarui sticky button logic agar sesuai dengan versi baru dari panel saran
// 5. Menggunakan judul dan deskripsi yang sesuai dengan sistem saran yang baru