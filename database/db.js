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
            slogan TEXT
        )
    `;

    db.serialize(() => {
        db.run(createLettersTableSQL);
        db.run(createFamiliesTableSQL);
        console.log('Database initialized successfully');
    });
}

module.exports = {
    db,
    initializeDatabase
};