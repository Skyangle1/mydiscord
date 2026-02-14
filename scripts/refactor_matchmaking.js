
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const handlers = {
    btn_cari_jodoh: `            // Handle matchmaking button click
            else if (interaction.customId === 'btn_cari_jodoh') {
                try {
                    const handler = require('../interactions/buttons/cariJodoh');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing cari jodoh handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_cari_teman: `            // Handle friend-finding button click
            else if (interaction.customId === 'btn_cari_teman') {
                try {
                    const handler = require('../interactions/buttons/cariTeman');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing cari teman handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    modal_cari_jodoh: `    // Handle Find Match modal submission
    else if (interaction.customId === 'modal_cari_jodoh') {
        try {
            const handler = require('../interactions/modals/cariJodoh');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing cari jodoh modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_cari_teman: `    // Handle Friend-Finding modal submission
    else if (interaction.customId === 'modal_cari_teman') {
        try {
            const handler = require('../interactions/modals/cariTeman');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing cari teman modal handler:', error);
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
        // Verification similar to previous script
        // Indices are 0-based
        console.log(`Checking ${name} Start (Line ${startIdx + 1}):`, lines[startIdx]);
        if (verifyStart && !lines[startIdx].includes(verifyStart)) {
            console.error(`${name} Start mismatch! Expected '${verifyStart}'`);
            // process.exit(1); 
        }

        console.log(`Checking ${name} End (Line ${endIdx + 1}):`, lines[endIdx]);
        // verifyEnd logic can be added if needed

        lines.splice(startIdx, (endIdx - startIdx + 1), newContent);
        console.log(`Replaced ${name}.`);
    }

    // 1. modal_cari_teman (1107 - 1252) -> Index 1106 - 1251
    // Step 402 says line 1107 is 'else if (interaction.customId && interaction.customId === 'modal_cari_teman')'
    // Step 403 says line 1252 is '}'
    const m_teman_start = 1106; // Line 1107
    const m_teman_end = 1251;   // Line 1252
    replaceBlock('modal_cari_teman', m_teman_start, m_teman_end, handlers.modal_cari_teman, 'modal_cari_teman');

    // 2. modal_cari_jodoh (960 - 1105) -> Index 959 - 1104
    // Step 391 says line 960 is 'if (interaction.customId && interaction.customId === 'modal_cari_jodoh')'
    // Step 402 says line 1105 is '}' then 1106 is blank/comment
    const m_jodoh_start = 959; // Line 960
    const m_jodoh_end = 1104;  // Line 1105
    replaceBlock('modal_cari_jodoh', m_jodoh_start, m_jodoh_end, handlers.modal_cari_jodoh, 'modal_cari_jodoh');

    // 3. Debug logging (932 - 958) -> Index 931 - 957
    // Step 391 says 932 is 'if (interaction.customId && interaction.customId === 'modal_cari_jodoh')' (The debug one)
    // Ends at 957 '}' (else block)
    // 958 is blank
    const debug_start = 931; // Line 932
    const debug_end = 957;   // Line 958
    // replace with empty string or comment? Empty string removes the block.
    // lines.splice(debug_start, (debug_end - debug_start + 1)); // This removes lines entirely
    // Wait, replacing with empty string adds an empty line. Removing removes the index.
    // If I use splice to remove, lines shift.
    // BUT I am working backwards relative to file, but I am modifying the array `lines`.
    // Changes at 1100 don't affect indices at 930.
    // So removing 930s is safe for subsequent steps (100s).
    replaceBlock('Debug Logging', debug_start, debug_end, '', 'modal_cari_jodoh');

    // 4. btn_cari_teman (169 - 236) -> Index 168 - 235
    // Step 395 says 169 is 'else if (interaction.customId === 'btn_cari_teman')'
    // Step 417 says 236 is '}'
    const b_teman_start = 168; // Line 169
    const b_teman_end = 235;   // Line 236
    replaceBlock('btn_cari_teman', b_teman_start, b_teman_end, handlers.btn_cari_teman, 'btn_cari_teman');

    // 5. btn_cari_jodoh (103 - 167) -> Index 102 - 166
    // Step 390 says 103 is 'else if (interaction.customId === 'btn_cari_jodoh')'
    // Step 395 says 167 is '}'
    const b_jodoh_start = 102; // Line 103
    const b_jodoh_end = 166;   // Line 167
    replaceBlock('btn_cari_jodoh', b_jodoh_start, b_jodoh_end, handlers.btn_cari_jodoh, 'btn_cari_jodoh');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
