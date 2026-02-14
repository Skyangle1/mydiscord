const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_cari_jodoh',
    async execute(interaction) {
        console.log('Interaksi Diterima:', interaction.customId); // Debug log
        console.log('Opening matchmaking modal...'); // Debug log

        try {
            const modal = new ModalBuilder()
                .setCustomId('modal_cari_jodoh')
                .setTitle('Form Cari Jodoh');

            // Input for Name
            const nameInput = new TextInputBuilder()
                .setCustomId('j_nama')
                .setLabel('Nama')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(30);

            // Input for Age
            const ageLocationInput = new TextInputBuilder()
                .setCustomId('j_umur')
                .setLabel('Umur')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Contoh: 20, Jakarta atau Rahasia, Bandung');

            // Input for Gender
            const genderStatusInput = new TextInputBuilder()
                .setCustomId('j_gender')
                .setLabel('Gender')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Contoh: Pria, Single atau Wanita, Mencari');

            // Input for About Me
            const aboutMeInput = new TextInputBuilder()
                .setCustomId('j_hobi')
                .setLabel('Tentang Diriku (Hobi/Vibe)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder('Ceritakan sedikit tentang keseharian atau hal yang kamu sukai...');

            // Input for Criteria
            const criteriaInput = new TextInputBuilder()
                .setCustomId('j_tipe')
                .setLabel('Kriteria / Pesan untuk Si Doi')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder('Tipe ideal atau pesan pembuka yang ingin kamu sampaikan...');

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(ageLocationInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(genderStatusInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(aboutMeInput);
            const fifthActionRow = new ActionRowBuilder().addComponents(criteriaInput);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

            // Show modal immediately without any async operations in between
            await interaction.showModal(modal);
            console.log('Modal shown successfully'); // Debug log
        } catch (modalError) {
            console.error('Error showing modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
