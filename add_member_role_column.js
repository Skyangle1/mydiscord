const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Check if column exists
    db.all("PRAGMA table_info(families);", (err, rows) => {
        if (err) {
            console.error("Error getting table info:", err);
            return;
        }

        const columnExists = rows.some(row => row.name === 'member_role_id');

        if (!columnExists) {
            console.log("Adding member_role_id column...");
            db.run("ALTER TABLE families ADD COLUMN member_role_id TEXT;", (alterErr) => {
                if (alterErr) {
                    console.error("Error adding column:", alterErr);
                } else {
                    console.log("Column member_role_id added successfully.");
                }
            });
        } else {
            console.log("Column member_role_id already exists.");
        }
    });
});

db.close();
