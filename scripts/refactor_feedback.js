
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const handlers = {
    btn_open_saran: `            // Handle Open Feedback button click
            else if (interaction.customId === 'btn_open_saran') {
                try {
                    const handler = require('../interactions/buttons/openSaran');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open saran handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_open_curhat: `            // Handle Open Curhat button click
            else if (interaction.customId === 'btn_open_curhat') {
                try {
                    const handler = require('../interactions/buttons/openCurhat');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open curhat handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_open_feedback: `            // Handle Open Feedback button click
            else if (interaction.customId === 'btn_open_feedback') {
                try {
                    const handler = require('../interactions/buttons/openFeedback');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open feedback handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    btn_open_saran_from_msg: `            // Handle Open Feedback button click from message
            else if (interaction.customId === 'btn_open_saran_from_msg') {
                try {
                    const handler = require('../interactions/buttons/openSaranFromMsg');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing open saran from msg handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
                    }
                }
            }`,
    modal_saran_user: `    // Handle Feedback modal submission (for the feedback button)
    else if (interaction.customId && interaction.customId === 'modal_saran_user') {
        try {
            const handler = require('../interactions/modals/saran');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing saran modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_saran_user_from_msg: `    // Handle Feedback modal submission (for the feedback button from message)
    else if (interaction.customId && interaction.customId === 'modal_saran_user_from_msg') {
        try {
            const handler = require('../interactions/modals/saranFromMsg');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing saran from msg modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    modal_curhat_user: `    // Handle Curhat modal submission
    else if (interaction.customId && interaction.customId === 'modal_curhat_user') {
        try {
            const handler = require('../interactions/modals/curhat');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing curhat modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`,
    feedbackModal: `// Handle feedback modal submission
else if (interaction.customId === 'feedbackModal') {
    try {
        const handler = require('../interactions/modals/feedback');
        await handler.execute(interaction);
    } catch (error) {
        console.error('Error executing feedback modal handler:', error);
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
            // process.exit(1); 
        }

        console.log(`Checking ${name} End (Line ${endIdx + 1}):`, lines[endIdx]);

        lines.splice(startIdx, (endIdx - startIdx + 1), newContent);
        console.log(`Replaced ${name}.`);
    }

    // Work backwards

    // 1. feedbackModal (1136 - 1318) -> Index 1135 - 1317
    const m_feedback_start = 1135;
    const m_feedback_end = 1317;
    replaceBlock('feedbackModal', m_feedback_start, m_feedback_end, handlers.feedbackModal, 'feedbackModal');

    // 2. modal_curhat_user (972 - 1082) -> Index 971 - 1081
    const m_curhat_start = 971;
    const m_curhat_end = 1081;
    replaceBlock('modal_curhat_user', m_curhat_start, m_curhat_end, handlers.modal_curhat_user, 'modal_curhat_user');

    // 3. modal_saran_user_from_msg (856 - 970) -> Index 855 - 969
    const m_saran_msg_start = 855;
    const m_saran_msg_end = 969;
    replaceBlock('modal_saran_user_from_msg', m_saran_msg_start, m_saran_msg_end, handlers.modal_saran_user_from_msg, 'modal_saran_user_from_msg');

    // 4. modal_saran_user (740 - 854) -> Index 739 - 853
    const m_saran_start = 739;
    const m_saran_end = 853;
    replaceBlock('modal_saran_user', m_saran_start, m_saran_end, handlers.modal_saran_user, 'modal_saran_user');

    // 5. btn_open_saran_from_msg (345 - 377) -> Index 344 - 376
    const b_saran_msg_start = 344;
    const b_saran_msg_end = 376;
    replaceBlock('btn_open_saran_from_msg', b_saran_msg_start, b_saran_msg_end, handlers.btn_open_saran_from_msg, 'btn_open_saran_from_msg');

    // 6. btn_open_feedback (212 - 277) -> Index 211 - 276
    const b_feedback_start = 211;
    const b_feedback_end = 276;
    replaceBlock('btn_open_feedback', b_feedback_start, b_feedback_end, handlers.btn_open_feedback, 'btn_open_feedback');

    // 7. btn_open_curhat (169 - 210) -> Index 168 - 209
    const b_curhat_start = 168;
    const b_curhat_end = 209;
    replaceBlock('btn_open_curhat', b_curhat_start, b_curhat_end, handlers.btn_open_curhat, 'btn_open_curhat');

    // 8. btn_open_saran (132 - 167) -> Index 131 - 166
    const b_saran_start = 131;
    const b_saran_end = 166;
    replaceBlock('btn_open_saran', b_saran_start, b_saran_end, handlers.btn_open_saran, 'btn_open_saran');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
