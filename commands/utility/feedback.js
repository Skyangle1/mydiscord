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
				.setTitle('<:pinkcrown:1464766248054161621> ROYAL FEEDBACK')
				.setDescription('<:pinkcrown:1464766248054161621> ROYAL FEEDBACK\nThis desk is dedicated for Crownfolk to share feedback regarding their experience within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Service satisfaction feedback\n> b. System or moderation evaluation\n> c. Community experience review\nAll feedback is documented to support continuous improvement.\nKindly provide honest, respectful, and constructive feedback to help us improve effectively.\n\n> 🕰️ Operating Hours: 08:00 – 24:00 (WIB) (UTC +7)\n> 🚫 Abuse or manipulation of ratings will result in restrictions.\n> 📜 Reviewed by the Royal Staff.')
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