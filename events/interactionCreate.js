const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { db } = require('../database/db');

module.exports = async (client, interaction) => {
    try {
        // Log all interactions for debugging
        if (interaction.isButton() || interaction.isModalSubmit()) {
            console.log('Interaksi Diterima:', interaction.customId);
        }

        // Check if the interaction is from the allowed guild
        const allowedGuildId = process.env.ALLOWED_GUILD_ID;
        if (allowedGuildId && interaction.guildId !== allowedGuildId) {
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
                    if (interaction.replied || interaction.deferred) {
                        // If already replied or deferred, use followUp or editReply
                        if (interaction.deferred) {
                            await interaction.editReply({
                                content: 'There was an error while executing this command!',
                                ephemeral: true
                            });
                        } else {
                            await interaction.followUp({
                                content: 'There was an error while executing this command!',
                                ephemeral: true
                            });
                        }
                    } else {
                        // If not yet replied, use reply
                        await interaction.reply({
                            content: 'There was an error while executing this command!',
                            ephemeral: true
                        });
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
                const targetUserId = interaction.customId.split('_')[3]; // Extract user ID from custom ID

                try {
                    // Show modal for the message
                    const modal = new ModalBuilder()
                        .setCustomId(`modal_chat_me_${targetUserId}`)
                        .setTitle('Tuliskan Pesan Perkenalanmu');

                    // Input for the introduction message
                    const messageInput = new TextInputBuilder()
                        .setCustomId('chat_me_message')
                        .setLabel('Tuliskan Pesan Perkenalanmu')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        .setPlaceholder('Halo, aku melihat profilmu di Velvet... bolehkah kita berkenalan?');

                    const actionRow = new ActionRowBuilder().addComponents(messageInput);
                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                } catch (modalError) {
                    console.error('Error showing chat me modal:', modalError);
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat membuka form pesan. Silakan coba lagi.',
                        ephemeral: true
                    });
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
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat membuka form saran. Silakan coba lagi.',
                        ephemeral: true
                    });
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
                    await interaction.reply({
                        content: 'Terjadi kesalahan saat membuka form saran. Silakan coba lagi.',
                        ephemeral: true
                    });
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

                                // ALSO send to the staff log channel
                                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                if (logChannel) {
                                    try {
                                        const logEmbed = new EmbedBuilder()
                                            .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                            .setColor('#811331')
                                            .setThumbnail(interaction.user.displayAvatarURL())
                                            .setDescription(replyContent)
                                            .addFields(
                                                { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                { name: '📅 Status', value: 'Terkirim', inline: true },
                                                { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                            )
                                            .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                            .setTimestamp();

                                        await logChannel.send({ embeds: [logEmbed] });
                                    } catch (logError) {
                                        console.error('Error sending to log channel:', logError);
                                        // Don't fail the main operation if logging fails
                                    }
                                }
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

                                    // ALSO send to the staff log channel
                                    const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                    if (logChannel) {
                                        try {
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                                .setColor('#811331')
                                                .setThumbnail(interaction.user.displayAvatarURL())
                                                .setDescription(replyContent)
                                                .addFields(
                                                    { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                    { name: '📅 Status', value: 'Terkirim', inline: true },
                                                    { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                                )
                                                .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                                .setTimestamp();

                                            await logChannel.send({ embeds: [logEmbed] });
                                        } catch (logError) {
                                            console.error('Error sending to log channel:', logError);
                                            // Don't fail the main operation if logging fails
                                        }
                                    }
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

                                // ALSO send to the staff log channel
                                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                if (logChannel) {
                                    try {
                                        const logEmbed = new EmbedBuilder()
                                            .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                            .setColor('#811331')
                                            .setThumbnail(interaction.user.displayAvatarURL())
                                            .setDescription(replyContent)
                                            .addFields(
                                                { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                { name: '📅 Status', value: 'Terkirim', inline: true },
                                                { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                            )
                                            .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                            .setTimestamp();

                                        await logChannel.send({ embeds: [logEmbed] });
                                    } catch (logError) {
                                        console.error('Error sending to log channel:', logError);
                                        // Don't fail the main operation if logging fails
                                    }
                                }
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
                        .setCustomId(`btn_chat_me_${interaction.user.id}`); // Custom ID with user ID

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
            // Handle Chat Me modal submission
            else if (interaction.customId && interaction.customId.startsWith('modal_chat_me_')) {
                try {
                    await interaction.deferReply({ flags: 64 });

                    const targetUserId = interaction.customId.split('_')[3]; // Extract target user ID
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

                    // Create embed for the message
                    const messageEmbed = new EmbedBuilder()
                        .setTitle('💌 Pesan Perkenalan Baru')
                        .setDescription(messageContent)
                        .setColor('#811331')
                        .setAuthor({ name: `${interaction.user.username}#${interaction.user.discriminator}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                        .setTimestamp();

                    try {
                        // Send DM to the target user
                        await targetUser.send({
                            embeds: [messageEmbed],
                            content: `💬 Kamu menerima pesan perkenalan dari <@${interaction.user.id}>!`
                        });

                        // Confirm to the sender
                        await interaction.editReply({
                            content: `Pesanmu telah dikirim ke <@${targetUser.id}>!`,
                            flags: 64
                        });
                    } catch (dmError) {
                        console.error('Error sending DM:', dmError);
                        await interaction.editReply({
                            content: 'Gagal mengirim pesan. Mungkin pengguna menonaktifkan pesan pribadi.',
                            flags: 64
                        });
                    }
                } catch (error) {
                    console.error('Error in chat me modal submission:', error);
                    try {
                        await interaction.editReply({
                            content: 'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.',
                            flags: 64
                        });
                    } catch (editError) {
                        console.error('Failed to send error message:', editError);
                    }
                }
            }
            // Handle Feedback modal submission (for the feedback button)
            else if (interaction.customId && interaction.customId === 'modal_saran_user') {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                const kategori = interaction.fields.getTextInputValue('kategori_saran');
                const pesan = interaction.fields.getTextInputValue('pesan_saran');

                // Ambil channel khusus admin untuk menerima laporan ini
                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);

                const logEmbed = new EmbedBuilder()
                    .setTitle('📒 Lembar Aspirasi')
                    .setColor('#811331')
                    .addFields(
                        { name: '👤 Pengirim', value: `${interaction.user.tag}`, inline: true },
                        { name: '📂 Kategori', value: kategori, inline: true },
                        { name: '💬 Pesan', value: `\`\`\`${pesan}\`\`\`` }
                    )
                    .setTimestamp();

                // Check if log channel exists and bot has permissions
                if (logChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = logChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in feedback log channel');
                            // Still send success message to user but log the error
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
                    }
                }
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in feedback log channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
                    }
                }
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in feedback log channel');
                            // Send without embed if no embed permission
                            await logChannel.send(`**Aspirasi Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`);
                        } else {
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    } catch (channelError) {
                        console.error('Error sending feedback to log channel:', channelError);
                        // Still send success message to user even if log channel fails
                    }
                } else {
                    console.log('Feedback log channel not found or not configured');
                }

                await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
                    }
                }
            }
            // Handle Feedback modal submission (for the feedback button from message)
            else if (interaction.customId && interaction.customId === 'modal_saran_user_from_msg') {
                await interaction.deferReply({ flags: 64 }); // Using flags instead of ephemeral

                const kategori = interaction.fields.getTextInputValue('kategori_saran_from_msg');
                const pesan = interaction.fields.getTextInputValue('pesan_saran_from_msg');

                // Ambil channel khusus admin untuk menerima laporan ini
                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);

                const logEmbed = new EmbedBuilder()
                    .setTitle('📒 Lembar Aspirasi')
                    .setColor('#811331')
                    .addFields(
                        { name: '👤 Pengirim', value: `${interaction.user.tag}`, inline: true },
                        { name: '📂 Kategori', value: kategori, inline: true },
                        { name: '💬 Pesan', value: `\`\`\`${pesan}\`\`\`` }
                    )
                    .setTimestamp();

                // Check if log channel exists and bot has permissions
                if (logChannel) {
                    try {
                        // Check if bot has permissions to send messages in the channel
                        const botPermissions = logChannel.permissionsFor(interaction.client.user);

                        if (!botPermissions?.has('SendMessages')) {
                            console.log('ERROR: Bot lacks SendMessages permission in feedback log channel');
                            // Still send success message to user but log the error
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
                    }
                }
                            return;
                        }

                        if (!botPermissions?.has('ViewChannel')) {
                            console.log('ERROR: Bot lacks ViewChannel permission in feedback log channel');
                            await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
                    }
                }
                            return;
                        }

                        if (!botPermissions?.has('EmbedLinks')) {
                            console.log('ERROR: Bot lacks EmbedLinks permission in feedback log channel');
                            // Send without embed if no embed permission
                            await logChannel.send(`**Aspirasi Baru!**\nPengirim: ${interaction.user.tag}\nKategori: ${kategori}\nPesan: ${pesan}`);
                        } else {
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    } catch (channelError) {
                        console.error('Error sending feedback to log channel:', channelError);
                        // Still send success message to user even if log channel fails
                    }
                } else {
                    console.log('Feedback log channel not found or not configured');
                }

                await interaction.editReply({ content: 'Terima kasih! Saran-mu sudah terkirim ke tim Mɣralune. ✨', flags: 64 });

                // Send the suggestion panel message after the user submits feedback to keep it accessible
                const targetChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                if (targetChannel) {
                    try {
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

                        // Create the embed with saran description
                        const embed = new EmbedBuilder()
                            .setTitle('📝 Kotak Aspirasi Mɣralune')
                            .setDescription('Punya saran, kritik, atau menemukan bug? Kami ingin mendengar suaramu demi kenyamanan bersama di Mɣralune.\n\nKlik tombol di bawah untuk menuliskan saran-mu!')
                            .setColor('#811331')
                            .setFooter({ text: 'Terima kasih telah membantu kami berkembang' });

                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('btn_open_saran') // ID Tombol
                                .setLabel('Beri Masukan ✨')
                                .setStyle(ButtonStyle.Primary)
                        );

                        // Send the message with button to the target channel
                        await targetChannel.send({ embeds: [embed], components: [row] });
                    } catch (error) {
                        console.error('Error sending suggestion panel after feedback submission:', error);
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

                        // NEW: ALSO send to the staff log channel (as requested in the original issue)
                        const logChannelId = process.env.FEEDBACK_LOG_CHANNEL_ID;
                        const logChannel = interaction.guild.channels.cache.get(logChannelId);

                        if (logChannel) {
                            try {
                                // Create embed for staff log
                                const logEmbed = new EmbedBuilder()
                                    .setTitle('💌 Warkah Confession Baru')
                                    .setColor('#FF69B4')
                                    .setThumbnail(interaction.user.displayAvatarURL())
                                    .addFields(
                                        { name: '👤 Pengirim', value: `${interaction.user.tag}`, inline: true },
                                        { name: '📝 Isi Pesan', value: `\`\`\`${inputContentValue}\`\`\`` }
                                    )
                                    .setTimestamp();

                                await logChannel.send({ embeds: [logEmbed] });
                            } catch (logError) {
                                console.error('Error sending to log channel:', logError);
                                // Don't fail the main operation if logging fails
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

                            // ALSO send to the staff log channel
                            const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                            if (logChannel) {
                                try {
                                    const logEmbed = new EmbedBuilder()
                                        .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                        .setColor('#811331')
                                        .setThumbnail(interaction.user.displayAvatarURL())
                                        .setDescription(replyContent)
                                        .addFields(
                                            { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                            { name: '📅 Status', value: 'Terkirim', inline: true },
                                            { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                        )
                                        .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                        .setTimestamp();

                                    await logChannel.send({ embeds: [logEmbed] });
                                } catch (logError) {
                                    console.error('Error sending to log channel:', logError);
                                    // Don't fail the main operation if logging fails
                                }
                            }
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

                            // ALSO send to the staff log channel
                            const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                            if (logChannel) {
                                try {
                                    const logEmbed = new EmbedBuilder()
                                        .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                        .setColor('#811331')
                                        .setThumbnail(interaction.user.displayAvatarURL())
                                        .setDescription(replyContent)
                                        .addFields(
                                            { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                            { name: '📅 Status', value: 'Terkirim', inline: true },
                                            { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                        )
                                        .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                        .setTimestamp();

                                    await logChannel.send({ embeds: [logEmbed] });
                                } catch (logError) {
                                    console.error('Error sending to log channel:', logError);
                                    // Don't fail the main operation if logging fails
                                }
                            }
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

                                // ALSO send to the staff log channel
                                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                if (logChannel) {
                                    try {
                                        const logEmbed = new EmbedBuilder()
                                            .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                            .setColor('#811331')
                                            .setThumbnail(interaction.user.displayAvatarURL())
                                            .setDescription(replyContent)
                                            .addFields(
                                                { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                { name: '📅 Status', value: 'Terkirim', inline: true },
                                                { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                            )
                                            .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                            .setTimestamp();

                                        await logChannel.send({ embeds: [logEmbed] });
                                    } catch (logError) {
                                        console.error('Error sending to log channel:', logError);
                                        // Don't fail the main operation if logging fails
                                    }
                                }
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

                                    // ALSO send to the staff log channel
                                    const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                    if (logChannel) {
                                        try {
                                            const logEmbed = new EmbedBuilder()
                                                .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                                .setColor('#811331')
                                                .setThumbnail(interaction.user.displayAvatarURL())
                                                .setDescription(replyContent)
                                                .addFields(
                                                    { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                    { name: '📅 Status', value: 'Terkirim', inline: true },
                                                    { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                                )
                                                .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                                .setTimestamp();

                                            await logChannel.send({ embeds: [logEmbed] });
                                        } catch (logError) {
                                            console.error('Error sending to log channel:', logError);
                                            // Don't fail the main operation if logging fails
                                        }
                                    }
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

                                // ALSO send to the staff log channel
                                const logChannel = interaction.guild.channels.cache.get(process.env.FEEDBACK_LOG_CHANNEL_ID);
                                if (logChannel) {
                                    try {
                                        const logEmbed = new EmbedBuilder()
                                            .setTitle(`✉️ Balasan untuk Surat #${letterId}`)
                                            .setColor('#811331')
                                            .setThumbnail(interaction.user.displayAvatarURL())
                                            .setDescription(replyContent)
                                            .addFields(
                                                { name: '✍️ Dari', value: replyDisplayName, inline: true },
                                                { name: '📅 Status', value: 'Terkirim', inline: true },
                                                { name: '🆔 Surat Tujuan', value: `#${letterId}`, inline: true }
                                            )
                                            .setFooter({ text: `Original Sender ID: ${interaction.user.id}` }) // Tetap simpan ID asli di footer kecil buat admin
                                            .setTimestamp();

                                        await logChannel.send({ embeds: [logEmbed] });
                                    } catch (logError) {
                                        console.error('Error sending to log channel:', logError);
                                        // Don't fail the main operation if logging fails
                                    }
                                }
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
        if (interaction.replied || interaction.deferred) {
            try {
                await interaction.followUp({ content: 'An unexpected error occurred.', ephemeral: true });
            } catch (followUpError) {
                console.error('Failed to send follow-up error message:', followUpError);
            }
        } else {
            try {
                await interaction.reply({ content: 'An unexpected error occurred.', ephemeral: true });
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    }
}

// Note: The message event listener should be in a separate file for better organization
// This is just a reference to where the message event should be implemented