
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const handlers = {
    btn_chat_me: `            // Handle Chat Me button click
            else if (interaction.customId && interaction.customId.startsWith('btn_chat_me_')) {
                try {
                    const handler = require('../interactions/buttons/chatMe');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing chat me handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    modal_chat_me: `    // Handle Chat Me modal submission
    else if (interaction.customId && interaction.customId.startsWith('modal_chat_me_')) {
        try {
            const handler = require('../interactions/modals/chatMe');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing chat me modal handler:', error);
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
        if (verifyStart && !lines[startIdx].includes(verifyStart)) {
            console.error(`${name} Start mismatch! Expected '${verifyStart}'`);
            process.exit(1);
        }

        console.log(`Checking ${name} End (Line ${endIdx + 1}):`, lines[endIdx]);

        lines.splice(startIdx, (endIdx - startIdx + 1), newContent);
        console.log(`Replaced ${name}.`);
    }

    // 1. modal_chat_me (851 - 959) -> Index 850 - 958
    // Step 444 says line 851 is 'else if (interaction.customId && interaction.customId.startsWith('modal_chat_me_'))'
    // Step 450 says line 959 is '}' and line 960 is '// Handle Feedback modal'
    const m_chat_start = 850; // Line 851
    const m_chat_end = 958;   // Line 959
    replaceBlock('modal_chat_me', m_chat_start, m_chat_end, handlers.modal_chat_me, 'modal_chat_me_');

    // 2. btn_chat_me (191 - 254) -> Index 190 - 253
    // Step 443 says line 191 is 'else if (interaction.customId && interaction.customId.startsWith('btn_chat_me_'))'
    // Step 449 says line 254 is '}' and 255 is '// Handle Open Feedback'
    const b_chat_start = 190; // Line 191
    const b_chat_end = 253;   // Line 254
    replaceBlock('btn_chat_me', b_chat_start, b_chat_end, handlers.btn_chat_me, 'btn_chat_me_');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
