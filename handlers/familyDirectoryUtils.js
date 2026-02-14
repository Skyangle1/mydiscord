const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { db } = require('../database/db');

// Config
const FAMILY_DIR_CHANNEL_ID = process.env.FAMILY_DIR_CHANNEL_ID;

async function updateFamilyDirectory(client) {
    if (!GAME_CHANNEL_ID) { // Wait, wrong var name
        // Get Env inside function to ensure it's loaded
        const PROPER_CHANNEL_ID = process.env.FAMILY_DIR_CHANNEL_ID;
        if (!PROPER_CHANNEL_ID) {
            console.log('FAMILY_DIR_CHANNEL_ID is not set in .env. Skipping directory update.');
            return;
        }
    }
}

// Re-write clean version
module.exports = {
    async updateFamilyDirectory(client) {
        const channelId = process.env.FAMILY_DIR_CHANNEL_ID;
        if (!channelId) return;

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) return;

            // Fetch families
            const families = await new Promise((resolve, reject) => {
                db.all('SELECT * FROM families ORDER BY family_name ASC', [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

            const embed = new EmbedBuilder()
                .setTitle('📜 Direktori Keluarga Mɣralune')
                .setDescription(families.length > 0
                    ? 'Berikut adalah daftar keluarga yang resmi terdaftar di Mɣralune.'
                    : 'Belum ada keluarga yang terdaftar.')
                .setColor('#FFD700')
                .setTimestamp()
                .setFooter({ text: 'Authorized Personnel Only for Deletion.' });

            if (families.length > 0) {
                const fields = families.map((f, i) => ({
                    name: `${i + 1}. ${f.family_name}`,
                    value: `Slogan: *${f.slogan || '-'}*\nKepala: <@${f.owner_id}>`
                }));
                embed.addFields(fields);
            }

            // Button for Admin Delete
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_admin_delete_family_menu')
                    .setLabel('Hapus Keluarga (Admin)')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

            // Find last message from bot
            const messages = await channel.messages.fetch({ limit: 10 });
            const botMsg = messages.find(m => m.author.id === client.user.id);

            if (botMsg) {
                await botMsg.edit({ embeds: [embed], components: [row] });
            } else {
                await channel.send({ embeds: [embed], components: [row] });
            }

        } catch (error) {
            console.error('Error updating Family Directory:', error);
        }
    }
};
