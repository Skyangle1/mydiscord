const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database/bot_database.db');
const db = new sqlite3.Database(dbPath);

// Function to view all families
function viewAllFamilies() {
    console.log('=== ALL FAMILIES IN DATABASE ===');
    db.all('SELECT * FROM families', [], (err, rows) => {
        if (err) {
            console.error('Error querying families:', err);
            return;
        }
        
        if (rows.length === 0) {
            console.log('No families found in database.');
        } else {
            console.log(`Found ${rows.length} family(ies):`);
            rows.forEach((row, index) => {
                console.log(`${index + 1}. Owner ID: ${row.owner_id}, Family Name: ${row.family_name}, Slogan: ${row.slogan}`);
            });
        }
        
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
}

// Run the function
viewAllFamilies();