const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send feedback to the team (Developer & Owner only)'),
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
			// Get the target channel from environment variable (specific for feedback)
			const targetChannelId = process.env.FEEDBACK_CHANNEL_ID;

			if (!targetChannelId) {
				await interaction.editReply({
					content: 'Target channel for feedback panel has not been configured. Please set FEEDBACK_CHANNEL_ID in the .env file.',
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

			// Create the embed with professional description
			const embed = new EmbedBuilder()
				.setTitle('💬 Kotak Feedback Profesional Mɣralune')
				.setDescription('Platform resmi untuk memberikan feedback terkait server Mɣralune.\n\nTim kami akan meninjau setiap feedback yang Anda berikan untuk meningkatkan kualitas layanan kami.\n\nGunakan tombol di bawah untuk membuka formulir feedback.')
				.setColor('#0099ff')
				.setFooter({ text: 'Feedback Anda sangat berharga bagi perkembangan komunitas Mɣralune', iconURL: interaction.client.user.displayAvatarURL() })
				.setTimestamp();

			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('btn_open_feedback') // ID Tombol
					.setLabel('Kirim Feedback')
					.setStyle(ButtonStyle.Primary)
					.setEmoji('💬')
			);

			// Send the feedback panel to the target channel
			await targetChannel.send({ embeds: [embed], components: [row] });
			await interaction.editReply({
				content: `Dashboard Feedback berhasil dikirim ke ${targetChannel.toString()}! Formulir feedback siap digunakan oleh anggota server.`,
				ephemeral: true
			});
		} catch (error) {
			console.error('Error in feedback command:', error);
			await interaction.editReply({ content: 'Terjadi kesalahan saat mengatur dashboard feedback.', ephemeral: true });
		}
	},
};