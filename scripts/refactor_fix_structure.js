
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../events/interactionCreate.js');

try {
    let data = fs.readFileSync(filePath, 'utf8');
    let lines = data.split('\n');

    // Helper to find block bounds
    function findBlock(searchStart, identifier) {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(identifier)) {
                // Find closing brace
                let braceCount = 0;
                let endIdx = -1;
                for (let j = i; j < lines.length; j++) {
                    braceCount += (lines[j].match(/{/g) || []).length;
                    braceCount -= (lines[j].match(/}/g) || []).length;
                    if (braceCount === 0) {
                        endIdx = j;
                        return { start: i, end: endIdx };
                    }
                }
            }
        }
        return null;
    }

    // 1. Extract claim_room and close_claim blocks
    const claimRoomBlock = findBlock(0, "interaction.customId.startsWith('claim_room_')");
    const closeClaimBlock = findBlock(0, "interaction.customId.startsWith('close_claim_')");

    let claimRoomContent = "";
    let closeClaimContent = "";

    if (claimRoomBlock && closeClaimBlock) {
        // We extract in reverse order to not mess up indices
        // Assuming closeClaim comes after claimRoom
        closeClaimContent = lines.slice(closeClaimBlock.start, closeClaimBlock.end + 1).join('\n');
        claimRoomContent = lines.slice(claimRoomBlock.start, claimRoomBlock.end + 1).join('\n');

        // Remove them from original location
        // Remove closeClaim first (higher index)
        lines.splice(closeClaimBlock.start, closeClaimBlock.end - closeClaimBlock.start + 1);
        lines.splice(claimRoomBlock.start, claimRoomBlock.end - claimRoomBlock.start + 1);

        console.log("Extracted claim_room and close_claim blocks.");
    }

    // 2. Insert into isButton block
    // Find end of isButton block. It ends before "if (interaction.isModalSubmit())" (or checking indentation)
    let isButtonEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("if (interaction.isModalSubmit())")) {
            // The previous line that contains '}' is likely the end of isButton
            // Looking backwards
            for (let j = i - 1; j >= 0; j--) {
                if (lines[j].trim() === '}') {
                    isButtonEnd = j;
                    break;
                }
            }
            break;
        }
    }

    if (isButtonEnd !== -1) {
        // Insert before the closing brace
        // Ensure content starts with 'else if'
        if (!claimRoomContent.trim().startsWith('else if')) {
            claimRoomContent = claimRoomContent.replace('if', 'else if');
        }
        // We need to make sure we don't duplicate comments or mess up
        lines.splice(isButtonEnd, 0, claimRoomContent);
        lines.splice(isButtonEnd + 1, 0, closeClaimContent);
        console.log("Inserted blocks into isButton.");
    }

    // 3. Fix isModalSubmit to be part of the chain
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith("if (interaction.isModalSubmit())")) {
            lines[i] = lines[i].replace("if (interaction", "else if (interaction");
            console.log("Fixed isModalSubmit chain.");
            break;
        }
    }

    // 4. Merge fallback logic
    // Find the fallback block: else if (interaction.isModalSubmit())
    // It should be near the end
    let fallbackBlockIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === "else if (interaction.isModalSubmit()) {") {
            fallbackBlockIdx = i;
            break;
        }
    }

    if (fallbackBlockIdx !== -1) {
        // Find the content
        let braceCount = 0;
        let endIdx = -1;
        for (let j = fallbackBlockIdx; j < lines.length; j++) {
            braceCount += (lines[j].match(/{/g) || []).length;
            braceCount -= (lines[j].match(/}/g) || []).length;
            if (braceCount === 0) {
                endIdx = j;
                break;
            }
        }

        if (endIdx !== -1) {
            let fallbackContent = lines.slice(fallbackBlockIdx + 1, endIdx).join('\n'); // content inside braces

            // Remove the fallback block
            lines.splice(fallbackBlockIdx, endIdx - fallbackBlockIdx + 1);

            // Insert into the end of the MAIN isModalSubmit block
            // The main block ends roughly where?
            // We need to find the specific isModalSubmit block again
            let mainModalIdx = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith("else if (interaction.isModalSubmit())")) {
                    mainModalIdx = i;
                    break;
                }
            }

            // Find end of main modal block
            if (mainModalIdx !== -1) {
                let mBraceCount = 0;
                let mEndIdx = -1;
                for (let j = mainModalIdx; j < lines.length; j++) {
                    mBraceCount += (lines[j].match(/{/g) || []).length;
                    mBraceCount -= (lines[j].match(/}/g) || []).length;
                    if (mBraceCount === 0) {
                        mEndIdx = j;
                        break;
                    }
                }

                if (mEndIdx !== -1) {
                    // Start of fallback logic
                    const newFallback = `\n            // Fallback for unrecognized modals
            else {
${fallbackContent}
            }`;
                    lines.splice(mEndIdx, 0, newFallback);
                    console.log("Merged fallback logic.");
                }
            }
        }
    }

    fs.writeFileSync(filePath, lines.join('\n'));
    console.log('Successfully refactored structure.');

} catch (err) {
    console.error('Error:', err);
}
