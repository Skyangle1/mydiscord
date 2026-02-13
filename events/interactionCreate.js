const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../database/db');

module.exports = async (client, interaction) => {
    try {
        // Log all interactions for debugging
        if (interaction.isButton() || interaction.isModalSubmit()) {
            console.log('Interaksi Diterima:', interaction.customId);
        }

        // Check if the interaction is from the allowed guild
        // Skip this check if interaction is in DM (no guildId)
        const allowedGuildIds = process.env.ALLOWED_GUILD_ID ?
            process.env.ALLOWED_GUILD_ID.split(',').map(id => id.trim()) : [];
        
        if (interaction.guildId && allowedGuildIds.length > 0 && !allowedGuildIds.includes(interaction.guildId)) {
            // Only reply if the interaction hasn't been replied to yet
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Bot ini hanya dapat digunakan di guild yang diizinkan.',
                    ephemeral: true
                });
            }
            return;
        }

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);

                // Try to send error message, but handle cases where interaction might already be responded to
                try {
                    if (!interaction.replied && !interaction.deferred) {
                        // If not yet replied, use reply with flags
                        await interaction.reply({
                            content: 'There was an error while executing this command!',
                            ephemeral: true
                        });
                    } else {
                        // If already replied or deferred, we can't send another reply
                        // Just log the error, as we can't respond to the user anymore
                        console.error('Could not send error message - interaction already acknowledged');
                    }
                } catch (replyError) {
                    console.error('Failed to send error message:', replyError);
                }
            }
        }
        else if (interaction.isButton()) {
            console.log('Interaksi Diterima:', interaction.customId); // Debug log

            // Handle the button click to open modal
            if (interaction.customId === 'btn_open_letter_modal') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_letter_submit')
                    .setTitle('Tulis Surat Cinta');

                // Input for "From" (optional)
                const inputFrom = new TextInputBuilder()
                    .setCustomId('input_from')
                    .setLabel('Dari (Kosongkan Jika Ingin Anonim)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                // Input for "To" (required)
                const inputTo = new TextInputBuilder()
                    .setCustomId('input_to')
                    .setLabel('Untuk (Masukkan Username)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                // Input for content (required)
                const inputContent = new TextInputBuilder()
                    .setCustomId('input_content')
                    .setLabel('Isi Surat')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                // Input for image URL (optional)
                const inputImage = new TextInputBuilder()
                    .setCustomId('input_image')
                    .setLabel('Link Gambar (opsional)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                // Add inputs to modal
                const firstActionRow = new ActionRowBuilder().addComponents(inputFrom);
                const secondActionRow = new ActionRowBuilder().addComponents(inputTo);
                const thirdActionRow = new ActionRowBuilder().addComponents(inputContent);
                const fourthActionRow = new ActionRowBuilder().addComponents(inputImage);

                modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

                await interaction.showModal(modal);
            }
            // Handle matchmaking button click
            else if (interaction.customId === 'btn_cari_jodoh') {
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
                }
            }
            // Handle friend-finding button click
            else if (interaction.customId === 'btn_cari_teman') {
                console.log('Interaksi Diterima:', interaction.customId); // Debug log
                console.log('Opening friend-finding modal...'); // Debug log

                try {
                    const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

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
                        .setPlaceholder('Contoh: Pria, Single atau Wanita, Mencari');

                    // Input for About Me
                    const aboutMeInput = new TextInputBuilder()
                        .setCustomId('ft_hobi')
                        .setLabel('Tentang Diriku (Hobi/Vibe)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder('Ceritakan sedikit tentang keseharian atau hal yang kamu sukai...');

                    // Input for Interests
                    const interestsInput = new TextInputBuilder()
                        .setCustomId('ft_minat')
                        .setLabel('Minat / Interest')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder('Apa minat atau interest yang kamu punya...');

                    // Add inputs to modal
                    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(ageLocationInput);
                    const thirdActionRow = new ActionRowBuilder().addComponents(genderStatusInput);
                    const fourthActionRow = new ActionRowBuilder().addComponents(aboutMeInput);
                    const fifthActionRow = new ActionRowBuilder().addComponents(interestsInput);

                    friendFindingModal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

                    // Show modal immediately without any async operations in between
                    await interaction.showModal(friendFindingModal);
                    console.log('Friend-finding modal shown successfully'); // Debug log
                } catch (modalError) {
                    console.error('Error showing friend-finding modal:', modalError);
                }
            }
            // Handle reply button clicks
            else if (interaction.customId && interaction.customId.startsWith('btn_reply_')) {
                const letterId = interaction.customId.split('_')[2];

                // Show modal immediately to avoid DiscordAPIError[10062]
                const modal = new ModalBuilder()
                    .setCustomId(`modal_reply_submit_${letterId}`)
                    .setTitle('Balas Surat');

                // Input for reply content (required)
                const inputReply = new TextInputBuilder()
                    .setCustomId('input_reply_content')
                    .setLabel('Isi Balasan')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                // Input for sender name (optional)
                const inputSenderName = new TextInputBuilder()
                    .setCustomId('input_reply_sender_name')
                    .setLabel('Nama Pengirim (Kosongkan untuk Nama Asli)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Misal: Pengagum Rahasia / Velvet Member')
                    .setRequired(false); // <-- Key is here (false)

                const firstActionRow = new ActionRowBuilder().addComponents(inputReply);
                const secondActionRow = new ActionRowBuilder().addComponents(inputSenderName);
                modal.addComponents(firstActionRow, secondActionRow);

                // Show modal first, then handle database validation in the modal submit handler
                await interaction.showModal(modal);
            }
            // Handle additional reply button clicks in threads
            else if (interaction.customId && interaction.customId.startsWith('btn_additional_reply_')) {
                const letterId = interaction.customId.split('_')[3];

                // Show modal immediately to avoid DiscordAPIError[10062]
                const modal = new ModalBuilder()
                    .setCustomId(`modal_additional_reply_${letterId}`)
                    .setTitle('Balas Surat (Lanjutan)');

                // Input for reply content (required)
                const inputReply = new TextInputBuilder()
                    .setCustomId('input_reply_content')
                    .setLabel('Isi Balasan')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                // Input for sender name (optional)
                const inputSenderName = new TextInputBuilder()
                    .setCustomId('input_reply_sender_name')
                    .setLabel('Nama Pengirim (Kosongkan untuk Nama Asli)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Misal: Pengagum Rahasia / Velvet Member')
                    .setRequired(false); // <-- Key is here (false)

                const firstActionRow = new ActionRowBuilder().addComponents(inputReply);
                const secondActionRow = new ActionRowBuilder().addComponents(inputSenderName);
                modal.addComponents(firstActionRow, secondActionRow);

                // Show modal first, then handle database validation in the modal submit handler
                await interaction.showModal(modal);
            }
            // Handle Chat Me button click
            else if (interaction.customId && interaction.customId.startsWith('btn_chat_me_')) {
                // Extract user ID and type from custom ID
                // Format: btn_chat_me_{type}_{userId}
                const parts = interaction.customId.split('_');
                if (parts.length < 4) {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Format custom ID tidak valid.',
                            ephemeral: true
                        });
                    }
                    return;
                }

                const type = parts[3]; // Either 'jodoh' or 'teman'
                const targetUserId = parts.slice(4).join('_'); // The actual user ID (handle cases where ID might have underscores)

                // Validate that targetUserId is a valid Discord Snowflake
                if (!targetUserId || targetUserId === 'undefined' || !/^\d{17,19}$/.test(targetUserId)) {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'ID pengguna tujuan tidak valid.',
                            ephemeral: true
                        });
                    }
                    return;
                }

                try {
                    // Determine title based on type
                    const title = type === 'teman' ? 'Tuliskan Pesan Kenalanmu' : 'Tuliskan Pesan Perkenalanmu';

                    // Determine placeholder based on type
                    const placeholder = type === 'teman'
                        ? 'Halo, aku melihat profilmu di komunitas Folk... bolehkah kita berkenalan?'
                        : 'Halo, aku melihat profilmu di Velvet... bolehkah kita berkenalan?';

                    // Show modal for the message
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_chat_me_${type}_${targetUserId}`)
                        .setTitle(title);

                    // Input for the introduction message
                    const messageInput = new TextInputBuilder()
                        .setCustomId('chat_me_message')
                        .setLabel(type === 'teman' ? 'Tuliskan Pesan Kenalanmu' : 'Tuliskan Pesan Perkenalanmu')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder(placeholder);

                    const actionRow = new ActionRowBuilder().addComponents(messageInput);
                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                } catch (modalError) {
                    console.error('Error showing chat me modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form pesan. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Open Feedback button click
            else if (interaction.customId === 'btn_open_saran') {
                try {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_saran_user')
                        .setTitle('^\n\nKirim Saran Mɣralune');

                    const inputKategori = new TextInputBuilder()
                        .setCustomId('kategori_saran')
                        .setLabel('Subjek / Kategori')
                        .setPlaceholder('Contoh: Saran Fitur / Laporan Bug')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const inputPesan = new TextInputBuilder()
                        .setCustomId('pesan_saran')
                        .setLabel('Detail Masukan')
                        .setPlaceholder('Tuliskan masukanmu di sini...')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(inputKategori),
                        new ActionRowBuilder().addComponents(inputPesan)
                    );

                    await interaction.showModal(modal);
                } catch (modalError) {
                    console.error('Error showing saran modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form saran. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Open Curhat button click
            else if (interaction.customId === 'btn_open_curhat') {
                try {
                    const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                    // Create a modal
                    const curhatModal = new ModalBuilder()
                        .setCustomId('modal_curhat_user')
                        .setTitle('Curhat Aman & Anonim');

                    // Input for category (required)
                    const categoryInput = new TextInputBuilder()
                        .setCustomId('kategori_curhat')
                        .setLabel('Kategori Curhat')
                        .setPlaceholder('Contoh: Curhat Harian, Curhat Galau, Curhat Cerita, dll')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    // Input for message (required)
                    const messageInput = new TextInputBuilder()
                        .setCustomId('pesan_curhat')
                        .setLabel('Isi Curhatmu')
                        .setPlaceholder('Ceritakan apa yang ingin kamu sampaikan... (semuanya anonim)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    // Add inputs to modal
                    const firstActionRow = new ActionRowBuilder().addComponents(categoryInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(messageInput);

                    curhatModal.addComponents(firstActionRow, secondActionRow);

                    await interaction.showModal(curhatModal);
                } catch (modalError) {
                    console.error('Error showing curhat modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form curhat. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Open Feedback button click
            else if (interaction.customId === 'btn_open_feedback') {
                try {
                    const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                    // Create a modal
                    const feedbackModal = new ModalBuilder()
                        .setCustomId('feedbackModal')
                        .setTitle('Feedback Form');

                    // Add star rating input (required)
                    const starRatingInput = new TextInputBuilder()
                        .setCustomId('starRating')
                        .setLabel('Rate your experience (1-5 stars)')
                        .setPlaceholder('Enter a number from 1 to 5')
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(1)
                        .setMaxLength(1)
                        .setRequired(true);

                    // Add feedback title input (optional)
                    const feedbackTitleInput = new TextInputBuilder()
                        .setCustomId('feedbackTitle')
                        .setLabel('Feedback Title')
                        .setPlaceholder('Briefly summarize your feedback (optional)')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(100)
                        .setRequired(false);

                    // Add detailed feedback input (optional)
                    const feedbackDetailInput = new TextInputBuilder()
                        .setCustomId('feedbackDetail')
                        .setLabel('Detailed Feedback')
                        .setPlaceholder('Please provide detailed feedback... (optional)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(4000)
                        .setRequired(false);

                    // Add feedback type selection (optional)
                    const feedbackTypeInput = new TextInputBuilder()
                        .setCustomId('feedbackType')
                        .setLabel('Feedback Type')
                        .setPlaceholder('Bug Report, Feature Request, or General Comment (optional)')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(50)
                        .setRequired(false);

                    // Add action rows for inputs
                    const firstActionRow = new ActionRowBuilder().addComponents(starRatingInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(feedbackTitleInput);
                    const thirdActionRow = new ActionRowBuilder().addComponents(feedbackDetailInput);
                    const fourthActionRow = new ActionRowBuilder().addComponents(feedbackTypeInput);

                    feedbackModal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

                    // Show the modal to the user
                    await interaction.showModal(feedbackModal);
                } catch (modalError) {
                    console.error('Error showing feedback modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form feedback. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Build Family button click
            else if (interaction.customId === 'btn_build_family') {
                try {
                    const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                    // Create a modal
                    const buildFamilyModal = new ModalBuilder()
                        .setCustomId('modal_build_family')
                        .setTitle('Bangun Keluargamu');

                    // Input for family name (required)
                    const familyNameInput = new TextInputBuilder()
                        .setCustomId('family_name')
                        .setLabel('Nama Keluarga')
                        .setPlaceholder('Contoh: Keluarga Bahagia, Tim Hebat, dll')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(25)
                        .setRequired(true);

                    // Input for family slogan (optional)
                    const sloganInput = new TextInputBuilder()
                        .setCustomId('family_slogan')
                        .setLabel('Slogan Keluarga')
                        .setPlaceholder('Slogan singkat keluargamu (opsional)')
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(100)
                        .setRequired(false);

                    // Input for family logo (optional)
                    const logoInput = new TextInputBuilder()
                        .setCustomId('family_logo')
                        .setLabel('Logo Keluarga')
                        .setPlaceholder('Masukkan URL logo keluarga (upload dulu ke layanan hosting gambar)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    // Add inputs to modal
                    const firstActionRow = new ActionRowBuilder().addComponents(familyNameInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(sloganInput);
                    const thirdActionRow = new ActionRowBuilder().addComponents(logoInput);

                    buildFamilyModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

                    await interaction.showModal(buildFamilyModal);
                } catch (modalError) {
                    console.error('Error showing build family modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form pembuatan keluarga. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Join Family button click
            else if (interaction.customId === 'btn_join_family') {
                try {
                    const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                    // Create a modal
                    const joinFamilyModal = new ModalBuilder()
                        .setCustomId('modal_join_family')
                        .setTitle('Masuk Keluarga');

                    // Input for family name (required)
                    const familyNameInput = new TextInputBuilder()
                        .setCustomId('join_family_name')
                        .setLabel('Nama Keluarga')
                        .setPlaceholder('Masukkan nama keluarga yang ingin kamu masuki')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    // Input for reason to join (required)
                    const reasonInput = new TextInputBuilder()
                        .setCustomId('join_reason')
                        .setLabel('Alasan Bergabung')
                        .setPlaceholder('Jelaskan mengapa kamu ingin bergabung dengan keluarga ini...')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    // Add inputs to modal
                    const firstActionRow = new ActionRowBuilder().addComponents(familyNameInput);
                    const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);

                    joinFamilyModal.addComponents(firstActionRow, secondActionRow);

                    await interaction.showModal(joinFamilyModal);
                } catch (modalError) {
                    console.error('Error showing join family modal:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form masuk keluarga. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle List Families button click
            else if (interaction.customId === 'btn_list_families') {
                try {
                    // Import the database connection
                    const { db } = require('../database/db');
                    
                    // Query to get all families
                    const families = [];
                    db.each('SELECT family_name, slogan, logo_url FROM families ORDER BY family_name ASC', [], (err, row) => {
                        if (err) {
                            console.error('Database error:', err);
                        } else {
                            families.push(row);
                        }
                    }, () => {
                        // After all rows are processed, send the list
                        let familyListMessage = '🏠 **Daftar Keluarga di Mɣralune**\n\n';
                        
                        if (families.length > 0) {
                            families.forEach((family, index) => {
                                familyListMessage += `${index + 1}. **${family.family_name}**\n`;
                                familyListMessage += `   Slogan: ${family.slogan || 'Tidak ada slogan'}\n`;
                                
                                // Add logo information if available
                                if (family.logo_url) {
                                    familyListMessage += `   Logo: ✅ Tersedia\n`;
                                } else {
                                    familyListMessage += `   Logo: ❌ Tidak ada\n`;
                                }
                                
                                familyListMessage += `\n`;
                            });
                        } else {
                            familyListMessage += 'Belum ada keluarga yang terdaftar.';
                        }
                        
                        // Send the list as a reply
                        if (!interaction.replied && !interaction.deferred) {
                            interaction.reply({ 
                                content: familyListMessage, 
                                ephemeral: false // Show to everyone in the channel
                            });
                        } else {
                            interaction.followUp({
                                content: familyListMessage,
                                ephemeral: false
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error listing families:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply({
                            content: 'Terjadi kesalahan saat mengambil daftar keluarga. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Approve Claim button click
            else if (interaction.customId && interaction.customId.startsWith('btn_approve_claim_')) {
                try {
                    // Check if user is authorized to use this feature
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

                    // Extract claim ID from custom ID
                    const claimId = interaction.customId.split('_')[3]; // Format: btn_approve_claim_{id}

                    // Get the database connection
                    const { db } = require('../database/db');

                    // Update claim status to APPROVED
                    const updateClaim = () => {
                        return new Promise((resolve, reject) => {
                            const query = `UPDATE claims SET status = ? WHERE id = ?`;
                            db.run(query, ['APPROVED', claimId], function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(this.changes); // Number of affected rows
                                }
                            });
                        });
                    };

                    try {
                        const changes = await updateClaim();
                        if (changes === 0) {
                            await interaction.reply({
                                content: 'Klaim tidak ditemukan.',
                                ephemeral: true
                            });
                            return;
                        }

                        // Get the user who made the claim and additional details
                        const getClaimDetails = () => {
                            return new Promise((resolve, reject) => {
                                const query = `SELECT user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
                                db.get(query, [claimId], (err, row) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(row);
                                    }
                                });
                            });
                        };

                        // Update the embed to show approved status
                        const { EmbedBuilder } = require('discord.js');
                        const originalEmbed = interaction.message.embeds[0];
                        const updatedEmbed = new EmbedBuilder()
                            .setTitle(`🎫 Tiket Klaim #${claimId} - DISETUJUI`)
                            .setDescription(originalEmbed.data.description || ' ')
                            .setColor('#00FF00') // Green color for approved
                            .addFields(
                                { name: 'Dibuat oleh', value: originalEmbed.data.fields.find(f => f.name === 'Dibuat oleh')?.value || 'Unknown', inline: true },
                                { name: 'Status', value: 'DISETUJUI', inline: true },
                                { name: 'Tanggal', value: originalEmbed.data.fields.find(f => f.name === 'Tanggal')?.value || new Date().toLocaleString('id-ID'), inline: true },
                                { name: 'Disetujui oleh', value: interaction.user.tag, inline: false }
                            )
                            .setTimestamp();

                        // Remove the buttons
                        await interaction.update({ embeds: [updatedEmbed], components: [] });

                        // Send success message to admin
                        await interaction.followUp({
                            content: `Tiket klaim #${claimId} telah disetujui.`,
                            ephemeral: true
                        });

                        // Get the claim details to include in the message
                        const getClaimDetailsForApproval = () => {
                            return new Promise((resolve, reject) => {
                                const query = `SELECT user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
                                db.get(query, [claimId], (err, row) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(row);
                                    }
                                });
                            });
                        };

                        const claimDetails = await getClaimDetailsForApproval();
                        
                        // Send detailed approval information in the thread
                        try {
                            const originalMessage = interaction.message;
                            let thread = originalMessage.thread;
                            
                            if (thread) {
                                // Send detailed approval information in the existing thread
                                const detailedApprovalMessage = `🎉 **TIKET DISETUJUI** 🎉\n\n` +
                                    `**Nama Penerima:** <@${claimDetails.user_id}>\n` +
                                    `**Kategori Pemenang:** ${claimDetails.description?.substring(0, 50) + '...' || 'Tidak ada deskripsi'}\n` +
                                    `**Total Hadiah:** ${claimDetails.reward_amount || 'Menunggu konfirmasi'}\n` +
                                    `**Nomor E-Wallet:** ${claimDetails.wallet_number || 'Belum diisi'}\n` +
                                    `**Alamat Lengkap:** ${claimDetails.address || 'Tidak disediakan (Privasi)'}\n\n` +
                                    `Tiket klaim telah disetujui oleh ${interaction.user.tag}.`;
                                    
                                await thread.send({
                                    content: detailedApprovalMessage
                                });
                                
                                // Send a private notification to the user in the thread
                                await thread.send({
                                    content: `<@${claimDetails.user_id}> Tiket klaimmu telah disetujui. Silakan dicek informasi lebih lanjut di sini.`
                                });
                            }
                        } catch (threadError) {
                            console.error('Error sending to thread for claim approval:', threadError);
                        }
                    } catch (dbError) {
                        console.error('Database error updating claim:', dbError);
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat memperbarui status klaim.',
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Error handling approve claim button:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat menyetujui klaim. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Reject Claim button click
            else if (interaction.customId && interaction.customId.startsWith('btn_reject_claim_')) {
                try {
                    // Check if user is authorized to use this feature
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

                    // Extract claim ID from custom ID
                    const claimId = interaction.customId.split('_')[3]; // Format: btn_reject_claim_{id}

                    // Get the database connection
                    const { db } = require('../database/db');

                    // Update claim status to REJECTED
                    const updateClaim = () => {
                        return new Promise((resolve, reject) => {
                            const query = `UPDATE claims SET status = ? WHERE id = ?`;
                            db.run(query, ['REJECTED', claimId], function(err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(this.changes); // Number of affected rows
                                }
                            });
                        });
                    };

                    try {
                        const changes = await updateClaim();
                        if (changes === 0) {
                            await interaction.reply({
                                content: 'Klaim tidak ditemukan.',
                                ephemeral: true
                            });
                            return;
                        }

                        // Get the user who made the claim and additional details
                        const getClaimDetails = () => {
                            return new Promise((resolve, reject) => {
                                const query = `SELECT user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
                                db.get(query, [claimId], (err, row) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(row);
                                    }
                                });
                            });
                        };

                        // Update the embed to show rejected status
                        const { EmbedBuilder } = require('discord.js');
                        const originalEmbed = interaction.message.embeds[0];
                        const updatedEmbed = new EmbedBuilder()
                            .setTitle(`🎫 Tiket Klaim #${claimId} - DITOLAK`)
                            .setDescription(originalEmbed.data.description || ' ')
                            .setColor('#FF0000') // Red color for rejected
                            .addFields(
                                { name: 'Dibuat oleh', value: originalEmbed.data.fields.find(f => f.name === 'Dibuat oleh')?.value || 'Unknown', inline: true },
                                { name: 'Status', value: 'DITOLAK', inline: true },
                                { name: 'Tanggal', value: originalEmbed.data.fields.find(f => f.name === 'Tanggal')?.value || new Date().toLocaleString('id-ID'), inline: true },
                                { name: 'Ditolak oleh', value: interaction.user.tag, inline: false }
                            )
                            .setTimestamp();

                        // Remove the buttons
                        await interaction.update({ embeds: [updatedEmbed], components: [] });

                        // Send success message to admin
                        await interaction.followUp({
                            content: `Tiket klaim #${claimId} telah ditolak.`,
                            ephemeral: true
                        });

                        // Get the claim details to include in the message
                        const getClaimDetailsForRejection = () => {
                            return new Promise((resolve, reject) => {
                                const query = `SELECT user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
                                db.get(query, [claimId], (err, row) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(row);
                                    }
                                });
                            });
                        };

                        const claimDetails = await getClaimDetailsForRejection();
                        
                        // Send detailed rejection information in the thread
                        try {
                            const originalMessage = interaction.message;
                            let thread = originalMessage.thread;
                            
                            if (thread) {
                                // Send detailed rejection information in the existing thread
                                const detailedRejectionMessage = `❌ **TIKET DITOLAK** ❌\n\n` +
                                    `**Nama Penerima:** <@${claimDetails.user_id}>\n` +
                                    `**Kategori Pemenang:** ${claimDetails.description?.substring(0, 50) + '...' || 'Tidak ada deskripsi'}\n` +
                                    `**Total Hadiah:** ${claimDetails.reward_amount || 'Menunggu konfirmasi'}\n` +
                                    `**Nomor E-Wallet:** ${claimDetails.wallet_number || 'Belum diisi'}\n` +
                                    `**Alamat Lengkap:** ${claimDetails.address || 'Tidak disediakan (Privasi)'}\n\n` +
                                    `Tiket klaim telah ditolak oleh ${interaction.user.tag}.`;
                                    
                                await thread.send({
                                    content: detailedRejectionMessage
                                });
                                
                                // Send a private notification to the user in the thread
                                await thread.send({
                                    content: `<@${claimDetails.user_id}> Tiket klaimmu telah ditolak. Silakan dicek informasi lebih lanjut di sini.`
                                });
                            }
                        } catch (threadError) {
                            console.error('Error sending to thread for claim rejection:', threadError);
                        }
                    } catch (dbError) {
                        console.error('Database error updating claim:', dbError);
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat memperbarui status klaim.',
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    console.error('Error handling reject claim button:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat menolak klaim. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Handle Open Feedback button click from message
            else if (interaction.customId === 'btn_open_saran_from_msg') {
                try {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_saran_user_from_msg')
                        .setTitle('Saran Terkait Pesan');

                    const inputKategori = new TextInputBuilder()
                        .setCustomId('kategori_saran_from_msg')
                        .setLabel('Subjek / Kategori')
                        .setPlaceholder('Contoh: Saran Fitur / Laporan Bug')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const inputPesan = new TextInputBuilder()
                        .setCustomId('pesan_saran_from_msg')
                        .setLabel('Detail Masukan')
                        .setPlaceholder('Tuliskan masukanmu di sini...')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(inputKategori),
                        new ActionRowBuilder().addComponents(inputPesan)
                    );

                    await interaction.showModal(modal);
                } catch (modalError) {
                    console.error('Error showing saran modal from message:', modalError);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuka form saran. Silakan coba lagi.',
                            ephemeral: true
                        });
                    }
                }
            }
            // Reply modal handlers have been moved to the correct modal submission section
            // Handle modal submission for reply
            else if (interaction.customId.startsWith('modal_reply_submit_')) {
                await interaction.deferReply({ flags: 64 }); // Use deferReply for modal submissions

                try {
                    const letterId = interaction.customId.split('_')[3];
                    const replyContent = interaction.fields.getTextInputValue('input_reply_content');
                    const replySenderName = interaction.fields.getTextInputValue('input_reply_sender_name');

                    // LOGIKA: Pakai nama custom, kalau kosong pakai Tag Discord asli
                    const replyDisplayName = replySenderName && replySenderName.trim() !== ""
                        ? replySenderName
                        : interaction.user.tag;

                    // Get the original letter info
                    const query = 'SELECT sender_id, recipient_name, original_message_id FROM letters WHERE id = ?';
                    db.get(query, [parseInt(letterId)], async (err, row) => {
                        if (err) {
                            console.error('Database error:', err);
                            await interaction.editReply({ content: 'Database error occurred!', flags: 64 });
                            return;
                        }

                        if (!row) {
                            await interaction.editReply({ content: 'Original letter not found!', flags: 64 });
                            return;
                        }

                        // Find the original message in the confession setup channel
                        const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
                        if (!targetChannel) {
                            await interaction.editReply({ content: 'Confession setup channel not found. Please contact the administrator.', flags: 64 });
                            return;
                        }

                        try {
                            // Get the original message by ID
                            let originalMessage;
                            if (row.original_message_id) {
                                originalMessage = await targetChannel.messages.fetch(row.original_message_id);
                            } else {
                                // Fallback: search for the message by embed footer
                                const messages = await targetChannel.messages.fetch({ limit: 100 });
                                originalMessage = messages.find(msg => {
                                    if (msg.embeds.length > 0) {
                                        const embed = msg.embeds[0];
                                        return embed.footer && embed.footer.text.includes('📜 Arsip Hati');
                                    }
                                    return false;
                                });
                            }

                            if (originalMessage) {
                                // Check if there's already a thread for this message
                                let thread = originalMessage.thread;

                                if (!thread) {
                                    // Create a new thread
                                    thread = await originalMessage.startThread({
                                        name: `📜 Arsip Hati`,
                                        autoArchiveDuration: 60, // Auto archive after 1 hour
                                        type: 12, // Private thread (GUILD_PRIVATE_THREAD)
                                    });
                                }

                                // Create reply embed
                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`🖋️ "Goresan Tanpa Tinta": ${replyContent}\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                    .setTimestamp();

                                // Create additional reply button
                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(additionalReplyButton);

                                // Send the reply in the thread
                                await thread.send({
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`🥀 Seseorang sedang merangkai rindu untukmu di "${interaction.guild.name}"...\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            } else {
                                // If we can't find the original message, send to the main channel
                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`🖋️ "Goresan Tanpa Tinta": ${replyContent}\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                    .setTimestamp();

                                // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                                const writeLetterButton = new ButtonBuilder()
                                    .setLabel('💌 Love Letter')
                                    .setStyle('Primary')
                                    .setCustomId('btn_open_letter_modal');

                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                                try {
                                    await targetChannel.send({
                                        content: `🖋️ "Teruntuk Sang Pemilik Nama" <@${row.sender_id}>`, // Mention the original sender for notification
                                        embeds: [replyEmbed],
                                        components: [buttonRow]
                                    });
                                } catch (sendError) {
                                    console.error('Error sending reply to target channel:', {
                                        message: sendError.message,
                                        code: sendError.code,
                                        name: sendError.name
                                    });

                                    // Handle specific Discord API errors
                                    if (sendError.code === 50013) { // Missing Permissions
                                        console.error('Bot lacks permissions to send messages in the target channel.');
                                        await interaction.editReply({
                                            content: 'Bot lacks permissions to send messages in the target channel.',
                                            ephemeral: true
                                        });
                                        return;
                                    } else if (sendError.code === 10003) { // Unknown Channel
                                        console.error('Target channel does not exist or is inaccessible.');
                                        await interaction.editReply({
                                            content: 'Target channel does not exist or is inaccessible.',
                                            ephemeral: true
                                        });
                                        return;
                                    } else if (sendError.code === 50001) { // Missing Access
                                        console.error('Bot lacks access to view the target channel.');
                                        await interaction.editReply({
                                            content: 'Bot lacks access to view the target channel.',
                                            ephemeral: true
                                        });
                                        return;
                                    } else {
                                        // For other errors, try to inform the user without crashing
                                        await interaction.editReply({
                                            content: 'An error occurred while sending the message.',
                                            flags: 64
                                        });
                                        return;
                                    }
                                }

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`🥀 Seseorang sedang merangkai rindu untukmu di "${interaction.guild.name}"...\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            }
                        } catch (error) {
                            console.error('Error sending reply:', error);
                            await interaction.editReply({ content: 'There was an error sending your reply. Please try again later.', flags: 64 });
                        }
                    });
                } catch (error) {
                    console.error('Error processing reply submission:', error);
                    await interaction.editReply({ content: 'There was an error submitting your reply. Please try again later.', flags: 64 });
                }
            }
            // Handle additional replies in threads
            else if (interaction.customId.startsWith('modal_additional_reply_')) {
                await interaction.deferReply({ flags: 64 }); // Use deferReply for modal submissions

                try {
                    const letterId = interaction.customId.split('_')[3];
                    const replyContent = interaction.fields.getTextInputValue('input_reply_content');
                    const replySenderName = interaction.fields.getTextInputValue('input_reply_sender_name');

                    // LOGIKA: Pakai nama custom, kalau kosong pakai Tag Discord asli
                    const replyDisplayName = replySenderName && replySenderName.trim() !== ""
                        ? replySenderName
                        : interaction.user.tag;

                    // Get the original letter info
                    const query = 'SELECT sender_id, recipient_name, original_message_id FROM letters WHERE id = ?';
                    db.get(query, [parseInt(letterId)], async (err, row) => {
                        if (err) {
                            console.error('Database error:', err);
                            await interaction.editReply({ content: 'Database error occurred!', flags: 64 });
                            return;
                        }

                        if (!row) {
                            await interaction.editReply({ content: 'Original letter not found!', flags: 64 });
                            return;
                        }

                        // Find the original message in the confession setup channel
                        const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
                        if (!targetChannel) {
                            await interaction.editReply({ content: 'Confession setup channel not found. Please contact the administrator.', flags: 64 });
                            return;
                        }

                        try {
                            // Get the original message by ID
                            let originalMessage;
                            if (row.original_message_id) {
                                originalMessage = await targetChannel.messages.fetch(row.original_message_id);
                            } else {
                                // Fallback: search for the message by embed footer
                                const messages = await targetChannel.messages.fetch({ limit: 100 });
                                originalMessage = messages.find(msg => {
                                    if (msg.embeds.length > 0) {
                                        const embed = msg.embeds[0];
                                        return embed.footer && embed.footer.text.includes('📜 Arsip Hati');
                                    }
                                    return false;
                                });
                            }

                            if (originalMessage && originalMessage.thread) {
                                // Send additional reply in the existing thread
                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`🖋️ "Goresan Tanpa Tinta": ${replyContent}\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setTimestamp();

                                // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                                const writeLetterButton = new ButtonBuilder()
                                    .setLabel('💌 Love Letter')
                                    .setStyle('Primary')
                                    .setCustomId('btn_open_letter_modal');

                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                                await originalMessage.thread.send({
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`🥀 Seseorang sedang merangkai rindu untukmu di "${interaction.guild.name}"...\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            } else {
                                // If no thread exists, create one
                                let thread;
                                if (originalMessage) {
                                    thread = await originalMessage.startThread({
                                        name: `📜 Arsip Hati`,
                                        autoArchiveDuration: 60,
                                        type: 12, // Private thread (GUILD_PRIVATE_THREAD)
                                    });
                                } else {
                                    // If we can't find the original message, send to the main channel
                                    const replyEmbed = new EmbedBuilder()
                                        .setTitle(`📖 "Lembar Terlarang"`)
                                        .setDescription(`🖋️ "Goresan Tanpa Tinta": ${replyContent}\n\nDari: ${replyDisplayName}`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                                    const writeLetterButton = new ButtonBuilder()
                                        .setLabel('💌 Love Letter')
                                        .setStyle('Primary')
                                        .setCustomId('btn_open_letter_modal');

                                    const additionalReplyButton = new ButtonBuilder()
                                        .setLabel('✉️ Reply Again')
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`btn_additional_reply_${letterId}`);

                                    const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                                    try {
                                        await targetChannel.send({
                                            content: `🖋️ "Teruntuk Sang Pemilik Nama" <@${row.sender_id}>`, // Mention the original sender for notification
                                            embeds: [replyEmbed],
                                            components: [buttonRow]
                                        });
                                    } catch (sendError) {
                                        console.error('Error sending reply to target channel:', {
                                            message: sendError.message,
                                            code: sendError.code,
                                            name: sendError.name
                                        });

                                        // Handle specific Discord API errors
                                        if (sendError.code === 50013) { // Missing Permissions
                                            console.error('Bot lacks permissions to send messages in the target channel.');
                                            await interaction.editReply({
                                                content: 'Bot lacks permissions to send messages in the target channel.',
                                                ephemeral: true
                                            });
                                            return;
                                        } else if (sendError.code === 10003) { // Unknown Channel
                                            console.error('Target channel does not exist or is inaccessible.');
                                            await interaction.editReply({
                                                content: 'Target channel does not exist or is inaccessible.',
                                                flags: 64
                                            });
                                            return;
                                        } else if (sendError.code === 50001) { // Missing Access
                                            console.error('Bot lacks access to view the target channel.');
                                            await interaction.editReply({
                                                content: 'Bot lacks access to view the target channel.',
                                                flags: 64
                                            });
                                            return;
                                        } else {
                                            // For other errors, try to inform the user without crashing
                                            await interaction.editReply({
                                                content: 'An error occurred while sending the message.',
                                                ephemeral: true
                                            });
                                            return;
                                        }
                                    }

                                    await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                                    return;
                                }

                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`🖋️ "Goresan Tanpa Tinta": ${replyContent}\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setTimestamp();

                                // Create additional reply button
                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(additionalReplyButton);

                                await thread.send({
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`🥀 Seseorang sedang merangkai rindu untukmu di "${interaction.guild.name}"...\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            }
                        } catch (error) {
                            console.error('Error sending additional reply:', error);
                            await interaction.editReply({ content: 'There was an error sending your reply. Please try again later.', flags: 64 });
                        }
                    });
                } catch (error) {
                    console.error('Error processing additional reply submission:', error);
                    await interaction.editReply({ content: 'There was an error submitting your reply. Please try again later.', flags: 64 });
                }
            }
        }

        // Handle Modal Submissions
        if (interaction.isModalSubmit()) {
            console.log('--- DEBUG MODAL ---');
            console.log('ID yang Diterima:', `"${interaction.customId}"`);

            // Check which modal is being handled
            if (interaction.customId && interaction.customId === 'modal_cari_jodoh') {
                console.log('ID yang Dicari:', '"modal_cari_jodoh"');
                console.log('Apakah Cocok?', interaction.customId === 'modal_cari_jodoh');
            } else if (interaction.customId && interaction.customId === 'modal_saran_user') {
                console.log('ID yang Dicari:', '"modal_saran_user"');
                console.log('Apakah Cocok?', interaction.customId === 'modal_saran_user');
            } else if (interaction.customId && interaction.customId === 'modal_saran_user_from_msg') {
                console.log('ID yang Dicari:', '"modal_saran_user_from_msg"');
                console.log('Apakah Cocok?', interaction.customId === 'modal_saran_user_from_msg');
            } else if (interaction.customId && interaction.customId.startsWith('modal_chat_me_')) {
                console.log('ID yang Dicari:', '"modal_chat_me_"');
                console.log('Apakah Cocok?', interaction.customId.startsWith('modal_chat_me_'));
            } else if (interaction.customId && interaction.customId === 'modal_letter_submit') {
                console.log('ID yang Dicari:', '"modal_letter_submit"');
                console.log('Apakah Cocok?', interaction.customId === 'modal_letter_submit');
            } else if (interaction.customId && interaction.customId.startsWith('modal_reply_submit_')) {
                console.log('ID yang Dicari:', '"modal_reply_submit_"');
                console.log('Apakah Cocok?', interaction.customId.startsWith('modal_reply_submit_'));
            } else if (interaction.customId && interaction.customId.startsWith('modal_additional_reply_')) {
                console.log('ID yang Dicari:', '"modal_additional_reply_"');
                console.log('Apakah Cocok?', interaction.customId.startsWith('modal_additional_reply_'));
            } else if (interaction.customId && interaction.customId === 'modal_join_family') {
                console.log('ID yang Dicari:', '"modal_join_family"');
                console.log('Apakah Cocok?', interaction.customId === 'modal_join_family');
            } else {
                console.log('ID yang Dicari:', 'other modal types');
                console.log('Apakah Cocok?', 'N/A - Custom handling');
            }

            // Handle Find Match modal submission
            if (interaction.customId && interaction.customId === 'modal_cari_jodoh') {
                console.log('BERHASIL MASUK KE BLOK MODAL!');

                try {
                    // Anti-Timeout: Defer reply immediately using flags instead of ephemeral
                    await interaction.deferReply({ flags: 64 });

                    // Logging Diagnosa: Log saat data mulai diambil
                    console.log('Starting to retrieve form data from modal submission');

                    // Sinkronisasi ID Input: Using the correct input IDs
                    const nama = interaction.fields.getTextInputValue('j_nama');
                    const umur = interaction.fields.getTextInputValue('j_umur');
                    const gender = interaction.fields.getTextInputValue('j_gender');
                    const hobi = interaction.fields.getTextInputValue('j_hobi');
                    const tipe = interaction.fields.getTextInputValue('j_tipe');

                    // Log the retrieved values
                    console.log('Retrieved form values:', {
                        nama: nama,
                        umur: umur,
                        gender: gender,
                        hobi: hobi,
                        tipe: tipe
                    });

                    // Validate that all required values exist
                    if (!nama || !umur || !gender || !hobi || !tipe) {
                        await interaction.editReply({
                            content: 'Semua field formulir harus diisi. Mohon lengkapi semua data.',
                            flags: 64
                        });
                        return;
                    }

                    // Log the environment variable
                    console.log('JODOH_CHANNEL_ID from env:', process.env.MATCHMAKING_CHANNEL_ID);

                    // Get the matchmaking channel from environment variable
                    const matchmakingChannelId = process.env.MATCHMAKING_CHANNEL_ID;

                    // Check if channel ID is configured
                    if (!matchmakingChannelId) {
                        await interaction.editReply({
                            content: 'Kanal cari jodoh belum dikonfigurasi. Silakan hubungi administrator.',
                            flags: 64
                        });
                        return;
                    }

                    // Get the matchmaking channel
                    const matchmakingChannel = client.channels.cache.get(matchmakingChannelId);

                    // Log when bot finds the channel object
                    console.log('Matchmaking channel object found:', matchmakingChannel ? 'YES' : 'NO');

                    // Check if channel exists
                    if (!matchmakingChannel) {
                        await interaction.editReply({
                            content: 'Kanal cari jodoh tidak ditemukan. Silakan hubungi administrator.',
                            flags: 64
                        });
                        return;
                    }

                    // Create embed with Output Estetik
                    const profileEmbed = new EmbedBuilder()
                        .setTitle('📜 Identitas Singkat')
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#811331')
                        .addFields(
                            { name: '👤 Nama', value: nama, inline: false },
                            { name: '🎂 Usia', value: umur, inline: true },
                            { name: '♂️/♀️ Gender', value: gender, inline: true },
                            { name: '✨ Tentang Diriku', value: hobi, inline: false },
                            { name: '🎯 Mencari Sosok...', value: tipe, inline: false }
                        )
                        .setFooter({ text: 'Yang tertarik bisa langsung DM ya!' })
                        .setTimestamp();

                    // Create buttons - "Isi Form Cari Jodoh" and "Chat Me"
                    const jodohButton = new ButtonBuilder()
                        .setLabel('Isi Form Cari Jodoh')
                        .setEmoji('💌')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('btn_cari_jodoh');

                    const chatMeButton = new ButtonBuilder()
                        .setLabel('Chat Me')
                        .setEmoji('💬')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`btn_chat_me_jodoh_${interaction.user.id}`); // Custom ID with user ID and type

                    const row = new ActionRowBuilder()
                        .addComponents(jodohButton, chatMeButton);

                    // Send the profile to the matchmaking channel
                    try {
                        await matchmakingChannel.send({
                            content: `✨ Ada formulir cari jodoh baru! <@${interaction.user.id}>`,
                            embeds: [profileEmbed],
                            components: [row]
                        });
                    } catch (sendError) {
                        // Error Handling Ketat: Show complete error details
                        console.error('Complete error details when sending to channel:', {
                            message: sendError.message,
                            stack: sendError.stack,
                            code: sendError.code,
                            name: sendError.name,
                            status: sendError.status,
                            method: sendError.method,
                            path: sendError.path
                        });

                        await interaction.editReply({
                            content: `Terjadi kesalahan saat mengirim profil ke kanal: ${sendError.message}`,
                            flags: 64
                        });
                        return;
                    }

                    // Final Response: Success confirmation to user
                    await interaction.editReply({
                        content: 'Profil kamu telah berhasil dikirim! Orang-orang bisa melihat profil kamu sekarang.',
                        flags: 64
                    });
                } catch (error) {
                    // Error Handling Ketat: Show complete error details
                    console.error('Complete error details in matchmaking form processing:', {
                        message: error.message,
                        stack: error.stack,
                        name: error.name,
                        code: error.code
                    });

                    try {
                        await interaction.editReply({
                            content: `Terjadi kesalahan saat mengirim profil kamu: ${error.message}`,
                            flags: 64
                        });
                    } catch (editError) {
                        console.error('Failed to send error message to user:', editError);
                    }
                }
            }
            // Handle Friend-Finding modal submission
            else if (interaction.customId && interaction.customId === 'modal_cari_teman') {
                console.log('BERHASIL MASUK KE BLOK MODAL CARI TEMAN!');

                try {
                    // Anti-Timeout: Defer reply immediately using flags instead of ephemeral
                    await interaction.deferReply({ flags: 64 });

                    // Logging Diagnosa: Log saat data mulai diambil
                    console.log('Starting to retrieve form data from friend-finding modal submission');

                    // Sinkronisasi ID Input: Using the correct input IDs
                    const nama = interaction.fields.getTextInputValue('ft_nama');
                    const umur = interaction.fields.getTextInputValue('ft_umur');
                    const gender = interaction.fields.getTextInputValue('ft_gender');
                    const hobi = interaction.fields.getTextInputValue('ft_hobi');
                    const minat = interaction.fields.getTextInputValue('ft_minat');

                    // Log the retrieved values
                    console.log('Retrieved friend-finding form values:', {
                        nama: nama,
                        umur: umur,
                        gender: gender,
                        hobi: hobi,
                        minat: minat
                    });

                    // Validate that all required values exist
                    if (!nama || !umur || !gender || !hobi || !minat) {
                        await interaction.editReply({
                            content: 'Semua field formulir harus diisi. Mohon lengkapi semua data.',
                            flags: 64
                        });
                        return;
                    }

                    // Log the environment variable
                    console.log('FRIEND_FINDING_CHANNEL_ID from env:', process.env.FRIEND_FINDING_CHANNEL_ID);

                    // Get the friend-finding channel from environment variable
                    const friendFindingChannelId = process.env.FRIEND_FINDING_CHANNEL_ID;

                    // Check if channel ID is configured
                    if (!friendFindingChannelId) {
                        await interaction.editReply({
                            content: 'Kanal cari teman belum dikonfigurasi. Silakan hubungi administrator.',
                            flags: 64
                        });
                        return;
                    }

                    // Get the friend-finding channel
                    const friendFindingChannel = client.channels.cache.get(friendFindingChannelId);

                    // Log when bot finds the channel object
                    console.log('Friend-finding channel object found:', friendFindingChannel ? 'YES' : 'NO');

                    // Check if channel exists
                    if (!friendFindingChannel) {
                        await interaction.editReply({
                            content: 'Kanal cari teman tidak ditemukan. Silakan hubungi administrator.',
                            flags: 64
                        });
                        return;
                    }

                    // Create embed with friend-finding profile
                    const profileEmbed = new EmbedBuilder()
                        .setTitle('🤝 Profil Folk Companion')
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                        .setColor('#007bff')
                        .addFields(
                            { name: '👤 Nama', value: nama, inline: false },
                            { name: '🎂 Usia', value: umur, inline: true },
                            { name: '♂️/♀️ Gender', value: gender, inline: true },
                            { name: '✨ Tentang Diriku', value: hobi, inline: false },
                            { name: '🎯 Minat / Interest', value: minat, inline: false }
                        )
                        .setFooter({ text: 'Yang tertarik bisa langsung DM ya!' })
                        .setTimestamp();

                    // Create buttons - "Gabung Komunitas Folk" and "Chat Me"
                    const friendButton = new ButtonBuilder()
                        .setLabel('Gabung Komunitas Folk')
                        .setEmoji('🤝')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('btn_cari_teman');

                    const chatMeButton = new ButtonBuilder()
                        .setLabel('Chat Me')
                        .setEmoji('💬')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(`btn_chat_me_teman_${interaction.user.id}`); // Custom ID with user ID and type

                    const row = new ActionRowBuilder()
                        .addComponents(friendButton, chatMeButton);

                    // Send the profile to the friend-finding channel
                    try {
                        await friendFindingChannel.send({
                            content: `🌟 Ada profil Folk Companion baru! <@${interaction.user.id}> sedang mencari teman sejiwa.`,
                            embeds: [profileEmbed],
                            components: [row]
                        });
                    } catch (sendError) {
                        // Error Handling Ketat: Show complete error details
                        console.error('Complete error details when sending to friend-finding channel:', {
                            message: sendError.message,
                            stack: sendError.stack,
                            code: sendError.code,
                            name: sendError.name,
                            status: sendError.status,
                            method: sendError.method,
                            path: sendError.path
                        });

                        await interaction.editReply({
                            content: `Terjadi kesalahan saat mengirim profil ke kanal: ${sendError.message}`,
                            flags: 64
                        });
                        return;
                    }

                    // Final Response: Success confirmation to user
                    await interaction.editReply({
                        content: 'Profil Folk Companion kamu telah berhasil dikirim! Temukan teman sejiwa dan mulai petualangan persahabatanmu sekarang.',
                        flags: 64
                    });
                } catch (error) {
                    // Error Handling Ketat: Show complete error details
                    console.error('Complete error details in friend-finding form processing:', {
                        message: error.message,
                        stack: error.stack,
                        name: error.name,
                        code: error.code
                    });

                    try {
                        await interaction.editReply({
                            content: `Terjadi kesalahan saat mengirim profil kamu: ${error.message}`,
                            flags: 64
                        });
                    } catch (editError) {
                        console.error('Failed to send error message to user:', editError);
                    }
                }
            }
            // Handle Chat Me modal submission
            else if (interaction.customId && interaction.customId.startsWith('modal_chat_me_')) {
                try {
                    await interaction.deferReply({ flags: 64 });

                    // Extract target user ID and determine type from the original button custom ID
                    // The custom ID format is: modal_chat_me_{type}_{userId}
                    const parts = interaction.customId.split('_');
                    if (parts.length < 4) {
                        await interaction.editReply({
                            content: 'Format custom ID tidak valid.',
                            flags: 64
                        });
                        return;
                    }

                    const type = parts[3]; // Either 'jodoh' or 'teman'
                    const targetUserId = parts[4]; // The actual user ID

                    // Validate that targetUserId is a valid Discord Snowflake
                    if (!targetUserId || targetUserId === 'undefined' || !/^\d{17,19}$/.test(targetUserId)) {
                        await interaction.editReply({
                            content: 'ID pengguna tujuan tidak valid.',
                            flags: 64
                        });
                        return;
                    }

                    const messageContent = interaction.fields.getTextInputValue('chat_me_message');

                    // Get the target user
                    const targetUser = await client.users.fetch(targetUserId);
                    if (!targetUser) {
                        await interaction.editReply({
                            content: 'Pengguna yang dituju tidak ditemukan.',
                            flags: 64
                        });
                        return;
                    }

                    // Create embed for the message with different titles based on context
                    let title, color, dmContent;
                    if (type === 'teman') {
                        title = '🤝 Pesan Kenalan Baru';
                        color = '#007bff';
                        dmContent = `👋 Kamu menerima pesan kenalan dari <@${interaction.user.id}>! Seseorang tertarik untuk menjadi teman barumu.`;
                    } else {
                        // Default to jodoh context
                        title = '💌 Pesan Perkenalan Baru';
                        color = '#811331';
                        dmContent = `💬 Kamu menerima pesan perkenalan dari <@${interaction.user.id}>! Seseorang tertarik untuk mengenalimu lebih dekat.`;
                    }

                    const messageEmbed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(messageContent)
                        .setColor(color)
                        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    try {
                        // Send DM to the target user with context-appropriate message
                        await targetUser.send({
                            embeds: [messageEmbed],
                            content: dmContent
                        });

                        // Confirm to the sender with context-appropriate message
                        const confirmationMessage = type === 'teman'
                            ? `Pesan kenalanmu telah dikirim ke <@${targetUser.id}>!`
                            : `Pesan perkenalanmu telah dikirim ke <@${targetUser.id}>!`;

                        await interaction.editReply({
                            content: confirmationMessage,
                            flags: 64
                        });
                    } catch (dmError) {
                        console.error('Error sending DM:', dmError);
                        try {
                            await interaction.editReply({
                                content: 'Gagal mengirim pesan. Mungkin pengguna menonaktifkan pesan pribadi.',
                                flags: 64
                            });
                        } catch (editError) {
                            console.error('Failed to edit reply after DM error:', editError);
                        }
                    }
                } catch (error) {
                    console.error('Error in chat me modal submission:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        try {
                            await interaction.reply({
                                content: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
                                flags: 64
                            });
                        } catch (replyError) {
                            console.error('Failed to send error message:', replyError);
                        }
                    } else if (!interaction.replied) {
                        try {
                            await interaction.editReply({
                                content: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
                                flags: 64
                            });
                        } catch (editError) {
                            console.error('Failed to edit reply after error:', editError);
                        }
                    }
                }
            }
            // Handle Feedback modal submission (for the feedback button)
            else if (interaction.customId && interaction.customId === 'modal_saran_user') {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                const kategori = interaction.fields.getTextInputValue('kategori_saran');
                const pesan = interaction.fields.getTextInputValue('pesan_saran');

                // Gunakan saluran saran utama, fallback ke log channel jika tidak ditemukan
                let saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_CHANNEL_ID);
                if (!saranChannel) {
                    saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_LOG_CHANNEL_ID);
                }

                // Buat embed untuk menampilkan saran user
                const userSuggestionEmbed = new EmbedBuilder()
                    .setTitle('✨ Saran Baru Mɣralune')
                    .setColor('#811331')
                    .addFields(
                        { name: '👤 Pengirim', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                        { name: '📂 Kategori', value: kategori, inline: true },
                        { name: '💬 Isi Saran', value: `\`\`\`${pesan}\`\`\`` }
                    )
                    .setTimestamp();

                // Check if saran channel exists and bot has permissions
                if (saranChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = saranChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in saran channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in saran channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in saran channel');
                            // Send without embed if no embed permission
                            const messageContent = `**Saran Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`;

                            await saranChannel.send(messageContent);
                        } else {
                            // Kirim pesan saran user tanpa men-tag staff
                            await saranChannel.send({ embeds: [userSuggestionEmbed] });
                        }

                        // STICKY BUTTON LOGIC: Find and delete the old button-only message, then send a new one to keep it at the bottom
                        try {
                            // Find the latest button-only message in the channel
                            const messages = await saranChannel.messages.fetch({ limit: 20 });
                            const buttonOnlyMessage = messages.find(msg =>
                                msg.author.id === interaction.client.user.id &&
                                msg.components.length > 0 && // Message has components (buttons)
                                msg.embeds.length === 0 // Message has no embed, only buttons
                            );

                            // Delete the old button-only message if found
                            if (buttonOnlyMessage) {
                                await buttonOnlyMessage.delete();
                            }

                            // Send a new button-only message at the bottom
                            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                            const newRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('btn_open_saran') // ID Tombol
                                    .setLabel('Ajukan Saran')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('📝')
                            );

                            await saranChannel.send({ components: [newRow] });
                        } catch (stickyError) {
                            console.error('Error in sticky button logic:', stickyError);

                            // If sticky button logic fails, send a new button-only message anyway
                            try {
                                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                                const fallbackRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('btn_open_saran') // ID Tombol
                                        .setLabel('Ajukan Saran')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('📝')
                                );

                                await saranChannel.send({ components: [fallbackRow] });
                            } catch (fallbackError) {
                                console.error('Error in fallback sticky button logic:', fallbackError);
                            }
                        }
                    } catch (channelError) {
                        console.error('Error sending saran to channel:', channelError);
                        // Still send success message to user even if channel fails
                    }
                } else {
                    console.log('Saran channel not found or not configured');
                    // Jika tidak ada channel yang ditemukan, beri tahu user
                    await interaction.editReply({
                        content: 'Terjadi kesalahan: Channel saran tidak ditemukan. Hubungi administrator server.',
                        flags: 64
                    });
                    return;
                }

                await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
            }
            // Handle Feedback modal submission (for the feedback button from message)
            else if (interaction.customId && interaction.customId === 'modal_saran_user_from_msg') {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                const kategori = interaction.fields.getTextInputValue('kategori_saran_from_msg');
                const pesan = interaction.fields.getTextInputValue('pesan_saran_from_msg');

                // Gunakan saluran saran utama, fallback ke log channel jika tidak ditemukan
                let saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_CHANNEL_ID);
                if (!saranChannel) {
                    saranChannel = interaction.guild.channels.cache.get(process.env.SARAN_LOG_CHANNEL_ID);
                }

                // Buat embed untuk menampilkan saran user
                const userSuggestionEmbed = new EmbedBuilder()
                    .setTitle('✨ Saran Baru Mɣralune')
                    .setColor('#811331')
                    .addFields(
                        { name: '👤 Pengirim', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                        { name: '📂 Kategori', value: kategori, inline: true },
                        { name: '💬 Isi Saran', value: `\`\`\`${pesan}\`\`\`` }
                    )
                    .setTimestamp();

                // Check if saran channel exists and bot has permissions
                if (saranChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = saranChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in saran channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in saran channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in saran channel');
                            // Send without embed if no embed permission
                            const messageContent = `**Saran Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`;

                            await saranChannel.send(messageContent);
                        } else {
                            // Kirim pesan saran user tanpa men-tag staff
                            await saranChannel.send({ embeds: [userSuggestionEmbed] });
                        }

                        // STICKY BUTTON LOGIC: Find and delete the old button-only message, then send a new one to keep it at the bottom
                        try {
                            // Find the latest button-only message in the channel
                            const messages = await saranChannel.messages.fetch({ limit: 20 });
                            const buttonOnlyMessage = messages.find(msg =>
                                msg.author.id === interaction.client.user.id &&
                                msg.components.length > 0 && // Message has components (buttons)
                                msg.embeds.length === 0 // Message has no embed, only buttons
                            );

                            // Delete the old button-only message if found
                            if (buttonOnlyMessage) {
                                await buttonOnlyMessage.delete();
                            }

                            // Send a new button-only message at the bottom
                            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                            const newRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('btn_open_saran') // ID Tombol
                                    .setLabel('Ajukan Saran')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('📝')
                            );

                            await saranChannel.send({ components: [newRow] });
                        } catch (stickyError) {
                            console.error('Error in sticky button logic:', stickyError);

                            // If sticky button logic fails, send a new button-only message anyway
                            try {
                                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                                const fallbackRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('btn_open_saran') // ID Tombol
                                        .setLabel('Ajukan Saran')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('📝')
                                );

                                await saranChannel.send({ components: [fallbackRow] });
                            } catch (fallbackError) {
                                console.error('Error in fallback sticky button logic:', fallbackError);
                            }
                        }
                    } catch (channelError) {
                        console.error('Error sending saran to channel:', channelError);
                        // Still send success message to user even if channel fails
                    }
                } else {
                    console.log('Saran channel not found or not configured');
                    // Jika tidak ada channel yang ditemukan, beri tahu user
                    await interaction.editReply({
                        content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨',
                        flags: 64
                    });
                    return;
                }

                await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
            }
            // Handle Curhat modal submission
            else if (interaction.customId && interaction.customId === 'modal_curhat_user') {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                const kategori = interaction.fields.getTextInputValue('kategori_curhat');
                const pesan = interaction.fields.getTextInputValue('pesan_curhat');

                // Gunakan saluran curhat utama
                const curhatChannel = interaction.guild.channels.cache.get(process.env.CURHAT_CHANNEL_ID);

                // Buat embed untuk menampilkan curhat user secara anonim
                const userCurhatEmbed = new EmbedBuilder()
                    .setTitle('💭 Curhat Awan Kelabu')
                    .setColor('#4A90E2')
                    .addFields(
                        { name: '🏷️ Kategori', value: kategori, inline: true },
                        { name: '💭 Curhat', value: `\`\`\`${pesan}\`\`\`` }
                    )
                    .setFooter({ text: 'Curhat anonim - tidak ada identitas pengirim' })
                    .setTimestamp();

                // Check if curhat channel exists and bot has permissions
                if (curhatChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = curhatChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in curhat channel');
                            await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in curhat channel');
                            await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in curhat channel');
                            // Send without embed if no embed permission
                            const messageContent = `**Curhat Anonim!**\nKategori: ${kategori}\nIsi: ${pesan}`;
                            await curhatChannel.send(messageContent);
                        } else {
                            // Kirim pesan curhat user secara anonim
                            await curhatChannel.send({ embeds: [userCurhatEmbed] });
                        }

                        // STICKY BUTTON LOGIC: Find and delete the old curhat button-only message, then send a new one to keep it at the bottom
                        try {
                            // Find the latest curhat button-only message in the channel
                            const messages = await curhatChannel.messages.fetch({ limit: 20 });
                            const buttonOnlyMessage = messages.find(msg =>
                                msg.author.id === interaction.client.user.id &&
                                msg.components.length > 0 && // Message has components (buttons)
                                msg.embeds.length === 0 // Message has no embed, only buttons
                            );

                            // Delete the old button-only message if found
                            if (buttonOnlyMessage) {
                                await buttonOnlyMessage.delete();
                            }

                            // Send a new button-only message at the bottom
                            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                            const newRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('btn_open_curhat') // ID Tombol
                                    .setLabel('Curhat Aja')
                                    .setEmoji('💭')
                                    .setStyle(ButtonStyle.Primary)
                            );

                            await curhatChannel.send({ components: [newRow] });
                        } catch (stickyError) {
                            console.error('Error in curhat sticky button logic:', stickyError);

                            // If sticky button logic fails, send a new button-only message anyway
                            try {
                                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                                const fallbackRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('btn_open_curhat') // ID Tombol
                                        .setLabel('Curhat Aja')
                                        .setEmoji('💭')
                                        .setStyle(ButtonStyle.Primary)
                                );

                                await curhatChannel.send({ components: [fallbackRow] });
                            } catch (fallbackError) {
                                console.error('Error in fallback curhat sticky button logic:', fallbackError);
                            }
                        }
                    } catch (channelError) {
                        console.error('Error sending curhat to channel:', channelError);
                        // Still send success message to user even if channel fails
                    }
                } else {
                    console.log('Curhat channel not found or not configured');
                    // Jika tidak ada channel yang ditemukan, beri tahu user
                    await interaction.editReply({
                        content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨',
                        flags: 64
                    });
                    return;
                }

                await interaction.editReply({ content: 'Terima kasih! Curhat-mu sudah terkirim secara anonim. ✨', flags: 64 });
            }
            // Handle Join Family modal submission
            else if (interaction.customId === 'modal_join_family') {
                console.log('Memasuki handler modal_join_family');
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                try {
                    // Get the database connection
                    const { db } = require('../database/db');

                    // Get values from modal
                    const familyName = interaction.fields.getTextInputValue('join_family_name');
                    const joinReason = interaction.fields.getTextInputValue('join_reason');

                    console.log(`Nama keluarga yang diminta: ${familyName}`);
                    console.log(`Alasan bergabung: ${joinReason}`);

                    // Check if user is already a family head using async method
                    const userFamilyHead = await new Promise((resolve, reject) => {
                        db.get('SELECT * FROM families WHERE owner_id = ?', [interaction.user.id], (err, row) => {
                            if (err) {
                                console.error('Database error checking family head:', err);
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                    
                    if (userFamilyHead) {
                        console.log(`User ${interaction.user.id} sudah menjadi kepala keluarga.`);
                        await interaction.editReply({
                            content: 'Kamu sudah menjadi kepala dari sebuah keluarga. Tidak bisa bergabung ke keluarga lain sebagai anggota.',
                            flags: 64
                        });
                        return;
                    }

                    // Check if user is already in a family using async method
                    const userFamily = await new Promise((resolve, reject) => {
                        db.get('SELECT * FROM family_members WHERE user_id = ?', [interaction.user.id], (err, row) => {
                            if (err) {
                                console.error('Database error checking family member:', err);
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                    
                    if (userFamily) {
                        console.log(`User ${interaction.user.id} sudah menjadi anggota keluarga.`);
                        await interaction.editReply({
                            content: 'Kamu sudah menjadi anggota dari sebuah keluarga.',
                            flags: 64
                        });
                        return;
                    }

                    // Check if the family exists in the database using async method
                    const family = await new Promise((resolve, reject) => {
                        db.get('SELECT * FROM families WHERE family_name = ?', [familyName], (err, row) => {
                            if (err) {
                                console.error('Database error checking family:', err);
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });

                    if (!family) {
                        console.log(`Keluarga dengan nama "${familyName}" tidak ditemukan.`);
                        await interaction.editReply({
                            content: `Keluarga dengan nama "${familyName}" tidak ditemukan.`,
                            flags: 64
                        });
                        return;
                    }

                    console.log(`Keluarga ditemukan: ${family.family_name}, Owner ID: ${family.owner_id}`);

                    // Check if user is already requesting to join this family using async method
                    const existingRequest = await new Promise((resolve, reject) => {
                        db.get('SELECT * FROM family_requests WHERE requester_id = ? AND family_id = ? AND status = ?', 
                            [interaction.user.id, family.owner_id, 'PENDING'], (err, row) => {
                            if (err) {
                                console.error('Database error checking existing request:', err);
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });

                    if (existingRequest) {
                        console.log(`User ${interaction.user.id} sudah memiliki permintaan yang menunggu untuk keluarga ${familyName}`);
                        await interaction.editReply({
                            content: `Kamu sudah mengajukan permintaan untuk bergabung dengan keluarga "${familyName}". Mohon tunggu tanggapan dari kepala keluarga.`,
                            flags: 64
                        });
                        return;
                    }

                    // Insert the join request into the family_requests table
                    try {
                        db.prepare('INSERT INTO family_requests (requester_id, family_id, reason) VALUES (?, ?, ?)').run(
                            interaction.user.id,
                            family.owner_id, // Using owner_id as family_id reference
                            joinReason
                        );

                        console.log(`Permintaan bergabung disimpan untuk user ${interaction.user.id} ke keluarga ${familyName} (Owner: ${family.owner_id})`);

                        await interaction.editReply({
                            content: `Permintaanmu untuk bergabung dengan keluarga "${familyName}" telah dikirim ke kepala keluarga. Mohon tunggu tanggapan.`,
                            flags: 64
                        });

                        // Notify the family head about the join request via DM
                        try {
                            console.log(`Mencoba mengambil data user kepala keluarga: ${family.owner_id}`);
                            const familyHead = await interaction.client.users.fetch(family.owner_id);
                            
                            console.log(`Mencoba mengirim DM ke kepala keluarga: ${family.owner_id} (${familyHead.tag})`);
                            
                            // Create embed for the join request
                            const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                            
                            const requestEmbed = new EmbedBuilder()
                                .setTitle('💌 Permintaan Bergabung Keluarga Baru')
                                .setDescription(`Pengguna **${interaction.user.tag}** ingin bergabung dengan keluargamu "${familyName}".\n\n**Alasan bergabung:** ${joinReason}`)
                                .setColor('#FFD700')
                                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                                .setTimestamp();

                            // Create buttons for approve and cancel
                            const approveButton = new ButtonBuilder()
                                .setLabel('Setujui')
                                .setStyle(ButtonStyle.Success)
                                .setCustomId(`btn_approve_join_request_${family.owner_id}_${interaction.user.id}`);

                            const cancelButton = new ButtonBuilder()
                                .setLabel('Tolak')
                                .setStyle(ButtonStyle.Danger)
                                .setCustomId(`btn_cancel_join_request_${family.owner_id}_${interaction.user.id}`);

                            const row = new ActionRowBuilder().addComponents(approveButton, cancelButton);

                            // Send DM to family head with the request and buttons
                            await familyHead.send({ 
                                embeds: [requestEmbed],
                                components: [row]
                            });
                            
                            console.log(`Berhasil mengirim DM ke kepala keluarga: ${family.owner_id} (${familyHead.tag})`);
                        } catch (dmError) {
                            console.error('Could not send DM to family head:', dmError);
                            
                            // Jika gagal mengirim ke kepala keluarga, kirim ke channel sebagai fallback
                            try {
                                const fallbackEmbed = new EmbedBuilder()
                                    .setTitle('💌 Permintaan Bergabung Keluarga Baru')
                                    .setDescription(`Pengguna **${interaction.user.tag}** ingin bergabung dengan keluargamu "${familyName}".\n\n**Alasan bergabung:** ${joinReason}\n\nCatatan: Tidak dapat mengirim DM ke kepala keluarga.`)
                                    .setColor('#FFD700')
                                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                                    .setTimestamp();

                                // Kirim ke channel tempat permintaan dibuat sebagai fallback
                                await interaction.channel.send({ 
                                    content: `<@${family.owner_id}>`, // Tag kepala keluarga
                                    embeds: [fallbackEmbed] 
                                });
                                
                                console.log(`DM ke kepala keluarga gagal, mengirim ke channel sebagai fallback`);
                            } catch (fallbackError) {
                                console.error('Fallback juga gagal:', fallbackError);
                            }
                        }
                    } catch (requestError) {
                        console.error('Error creating join request:', requestError);
                        await interaction.editReply({
                            content: 'Terjadi kesalahan saat membuat permintaan bergabung keluarga. Silakan coba lagi.',
                            flags: 64
                        });
                    }
                } catch (error) {
                    console.error('Error processing join family modal:', error);

                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: '❌ Terjadi kesalahan saat mengajukan permintaan bergabung keluarga. Silakan coba lagi nanti.',
                            flags: 64
                        });
                    } else {
                        await interaction.editReply({
                            content: '❌ Terjadi kesalahan saat mengajukan permintaan bergabung keluarga. Silakan coba lagi nanti.',
                            flags: 64
                        });
                    }
                }
            }
            // Handle modal submission for new letter - UPDATED IMPLEMENTATION
            else if (interaction.customId && interaction.customId === 'modal_letter_submit') {
                await interaction.deferReply({ flags: 64 });

                try {
                    // Debug logging for letter submission
                    console.log('--- LETTER SUBMISSION DEBUG ---');
                    console.log('Processing modal submission:', interaction.customId);

                    // Get values from modal
                    const inputFromValue = interaction.fields.getTextInputValue('input_from');
                    const inputToValue = interaction.fields.getTextInputValue('input_to');
                    const inputContentValue = interaction.fields.getTextInputValue('input_content');
                    const inputImageValue = interaction.fields.getTextInputValue('input_image');

                    console.log('Input values retrieved:');
                    console.log('- From:', inputFromValue);
                    console.log('- To:', inputToValue);
                    console.log('- Content length:', inputContentValue?.length || 0);
                    console.log('- Image:', inputImageValue);

                    // Clean the input to remove @ symbol if present
                    let cleanInput = inputToValue;
                    if (cleanInput.startsWith('@')) {
                        cleanInput = cleanInput.substring(1); // Remove the @ symbol
                    }

                    // Also try to extract username from a mention format like <@user_id> or <@!user_id>
                    const mentionRegex = /^<@!?(\d+)>$/;
                    const mentionMatch = inputToValue.match(mentionRegex);
                    let mentionedUserId = null;

                    if (mentionMatch) {
                        mentionedUserId = mentionMatch[1];
                        // Try to find the user by ID first
                        var targetUser = await client.users.fetch(mentionedUserId).catch(() => null);
                        if (targetUser) {
                            var foundBy = 'user mention';
                        }
                    }

                    // Try to find the user by username with flexible validation
                    let targetUserLocal = targetUser || null;
                    let foundByLocal = foundBy || ''; // Track how the user was found

                    try {
                        // If it's a mention, we already tried fetching by ID above
                        if (!targetUserLocal && mentionedUserId) {
                            // If fetching by ID failed, try to find in guild members
                            const guildMember = await interaction.guild.members.fetch(mentionedUserId).catch(() => null);
                            if (guildMember) {
                                targetUserLocal = guildMember.user;
                                foundByLocal = 'user mention (from guild)';
                            }
                        }

                        // If not a mention or user not found by ID, proceed with username search
                        if (!targetUserLocal) {
                            // First, try to find by exact username#discriminator (most precise)
                            if (cleanInput.includes('#')) {
                                targetUserLocal = client.users.cache.find(user =>
                                    `${user.username}#${user.discriminator}` === cleanInput
                                );
                                if (targetUserLocal) foundByLocal = 'username#discriminator';
                            }

                            // If not found by discriminator, try exact username match (case-insensitive)
                            if (!targetUserLocal) {
                                targetUserLocal = client.users.cache.find(user =>
                                    user.username.toLowerCase() === cleanInput.toLowerCase()
                                );
                                if (targetUserLocal) foundByLocal = 'username';
                            }

                            // If still not found, try partial match (for usernames with punctuation, numbers, etc.)
                            if (!targetUserLocal) {
                                targetUserLocal = client.users.cache.find(user =>
                                    user.username.toLowerCase().includes(cleanInput.toLowerCase())
                                );
                                if (targetUserLocal) foundByLocal = 'partial username match';
                            }

                            // If still not found, try to find by nickname in the current guild (exact match first)
                            if (!targetUserLocal) {
                                const guild = interaction.guild;
                                const member = guild.members.cache.find(m =>
                                    m.user.username.toLowerCase() === cleanInput.toLowerCase() ||
                                    (m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase())
                                );
                                if (member) {
                                    targetUserLocal = member.user;
                                    foundByLocal = m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase() ? 'nickname' : 'username in guild';
                                }
                            }

                            // If still not found, try partial nickname match in the current guild
                            if (!targetUserLocal) {
                                const guild = interaction.guild;
                                const member = guild.members.cache.find(m =>
                                    m.user.username.toLowerCase().includes(cleanInput.toLowerCase()) ||
                                    (m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase()))
                                );
                                if (member) {
                                    targetUserLocal = member.user;
                                    foundByLocal = m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase()) ? 'partial nickname match' : 'partial username match in guild';
                                }
                            }

                            // If still not found in cache, try fetching all members from the current guild
                            if (!targetUserLocal) {
                                try {
                                    // Search in the current guild for the user
                                    const guild = interaction.guild;

                                    // Fetch all members in the guild
                                    const guildMembers = await guild.members.fetch();

                                    // Try exact username match in the fetched members
                                    let member = guildMembers.find(m =>
                                        m.user.username.toLowerCase() === cleanInput.toLowerCase()
                                    );

                                    if (!member) {
                                        // Try partial username match in the fetched members
                                        member = guildMembers.find(m =>
                                            m.user.username.toLowerCase().includes(cleanInput.toLowerCase())
                                        );
                                    }

                                    if (!member) {
                                        // Try exact nickname match in the fetched members
                                        member = guildMembers.find(m =>
                                            m.nickname && m.nickname.toLowerCase() === cleanInput.toLowerCase()
                                        );
                                    }

                                    if (!member) {
                                        // Try partial nickname match in the fetched members
                                        member = guildMembers.find(m =>
                                            m.nickname && m.nickname.toLowerCase().includes(cleanInput.toLowerCase())
                                        );
                                    }

                                    if (member) {
                                        targetUserLocal = member.user;
                                        foundByLocal = member.nickname && member.nickname.toLowerCase().includes(cleanInput.toLowerCase()) ?
                                            'partial nickname match (fetched)' : 'partial username match (fetched)';
                                    }
                                } catch (fetchError) {
                                    console.error('Error fetching guild members:', fetchError);
                                }
                            }
                        }

                        if (!targetUserLocal) {
                            await interaction.editReply({
                                content: `Tidak dapat menemukan pengguna dengan username "${inputToValue}".\n\nCara pencarian yang didukung:\n• @mention langsung (lebih disarankan)\n• Username lengkap (cth: johndoe, john.doe, user_name)\n• Sebagian dari username atau nickname\n• Gunakan @mention untuk hasil terbaik`
                            });
                            return;
                        }

                        // Update the variables to be used later
                        targetUser = targetUserLocal;
                    } catch (error) {
                        console.error('Error finding user:', error);
                        await interaction.editReply({
                            content: `Terjadi kesalahan saat mencari pengguna "${inputToValue}". Silakan coba lagi.`
                        });
                        return;
                    }

                    // Determine if anonymous
                    const isAnonymous = !inputFromValue || inputFromValue.trim() === '';
                    const displayName = isAnonymous ? '👤 Sang Pengagum Rahasia' : inputFromValue;

                    // Insert into database using Promise wrapper with timeout
                    const insertQuery = `
                        INSERT INTO letters (sender_id, recipient_name, content, is_anonymous)
                        VALUES (?, ?, ?, ?)
                    `;

                    const insertPromise = new Promise((resolve, reject) => {
                        // Set a timeout for the database operation
                        const timeout = setTimeout(() => {
                            reject(new Error('Database operation timed out'));
                        }, 10000); // 10 second timeout

                        db.run(insertQuery, [
                            interaction.user.id,
                            targetUser.username, // recipient_name
                            inputContentValue,
                            isAnonymous ? 1 : 0
                        ], function(err) {
                            clearTimeout(timeout); // Clear the timeout if operation completes
                            if (err) {
                                reject(err);
                            } else {
                                resolve(this.lastID); // Get the last inserted ID
                            }
                        });
                    });

                    let letterId;
                    try {
                        letterId = await insertPromise;
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        await interaction.editReply({ content: 'Database error occurred while saving your letter. Please try again.' });
                        return;
                    }

                        // Create embed for the letter
                        const letterEmbed = new EmbedBuilder()
                            .setTitle('💌｜velvet-confession')
                            .setDescription(`${inputContentValue}\n\nDari: ${displayName}`)
                            .setColor('#FF69B4')
                            .setFooter({ text: '📜 Arsip Hati' })
                            .setTimestamp();

                        // Add image if provided
                        if (inputImageValue && inputImageValue.trim() !== '') {
                            letterEmbed.setImage(inputImageValue);
                        }

                        // Create buttons - "Love Letter" on the left, "✉️ Reply" on the right
                        const writeLetterButton = new ButtonBuilder()
                            .setLabel('💌 Love Letter')
                            .setStyle('Primary')
                            .setCustomId('btn_open_letter_modal');

                        const replyButton = new ButtonBuilder()
                            .setLabel('✉️ Reply')
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`btn_reply_${letterId}`);

                        const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, replyButton);

                        // Send to confession setup channel
                        console.log('Confession channel ID from env:', process.env.CONFESSION_SETUP_CHANNEL_ID);
                        const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
                        console.log('Target channel object:', targetChannel ? 'FOUND' : 'NOT FOUND');

                        if (!targetChannel) {
                            console.log('ERROR: Confession setup channel not found');
                            await interaction.editReply({ content: 'Confession setup channel not found. Please contact the administrator.' });
                            return;
                        }

                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = targetChannel.permissionsFor(interaction.client.user);
                        console.log('Bot permissions in target channel:', botPermissions?.toArray());

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission');
                            await interaction.editReply({ content: 'Bot does not have permission to send messages in the confession channel.' });
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission');
                            await interaction.editReply({ content: 'Bot does not have permission to view the confession channel.' });
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission');
                            await interaction.editReply({ content: 'Bot does not have permission to embed links in the confession channel.' });
                            return;
                        }

                        try {
                            // Send to target channel and handle the response
                            const sentMessage = await targetChannel.send({
                                content: `🖋️ "Teruntuk Sang Pemilik Nama" <@${targetUser.id}>`, // Mention the recipient at the top for notification
                                embeds: [letterEmbed],
                                components: [buttonRow]
                            });

                            // Update the database with the original message ID
                            const updateQuery = 'UPDATE letters SET original_message_id = ? WHERE id = ?';

                            const updatePromise = new Promise((resolve, reject) => {
                                // Set a timeout for the database operation
                                const timeout = setTimeout(() => {
                                    reject(new Error('Database update operation timed out'));
                                }, 10000); // 10 second timeout

                                db.run(updateQuery, [sentMessage.id, letterId], (updateErr) => {
                                    clearTimeout(timeout); // Clear the timeout if operation completes
                                    if (updateErr) {
                                        reject(updateErr);
                                    } else {
                                        resolve();
                                    }
                                });
                            });

                            try {
                                await updatePromise;
                            } catch (updateError) {
                                console.error('Error updating original message ID:', updateError);
                            }

                            // Send DM to the recipient
                            try {
                                const dmEmbed = new EmbedBuilder()
                                    .setTitle('🥀｜velvet-confession')
                                    .setDescription(`🥀 Seseorang sedang merangkai rindu untukmu di "${interaction.guild.name}"...\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                    .setColor('#FF69B4')
                                    .setTimestamp();

                                if (targetUser) {
                                    await targetUser.send({ embeds: [dmEmbed] });
                                }
                            } catch (dmError) {
                                // If DM fails, it's likely because the user has DMs disabled
                                if (targetUser) {
                                    console.warn(`Could not send DM to user ${targetUser.id}:`, dmError.message);
                                } else {
                                    console.warn('Could not send DM to user: targetUser is undefined', dmError.message);
                                }
                                // Optionally notify the sender that DM failed
                                // await interaction.followUp({
                                //     content: `Catatan: Tidak dapat mengirim DM ke penerima karena mereka mungkin menonaktifkan pesan pribadi.`,
                                //     ephemeral: true
                                // });
                            }

                            await interaction.editReply({ content: 'Surat berhasil dikirim ke channel confess!', ephemeral: false });
                        } catch (sendError) {
                            console.error('Error sending message to channel:', sendError);

                            // Handle specific Discord API errors
                            if (sendError.code === 50013) { // Missing Permissions
                                console.error('Bot lacks permissions to send messages in the confession channel.');
                                await interaction.editReply({
                                    content: 'Bot lacks permissions to send messages in the confession channel.',
                                    ephemeral: true
                                });
                            } else if (sendError.code === 10003) { // Unknown Channel
                                console.error('Confession channel does not exist or is inaccessible.');
                                await interaction.editReply({
                                    content: 'Confession channel does not exist or is inaccessible.',
                                    ephemeral: true
                                });
                            } else if (sendError.code === 50001) { // Missing Access
                                console.error('Bot lacks access to view the confession channel.');
                                await interaction.editReply({
                                    content: 'Bot lacks access to view the confession channel.',
                                    ephemeral: true
                                });
                            } else {
                                await interaction.editReply({ content: 'There was an error sending your letter. Please try again later.' });
                            }
                        }
                } catch (error) {
                    console.error('Error processing letter submission:', error);
                    await interaction.editReply({ content: 'There was an error submitting your letter. Please try again later.' });
                }
            }
        }
        // Handle modal submission for reply - FIXED TO USE STARTSWITH FOR DYNAMIC IDs AND CHECK IF CUSTOMID EXISTS
        if (interaction.isModalSubmit() && interaction.customId && interaction.customId.startsWith('modal_reply_submit_')) {
            await interaction.deferReply({ flags: 64 }); // Use deferReply for modal submissions

            try {
                const letterId = interaction.customId.split('_')[3];
                const replyContent = interaction.fields.getTextInputValue('input_reply_content');
                const replySenderName = interaction.fields.getTextInputValue('input_reply_sender_name');

                // LOGIKA: Pakai nama custom, kalau kosong pakai Tag Discord asli
                const replyDisplayName = replySenderName && replySenderName.trim() !== ""
                    ? replySenderName
                    : interaction.user.tag;

                // Create a promise wrapper for the database query
                const getLetterInfo = (letterId) => {
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT sender_id, recipient_name, original_message_id FROM letters WHERE id = ?';
                        db.get(query, [parseInt(letterId)], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                try {
                    // Get the original letter info
                    const row = await getLetterInfo(letterId);

                    if (!row) {
                        await interaction.editReply({ content: 'Original letter not found!', flags: 64 });
                        return;
                    }

                    // Find the original message in the confession setup channel
                    const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
                    if (!targetChannel) {
                        await interaction.editReply({ content: 'Confession setup channel not found. Please contact the administrator.', flags: 64 });
                        return;
                    }

                    try {
                        // Get the original message by ID
                        let originalMessage;
                        if (row.original_message_id) {
                            originalMessage = await targetChannel.messages.fetch(row.original_message_id);
                        } else {
                            // Fallback: search for the message by embed footer
                            const messages = await targetChannel.messages.fetch({ limit: 100 });
                            originalMessage = messages.find(msg => {
                                if (msg.embeds.length > 0) {
                                    const embed = msg.embeds[0];
                                    return embed.footer && embed.footer.text.includes('📜 Arsip Hati');
                                }
                                return false;
                            });
                        }

                        if (originalMessage) {
                            // Check if there's already a thread for this message
                            let thread = originalMessage.thread;

                            if (!thread) {
                                // Create a new thread
                                thread = await originalMessage.startThread({
                                    name: `📜 Arsip Hati`,
                                    autoArchiveDuration: 60, // Auto archive after 1 hour
                                    type: 12, // Private thread (GUILD_PRIVATE_THREAD)
                                });
                            }

                            // Create reply embed
                            const replyEmbed = new EmbedBuilder()
                                .setTitle(`📖 "Lembar Terlarang"`)
                                .setDescription(`${replyContent}\n\nDari: ${replyDisplayName}`)
                                .setColor('#9370DB')
                                .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                .setTimestamp();

                            // Create additional reply button
                            const additionalReplyButton = new ButtonBuilder()
                                .setLabel('✉️ Reply Again')
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId(`btn_additional_reply_${letterId}`);

                            const buttonRow = new ActionRowBuilder().addComponents(additionalReplyButton);

                            // Send the reply in the thread
                            await thread.send({
                                embeds: [replyEmbed],
                                components: [buttonRow]
                            });

                            // Send DM to the original sender
                            try {
                                const originalSender = await interaction.client.users.fetch(row.sender_id);
                                const dmEmbed = new EmbedBuilder()
                                    .setTitle('🥀｜Balasan Tiba')
                                    .setDescription(`^\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                    .setColor('#9370DB')
                                    .setTimestamp();

                                await originalSender.send({ embeds: [dmEmbed] });
                            } catch (dmError) {
                                // If DM fails, it's likely because the user has DMs disabled
                                console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                            }

                            await interaction.editReply({ content: `Balasan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                        } else {
                            // If we can't find the original message, send to the main channel
                            const replyEmbed = new EmbedBuilder()
                                .setTitle(`📖 "Lembar Terlarang"`)
                                .setDescription(`^\n\nDari: ${replyDisplayName}`)
                                .setColor('#9370DB')
                                .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                .setTimestamp();

                            // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                            const writeLetterButton = new ButtonBuilder()
                                .setLabel('💌 Love Letter')
                                .setStyle('Primary')
                                .setCustomId('btn_open_letter_modal');

                            const additionalReplyButton = new ButtonBuilder()
                                .setLabel('✉️ Reply Again')
                                .setStyle(ButtonStyle.Secondary)
                                .setCustomId(`btn_additional_reply_${letterId}`);

                            const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                            try {
                                await targetChannel.send({
                                    content: `^\n\nDari: ${row.sender_id}>`, // Mention the original sender for notification
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });
                            } catch (sendError) {
                                console.error('Error sending reply to target channel:', {
                                    message: sendError.message,
                                    code: sendError.code,
                                    name: sendError.name
                                });

                                // Handle specific Discord API errors
                                if (sendError.code === 50013) { // Missing Permissions
                                    console.error('Bot lacks permissions to send messages in the target channel.');
                                    await interaction.editReply({
                                        content: 'Bot lacks permissions to send messages in the target channel.',
                                        flags: 64
                                    });
                                    return;
                                } else if (sendError.code === 10003) { // Unknown Channel
                                    console.error('Target channel does not exist or is inaccessible.');
                                    await interaction.editReply({
                                        content: 'Target channel does not exist or is inaccessible.',
                                        ephemeral: true
                                    });
                                    return;
                                } else if (sendError.code === 50001) { // Missing Access
                                    console.error('Bot lacks access to view the target channel.');
                                    await interaction.editReply({
                                        content: 'Bot lacks access to view the target channel.',
                                        ephemeral: true
                                    });
                                    return;
                                } else {
                                    // For other errors, try to inform the user without crashing
                                    await interaction.editReply({
                                        content: 'An error occurred while sending the message.',
                                        ephemeral: true
                                    });
                                    return;
                                }
                            }

                            // Send DM to the original sender
                            try {
                                const originalSender = await interaction.client.users.fetch(row.sender_id);
                                const dmEmbed = new EmbedBuilder()
                                    .setTitle('🥀｜Balasan Tiba')
                                    .setDescription(`^\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                    .setColor('#9370DB')
                                    .setTimestamp();

                                await originalSender.send({ embeds: [dmEmbed] });
                            } catch (dmError) {
                                // If DM fails, it's likely because the user has DMs disabled
                                console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                            }

                            await interaction.editReply({ content: `Balasan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                        }
                    } catch (error) {
                        console.error('Error sending reply:', error);
                        await interaction.editReply({ content: 'There was an error sending your reply. Please try again later.', flags: 64 });
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    await interaction.editReply({ content: 'Database error occurred!', flags: 64 });
                    return;
                }
            } catch (error) {
                console.error('Error processing reply submission:', error);
                await interaction.editReply({ content: 'There was an error submitting your reply. Please try again later.', flags: 64 });
            }
            return; // Stop processing other handlers for this interaction
        }
        // Handle additional replies in threads
        else if (interaction.customId && interaction.customId.startsWith('modal_additional_reply_')) {
            await interaction.deferReply({ flags: 64 }); // Use deferReply for modal submissions

            try {
                const letterId = interaction.customId.split('_')[3];
                const replyContent = interaction.fields.getTextInputValue('input_reply_content');
                const replySenderName = interaction.fields.getTextInputValue('input_reply_sender_name');

                // LOGIKA: Pakai nama custom, kalau kosong pakai Tag Discord asli
                const replyDisplayName = replySenderName && replySenderName.trim() !== ""
                    ? replySenderName
                    : interaction.user.tag;

                // Create a promise wrapper for the database query
                const getLetterInfo = (letterId) => {
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT sender_id, recipient_name, original_message_id FROM letters WHERE id = ?';
                        db.get(query, [parseInt(letterId)], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                try {
                    // Get the original letter info
                    const row = await getLetterInfo(letterId);

                    if (!row) {
                        await interaction.editReply({ content: 'Original letter not found!', flags: 64 });
                        return;
                    }

                    // Find the original message in the confession setup channel
                    const targetChannel = client.channels.cache.get(process.env.CONFESSION_SETUP_CHANNEL_ID);
                    if (!targetChannel) {
                        await interaction.editReply({ content: 'Confession setup channel not found. Please contact the administrator.', flags: 64 });
                        return;
                    }

                    try {
                        // Get the original message by ID
                        let originalMessage;
                        if (row.original_message_id) {
                            originalMessage = await targetChannel.messages.fetch(row.original_message_id);
                        } else {
                            // Fallback: search for the message by embed footer
                            const messages = await targetChannel.messages.fetch({ limit: 100 });
                            originalMessage = messages.find(msg => {
                                if (msg.embeds.length > 0) {
                                    const embed = msg.embeds[0];
                                    return embed.footer && embed.footer.text.includes('📜 Arsip Hati');
                                }
                                return false;
                            });
                        }

                            if (originalMessage && originalMessage.thread) {
                                // Send additional reply in the existing thread
                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`^\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                    .setTimestamp();

                                // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                                const writeLetterButton = new ButtonBuilder()
                                    .setLabel('💌 Love Letter')
                                    .setStyle('Primary')
                                    .setCustomId('btn_open_letter_modal');

                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                                await originalMessage.thread.send({
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`^\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            } else {
                                // If no thread exists, create one
                                let thread;
                                if (originalMessage) {
                                    thread = await originalMessage.startThread({
                                        name: `📜 Arsip Hati`,
                                        autoArchiveDuration: 60,
                                        type: 12, // Private thread (GUILD_PRIVATE_THREAD)
                                    });
                                } else {
                                    // If we can't find the original message, send to the main channel
                                    const replyEmbed = new EmbedBuilder()
                                        .setTitle(`📖 "Lembar Terlarang"`)
                                        .setDescription(`^\n\nDari: ${replyDisplayName}`)
                                        .setColor('#9370DB')
                                        .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                        .setTimestamp();

                                    // Create buttons - "Love Letter" on the left, "✉️ Reply Again" on the right
                                    const writeLetterButton = new ButtonBuilder()
                                        .setLabel('💌 Love Letter')
                                        .setStyle('Primary')
                                        .setCustomId('btn_open_letter_modal');

                                    const additionalReplyButton = new ButtonBuilder()
                                        .setLabel('✉️ Reply Again')
                                        .setStyle(ButtonStyle.Secondary)
                                        .setCustomId(`btn_additional_reply_${letterId}`);

                                    const buttonRow = new ActionRowBuilder().addComponents(writeLetterButton, additionalReplyButton);

                                    try {
                                        await targetChannel.send({
                                            content: `^\n\nDari: ${row.sender_id}>`, // Mention the original sender for notification
                                            embeds: [replyEmbed],
                                            components: [buttonRow]
                                        });
                                    } catch (sendError) {
                                        console.error('Error sending reply to target channel:', {
                                            message: sendError.message,
                                            code: sendError.code,
                                            name: sendError.name
                                        });

                                        // Handle specific Discord API errors
                                        if (sendError.code === 50013) { // Missing Permissions
                                            console.error('Bot lacks permissions to send messages in the target channel.');
                                            await interaction.editReply({
                                                content: 'Bot lacks permissions to send messages in the target channel.',
                                                ephemeral: true
                                            });
                                            return;
                                        } else if (sendError.code === 10003) { // Unknown Channel
                                            console.error('Target channel does not exist or is inaccessible.');
                                            await interaction.editReply({
                                                content: 'Target channel does not exist or is inaccessible.',
                                                flags: 64
                                            });
                                            return;
                                        } else if (sendError.code === 50001) { // Missing Access
                                            console.error('Bot lacks access to view the target channel.');
                                            await interaction.editReply({
                                                content: 'Bot lacks access to view the target channel.',
                                                flags: 64
                                            });
                                            return;
                                        } else {
                                            // For other errors, try to inform the user without crashing
                                            await interaction.editReply({
                                                content: 'An error occurred while sending the message.',
                                                ephemeral: true
                                            });
                                            return;
                                        }
                                    }

                                    await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                                    return;
                                }

                                const replyEmbed = new EmbedBuilder()
                                    .setTitle(`📖 "Lembar Terlarang"`)
                                    .setDescription(`^\n\nDari: ${replyDisplayName}`)
                                    .setColor('#9370DB')
                                    .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                    .setTimestamp();

                                // Create additional reply button
                                const additionalReplyButton = new ButtonBuilder()
                                    .setLabel('✉️ Reply Again')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setCustomId(`btn_additional_reply_${letterId}`);

                                const buttonRow = new ActionRowBuilder().addComponents(additionalReplyButton);

                                await thread.send({
                                    embeds: [replyEmbed],
                                    components: [buttonRow]
                                });

                                // Send DM to the original sender
                                try {
                                    const originalSender = await interaction.client.users.fetch(row.sender_id);
                                    const dmEmbed = new EmbedBuilder()
                                        .setTitle('🥀｜Balasan Tiba')
                                        .setDescription(`^\n\nHalo, ada sebuah naskah manis yang baru saja dititipkan khusus untukmu. Isinya penuh dengan perasaan yang jujur dan hangat.\n\nSilakan luangkan waktumu sejenak untuk membacanya di channel confess. Jika jemarimu ingin membalas, ia akan sangat senang menantinya.\n\nTemukan suratmu di sini: <#${process.env.CONFESSION_SETUP_CHANNEL_ID}>`)
                                        .setColor('#9370DB')
                                        .setTimestamp();

                                    await originalSender.send({ embeds: [dmEmbed] });
                                } catch (dmError) {
                                    // If DM fails, it's likely because the user has DMs disabled
                                    console.warn(`Could not send DM to user ${row.sender_id}:`, dmError.message);
                                }

                                await interaction.editReply({ content: `Balasan lanjutan telah dikirim sebagai **${replyDisplayName}**! ✨`, flags: 64 });
                            }
                        } catch (error) {
                            console.error('Error sending additional reply:', error);
                            await interaction.editReply({ content: 'There was an error sending your reply. Please try again later.', flags: 64 });
                        }
                    } catch (dbError) {
                        console.error('Database error:', dbError);
                        await interaction.editReply({ content: 'Database error occurred!', flags: 64 });
                        return;
                    }
                } catch (error) {
                    console.error('Error processing additional reply submission:', error);
                    await interaction.editReply({ content: 'There was an error submitting your reply. Please try again later.', flags: 64 });
                }
            return; // Stop processing other handlers for this interaction
        }
        // Handle feedback modal submission
        else if (interaction.customId === 'feedbackModal') {
            try {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                // Get the values from the modal
                const starRating = interaction.fields.getTextInputValue('starRating');
                const feedbackTitle = interaction.fields.getTextInputValue('feedbackTitle');
                const feedbackDetail = interaction.fields.getTextInputValue('feedbackDetail');
                const feedbackType = interaction.fields.getTextInputValue('feedbackType');

                // Validate star rating
                const rating = parseInt(starRating);
                if (isNaN(rating) || rating < 1 || rating > 5) {
                    await interaction.editReply({
                        content: '❌ Invalid star rating. Please enter a number between 1 and 5.',
                        flags: 64
                    });
                    return;
                }

                // Create star rating display
                const starDisplay = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

                // Use default values if optional fields are empty
                const title = feedbackTitle.trim() || 'No title provided';
                const detail = feedbackDetail.trim() || 'No details provided';
                const type = feedbackType.trim() || 'General Feedback';

                // Use feedback channel from environment variable, fallback to log channel if not found
                let feedbackChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_CHANNEL_ID);
                if (!feedbackChannel) {
                    feedbackChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                }

                // Get staff role for tagging
                const staffRole = interaction.guild.roles.cache.get(process.env.STAFF_ROLE_ID);

                // Create embed for feedback
                const { EmbedBuilder } = require('discord.js');

                const feedbackEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`💬 Feedback Baru Mɣralune - ${type}`)
                    .addFields(
                        { name: 'Rating', value: `${starDisplay} (${rating}/5)`, inline: true },
                        { name: 'Title', value: title, inline: true },
                        { name: 'Details', value: detail },
                        { name: 'Submitted by', value: `${interaction.user} (${interaction.user.tag})`, inline: true },
                        { name: 'Date', value: new Date().toLocaleDateString(), inline: true }
                    )
                    .setTimestamp();

                // Check if feedback channel exists and bot has permissions
                if (feedbackChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = feedbackChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in feedback channel');
                            await interaction.editReply({ content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in feedback channel');
                            await interaction.editReply({ content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in feedback channel');
                            // Send without embed if no embed permission
                            const messageContent = staffRole ?
                                `<@&${staffRole.id}>\n**Feedback Baru!**\nPengirim: ${interaction.user.tag}\nRating: ${rating}/5\nTipe: ${type}\nJudul: ${title}\nDetail: ${detail}` :
                                `**Feedback Baru!**\nPengirim: ${interaction.user.tag}\nRating: ${rating}/5\nTipe: ${type}\nJudul: ${title}\nDetail: ${detail}`;

                            await feedbackChannel.send(messageContent);
                        } else {
                            // Send feedback with staff tag if role exists
                            const messageContent = staffRole ?
                                { content: `<@&${staffRole.id}>`, embeds: [feedbackEmbed] } :
                                { embeds: [feedbackEmbed] };
                            await feedbackChannel.send(messageContent);
                        }

                        // STICKY BUTTON LOGIC: Find and delete the old feedback button-only message, then send a new one to keep it at the bottom
                        try {
                            // Find the latest feedback button-only message in the channel
                            const messages = await feedbackChannel.messages.fetch({ limit: 20 });
                            const feedbackButtonMessage = messages.find(msg =>
                                msg.author.id === interaction.client.user.id &&
                                msg.components.length > 0 && // Message has components (buttons)
                                msg.embeds.length === 0 // Message has no embed, only buttons
                            );

                            // Delete the old feedback button-only message if found
                            if (feedbackButtonMessage) {
                                await feedbackButtonMessage.delete();
                            }

                            // Send a new feedback button-only message at the bottom
                            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                            const newRow = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('btn_open_feedback') // ID Tombol
                                    .setLabel('Kirim Feedback')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('💬')
                            );

                            await feedbackChannel.send({ components: [newRow] });
                        } catch (stickyError) {
                            console.error('Error in feedback sticky button logic:', stickyError);

                            // If sticky button logic fails, send a new button-only message anyway
                            try {
                                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                                const fallbackRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('btn_open_feedback') // ID Tombol
                                        .setLabel('Kirim Feedback')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('💬')
                                );

                                await feedbackChannel.send({ components: [fallbackRow] });
                            } catch (fallbackError) {
                                console.error('Error in fallback feedback sticky button logic:', fallbackError);
                            }
                        }
                    } catch (channelError) {
                        console.error('Error sending feedback to channel:', channelError);
                        // Still send success message to user even if channel fails
                    }
                } else {
                    console.log('Feedback channel not found or not configured');
                    // If no specific channel is set, send to the same channel where command was used
                    await interaction.channel.send({ embeds: [feedbackEmbed] });
                }

                // Reply to the user
                await interaction.editReply({
                    content: 'Terima kasih! Feedback-mu sudah terkirim ke tim Mɣralune. ✨',
                    flags: 64
                });

                // Log feedback to a file for record keeping
                const fs = require('fs');
                const path = require('path');

                const feedbackLog = {
                    userId: interaction.user.id,
                    userTag: interaction.user.tag,
                    rating: rating,
                    title: title,
                    details: detail,
                    type: type,
                    timestamp: new Date().toISOString()
                };

                // Create logs directory if it doesn't exist
                const logsDir = path.join(__dirname, '../logs');
                if (!fs.existsSync(logsDir)) {
                    fs.mkdirSync(logsDir, { recursive: true });
                }

                // Append feedback to log file
                const logFilePath = path.join(logsDir, 'feedback.log');
                fs.appendFileSync(logFilePath, JSON.stringify(feedbackLog) + '\n');

            } catch (error) {
                console.error('Error processing feedback modal:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ There was an error submitting your feedback. Please try again later.',
                        flags: 64
                    });
                }
            }
        }
        // Handle Build Family modal submission
        else if (interaction.customId === 'modal_build_family') {
            await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

            try {
                // Get the database connection
                const { db } = require('../database/db');

                // Get values from modal
                const familyName = interaction.fields.getTextInputValue('family_name');
                const familySlogan = interaction.fields.getTextInputValue('family_slogan') || 'Tidak ada slogan';
                const familyLogo = interaction.fields.getTextInputValue('family_logo') || '';

                const member = interaction.member;

                // Check if user already has a family as head (one family per user as head)
                // Using a Promise to handle the asynchronous database operation
                const checkExistingFamily = () => {
                    return new Promise((resolve, reject) => {
                        db.get('SELECT * FROM families WHERE owner_id = ?', [interaction.user.id], (err, row) => {
                            if (err) {
                                console.error('Database error:', err);
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                let existingFamilyAsHead = null;
                try {
                    existingFamilyAsHead = await checkExistingFamily();
                } catch (error) {
                    console.error('Error checking existing family:', error);
                }

                // Debug logging
                console.log('DEBUG - Checking existing family for user:', interaction.user.id);
                console.log('DEBUG - Query result:', existingFamilyAsHead);
                console.log('DEBUG - Type of result:', typeof existingFamilyAsHead);

                // Check if user already has a family as head
                if (existingFamilyAsHead) {
                    console.log('DEBUG - Family data:', existingFamilyAsHead);
                    await interaction.editReply({
                        content: 'Kamu sudah memiliki keluarga sebagai kepala keluarga. Setiap pengguna hanya bisa menjadi kepala satu keluarga.',
                        flags: 64
                    });
                    return;
                }

                // [PENGECEKAN PEMBAYARAN] - Tempatkan logika pengecekan pembayaran di sini
                // Contoh:
                // if (!await checkPaymentStatus(interaction.user.id)) {
                //     await interaction.editReply({
                //         content: 'Pembayaran belum dilakukan. Silakan lakukan pembayaran terlebih dahulu.',
                //         flags: 64
                //     });
                //     return;
                // }

                // Insert family data into the database
                try {
                    db.prepare('INSERT INTO families (owner_id, family_name, slogan, logo_url) VALUES (?, ?, ?, ?)').run(
                        interaction.user.id,
                        familyName,
                        familySlogan,
                        familyLogo
                    );
                } catch (insertError) {
                    console.error('Database error inserting family:', insertError);
                    await interaction.editReply({
                        content: 'Terjadi kesalahan saat membuat keluarga. Silakan coba lagi.',
                        flags: 64
                    });
                    return;
                }

                // Create a new role with the family name
                const guild = interaction.guild;

                // Check if bot has permission to manage roles
                if (!guild.members.me.permissions.has('ManageRoles')) {
                    await interaction.editReply({
                        content: 'Bot tidak memiliki izin untuk mengelola role. Mohon berikan izin "Manage Roles" ke bot.',
                        flags: 64
                    });
                    return;
                }

                // Remove any previous family head roles before adding the new one
                const existingFamilyRoles = member.roles.cache.filter(role => 
                    role.name.endsWith(' (Kepala)')
                );
                
                for (const role of existingFamilyRoles.values()) {
                    await member.roles.remove(role);
                }
                
                // Create a role for the family (this will be the general family role for all members)
                const familyRole = await guild.roles.create({
                    name: familyName,
                    color: '#FFB6C1', // Light pink color for family members
                    reason: `Created for family ${familyName} by ${interaction.user.tag}`
                });
                
                // Create a unique role name for the family head (to distinguish from members)
                const headRoleName = `${familyName} (Ketua)`;
                
                const headRole = await guild.roles.create({
                    name: headRoleName,
                    color: '#FF69B4', // Different color for family head
                    reason: `Created for family head of ${familyName} by ${interaction.user.tag}`
                });

                // Add the head role to the user who created the family
                await member.roles.add(headRole);

                console.log(`Roles "${familyName}" and "${headRoleName}" created for family`);

                // Send notification to admin channel instead of creating a family channel
                const adminChannelId = process.env.ADMIN_NOTIFICATION_CHANNEL_ID || process.env.STAFF_CHANNEL_ID;
                if (adminChannelId) {
                    const adminChannel = guild.channels.cache.get(adminChannelId);
                    if (adminChannel) {
                        const notificationEmbed = new EmbedBuilder()
                            .setTitle('🏠 Keluarga Baru Dibuat')
                            .setDescription(`Sebuah keluarga baru telah dibuat di server ini`)
                            .addFields(
                                { name: '>Nama Keluarga', value: familyName, inline: true },
                                { name: 'Slogan', value: familySlogan, inline: true },
                                { name: 'Pembuat', value: `${interaction.user.tag} (ID: ${interaction.user.id})`, inline: true }
                            )
                            .setColor('#FF69B4')
                            .setTimestamp();
                            
                        // Add thumbnail if logo is provided
                        if (familyLogo) {
                            notificationEmbed.setThumbnail(familyLogo);
                        }

                        await adminChannel.send({ embeds: [notificationEmbed] });
                    }
                }

                // Create success embed
                const successEmbed = new EmbedBuilder()
                    .setTitle('🏠 Keluarga Berhasil Dibangun!')
                    .setDescription(`**${familyName}** telah resmi dibangun!\n\n**Slogan:** ${familySlogan}\n\nRole dan channel khusus telah dibuat untuk keluargamu.`)
                    .setColor('#FF69B4')
                    .addFields(
                        { name: 'Nama Keluarga', value: familyName, inline: true },
                        { name: 'Slogan', value: familySlogan, inline: true },
                        { name: 'Anggota Keluarga', value: `<@${interaction.user.id}>`, inline: true }
                    )
                    .setTimestamp();
                    
                // Add thumbnail if logo is provided
                if (familyLogo) {
                    successEmbed.setThumbnail(familyLogo);
                }

                // Send success message to the bonded channel
                const bondedChannelId = process.env.BONDED_CHANNEL_ID;
                if (bondedChannelId) {
                    const bondedChannel = interaction.client.channels.cache.get(bondedChannelId);
                    if (bondedChannel) {
                        await bondedChannel.send({ embeds: [successEmbed] });
                    }
                }

                // Confirm to the user
                await interaction.editReply({
                    content: `Keluargamu "${familyName}" telah berhasil dibangun! Role dan channel khusus telah dibuat.`,
                    flags: 64
                });
            } catch (error) {
                console.error('Error processing build family modal:', error);

                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '❌ Terjadi kesalahan saat membuat keluargamu. Silakan coba lagi nanti.',
                        flags: 64
                    });
                } else {
                    await interaction.editReply({
                        content: '❌ Terjadi kesalahan saat membuat keluargamu. Silakan coba lagi nanti.',
                        flags: 64
                    });
                }
            }
        }
        // Handle Approve Join Request button click
        else if (interaction.customId && interaction.customId.startsWith('btn_approve_join_request_')) {
            try {
                // Extract family head ID and requester ID from custom ID
                // Format: btn_approve_join_request_{familyHeadId}_{requesterId}
                const parts = interaction.customId.split('_');
                if (parts.length < 5) {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Format ID permintaan tidak valid.',
                            ephemeral: true
                        });
                    }
                    return;
                }

                const familyHeadId = parts[4]; // family head ID
                const requesterId = parts[5]; // requester ID

                // Verify that the person clicking is indeed the family head
                if (interaction.user.id !== familyHeadId) {
                    await interaction.reply({
                        content: 'Hanya kepala keluarga yang dapat menyetujui permintaan ini.',
                        ephemeral: true
                    });
                    return;
                }

                // Get the database connection
                const { db } = require('../database/db');

                // Get the family info using async method
                const family = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM families WHERE owner_id = ?', [familyHeadId], (err, row) => {
                        if (err) {
                            console.error('Database error getting family:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
                
                if (!family) {
                    await interaction.reply({
                        content: 'Keluarga tidak ditemukan.',
                        ephemeral: true
                    });
                    return;
                }

                // Get the request info using async method
                const request = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM family_requests WHERE requester_id = ? AND family_id = ? AND status = ?', 
                        [requesterId, familyHeadId, 'PENDING'], (err, row) => {
                        if (err) {
                            console.error('Database error getting request:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
                
                if (!request) {
                    await interaction.reply({
                        content: 'Permintaan tidak ditemukan atau sudah diproses.',
                        ephemeral: true
                    });
                    return;
                }

                // Update the request status to APPROVED using async method
                await new Promise((resolve, reject) => {
                    db.run('UPDATE family_requests SET status = ? WHERE requester_id = ? AND family_id = ?', 
                        ['APPROVED', requesterId, familyHeadId], (err) => {
                        if (err) {
                            console.error('Database error updating request:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                // Add the user to the family_members table using async method
                try {
                    await new Promise((resolve, reject) => {
                        db.run('INSERT INTO family_members (user_id, family_id, join_date) VALUES (?, ?, ?)', 
                            [requesterId, familyHeadId, new Date().toISOString()], (err) => {
                            if (err) {
                                // If user is already in the family, continue anyway
                                if (err.errno !== 19) { // SQLITE_CONSTRAINT error code
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            } else {
                                resolve();
                            }
                        });
                    });
                } catch (insertError) {
                    console.error('Error inserting to family_members:', insertError);
                }

                // Get the guild and member
                // Since interaction happens in DM, interaction.guild is null
                // So we need to get the guild from the client
                const guild = interaction.client.guilds.cache.get(interaction.guildId) || 
                             interaction.client.guilds.cache.first(); // fallback to first guild if needed
                if (!guild) {
                    await interaction.reply({
                        content: 'Server tidak ditemukan. Tidak dapat menyelesaikan permintaan.',
                        ephemeral: true
                    });
                    return;
                }
                
                let member;
                try {
                    member = await guild.members.fetch(requesterId);
                } catch (memberFetchError) {
                    // If member is not in the guild, fetch the user instead
                    if (memberFetchError.code === 10007) { // Unknown Member
                        console.log(`User ${requesterId} tidak ditemukan di guild, mengambil data user biasa`);
                        member = await interaction.client.users.fetch(requesterId);
                    } else {
                        throw memberFetchError; // Re-throw if it's a different error
                    }
                }

                // Find the family role by name (the general family role, not the head role)
                if (family && family.family_name) {
                    // Refresh the guild roles cache to ensure we have the latest roles
                    await guild.roles.fetch();
                    
                    // Look for the general family role (without "(Ketua)" suffix)
                    const familyRole = guild.roles.cache.find(role => 
                        role.name === family.family_name && 
                        !role.name.includes('(Ketua)')
                    );

                    if (familyRole) {
                        try {
                            // Only add role if member is actually a guild member
                            if (member && member.joinedAt) {
                                await member.roles.add(familyRole);
                                console.log(`Role "${familyRole.name}" added to user ${requesterId}`);
                            } else {
                                console.log(`User ${requesterId} bukan anggota guild, tidak bisa menambahkan role`);
                            }
                        } catch (roleError) {
                            console.error('Error adding family role to user:', roleError);
                        }
                    } else {
                        console.error(`Family role "${family.family_name}" not found`);
                        console.log('Available roles:', guild.roles.cache.map(role => role.name).join(', '));
                        
                        // Try to find a role that contains the family name (as fallback)
                        const similarRole = guild.roles.cache.find(role => 
                            role.name.includes(family.family_name) && 
                            !role.name.includes('(Ketua)')
                        );
                        
                        if (similarRole) {
                            console.log(`Found similar role: "${similarRole.name}", trying to use this instead`);
                            try {
                                if (member && member.joinedAt) {
                                    await member.roles.add(similarRole);
                                    console.log(`Similar role "${similarRole.name}" added to user ${requesterId}`);
                                }
                            } catch (roleError) {
                                console.error('Error adding similar family role to user:', roleError);
                            }
                        }
                    }
                } else {
                    console.error('Family data or family name is undefined');
                }

                // Update the embed to show approved status
                const { EmbedBuilder } = require('discord.js');
                
                // Handle both user and member objects for tag and avatar
                let requesterTag, requesterAvatar;
                
                if (member) {
                    requesterTag = member.tag || member.username || 'Unknown User';
                    requesterAvatar = member.displayAvatarURL ? member.displayAvatarURL({ dynamic: true }) : 
                                     member.avatarURL ? member.avatarURL({ dynamic: true }) : 
                                     'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
                } else {
                    requesterTag = 'Unknown User';
                    requesterAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png'; // Default avatar
                }
                
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(`💌 Permintaan Bergabung Keluarga - DISETUJUI`)
                    .setDescription(`Pengguna **${requesterTag}** ingin bergabung dengan keluargamu "${family.family_name}".\n\n**Alasan bergabung:** ${request.reason}`)
                    .setColor('#00FF00') // Green color for approved
                    .setThumbnail(requesterAvatar)
                    .addFields(
                        { name: 'Status', value: 'DISETUJUI', inline: true },
                        { name: 'Disetujui oleh', value: interaction.user.tag, inline: true },
                        { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                    )
                    .setTimestamp();

                // Remove the buttons
                await interaction.update({ embeds: [updatedEmbed], components: [] });

                // Send success message to family head
                await interaction.followUp({
                    content: `Permintaan dari **${requesterTag}** untuk bergabung dengan keluarga "${family.family_name}" telah disetujui.`,
                    ephemeral: true
                });

                // Notify the requester that their request was approved
                try {
                    const requester = await interaction.client.users.fetch(requesterId);
                    await requester.send(`🎉 Permintaanmu untuk bergabung dengan keluarga "${family.family_name}" telah **disetujui** oleh kepala keluarga! Selamat datang di keluargamu yang baru!`);
                } catch (dmError) {
                    console.error('Could not send DM to requester:', dmError);
                }
            } catch (error) {
                console.error('Error handling approve join request button:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat menyetujui permintaan bergabung keluarga. Silakan coba lagi.',
                        ephemeral: true
                    });
                }
            }
        }
        // Handle Cancel Join Request button click
        else if (interaction.customId && interaction.customId.startsWith('btn_cancel_join_request_')) {
            try {
                // Extract family head ID and requester ID from custom ID
                // Format: btn_cancel_join_request_{familyHeadId}_{requesterId}
                const parts = interaction.customId.split('_');
                if (parts.length < 5) {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Format ID permintaan tidak valid.',
                            ephemeral: true
                        });
                    }
                    return;
                }

                const familyHeadId = parts[4]; // family head ID
                const requesterId = parts[5]; // requester ID

                // Verify that the person clicking is indeed the family head
                if (interaction.user.id !== familyHeadId) {
                    await interaction.reply({
                        content: 'Hanya kepala keluarga yang dapat menolak permintaan ini.',
                        ephemeral: true
                    });
                    return;
                }

                // Get the database connection
                const { db } = require('../database/db');

                // Get the family info using async method
                const family = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM families WHERE owner_id = ?', [familyHeadId], (err, row) => {
                        if (err) {
                            console.error('Database error getting family:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
                
                if (!family) {
                    await interaction.reply({
                        content: 'Keluarga tidak ditemukan.',
                        ephemeral: true
                    });
                    return;
                }

                // Get the request info using async method
                const request = await new Promise((resolve, reject) => {
                    db.get('SELECT * FROM family_requests WHERE requester_id = ? AND family_id = ? AND status = ?', 
                        [requesterId, familyHeadId, 'PENDING'], (err, row) => {
                        if (err) {
                            console.error('Database error getting request:', err);
                            reject(err);
                        } else {
                            resolve(row);
                        }
                    });
                });
                
                if (!request) {
                    await interaction.reply({
                        content: 'Permintaan tidak ditemukan atau sudah diproses.',
                        ephemeral: true
                    });
                    return;
                }

                // Update the request status to REJECTED using async method
                await new Promise((resolve, reject) => {
                    db.run('UPDATE family_requests SET status = ? WHERE requester_id = ? AND family_id = ?', 
                        ['REJECTED', requesterId, familyHeadId], (err) => {
                        if (err) {
                            console.error('Database error updating request:', err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });

                // Update the embed to show rejected status
                const { EmbedBuilder } = require('discord.js');
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(`💌 Permintaan Bergabung Keluarga - DITOLAK`)
                    .setDescription(`Pengguna **${interaction.user.tag}** ingin bergabung dengan keluargamu "${family.family_name}".\n\n**Alasan bergabung:** ${request.reason}`)
                    .setColor('#FF0000') // Red color for rejected
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Status', value: 'DITOLAK', inline: true },
                        { name: 'Ditolak oleh', value: interaction.user.tag, inline: true },
                        { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                    )
                    .setTimestamp();

                // Remove the buttons
                await interaction.update({ embeds: [updatedEmbed], components: [] });

                // Send success message to family head
                await interaction.followUp({
                    content: `Permintaan dari **${interaction.user.tag}** untuk bergabung dengan keluarga "${family.family_name}" telah ditolak.`,
                    ephemeral: true
                });

                // Notify the requester that their request was rejected
                try {
                    const requester = await interaction.client.users.fetch(requesterId);
                    await requester.send(`😔 Permintaanmu untuk bergabung dengan keluarga "${family.family_name}" telah **ditolak** oleh kepala keluarga.`);
                } catch (dmError) {
                    console.error('Could not send DM to requester:', dmError);
                }
            } catch (error) {
                console.error('Error handling cancel join request button:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat menolak permintaan bergabung keluarga. Silakan coba lagi.',
                        ephemeral: true
                    });
                }
            }
        }
        // Handle Share Profile button click
        else if (interaction.customId === 'btn_share_profile') {
            try {
                const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

                // Create a modal
                const shareProfileModal = new ModalBuilder()
                    .setCustomId('modal_share_profile')
                    .setTitle('Bagikan Profil Sosial Media');

                // Input for Instagram username (required)
                const instagramInput = new TextInputBuilder()
                    .setCustomId('instagram_username')
                    .setLabel('Instagram Username')
                    .setPlaceholder('Contoh: johndoe, tidak perlu pakai @')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                // Input for TikTok username (required)
                const tiktokInput = new TextInputBuilder()
                    .setCustomId('tiktok_username')
                    .setLabel('TikTok Username')
                    .setPlaceholder('Contoh: johndoe, tidak perlu pakai @')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                // Input for description (required, max 100 chars)
                const descriptionInput = new TextInputBuilder()
                    .setCustomId('social_description')
                    .setLabel('Deskripsi Singkat')
                    .setPlaceholder('Ceritakan sedikit tentang dirimu...')
                    .setStyle(TextInputStyle.Paragraph)
                    .setMaxLength(100)
                    .setRequired(true);

                // Add inputs to modal
                const firstActionRow = new ActionRowBuilder().addComponents(instagramInput);
                const secondActionRow = new ActionRowBuilder().addComponents(tiktokInput);
                const thirdActionRow = new ActionRowBuilder().addComponents(descriptionInput);

                shareProfileModal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

                await interaction.showModal(shareProfileModal);
            } catch (modalError) {
                console.error('Error showing share profile modal:', modalError);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat membuka form bagikan profil. Silakan coba lagi.',
                        ephemeral: true
                    });
                }
            }
        }
        // Handle Open Claim button click (now for users to create ticket)
        else if (interaction.customId === 'btn_open_claim') {
            try {
                const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

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
        // Handle Share Profile modal submission
        else if (interaction.customId === 'modal_share_profile') {
            try {
                await interaction.deferReply({ flags: 64 }); // Using flags for ephemeral response

                // Get values from modal
                const instagramUsername = interaction.fields.getTextInputValue('instagram_username');
                const tiktokUsername = interaction.fields.getTextInputValue('tiktok_username');
                const socialDescription = interaction.fields.getTextInputValue('social_description');

                // Security check: validate input for potential phishing links
                if (instagramUsername.includes('http') || instagramUsername.includes('.com') || 
                    tiktokUsername.includes('http') || tiktokUsername.includes('.com')) {
                    await interaction.editReply({
                        content: 'Mohon masukkan username saja, tanpa link lengkap (tidak boleh mengandung "http" atau ".com").',
                        flags: 64
                    });
                    return;
                }

                // Convert to proper links
                const instagramLink = `https://instagram.com/${instagramUsername}`;
                const tiktokLink = `https://tiktok.com/@${tiktokUsername}`;

                // Create embed with user's social media info
                const { EmbedBuilder } = require('discord.js');
                const socialEmbed = new EmbedBuilder()
                    .setTitle(`📱 Profil Sosial Media - ${interaction.user.username}`)
                    .setDescription(socialDescription)
                    .setColor('#90EE90')
                    .addFields(
                        { name: '-instagram', value: `[${instagramUsername}](${instagramLink})`, inline: true },
                        { name: ' TikTok', value: `[${tiktokUsername}](${tiktokLink})`, inline: true }
                    )
                    .setFooter({ text: `Dibagikan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                // Create link buttons
                const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
                
                const linkButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('Instagram')
                        .setURL(instagramLink)
                        .setStyle(ButtonStyle.Link),
                    new ButtonBuilder()
                        .setLabel('TikTok')
                        .setURL(tiktokLink)
                        .setStyle(ButtonStyle.Link)
                );

                // Send the embed with link buttons
                await interaction.editReply({
                    content: 'Profil sosial media kamu telah dibagikan:',
                    embeds: [socialEmbed],
                    components: [linkButtons],
                    flags: 64
                });

                // Create link buttons with logos - with share button on the left
                const linkButtonsWithShare = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('btn_share_profile')
                        .setLabel('Bagikan Profil')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('📱'),
                    new ButtonBuilder()
                        .setLabel('Instagram')
                        .setURL(instagramLink)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📸'),
                    new ButtonBuilder()
                        .setLabel('TikTok')
                        .setURL(tiktokLink)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🎵')
                );

                // Send to the target social sharing channel
                const socialSharingChannelId = process.env.SOCIAL_SHARING_CHANNEL_ID;
                if (socialSharingChannelId) {
                    const socialSharingChannel = interaction.client.channels.cache.get(socialSharingChannelId);
                    if (socialSharingChannel) {
                        await socialSharingChannel.send({
                            content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                            embeds: [socialEmbed],
                            components: [linkButtonsWithShare]
                        });
                    } else {
                        // If target channel is not found, send to current channel as fallback
                        await interaction.channel.send({
                            content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                            embeds: [socialEmbed],
                            components: [linkButtonsWithShare]
                        });
                    }
                } else {
                    // If no target channel is configured, send to current channel
                    await interaction.channel.send({
                        content: `<@${interaction.user.id}> telah membagikan profil sosial media mereka:`,
                        embeds: [socialEmbed],
                        components: [linkButtonsWithShare]
                    });
                }
            } catch (error) {
                console.error('Error processing share profile modal:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat memproses profil sosial media kamu. Silakan coba lagi.',
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({
                        content: 'Terjadi kesalahan saat memproses profil sosial media kamu. Silakan coba lagi.',
                        flags: 64
                    });
                }
            }
        }
        // Handle Enhanced Claim modal submission (creating ticket)
        else if (interaction.customId === 'modal_enhanced_claim') {
            try {
                await interaction.deferReply({ flags: 64 }); // Using flags for ephemeral response

                // Get values from modal
                const receiverName = interaction.fields.getTextInputValue('receiver_name');
                const winnerCategory = interaction.fields.getTextInputValue('winner_category');
                const rewardAmount = interaction.fields.getTextInputValue('reward_amount');
                const walletNumber = interaction.fields.getTextInputValue('wallet_number');
                const address = interaction.fields.getTextInputValue('address');

                // Get the database connection
                const { db } = require('../database/db');

                // Check the maximum number of pending claims allowed per user from environment variable
                const maxPendingClaims = parseInt(process.env.MAX_PENDING_CLAIMS_PER_USER) || 5;
                
                // Function to clean up invalid claims (channels/threads that no longer exist)
                const cleanupInvalidClaims = async () => {
                    return new Promise(async (resolve, reject) => {
                        // Get all pending claims for this user
                        const query = `SELECT id, channel_id, thread_id FROM claims WHERE user_id = ? AND status = 'PENDING'`;
                        db.all(query, [interaction.user.id], async (err, rows) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            
                            console.log(`Found ${rows.length} pending claims for user ${interaction.user.id}`);
                            
                            // Check each claim to see if its channel/thread still exists
                            for (const claim of rows) {
                                let channelExists = true;
                                
                                if (claim.channel_id) {
                                    // Check if the channel still exists
                                    try {
                                        const channel = await interaction.guild.channels.fetch(claim.channel_id);
                                        if (!channel) {
                                            channelExists = false;
                                        }
                                    } catch (channelError) {
                                        // Channel doesn't exist
                                        channelExists = false;
                                    }
                                } else if (claim.thread_id) {
                                    // Check if the thread still exists
                                    try {
                                        const thread = await interaction.guild.channels.fetch(claim.thread_id);
                                        if (!thread) {
                                            channelExists = false;
                                        }
                                    } catch (threadError) {
                                        // Thread doesn't exist
                                        channelExists = false;
                                    }
                                }
                                
                                // If the channel/thread doesn't exist, update the claim status to ARCHIVED
                                if (!channelExists) {
                                    try {
                                        const updateQuery = `UPDATE claims SET status = 'ARCHIVED' WHERE id = ?`;
                                        db.run(updateQuery, [claim.id], (updateErr) => {
                                            if (updateErr) {
                                                console.error(`Error updating claim ${claim.id} status to ARCHIVED:`, updateErr);
                                            } else {
                                                console.log(`Claim ${claim.id} status updated to ARCHIVED (channel/thread no longer exists)`);
                                            }
                                        });
                                    } catch (updateError) {
                                        console.error(`Error in updating claim ${claim.id}:`, updateError);
                                    }
                                } else {
                                    console.log(`Claim ${claim.id} channel/thread still exists`);
                                }
                            }
                            
                            resolve();
                        });
                    });
                };
                
                // Clean up invalid claims first
                await cleanupInvalidClaims();
                
                // Check if user already has maxPendingClaims or more pending claims
                const checkPendingClaims = () => {
                    return new Promise((resolve, reject) => {
                        const query = `SELECT COUNT(*) as count FROM claims WHERE user_id = ? AND status = 'PENDING'`;
                        db.get(query, [interaction.user.id], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row.count);
                            }
                        });
                    });
                };

                const pendingCount = await checkPendingClaims();
                
                console.log(`User ${interaction.user.id} has ${pendingCount} pending claims (max allowed: ${maxPendingClaims})`);
                
                if (pendingCount >= maxPendingClaims) {
                    // Get details of pending claims for debugging
                    const getPendingClaimsDetails = () => {
                        return new Promise((resolve, reject) => {
                            const query = `SELECT id, channel_id, thread_id FROM claims WHERE user_id = ? AND status = 'PENDING'`;
                            db.all(query, [interaction.user.id], (err, rows) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(rows);
                                }
                            });
                        });
                    };
                    
                    const pendingClaims = await getPendingClaimsDetails();
                    console.log(`Pending claims for user ${interaction.user.id}:`, pendingClaims);
                    
                    await interaction.editReply({
                        content: `Kamu sudah memiliki ${maxPendingClaims} klaim aktif. Mohon tunggu hingga beberapa klaim selesai sebelum membuat klaim baru.`,
                        flags: 64
                    });
                    return;
                }

                // Insert the enhanced claim into the database
                const insertEnhancedClaim = () => {
                    return new Promise((resolve, reject) => {
                        const query = `
                            INSERT INTO claims (user_id, description, status, wallet_number, address, reward_amount, channel_id, thread_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        `;
                        db.run(query, [
                            interaction.user.id, 
                            `Klaim Hadiah: ${winnerCategory} - ${rewardAmount}`, 
                            'PENDING', 
                            walletNumber, 
                            address, 
                            rewardAmount,
                            null, // channel_id - will be updated later if channel is created
                            null  // thread_id - will be updated later if thread is created
                        ], function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(this.lastID); // Get the inserted claim ID
                            }
                        });
                    });
                };

                let claimId;
                try {
                    claimId = await insertEnhancedClaim();
                } catch (dbError) {
                    console.error('Database error inserting enhanced claim:', dbError);
                    await interaction.editReply({
                        content: 'Terjadi kesalahan saat menyimpan klaim. Silakan coba lagi.',
                        flags: 64
                    });
                    return;
                }

                // Get the claim log channel from environment variable
                const claimChannelId = process.env.CLAIM_LOG_CHANNEL_ID;
                if (!claimChannelId) {
                    await interaction.editReply({
                        content: 'Channel klaim belum dikonfigurasi. Silakan hubungi administrator.',
                        flags: 64
                    });
                    return;
                }

                const claimChannel = interaction.guild.channels.cache.get(claimChannelId);
                if (!claimChannel) {
                    await interaction.editReply({
                        content: 'Channel klaim tidak ditemukan. Silakan hubungi administrator.',
                        flags: 64
                    });
                    return;
                }

                // Get the claim category from environment variable
                const claimCategoryId = process.env.CLAIM_CATEGORY_ID;
                
                if (!claimCategoryId) {
                    // If no category is set, send to the claim log channel as before but with minimal info
                    const { EmbedBuilder } = require('discord.js');
                    const minimalEmbed = new EmbedBuilder()
                        .setTitle(`🎫 Tiket Klaim Baru #${claimId}`)
                        .setDescription(`<@${interaction.user.id}> telah membuat tiket klaim baru.`)
                        .setColor('#FFD700')
                        .addFields(
                            { name: 'Status', value: 'PENDING', inline: true },
                            { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                        )
                        .setTimestamp();

                    // Send the minimal claim notification to the claim log channel
                    const sentMessage = await claimChannel.send({ 
                        content: `🚨 **KLAIM RAHASIA** - Hanya admin yang dapat melihat detail.`,
                        embeds: [minimalEmbed]
                    });
                    
                    // Create a thread for this ticket
                    try {
                        const thread = await sentMessage.startThread({
                            name: `🔒 Tiket Klaim #${claimId} - ${receiverName}`,
                            autoArchiveDuration: 60, // Auto archive after 1 hour
                        });
                        
                        // Update the claim record with the thread ID
                        const updateClaimThread = () => {
                            return new Promise((resolve, reject) => {
                                const query = `UPDATE claims SET thread_id = ? WHERE id = ?`;
                                db.run(query, [thread.id, claimId], function(err) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        };
                        
                        await updateClaimThread();
                        
                        // Send a welcome message in the thread
                        await thread.send({
                            content: ` Halo <@${interaction.user.id}>! Tiket klaimmu telah dibuat. Admin akan segera menangani permintaanmu.`
                        });
                        
                        // Send detailed information in the thread for admin reference
                        const detailedInfo = `**🔐 INFORMASI KLAIM RAHASIA:**\n` +
                            `**Nama Penerima:** ${receiverName}\n` +
                            `**Kategori Pemenang:** ${winnerCategory}\n` +
                            `**Total Hadiah:** ${rewardAmount}\n` +
                            `**Nomor E-Wallet:** ${walletNumber}\n` +
                            `**Alamat Lengkap:** ${address || 'Tidak disediakan (Privasi)'}\n` +
                            `**Dibuat oleh:** ${interaction.user.tag} (${interaction.user.id})`;
                        
                        await thread.send({
                            content: detailedInfo
                        });
                        
                        // Send the full embed with all details in the thread as well
                        const { EmbedBuilder } = require('discord.js');
                        const detailedEmbed = new EmbedBuilder()
                            .setTitle(`🔐 Detail Klaim #${claimId}`)
                            .setColor('#9370DB') // Purple color for private info
                            .addFields(
                                { name: '>Nama Penerima', value: receiverName, inline: false },
                                { name: 'Kategori Pemenang', value: winnerCategory, inline: true },
                                { name: 'Total Hadiah', value: rewardAmount, inline: true },
                                { name: 'Nomor E-Wallet', value: walletNumber, inline: true },
                                { name: 'Alamat Lengkap', value: address || 'Tidak disediakan (Privasi)', inline: false },
                                { name: 'Dibuat oleh', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                                { name: 'Status', value: 'PENDING', inline: true },
                                { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                            )
                            .setTimestamp();
                        
                        await thread.send({ embeds: [detailedEmbed] });
                    } catch (threadError) {
                        console.error('Error creating thread for claim ticket:', threadError);
                    }
                } else {
                    // Create a new text channel in the specified category
                    try {
                        const claimCategory = interaction.guild.channels.cache.get(claimCategoryId);
                        
                        if (!claimCategory) {
                            await interaction.editReply({
                                content: 'Kategori klaim tidak ditemukan. Silakan hubungi admin.',
                                flags: 64
                            });
                            return;
                        }
                        
                        // Verify that the provided ID is actually a category
                        if (claimCategory.type !== 4) { // ChannelType.GuildCategory is 4
                            console.error(`Provided CLAIM_CATEGORY_ID ${claimCategoryId} is not a category. Creating claim in default way instead.`);
                            // Fallback to creating thread in the claim log channel
                            const { EmbedBuilder } = require('discord.js');
                            const minimalEmbed = new EmbedBuilder()
                                .setTitle(`🎫 Tiket Klaim Baru #${claimId}`)
                                .setDescription(`<@${interaction.user.id}> telah membuat tiket klaim baru.`)
                                .setColor('#FFD700')
                                .addFields(
                                    { name: 'Status', value: 'PENDING', inline: true },
                                    { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                                )
                                .setTimestamp();

                            // Send the minimal claim notification to the claim log channel
                            const sentMessage = await claimChannel.send({ 
                                content: `🚨 **KLAIM RAHASIA** - Hanya admin yang dapat melihat detail.`,
                                embeds: [minimalEmbed]
                            });
                            
                            // Create a thread for this ticket
                            try {
                                const thread = await sentMessage.startThread({
                                    name: `🔒 Tiket Klaim #${claimId} - ${receiverName}`,
                                    autoArchiveDuration: 60, // Auto archive after 1 hour
                                });
                                
                                // Update the claim record with the thread ID
                                const updateClaimThread = () => {
                                    return new Promise((resolve, reject) => {
                                        const query = `UPDATE claims SET thread_id = ? WHERE id = ?`;
                                        db.run(query, [thread.id, claimId], function(err) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    });
                                };
                                
                                await updateClaimThread();
                                
                                // Send a welcome message in the thread
                                await thread.send({
                                    content: ` Halo <@${interaction.user.id}>! Tiket klaimmu telah dibuat. Admin akan segera menangani permintaanmu.`
                                });
                                
                                // Send detailed information in the thread for admin reference
                                const detailedInfo = `**🔐 INFORMASI KLAIM RAHASIA:**\n` +
                                    `**Nama Penerima:** ${receiverName}\n` +
                                    `**Kategori Pemenang:** ${winnerCategory}\n` +
                                    `**Total Hadiah:** ${rewardAmount}\n` +
                                    `**Nomor E-Wallet:** ${walletNumber}\n` +
                                    `**Alamat Lengkap:** ${address || 'Tidak disediakan (Privasi)'}\n` +
                                    `**Dibuat oleh:** ${interaction.user.tag} (${interaction.user.id})`;
                                
                                await thread.send({
                                    content: detailedInfo
                                });
                                
                                // Send the full embed with all details in the thread as well
                                const { EmbedBuilder } = require('discord.js');
                                const detailedEmbed = new EmbedBuilder()
                                    .setTitle(`🔐 Detail Klaim #${claimId}`)
                                    .setColor('#9370DB') // Purple color for private info
                                    .addFields(
                                        { name: '>Nama Penerima', value: receiverName, inline: false },
                                        { name: 'Kategori Pemenang', value: winnerCategory, inline: true },
                                        { name: 'Total Hadiah', value: rewardAmount, inline: true },
                                        { name: 'Nomor E-Wallet', value: walletNumber, inline: true },
                                        { name: 'Alamat Lengkap', value: address || 'Tidak disediakan (Privasi)', inline: false },
                                        { name: 'Dibuat oleh', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                                        { name: 'Status', value: 'PENDING', inline: true },
                                        { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                                    )
                                    .setTimestamp();
                                
                                // Create buttons for admins
                                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                                const actionRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`claim_room_${claimId}`)
                                        .setLabel('Claim Room')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('🙋'),
                                    new ButtonBuilder()
                                        .setCustomId(`close_claim_${claimId}`)
                                        .setLabel('Tutup Locket')
                                        .setStyle(ButtonStyle.Danger)
                                        .setEmoji('🔒')
                                );
                                
                                await thread.send({ 
                                    embeds: [detailedEmbed],
                                    components: [actionRow]
                                });

                                // Send confirmation to the user
                                await interaction.editReply({
                                    content: `Tiket klaimmu telah dibuat dengan ID #${claimId} di thread privat. Hanya kamu dan admin yang bisa mengaksesnya. Terima kasih!`,
                                    flags: 64
                                });
                            } catch (threadError) {
                                console.error('Error creating thread for claim ticket:', threadError);
                                await interaction.editReply({
                                    content: 'Terjadi kesalahan saat membuat thread klaim. Silakan coba lagi.',
                                    flags: 64
                                });
                            }
                            return; // Exit early since we're using fallback
                        }
                        
                        // Create a new text channel for this claim
                        const claimChannelCreated = await interaction.guild.channels.create({
                            name: `🔒klaim-${claimId}-${receiverName.replace(/\s+/g, '-').toLowerCase()}`,
                            type: 0, // Text channel type
                            parent: claimCategoryId,
                            topic: `Klaim Ticket #${claimId} - ${receiverName}`,
                            permissionOverwrites: [
                                {
                                    id: interaction.guild.roles.everyone,
                                    deny: ['ViewChannel'],
                                },
                                // Allow access for administrators
                                {
                                    id: interaction.guild.roles.cache.find(role => role.name === 'Administrator')?.id || interaction.guild.id, // Default to guild ID as fallback
                                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                                },
                                // Allow access for specific staff role if defined
                                {
                                    id: interaction.guild.roles.cache.find(role => role.name === 'Staff')?.id || interaction.user.id, // Fallback to user ID if no Staff role
                                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                                },
                                // Allow access for the user who created the claim
                                {
                                    id: interaction.user.id,
                                    allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'],
                                }
                            ],
                        });
                        
                        // Update the claim record with the channel ID
                        const updateClaimChannel = () => {
                            return new Promise((resolve, reject) => {
                                const query = `UPDATE claims SET channel_id = ? WHERE id = ?`;
                                db.run(query, [claimChannelCreated.id, claimId], function(err) {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve();
                                    }
                                });
                            });
                        };
                        
                        await updateClaimChannel();
                        
                        // Send detailed information in the new channel
                        const detailedInfo = `**🔐 TIKET KLAIM RAHASIA #${claimId} 🔐**\n\n` +
                            `**Nama Penerima:** ${receiverName}\n` +
                            `**Kategori Pemenang:** ${winnerCategory}\n` +
                            `**Total Hadiah:** ${rewardAmount}\n` +
                            `**Nomor E-Wallet:** ${walletNumber}\n` +
                            `**Alamat Lengkap:** ${address || 'Tidak disediakan (Privasi)'}\n` +
                            `**Dibuat oleh:** ${interaction.user.tag} (${interaction.user.id})\n` +
                            `**Status:** PENDING\n` +
                            `**Tanggal:** ${new Date().toLocaleString('id-ID')}`;
                        
                        const claimMessage = await claimChannelCreated.send({
                            content: ` Halo <@${interaction.user.id}>! Tiket klaimmu telah dibuat. Admin akan segera menangani permintaanmu.`,
                        });
                        
                        await claimChannelCreated.send({
                            content: detailedInfo
                        });
                        
                        // Send the full embed with all details in the channel as well
                        const { EmbedBuilder } = require('discord.js');
                        const detailedEmbed = new EmbedBuilder()
                            .setTitle(`🔐 Detail Klaim #${claimId}`)
                            .setColor('#9370DB') // Purple color for private info
                            .addFields(
                                { name: '>Nama Penerima', value: receiverName, inline: false },
                                { name: 'Kategori Pemenang', value: winnerCategory, inline: true },
                                { name: 'Total Hadiah', value: rewardAmount, inline: true },
                                { name: 'Nomor E-Wallet', value: walletNumber, inline: true },
                                { name: 'Alamat Lengkap', value: address || 'Tidak disediakan (Privasi)', inline: false },
                                { name: 'Dibuat oleh', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                                { name: 'Status', value: 'PENDING', inline: true },
                                { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                            )
                            .setTimestamp();
                        
                        // Create buttons for admins
                        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                        const actionRow = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`claim_room_${claimId}`)
                                .setLabel('Claim Room')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('🙋'),
                            new ButtonBuilder()
                                .setCustomId(`close_claim_${claimId}`)
                                .setLabel('Tutup Locket')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🔒')
                        );
                        
                        await claimChannelCreated.send({ 
                            embeds: [detailedEmbed],
                            components: [actionRow]
                        });
                        
                        // Send confirmation to the user
                        await interaction.editReply({
                            content: `Tiket klaimmu telah dibuat dengan ID #${claimId} di channel privat. Hanya kamu dan admin yang bisa mengaksesnya. Terima kasih!`,
                            flags: 64
                        });
                    } catch (channelError) {
                        console.error('Error creating claim channel:', channelError);
                        await interaction.editReply({
                            content: 'Terjadi kesalahan saat membuat channel klaim. Silakan coba lagi.',
                            flags: 64
                        });
                    }
                }

            } catch (error) {
                console.error('Error processing enhanced claim modal:', error);
                if (!interaction.replied && !interaction.deferred) {
                    try {
                        await interaction.reply({
                            content: 'Terjadi kesalahan saat membuat tiket klaim. Silakan coba lagi.',
                            ephemeral: true
                        });
                    } catch (replyError) {
                        console.error('Failed to send error message:', replyError);
                    }
                } else {
                    try {
                        await interaction.editReply({
                            content: 'Terjadi kesalahan saat membuat tiket klaim. Silakan coba lagi.',
                            flags: 64
                        });
                    } catch (editError) {
                        console.error('Failed to edit reply after error:', editError);
                    }
                }
            }
        }
        // Handle Claim Room button click
        else if (interaction.customId && interaction.customId.startsWith('claim_room_')) {
            try {
                // Check if user is authorized to use this feature
                const authorizedIds = process.env.CLIENT_OWNER_ID ?
                    Array.isArray(process.env.CLIENT_OWNER_ID) ?
                        process.env.CLIENT_OWNER_ID :
                        process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                    : [];

                // Check if user has admin permissions
                const isAdmin = interaction.member.permissions.has('Administrator');
                const isOwner = authorizedIds.includes(interaction.user.id);
                
                if (!isAdmin && !isOwner) {
                    return await interaction.reply({
                        content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                        ephemeral: true
                    });
                }

                // Extract claim ID from custom ID
                const claimId = interaction.customId.split('_')[2]; // Format: claim_room_{id}

                // Get the database connection
                const { db } = require('../database/db');

                // Get the claim details to find the channel/thread ID and other info
                const getClaimDetails = () => {
                    return new Promise((resolve, reject) => {
                        const query = `SELECT channel_id, thread_id, user_id, description, wallet_number, address, reward_amount FROM claims WHERE id = ?`;
                        db.get(query, [claimId], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                const claimDetails = await getClaimDetails();
                
                if (!claimDetails) {
                    await interaction.reply({
                        content: 'Klaim tidak ditemukan.',
                        ephemeral: true
                    });
                    return;
                }

                // Update the embed to show who claimed the room
                const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                const updatedEmbed = new EmbedBuilder()
                    .setTitle(`🔐 Detail Klaim #${claimId}`)
                    .setDescription(`Klaim ini sedang ditangani oleh ${interaction.user.tag}`)
                    .setColor('#0000FF') // Blue color for claimed
                    .addFields(
                        { name: 'Dibuat oleh', value: `<@${claimDetails.user_id}>`, inline: true },
                        { name: 'Status', value: 'CLAIMED', inline: true },
                        { name: 'Tanggal', value: new Date().toLocaleString('id-ID'), inline: true }
                    )
                    .setTimestamp();

                // Disable the claim button and keep the close button enabled
                const claimButton = new ButtonBuilder()
                    .setCustomId(`claim_room_${claimId}`)
                    .setLabel('Room Sudah Diambil')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🙋')
                    .setDisabled(true);

                const closeButton = new ButtonBuilder()
                    .setCustomId(`close_claim_${claimId}`)
                    .setLabel('Tutup Locket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔒');

                const updatedRow = new ActionRowBuilder().addComponents(claimButton, closeButton);

                // Update the message
                await interaction.update({ 
                    embeds: [updatedEmbed], 
                    components: [updatedRow] 
                });

                // Send confirmation message
                await interaction.followUp({
                    content: `Kamu telah mengambil klaim #${claimId}. Sekarang kamu bisa menangani klaim ini.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error handling claim room button:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat mengambil room klaim. Silakan coba lagi.',
                        ephemeral: true
                    });
                }
            }
        }
        // Handle Close Claim button click
        else if (interaction.customId && interaction.customId.startsWith('close_claim_')) {
            try {
                // Check if user is authorized to use this feature
                const authorizedIds = process.env.CLIENT_OWNER_ID ?
                    Array.isArray(process.env.CLIENT_OWNER_ID) ?
                        process.env.CLIENT_OWNER_ID :
                        process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
                    : [];

                // Check if user has admin permissions
                const isAdmin = interaction.member.permissions.has('Administrator');
                const isOwner = authorizedIds.includes(interaction.user.id);
                
                if (!isAdmin && !isOwner) {
                    return await interaction.reply({
                        content: 'Akses ditolak. Hanya Admin/Developer yang memiliki izin untuk melakukan tindakan ini.',
                        ephemeral: true
                    });
                }

                // Extract claim ID from custom ID
                const claimId = interaction.customId.split('_')[2]; // Format: close_claim_{id}

                // Get the database connection
                const { db } = require('../database/db');

                // Get the claim details to find the channel/thread ID
                const getClaimDetails = () => {
                    return new Promise((resolve, reject) => {
                        const query = `SELECT channel_id, thread_id, status FROM claims WHERE id = ?`;
                        db.get(query, [claimId], (err, row) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                };

                const claimDetails = await getClaimDetails();
                
                if (!claimDetails) {
                    await interaction.reply({
                        content: 'Klaim tidak ditemukan.',
                        ephemeral: true
                    });
                    return;
                }

                // Check if claim is already closed
                if (claimDetails.status === 'APPROVED' || claimDetails.status === 'REJECTED' || claimDetails.status === 'CLOSED') {
                    await interaction.reply({
                        content: 'Klaim ini sudah ditutup atau diproses.',
                        ephemeral: true
                    });
                    return;
                }

                // Update claim status to CLOSED
                const updateClaimStatus = () => {
                    return new Promise((resolve, reject) => {
                        const query = `UPDATE claims SET status = ? WHERE id = ?`;
                        db.run(query, ['CLOSED', claimId], function(err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(this.changes); // Number of affected rows
                            }
                        });
                    });
                };

                try {
                    const changes = await updateClaimStatus();
                    if (changes === 0) {
                        await interaction.reply({
                            content: 'Klaim tidak ditemukan.',
                            ephemeral: true
                        });
                        return;
                    }

                    // Try to delete the channel/thread if it exists
                    let deletionSuccess = false;
                    
                    if (claimDetails && claimDetails.channel_id) {
                        // Try to delete the channel
                        try {
                            const channelToDelete = await interaction.guild.channels.fetch(claimDetails.channel_id);
                            if (channelToDelete) {
                                await channelToDelete.delete();
                                deletionSuccess = true;
                            }
                        } catch (channelError) {
                            console.error('Error deleting claim channel:', channelError);
                        }
                    } else if (claimDetails && claimDetails.thread_id) {
                        // Try to delete the thread
                        try {
                            const threadToDelete = await interaction.guild.channels.fetch(claimDetails.thread_id);
                            if (threadToDelete) {
                                await threadToDelete.delete();
                                deletionSuccess = true;
                            }
                        } catch (threadError) {
                            console.error('Error deleting claim thread:', threadError);
                        }
                    }

                    // Update the button to show it's closed
                    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                    const updatedEmbed = new EmbedBuilder()
                        .setTitle(`🔐 Detail Klaim #${claimId} - DITUTUP`)
                        .setColor('#808080') // Gray color for closed
                        .setDescription('Klaim ini telah ditutup oleh admin.')
                        .setTimestamp();

                    // Disable both buttons
                    const disabledClaimButton = new ButtonBuilder()
                        .setCustomId(`claim_room_${claimId}`)
                        .setLabel('Room Sudah Diambil')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🙋')
                        .setDisabled(true);

                    const disabledCloseButton = new ButtonBuilder()
                        .setCustomId(`close_claim_${claimId}`)
                        .setLabel('Locket Ditutup')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🔒')
                        .setDisabled(true);

                    const updatedRow = new ActionRowBuilder().addComponents(disabledClaimButton, disabledCloseButton);

                    // Update the message
                    try {
                        await interaction.update({ 
                            embeds: [updatedEmbed], 
                            components: [updatedRow] 
                        });
                    } catch (updateError) {
                        console.error('Error updating message after closing claim:', updateError);
                    }

                    // Send confirmation message
                    try {
                        await interaction.followUp({
                            content: `Klaim #${claimId} telah ditutup.${deletionSuccess ? ' Channel/thread terkait telah dihapus.' : ''}`,
                            ephemeral: true
                        });
                    } catch (followUpError) {
                        console.error('Error sending follow-up message:', followUpError);
                    }
                } catch (dbError) {
                    console.error('Database error updating claim status:', dbError);
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat menutup klaim.',
                        ephemeral: true
                    });
                }
            } catch (error) {
                console.error('Error handling close claim button:', error);
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat menutup klaim. Silakan coba lagi.',
                        ephemeral: true
                    });
                }
            }
        }
        // Handle any other modal submissions that weren't caught by specific handlers
        else if (interaction.isModalSubmit()) {
            console.log('Unrecognized modal submission received:', interaction.customId);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Formulir ini tidak dikenali oleh sistem. Silakan coba lagi atau hubungi administrator.',
                        ephemeral: true
                    });
                }
            } catch (replyError) {
                console.error('Error sending unrecognized modal response:', replyError);
            }
        }
    } catch (error) {
        console.error('Unhandled interaction error:', error);

        // Try to respond to the interaction if possible
        // Only send error message if the interaction hasn't been acknowledged yet
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: 'An unexpected error occurred.', ephemeral: true });
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
        // If interaction is already acknowledged, we can't send another message, so just log the error
    }
}

// Note: The message event listener should be in a separate file for better organization
// This is just a reference to where the message event should be implemented