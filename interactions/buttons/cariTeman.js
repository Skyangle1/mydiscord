const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_cari_teman',
    async execute(interaction) {
        console.log('Interaksi Diterima:', interaction.customId); // Debug log
        console.log('Opening friend-finding modal...'); // Debug log

        try {
            // Create a modal
            const friendFindingModal = new ModalBuilder()
                .setCustomId('modal_cari_teman')
                .setTitle('Form Cari Teman');

            // Input for Name
            const nameInput = new TextInputBuilder()
                .setCustomId('ft_nama')
                .setLabel('Nama')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(30);

            // Input for Age
            const ageLocationInput = new TextInputBuilder()
                .setCustomId('ft_umur')
                .setLabel('Umur')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Contoh: 20, Jakarta atau Rahasia, Bandung');

            // Input for Gender
            const genderStatusInput = new TextInputBuilder()
                .setCustomId('ft_gender')
                .setLabel('Gender')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder('Contoh: Pria/Wanita, dll');

            // Input for About Me
            const aboutMeInput = new TextInputBuilder()
                .setCustomId('ft_hobi')
                .setLabel('Hobi / Minat')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder('Apa yang suka kamu lakukan? Gaming, Musik, dll...');

            // Input for Goal
            const goalInput = new TextInputBuilder()
                .setCustomId('ft_tujuan')
                .setLabel('Tujuan Mencari Teman')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setPlaceholder('Main bareng, ngobrol santai, atau diskusi topik tertentu...');

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(ageLocationInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(genderStatusInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(aboutMeInput);
            const fifthActionRow = new ActionRowBuilder().addComponents(goalInput);

            friendFindingModal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

            await interaction.showModal(friendFindingModal);
            console.log('Friend finding modal shown successfully');
        } catch (modalError) {
            console.error('Error showing friend finding modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
