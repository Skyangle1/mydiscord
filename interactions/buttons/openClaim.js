const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'btn_open_claim',
    async execute(interaction) {
        try {
            // Create a modal for enhanced claim
            const claimModal = new ModalBuilder()
                .setCustomId('modal_enhanced_claim')
                .setTitle('Ajukan Tiket Klaim Hadiah');

            // Input for receiver name (required)
            const receiverNameInput = new TextInputBuilder()
                .setCustomId('receiver_name')
                .setLabel('Nama Penerima')
                .setPlaceholder('Masukkan nama penerima hadiah')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for winner category (required)
            const categoryInput = new TextInputBuilder()
                .setCustomId('winner_category')
                .setLabel('Kategori Pemenang')
                .setPlaceholder('Contoh: Juara 1, Pemenang Minggu Ini, dll')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for reward amount (required)
            const rewardInput = new TextInputBuilder()
                .setCustomId('reward_amount')
                .setLabel('Total Hadiah')
                .setPlaceholder('Contoh: Rp 500.000, 1 Voucher Game, dll')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for e-wallet number (required)
            const walletInput = new TextInputBuilder()
                .setCustomId('wallet_number')
                .setLabel('Nomor E-Wallet')
                .setPlaceholder('Contoh: 081234567890 (DANA/OVO/GOPAY)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // Input for address (optional for privacy)
            const addressInput = new TextInputBuilder()
                .setCustomId('address')
                .setLabel('Alamat Lengkap (Opsional)')
                .setPlaceholder('Contoh: Jl. Merdeka No. 123, Kota, Provinsi (Boleh dikosongkan untuk privasi)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            // Add inputs to modal
            const firstActionRow = new ActionRowBuilder().addComponents(receiverNameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(categoryInput);
            const thirdActionRow = new ActionRowBuilder().addComponents(rewardInput);
            const fourthActionRow = new ActionRowBuilder().addComponents(walletInput);
            const fifthActionRow = new ActionRowBuilder().addComponents(addressInput);

            claimModal.addComponents(
                firstActionRow,
                secondActionRow,
                thirdActionRow,
                fourthActionRow,
                fifthActionRow
            );

            await interaction.showModal(claimModal);
        } catch (modalError) {
            console.error('Error showing enhanced claim modal:', modalError);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Terjadi kesalahan saat membuka form klaim. Silakan coba lagi.',
                    ephemeral: true
                });
            }
        }
    }
};
