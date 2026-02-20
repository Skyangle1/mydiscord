const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const interactionCache = new Set();

module.exports = async (client, interaction) => {
    try {
        // Deduplication: Ignore if interaction already processing
        if (interactionCache.has(interaction.id)) return;
        interactionCache.add(interaction.id);
        setTimeout(() => interactionCache.delete(interaction.id), 3000); // Clear after 3s

        // Log all interactions for debugging
        if (interaction.isButton() || interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
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

            // Dynamic button handler loading
            let handlerFound = false;

            // Look for pattern-matching handlers
            const buttonFiles = require('fs').readdirSync('./interactions/buttons').filter(file => file.endsWith('.js'));

            for (const file of buttonFiles) {
                try {
                    const handler = require(`../interactions/buttons/${file}`);

                    // Check if handler has a regex pattern that matches the customId
                    if (handler.customId instanceof RegExp && handler.customId.test(interaction.customId)) {
                        await handler.execute(interaction);
                        handlerFound = true;
                        break;
                    }
                    // Check if handler has a string customId that matches exactly
                    else if (typeof handler.customId === 'string' && interaction.customId === handler.customId) {
                        await handler.execute(interaction);
                        handlerFound = true;
                        break;
                    }
                    // Check if handler has a string customId that the interaction.customId starts with
                    else if (typeof handler.customId === 'string' && interaction.customId.startsWith(handler.customId)) {
                        await handler.execute(interaction);
                        handlerFound = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error loading button handler ${file}:`, error);
                }
            }

            if (!handlerFound) {
                console.log('Unrecognized button interaction received:', interaction.customId);

                // Try to handle specific known button IDs that might not have been loaded properly
                if (interaction.customId === 'btn_open_letter_modal') {
                    try {
                        const handler = require('../interactions/buttons/openLetter');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open letter handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_cari_jodoh') {
                    try {
                        const handler = require('../interactions/buttons/cariJodoh');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing cari jodoh handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_cari_teman') {
                    try {
                        const handler = require('../interactions/buttons/cariTeman');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing cari teman handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_open_claim') {
                    try {
                        const handler = require('../interactions/buttons/openClaim');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open claim handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_open_saran') {
                    try {
                        const handler = require('../interactions/buttons/openSaran');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open saran handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_open_curhat') {
                    try {
                        const handler = require('../interactions/buttons/openCurhat');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open curhat handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_open_feedback') {
                    try {
                        const handler = require('../interactions/buttons/openFeedback');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open feedback handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_share_profile') {
                    try {
                        const handler = require('../interactions/buttons/shareProfile');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing share profile handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_reply_')) {
                    try {
                        const handler = require('../interactions/buttons/reply');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing reply handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_additional_reply_')) {
                    try {
                        const handler = require('../interactions/buttons/additionalReply');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing additional reply handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_chat_me_')) {
                    try {
                        const handler = require('../interactions/buttons/chatMe');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing chat me handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_open_saran_from_msg')) {
                    try {
                        const handler = require('../interactions/buttons/openSaranFromMsg');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open saran from msg handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('claim_room_')) {
                    try {
                        const handler = require('../interactions/buttons/claimRoom');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing claim room handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('close_claim_')) {
                    try {
                        const handler = require('../interactions/buttons/closeClaim');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing close claim handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_approve_claim_')) {
                    try {
                        const handler = require('../interactions/buttons/approveClaim');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing approve claim handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_reject_claim_')) {
                    try {
                        const handler = require('../interactions/buttons/rejectClaim');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing reject claim handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_approve_join_request_')) {
                    try {
                        const handler = require('../interactions/buttons/approveJoinRequest');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing approve join request handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('btn_cancel_join_request_')) {
                    try {
                        const handler = require('../interactions/buttons/cancelJoinRequest');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing cancel join request handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_build_family') {
                    try {
                        const handler = require('../interactions/buttons/buildFamily');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing build family handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_join_family') {
                    try {
                        const handler = require('../interactions/buttons/joinFamily');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing join family handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_list_families') {
                    try {
                        const handler = require('../interactions/buttons/listFamilies');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing list families handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('join_family_request_')) {
                    try {
                        const handler = require('../interactions/buttons/joinFamilyRequest');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing join family request handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('approve_family_')) {
                    try {
                        const handler = require('../interactions/buttons/approveFamilyRequest');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing approve family handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('reject_family_')) {
                    try {
                        const handler = require('../interactions/buttons/rejectFamilyRequest');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing reject family handler:', error);
                    }
                }
                else if (interaction.customId === 'btn_open_hiring_news') {
                    try {
                        const handler = require('../interactions/buttons/openHiringNews');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing open hiring news handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('approve_hiring_')) {
                    try {
                        const handler = require('../interactions/buttons/approveHiring');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing approve hiring handler:', error);
                    }
                }
                else if (interaction.customId.startsWith('reject_hiring_')) {
                    try {
                        const handler = require('../interactions/buttons/rejectHiring');
                        await handler.execute(interaction);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing reject hiring handler:', error);
                    }
                }

                if (!handlerFound) {
                    try {
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({
                                content: 'Tombol ini tidak dikenali oleh sistem. Silakan coba lagi atau hubungi administrator.',
                                ephemeral: true
                            });
                        }
                    } catch (replyError) {
                        console.error('Error sending unrecognized button response:', replyError);
                    }
                }
            }
        }
        else if (interaction.isStringSelectMenu()) {
            console.log('Interaksi Menu Diterima:', interaction.customId);

            let handlerFound = false;
            const menuFiles = require('fs').readdirSync('./interactions/selectMenus').filter(file => file.endsWith('.js'));

            for (const file of menuFiles) {
                try {
                    const handler = require(`../interactions/selectMenus/${file}`);
                    if (handler.customId === interaction.customId) {
                        await handler.execute(interaction, client);
                        handlerFound = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error loading select menu handler ${file}:`, error);
                }
            }

            if (!handlerFound) {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: 'Menu ini tidak dikenali oleh sistem.',
                        ephemeral: true
                    });
                }
            }
        }

        // Handle Modal Submissions
        else if (interaction.isModalSubmit()) {
            console.log('--- DEBUG MODAL ---');
            console.log('ID yang Diterima:', `"${interaction.customId}"`);

            // Dynamic modal handler loading
            let handlerFound = false;

            // Look for pattern-matching handlers
            const modalFiles = require('fs').readdirSync('./interactions/modals').filter(file => file.endsWith('.js'));

            for (const file of modalFiles) {
                try {
                    const handler = require(`../interactions/modals/${file}`);

                    // Check if handler has a regex pattern that matches the customId
                    if (handler.customId instanceof RegExp && handler.customId.test(interaction.customId)) {
                        await handler.execute(interaction, client);
                        handlerFound = true;
                        break;
                    }
                    // Check if handler has a string customId that matches exactly
                    else if (typeof handler.customId === 'string' && interaction.customId === handler.customId) {
                        await handler.execute(interaction, client);
                        handlerFound = true;
                        break;
                    }
                    // Check if handler has a string customId that the interaction.customId starts with
                    else if (typeof handler.customId === 'string' && interaction.customId.startsWith(handler.customId)) {
                        await handler.execute(interaction, client);
                        handlerFound = true;
                        break;
                    }
                } catch (error) {
                    console.error(`Error loading modal handler ${file}:`, error);
                }
            }

            if (!handlerFound) {
                if (interaction.customId.startsWith('modal_join_request_')) {
                    try {
                        const handler = require('../interactions/modals/submitFamilyJoin');
                        await handler.execute(interaction, client);
                        handlerFound = true;
                    } catch (error) {
                        console.error('Error executing fallback submit family join handler:', error);
                    }
                }

                if (!handlerFound) {
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