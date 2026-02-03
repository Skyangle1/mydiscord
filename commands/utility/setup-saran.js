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

            // Send the message with button to the current channel
            await interaction.channel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({ content: 'Dashboard Saran berhasil dikirim!', flags: 64 });
        } catch (error) {
            console.error('Error in setup saran command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard saran.', flags: 64 });
        }
    },
};
