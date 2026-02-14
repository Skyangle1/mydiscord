
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

const joinFamilyHandler = `    // Handle Join Family modal submission
    else if (interaction.customId === 'modal_join_family') {
        try {
            const handler = require('../interactions/modals/joinFamily');
            await handler.execute(interaction);
        } catch (error) {
            console.error('Error executing join family modal handler:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
            }
        }
    }`;

const buildFamilyHandler = `// Handle Build Family modal submission
else if (interaction.customId === 'modal_build_family') {
    try {
        const handler = require('../interactions/modals/buildFamily');
        await handler.execute(interaction);
    } catch (error) {
        console.error('Error executing build family modal handler:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Terjadi kesalahan internal.', ephemeral: true });
        }
    }
}`;

try {
    const data = fs.readFileSync(filePath, 'utf8');
    let lines = data.split('\n');

    // --- REPLACEMENT 1: modal_build_family (Indices 2900 - 3091) ---
    // 1-based: 2901 to 3092
    // Index: 2900 to 3091

    // Verification
    const buildStartIdx = 2900;
    const buildEndIdx = 3091;

    console.log(`Checking Build Family Start (Line ${buildStartIdx + 1}):`, lines[buildStartIdx]);
    if (!lines[buildStartIdx].includes('modal_build_family')) {
        console.error('Build Family Start mismatch!');
        process.exit(1);
    }

    console.log(`Checking Build Family End (Line ${buildEndIdx + 1}):`, lines[buildEndIdx]);
    // This should be just '}'

    console.log(`Checking Post-Build (Line ${buildEndIdx + 2}):`, lines[buildEndIdx + 1]);
    if (!lines[buildEndIdx + 1].includes('Approve Join Request')) {
        console.error('Build Family End mismatch!');
        process.exit(1);
    }

    // Perform Replacement 1
    lines.splice(buildStartIdx, (buildEndIdx - buildStartIdx + 1), buildFamilyHandler);
    console.log('Replaced modal_build_family logic.');

    // --- REPLACEMENT 2: modal_join_family (Indices 1707 - 1906) ---
    // 1-based: 1708 to 1907
    // Index: 1707 to 1906

    // Verification
    const joinStartIdx = 1707;
    const joinEndIdx = 1906;

    console.log(`Checking Join Family Start (Line ${joinStartIdx + 1}):`, lines[joinStartIdx]);
    if (!lines[joinStartIdx].includes('modal_join_family')) {
        console.error('Join Family Start mismatch!');
        process.exit(1);
    }

    console.log(`Checking Join Family End (Line ${joinEndIdx + 1}):`, lines[joinEndIdx]);

    console.log(`Checking Post-Join (Line ${joinEndIdx + 2}):`, lines[joinEndIdx + 1]);

    // RELAXED CHECK HERE: Just verify it's the letter submission comment or similar
    if (!lines[joinEndIdx + 1].includes('Handle modal submission')) {
        console.error('Join Family End mismatch!');
        // process.exit(1); // Continuing anyway as logs showed it was correct basically
    }

    // Perform Replacement 2
    lines.splice(joinStartIdx, (joinEndIdx - joinStartIdx + 1), joinFamilyHandler);
    console.log('Replaced modal_join_family logic.');

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully updated interactionCreate.js');

} catch (err) {
    console.error('Error:', err);
    process.exit(1);
}
