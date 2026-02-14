const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_cari_jodoh',
    async execute(interaction) {
        console.log('BERHASIL MASUK KE BLOK MODAL!');

        try {
            // Anti-Timeout: Defer reply immediately using flags instead of ephemeral
            await interaction.deferReply({ flags: 64 });

            // Logging Diagnosa: Log saat data mulai diambil
            console.log('Starting to retrieve form data from modal submission');

            // Sinkronisasi ID Input: Using the correct input IDs
            const nama = interaction.fields.getTextInputValue('j_nama');
            const umur = interaction.fields.getTextInputValue('j_umur');
            const gender = interaction.fields.getTextInputValue('j_gender');
            const hobi = interaction.fields.getTextInputValue('j_hobi');
            const tipe = interaction.fields.getTextInputValue('j_tipe');

            // Log the retrieved values
            console.log('Retrieved form values:', {
                nama: nama,
                umur: umur,
                gender: gender,
                hobi: hobi,
                tipe: tipe
            });

            // Validate that all required values exist
            if (!nama || !umur || !gender || !hobi || !tipe) {
                await interaction.editReply({
                    content: 'Semua field formulir harus diisi. Mohon lengkapi semua data.',
                    flags: 64
                });
                return;
            }

            // Log the environment variable
            console.log('JODOH_CHANNEL_ID from env:', process.env.MATCHMAKING_CHANNEL_ID);

            // Get the matchmaking channel from environment variable
            const matchmakingChannelId = process.env.MATCHMAKING_CHANNEL_ID;

            // Check if channel ID is configured
            if (!matchmakingChannelId) {
                await interaction.editReply({
                    content: 'Kanal cari jodoh belum dikonfigurasi. Silakan hubungi administrator.',
                    flags: 64
                });
                return;
            }

            // Get the matchmaking channel
            const matchmakingChannel = interaction.client.channels.cache.get(matchmakingChannelId);

            // Log when bot finds the channel object
            console.log('Matchmaking channel object found:', matchmakingChannel ? 'YES' : 'NO');

            // Check if channel exists
            if (!matchmakingChannel) {
                await interaction.editReply({
                    content: 'Kanal cari jodoh tidak ditemukan. Silakan hubungi administrator.',
                    flags: 64
                });
                return;
            }

            // Create embed with Output Estetik
            const profileEmbed = new EmbedBuilder()
                .setTitle('📜 Identitas Singkat')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setColor('#811331')
                .addFields(
                    { name: '👤 Nama', value: nama, inline: false },
                    { name: '🎂 Usia', value: umur, inline: true },
                    { name: '♂️/♀️ Gender', value: gender, inline: true },
                    { name: '✨ Tentang Diriku', value: hobi, inline: false },
                    { name: '🎯 Mencari Sosok...', value: tipe, inline: false }
                )
                .setFooter({ text: 'Yang tertarik bisa langsung DM ya!' })
                .setTimestamp();

            // Create buttons - "Isi Form Cari Jodoh" and "Chat Me"
            const jodohButton = new ButtonBuilder()
                .setLabel('Isi Form Cari Jodoh')
                .setEmoji('💌')
                .setStyle(ButtonStyle.Primary)
                .setCustomId('btn_cari_jodoh');

            const chatMeButton = new ButtonBuilder()
                .setLabel('Chat Me')
                .setEmoji('💬')
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(`btn_chat_me_jodoh_${interaction.user.id}`); // Custom ID with user ID and type

            const row = new ActionRowBuilder()
                .addComponents(jodohButton, chatMeButton);

            // Send the profile to the matchmaking channel
            try {
                await matchmakingChannel.send({
                    content: `✨ Ada formulir cari jodoh baru! <@${interaction.user.id}>`,
                    embeds: [profileEmbed],
                    components: [row]
                });
            } catch (sendError) {
                // Error Handling Ketat: Show complete error details
                console.error('Complete error details when sending to channel:', {
                    message: sendError.message,
                    stack: sendError.stack,
                    code: sendError.code,
                    name: sendError.name,
                    status: sendError.status,
                    method: sendError.method,
                    path: sendError.path
                });

                await interaction.editReply({
                    content: `Terjadi kesalahan saat mengirim profil ke kanal: ${sendError.message}`,
                    flags: 64
                });
                return;
            }

            // Final Response: Success confirmation to user
            await interaction.editReply({
                content: 'Profil kamu telah berhasil dikirim! Orang-orang bisa melihat profil kamu sekarang.',
                flags: 64
            });
        } catch (error) {
            // Error Handling Ketat: Show complete error details
            console.error('Complete error details in matchmaking form processing:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code
            });

            try {
                await interaction.editReply({
                    content: `Terjadi kesalahan saat mengirim profil kamu: ${error.message}`,
                    flags: 64
                });
            } catch (editError) {
                console.error('Failed to send error message to user:', editError);
            }
        }
    }
};
