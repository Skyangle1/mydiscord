const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_cari_teman',
    async execute(interaction) {
        console.log('BERHASIL MASUK KE BLOK MODAL CARI TEMAN!');

        try {
            // Anti-Timeout: Defer reply immediately
            await interaction.deferReply({ ephemeral: true });

            // Logging Diagnosa: Log saat data mulai diambil
            console.log('Starting to retrieve form data from friend-finding modal submission');

            // Sinkronisasi ID Input
            const nama = interaction.fields.getTextInputValue('ft_nama');
            const umur = interaction.fields.getTextInputValue('ft_umur');
            const gender = interaction.fields.getTextInputValue('ft_gender');
            const hobi = interaction.fields.getTextInputValue('ft_hobi');
            const tujuan = interaction.fields.getTextInputValue('ft_tujuan');

            // Log the retrieved values
            console.log('Retrieved friend-finding values:', {
                nama, umur, gender, hobi, tujuan
            });

            // Validate that all required values exist
            if (!nama || !umur || !gender || !hobi || !tujuan) {
                await interaction.editReply({
                    content: 'Semua field formulir harus diisi.'
                });
                return;
            }

            // Get the friend-finding channel from environment variable
            const friendFindingChannelId = process.env.FRIEND_FINDING_CHANNEL_ID;

            // Check if channel ID is configured
            if (!friendFindingChannelId) {
                await interaction.editReply({
                    content: 'Kanal cari teman belum dikonfigurasi. Silakan hubungi administrator.'
                });
                return;
            }

            // Get the channel object
            const friendChannel = interaction.client.channels.cache.get(friendFindingChannelId);

            if (!friendChannel) {
                await interaction.editReply({
                    content: 'Kanal cari teman tidak ditemukan. Silakan hubungi administrator.'
                });
                return;
            }

            // Create embed
            const profileEmbed = new EmbedBuilder()
                .setTitle('🤝 Kartu Nama Teman Baru')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor('#2ECC71') // Green color for friendship
                .addFields(
                    { name: '👤 Nama', value: nama, inline: false },
                    { name: '🎂 Usia', value: umur, inline: true },
                    { name: '♂️/♀️ Gender', value: gender, inline: true },
                    { name: '🎨 Hobi/Minat', value: hobi, inline: false },
                    { name: '🎯 Tujuan', value: tujuan, inline: false }
                )
                .setFooter({ text: 'Yuk kenalan! Klik tombol Chat Me di bawah.' })
                .setTimestamp();

            // Create buttons
            const cariTemanButton = new ButtonBuilder()
                .setLabel('Isi Form Cari Teman')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Success)
                .setCustomId('btn_cari_teman');

            const chatMeButton = new ButtonBuilder()
                .setLabel('Chat Me')
                .setEmoji('💬')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`btn_chat_me_teman_${interaction.user.id}`); // Custom ID with user ID and type

            const row = new ActionRowBuilder()
                .addComponents(cariTemanButton, chatMeButton);

            // Send to channel
            try {
                await friendChannel.send({
                    content: `👋 Ada yang cari teman baru nih! <@${interaction.user.id}>`,
                    embeds: [profileEmbed],
                    components: [row]
                });
            } catch (sendError) {
                console.error('Error sending friend profile to channel:', sendError);
                await interaction.editReply({
                    content: `Terjadi kesalahan saat mengirim profil ke kanal: ${sendError.message}`
                });
                return;
            }

            // Success confirmation
            await interaction.editReply({
                content: 'Kartu nama teman kamu telah berhasil dikirim! Semoga cepat dapat teman baru ya.'
            });

        } catch (error) {
            console.error('Error in friend-finding form processing:', error);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: `Terjadi kesalahan saat mengirim profil kamu: ${error.message}`
                    });
                } else {
                    // Try to reply if not already interacting
                    await interaction.reply({
                        content: `Terjadi kesalahan: ${error.message}`,
                        ephemeral: true
                    });
                }
            } catch (editError) {
                console.error('Failed to send error message to user (interaction likely invalid):', editError.message);
            }
        }
    }
};
