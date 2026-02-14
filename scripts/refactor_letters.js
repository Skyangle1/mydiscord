
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const handlers = {
    btn_open_letter_modal: `            // Handle the button click to open modal
            if (interaction.customId === 'btn_open_letter_modal') {
                try {
                    const handler = require('../interactions/buttons/openLetter');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open letter handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_reply: `            // Handle reply button clicks
            else if (interaction.customId && interaction.customId.startsWith('btn_reply_')) {
                try {
                    const handler = require('../interactions/buttons/reply');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing reply handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_additional_reply: `            // Handle additional reply button clicks in threads
            else if (interaction.customId && interaction.customId.startsWith('btn_additional_reply_')) {
                try {
                    const handler = require('../interactions/buttons/additionalReply');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing additional reply handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    modal_letter_submit: `    // Handle modal submission for new letter
    else if (interaction.customId && interaction.customId === 'modal_letter_submit') {
        try {
            const handler = require('../interactions/modals/letter');
            await handler.execute(interaction, client);
        } catch (error) {
            console.error('Error executing letter modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_reply_submit: `    // Handle modal submission for reply
    else if (interaction.customId && interaction.customId.startsWith('modal_reply_submit_')) {
        try {
            const handler = require('../interactions/modals/reply');
            await handler.execute(interaction, client);
        } catch (error) {
            console.error('Error executing reply modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_additional_reply: `    // Handle additional replies in threads
    else if (interaction.customId && interaction.customId.startsWith('modal_additional_reply_')) {
        try {
            const handler = require('../interactions/modals/additionalReply');
            await handler.execute(interaction, client);
        } catch (error) {
            console.error('Error executing additional reply modal handler:', error);
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

    // Work backwards

    // 1. modal_additional_reply (1741 - 1975) -> Index 1740 - 1974
    const m_add_start = 1740;
    const m_add_end = 1974;
    replaceBlock('modal_additional_reply', m_add_start, m_add_end, handlers.modal_additional_reply, 'modal_additional_reply_');

    // 2. modal_reply_submit (1530 - 1739) -> Index 1529 - 1738
    const m_reply_start = 1529;
    const m_reply_end = 1738;
    replaceBlock('modal_reply_submit', m_reply_start, m_reply_end, handlers.modal_reply_submit, 'modal_reply_submit_');

    // 3. modal_letter_submit (1169 - 1528) -> Index 1168 - 1527
    const m_letter_start = 1168;
    const m_letter_end = 1527;
    replaceBlock('modal_letter_submit', m_letter_start, m_letter_end, handlers.modal_letter_submit, 'modal_letter_submit');

    // 4. btn_additional_reply (160 - 189) -> Index 159 - 188
    const b_add_start = 159;
    const b_add_end = 188;
    replaceBlock('btn_additional_reply', b_add_start, b_add_end, handlers.btn_additional_reply, 'btn_additional_reply_');

    // 5. btn_reply (129 - 158) -> Index 128 - 157
    const b_reply_start = 128;
    const b_reply_end = 157;
    replaceBlock('btn_reply', b_reply_start, b_reply_end, handlers.btn_reply, 'btn_reply_');

    // 6. btn_open_letter_modal (59 - 106) -> Index 58 - 105
    // Need to verify 106 is '}'
    const b_open_start = 58;
    const b_open_end = 105; // 106 minus 1
    replaceBlock('btn_open_letter_modal', b_open_start, b_open_end, handlers.btn_open_letter_modal, 'btn_open_letter_modal');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
