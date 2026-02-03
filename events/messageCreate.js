const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	async execute(message) {
		// Ignore bot messages and system messages
		if (message.author.bot) return;

		// Check if message is in a feedback-enabled channel
		// You can customize this condition based on your needs
		const feedbackEnabledChannelId = process.env.FEEDBACK_ENABLED_CHANNEL_ID;

		if (feedbackEnabledChannelId && message.channel.id === feedbackEnabledChannelId) {
			// Create a button for feedback
			const feedbackButton = new ButtonBuilder()
				.setCustomId('btn_open_saran_from_msg')
				.setLabel('Berikan Masukan')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji('💬');

			const row = new ActionRowBuilder().addComponents(feedbackButton);

			// Send a follow-up message with the feedback button
			try {
				await message.reply({
					content: 'Ingin memberikan masukan tentang pesan ini?',
					components: [row],
					allowedMentions: { repliedUser: false }
				});
			} catch (error) {
				console.error('Error sending feedback button message:', error);
			}
		}
	},
};