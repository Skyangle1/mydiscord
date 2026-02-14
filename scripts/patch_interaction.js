
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');
const rejectDispatcher = `            // Handle Reject Claim button click
            else if (interaction.customId && interaction.customId.startsWith('btn_reject_claim_')) {
                try {
                    const handler = require('../interactions/buttons/rejectClaim');
                    await handler.execute(interaction);
                } catch (error) {
                    console.error('Error executing reject claim handler:', error);
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({
                            content: 'Terjadi kesalahan internal saat memproses penolakan klaim.',
                            ephemeral: true
                        });
                    }
                }
            }`;

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    // Find where to insert (Line 683 in 1-based, index 682)
    // We are looking for the line that starts with .setTitle in the current broken state
    // OR the comment "// Handle Reject Claim button click" which is at line 682 (index 681)

    let insertIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '// Handle Reject Claim button click') {
            insertIndex = i;
            break;
        }
    }

    if (insertIndex === -1) {
        console.error('Could not find insertion point.');
        process.exit(1);
    }

    // We want to replace the comment line and insert the block
    // AND keep the broken code below it but maybe comment it out or separate it?

    // Actually, the comment is part of the new block I constructed in string above.
    // So I can replace lines[insertIndex] with nothing (remove it) and insert the block.

    // But wait, the lines BELOW (the broken ones) need to be handled.
    // The broken lines start at insertIndex + 1.

    const newLines = [
        ...lines.slice(0, insertIndex),
        rejectDispatcher,
        '            /* BROKEN CODE SECTION - MISSING CONTEXT */',
        ...lines.slice(insertIndex + 1)
    ];

    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('File patched with reject dispatcher.');

} catch (err) {
    console.error('Error:', err);
}
