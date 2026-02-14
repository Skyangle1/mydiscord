const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const { db } = require('../../database/db');

module.exports = {
    customId: /^join_family_request_\d+$/, // Matches join_family_request_123456789
    async execute(interaction) {
        try {
            const ownerId = interaction.customId.split('_')[3];

            // 1. Check restriction: Head of Family cannot join others
            const checkHead = () => {
                return new Promise((resolve, reject) => {
                    db.get('SELECT * FROM families WHERE owner_id = ?', [interaction.user.id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            };

            // 2. Check restriction: Already in a family? (Member)
            const checkMember = () => {
                return new Promise((resolve, reject) => {
                    db.get('SELECT * FROM family_members WHERE user_id = ?', [interaction.user.id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            };

            const [isHead, isMember] = await Promise.all([checkHead(), checkMember()]);

            if (isHead) {
                return await interaction.reply({
                    content: '🚫 Kamu adalah Kepala Keluarga. Kamu tidak bisa bergabung dengan keluarga lain.',
                    ephemeral: true
                });
            }

            if (isMember) {
                return await interaction.reply({
                    content: '🚫 Kamu sudah bergabung dengan sebuah keluarga. Keluar dulu jika ingin pindah.',
                    ephemeral: true
                });
            }

            // 3. Show Modal
            const modal = new ModalBuilder()
                .setCustomId(`modal_join_request_${ownerId}`)
                .setTitle('Permohonan Masuk Keluarga');

            const reasonInput = new TextInputBuilder()
                .setCustomId('join_reason')
                .setLabel('Alasan Bergabung')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Kenapa kamu ingin masuk keluarga ini?')
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(row);

            await interaction.showModal(modal);

        } catch (error) {
            console.error('Error handling join family request:', error);
            if (!interaction.replied) await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
        }
    }
};
