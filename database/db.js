const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, 'bot_database.db');
const dbPath = path.join(__dirname, 'bot_database.db');

// Connect to the database
const db = new sqlite3.Database(dbPath);

// Enable WAL mode for better concurrency
db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
});

// Initialize the tables
function initializeDatabase() {
    // Create letters table
    const createLettersTableSQL = `
        CREATE TABLE IF NOT EXISTS letters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_message_id TEXT,
            reply_message_id TEXT,
            sender_id TEXT NOT NULL,
            recipient_name TEXT,
            sender_name TEXT,
            content TEXT NOT NULL,
            is_anonymous INTEGER DEFAULT 0,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Create families table
    const createFamiliesTableSQL = `
        CREATE TABLE IF NOT EXISTS families (
            owner_id TEXT PRIMARY KEY,
            family_name TEXT NOT NULL,
            slogan TEXT,
            logo_url TEXT
        )
    `;
    
    // Create family_members table
    const createFamilyMembersTableSQL = `
        CREATE TABLE IF NOT EXISTS family_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            family_id TEXT NOT NULL,
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES families(owner_id)
        )
    `;

    db.serialize(() => {
        db.run(createLettersTableSQL);
        db.run(createFamiliesTableSQL);
        db.run(createFamilyMembersTableSQL);
        
        // Run schema migrations
        runMigrations();
        
        console.log('Database initialized successfully');
    });
}

// Function to run schema migrations
function runMigrations() {
    // Check if logo_url column exists in families table
    db.all("PRAGMA table_info(families)", [], (err, columns) => {
        if (err) {
            console.error('Error getting column info:', err);
            return;
        }

        const logoUrlExists = columns.some(col => col.name === 'logo_url');

        if (!logoUrlExists) {
            // Add logo_url column
            db.run("ALTER TABLE families ADD COLUMN logo_url TEXT", (err) => {
                if (err) {
                    console.error('Error adding logo_url column:', err);
                } else {
                    console.log('Added logo_url column to families table');
                }
            });
        }
    });

    // Create claims table if it doesn't exist
    const createClaimsTableSQL = `
        CREATE TABLE IF NOT EXISTS claims (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            description TEXT NOT NULL,
            proof_url TEXT,
            status TEXT DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createClaimsTableSQL, (err) => {
        if (err) {
            console.error('Error creating claims table:', err);
        } else {
            console.log('Claims table ensured');
        }
    });

    // Create family_requests table if it doesn't exist
    const createFamilyRequestsTableSQL = `
        CREATE TABLE IF NOT EXISTS family_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requester_id TEXT NOT NULL,
            family_id TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (family_id) REFERENCES families(owner_id)
        )
    `;

    db.run(createFamilyRequestsTableSQL, (err) => {
        if (err) {
            console.error('Error creating family_requests table:', err);
        } else {
            console.log('Family requests table ensured');
        }
    });

    // Create auto_panels table if it doesn't exist
    const createAutoPanelsTableSQL = `
        CREATE TABLE IF NOT EXISTS auto_panels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            panel_type TEXT NOT NULL UNIQUE,
            message_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createAutoPanelsTableSQL, (err) => {
        if (err) {
            console.error('Error creating auto_panels table:', err);
        } else {
            console.log('Auto panels table ensured');
        }
    });
}

module.exports = {
    db,
    initializeDatabase
};