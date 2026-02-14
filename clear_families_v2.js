const { db } = require('./database/db');

console.log('🧹 Clearing Family Database...');

db.serialize(() => {
    db.run("DELETE FROM families", (err) => {
        if (err) console.error('Error clearing families:', err);
        else console.log('✅ Families table cleared.');
    });

    db.run("DELETE FROM family_members", (err) => {
        if (err) console.error('Error clearing family_members:', err);
        else console.log('✅ Family Members table cleared.');
    });

    db.run("DELETE FROM family_requests", (err) => {
        if (err) console.error('Error clearing family_requests:', err);
        else console.log('✅ Family Requests table cleared.');
    });
});
