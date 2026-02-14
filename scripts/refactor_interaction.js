
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');
const newLogic = `            // Handle Reject Claim button click
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

    // We want to keep lines 0 to 681 (which is line 1 to 682 in 1-based indexing)
    // Line 683 (index 682) starts the block to remove
    // Line 826 (index 825) is the last line to remove
    // We keep line 827 (index 826) onwards.

    // BUT we must verify the content of the lines we are removing to be safe.
    const startLineIndex = 682; // Line 683
    const endLineIndex = 825;   // Line 826

    console.log('Verifying content at start of deletion (Line 683):', lines[startLineIndex]);
    if (!lines[startLineIndex].includes('else if (interaction.customId && interaction.customId.startsWith(\'btn_reject_claim_\'))')) {
        console.error('Start line mismatch! Aborting.');
        process.exit(1);
    }

    console.log('Verifying content at end of deletion (Line 826):', lines[endLineIndex]);
    if (!lines[endLineIndex].trim() === '}') { // Checking close brace
        // This check is weak, let's check the NEXT line (Line 827)
    }

    const nextLineIndex = 826; // Line 827
    console.log('Verifying content AFTER deletion (Line 827):', lines[nextLineIndex]);
    if (!lines[nextLineIndex].includes('btn_open_saran_from_msg')) {
        console.error('End line mismatch! Aborting.');
        process.exit(1);
    }

    const newLines = [
        ...lines.slice(0, startLineIndex),
        newLogic,
        ...lines.slice(nextLineIndex)
    ];

    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log('File successfully updated.');

} catch (err) {
    console.error('Error:', err);
}
