const fs = require('fs');
const path = require('path');
const { db } = require('./database/db');

async function runDiagnostics() {
    console.log('--- DIAGNOSTIC START ---');

    // 1. Check Database Schema
    console.log('\nChecking Database Schema...');
    await new Promise((resolve) => {
        db.all("PRAGMA table_info(families)", [], (err, columns) => {
            if (err) {
                console.error('DB Error:', err);
            } else {
                const names = columns.map(c => c.name);
                console.log('families columns:', names);
                if (names.includes('role_id')) console.log('✅ role_id exists.');
                else console.error('❌ role_id MISSING in families table!');
            }
            resolve();
        });
    });

    // 2. Check File Loadability & Custom IDs
    console.log('\nChecking Handler Files...');
    const buttonsDir = './interactions/buttons';
    const modalsDir = './interactions/modals';

    const checkDir = (dir) => {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const handler = require(path.join(__dirname, dir, file));
                if (!handler.customId) {
                    console.error(`❌ ${file}: Missing customId export`);
                } else {
                    const idType = handler.customId instanceof RegExp ? 'RegExp' : typeof handler.customId;
                    console.log(`✅ ${file}: Loaded (ID: ${idType} ${handler.customId})`);
                }
            } catch (e) {
                console.error(`❌ ${file}: FAILED TO REQUIRE - ${e.message}`);
            }
        }
    };

    console.log('--- Buttons ---');
    checkDir(buttonsDir);

    console.log('--- Modals ---');
    checkDir(modalsDir);

    // 3. Simulate Regex Matching Logic
    console.log('\nSimulating Interaction Matching...');
    const joinReqHandler = require('./interactions/buttons/joinFamilyRequest.js');
    const testId = 'join_family_request_123456789';

    if (joinReqHandler.customId instanceof RegExp && joinReqHandler.customId.test(testId)) {
        console.log(`✅ Regex Match Test Passed for ${testId}`);
    } else {
        console.error(`❌ Regex Match Test FAILED for ${testId}`);
        console.log('Regex:', joinReqHandler.customId);
    }

    // 4. Simulate Multi-Guild Logic (Mock Env)
    console.log('\nSimulating Multi-Guild Parsing...');
    process.env.ALLOWED_GUILD_ID = "123456789, 987654321"; // Mock
    const allowedGuildIds = process.env.ALLOWED_GUILD_ID
        ? process.env.ALLOWED_GUILD_ID.split(',').map(id => id.trim())
        : [];
    console.log('Parsed Guild IDs:', allowedGuildIds);
    if (allowedGuildIds.length === 2 && allowedGuildIds[0] === '123456789') {
        console.log('✅ Multi-Guild ID Parsing Correct');
    } else {
        console.error('❌ Multi-Guild ID Parsing FAILED');
    }

    console.log('\n--- DIAGNOSTIC END ---');
}

runDiagnostics();
