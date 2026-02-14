const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reflection')
        .setDescription('Setup panel Reflection Ticket (Owner & Developer only)'),
    async execute(interaction) {
        // Check if user is developer or owner
        const authorizedIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!authorizedIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Get the target channel
            const targetChannelId = process.env.REFLECTION_LOG_CHANNEL_ID;

            if (!targetChannelId) {
                return await interaction.editReply({
                    content: 'Target channel belum dikonfigurasi. Silakan setel REFLECTION_LOG_CHANNEL_ID di file .env.',
                    ephemeral: true
                });
            }

            const targetChannel = interaction.client.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                return await interaction.editReply({
                    content: `Target channel (ID: ${targetChannelId}) tidak ditemukan.`,
                    ephemeral: true
                });
            }

            // Create the embed
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> REFLECTION TICKET')
                .setDescription(
                    'This desk is dedicated to private reflection sessions and personal support requests.\n\n' +
                    'Please use this service for the following purposes:\n' +
                    'a. Requesting private reflection sessions\n' +
                    'b. Emotional or mental support inquiries\n' +
                    'c. One-on-one guidance with appointed counselors\n' +
                    'All tickets are handled discreetly and with respect to personal boundaries.\n' +
                    'Kindly share only what you are comfortable disclosing.\n\n' +
                    '🕰️ Operating Hours: By Appointment\n' +
                    '🚫 Misuse or false requests may lead to access limitations.'
                )
                .setColor('#FF99CC') // Pinkish/Calm color
                .setFooter({ text: '📜 Managed by the Royal Counsel.', iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_open_reflection')
                    .setLabel('Request Session')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🕯️')
            );

            await targetChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({
                content: `Panel Reflection berhasil dikirim ke ${targetChannel.toString()}!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in reflection command:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan sistem.', ephemeral: true });
        }
    },
};
