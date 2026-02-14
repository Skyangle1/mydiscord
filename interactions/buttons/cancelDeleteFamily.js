const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'btn_cancel_delete_family',
    async execute(interaction) {
        await interaction.update({
            content: '❌ Penghapusan dibatalkan.',
            embeds: [],
            components: []
        });
    }
};
