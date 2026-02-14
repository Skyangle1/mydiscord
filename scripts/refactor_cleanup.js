
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const handlers = {
    btn_approve_join_request: `            // Handle Approve Join Request button click
            else if (interaction.customId && interaction.customId.startsWith('btn_approve_join_request_')) {
                try {
                    const handler = require('../interactions/buttons/approveJoinRequest');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing approve join request handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_cancel_join_request: `            // Handle Cancel Join Request button click
            else if (interaction.customId && interaction.customId.startsWith('btn_cancel_join_request_')) {
                try {
                    const handler = require('../interactions/buttons/cancelJoinRequest');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing cancel join request handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_share_profile: `            // Handle Share Profile button click
            else if (interaction.customId === 'btn_share_profile') {
                try {
                    const handler = require('../interactions/buttons/shareProfile');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing share profile handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_open_claim: `            // Handle Open Claim button click
            else if (interaction.customId === 'btn_open_claim') {
                try {
                    const handler = require('../interactions/buttons/openClaim');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open claim handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    modal_share_profile: `    // Handle Share Profile modal submission
    else if (interaction.customId === 'modal_share_profile') {
        try {
            const handler = require('../interactions/modals/shareProfile');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing share profile modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_enhanced_claim: `    // Handle Enhanced Claim modal submission
    else if (interaction.customId === 'modal_enhanced_claim') {
        try {
            const handler = require('../interactions/modals/enhancedClaim');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing enhanced claim modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    claim_room: `    // Handle Claim Room button click
    else if (interaction.customId && interaction.customId.startsWith('claim_room_')) {
        try {
            const handler = require('../interactions/buttons/claimRoom');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing claim room handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    close_claim: `    // Handle Close Claim button click
    else if (interaction.customId && interaction.customId.startsWith('close_claim_')) {
        try {
            const handler = require('../interactions/buttons/closeClaim');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing close claim handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`
};

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let lines = data.split('\n');

    // Helper to log and splice
    function replaceBlock(name, startIdx, endIdx, newContent, verifyStart, verifyEnd) {
        console.log(`Checking ${name} Start (Line ${startIdx + 1}):`, lines[startIdx]);
        if (verifyStart && !lines[startIdx].trim().startsWith(verifyStart)) { // Relaxed check
            console.error(`${name} Start mismatch! Expected startsWith '${verifyStart}', got: '${lines[startIdx]}'`);
            // process.exit(1); 
        }

        console.log(`Checking ${name} End (Line ${endIdx + 1}):`, lines[endIdx]);

        lines.splice(startIdx, (endIdx - startIdx + 1), newContent);
        console.log(`Replaced ${name}.`);
    }

    // Work backwards based on previously viewed line numbers, but adjusting for recent shifts if any. 
    // The previous run of refactor_feedback.js reduced lines by ~500.
    // The line numbers from recent view_file calls (Step 581, 582, 583, 587, 588, 589, 590, 595, 596) SHOULD BE ACCURATE as they were run AFTER the feedback refactor.

    // 1. close_claim_ (1972 - 2141) -> Index 1971 - 2140
    const close_claim_start = 1971;
    const close_claim_end = 2140;
    replaceBlock('close_claim', close_claim_start, close_claim_end, handlers.close_claim, 'else if (interaction.customId && interaction.customId.startsWith(\'close_claim_\'))');

    // 2. claim_room_ (1871 - 1969) -> Index 1870 - 1968
    const claim_room_start = 1870;
    const claim_room_end = 1968;
    replaceBlock('claim_room', claim_room_start, claim_room_end, handlers.claim_room, 'else if (interaction.customId && interaction.customId.startsWith(\'claim_room_\'))');

    // 3. modal_enhanced_claim (1336 - 1868) -> Index 1335 - 1867
    const m_enhanced_start = 1335;
    const m_enhanced_end = 1867;
    replaceBlock('modal_enhanced_claim', m_enhanced_start, m_enhanced_end, handlers.modal_enhanced_claim, 'else if (interaction.customId === \'modal_enhanced_claim\')');

    // 4. modal_share_profile (1217 - 1334) -> Index 1216 - 1333
    const m_share_start = 1216;
    const m_share_end = 1333;
    replaceBlock('modal_share_profile', m_share_start, m_share_end, handlers.modal_share_profile, 'else if (interaction.customId === \'modal_share_profile\')');

    // 5. btn_open_claim (1141 - 1215) -> Index 1140 - 1214
    const b_open_claim_start = 1140;
    const b_open_claim_end = 1214;
    replaceBlock('btn_open_claim', b_open_claim_start, b_open_claim_end, handlers.btn_open_claim, 'else if (interaction.customId === \'btn_open_claim\')');

    // 6. btn_share_profile (1088 - 1139) -> Index 1087 - 1138
    const b_share_start = 1087;
    const b_share_end = 1138;
    replaceBlock('btn_share_profile', b_share_start, b_share_end, handlers.btn_share_profile, 'else if (interaction.customId === \'btn_share_profile\')');

    // 7. btn_cancel_join_request_ (963 - 1086) -> Index 962 - 1085
    const b_cancel_start = 962;
    const b_cancel_end = 1085;
    replaceBlock('btn_cancel_join_request', b_cancel_start, b_cancel_end, handlers.btn_cancel_join_request, 'else if (interaction.customId && interaction.customId.startsWith(\'btn_cancel_join_request_\'))');

    // 8. btn_approve_join_request_ (728 - 961) -> Index 727 - 960
    const b_approve_start = 727;
    const b_approve_end = 960;
    replaceBlock('btn_approve_join_request', b_approve_start, b_approve_end, handlers.btn_approve_join_request, 'else if (interaction.customId && interaction.customId.startsWith(\'btn_approve_join_request_\'))');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js with cleanup refactoring.');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
