const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'database/bot_database.db');
const db = new sqlite3.Database(dbPath);

// Function to clean family entry for a specific user
function cleanFamilyEntry(userId) {
    console.log(`Cleaning family entry for user ID: ${userId}`);
    
    // First, check if there's an existing entry
    db.get('SELECT * FROM families WHERE owner_id = ?', [userId], (err, row) => {
        if (err) {
            console.error('Error querying database:', err);
            db.close();
            return;
        }
        
        if (row) {
            console.log('Found existing family entry:', row);
            
            // Delete the existing entry
            db.run('DELETE FROM families WHERE owner_id = ?', [userId], function(deleteErr) {
                if (deleteErr) {
                    console.error('Error deleting from database:', deleteErr);
                } else {
                    console.log('Successfully deleted family entry for user:', userId);
                }
                
                // Close database connection
                db.close((closeErr) => {
                    if (closeErr) {
                        console.error('Error closing database:', closeErr);
                    } else {
                        console.log('Database connection closed.');
                    }
                });
            });
        } else {
            console.log('No existing family entry found for user:', userId);
            
            // Close database connection
            db.close((closeErr) => {
                if (closeErr) {
                    console.error('Error closing database:', closeErr);
                } else {
                    console.log('Database connection closed.');
                }
            });
        }
    });
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
    console.log('Usage: node clean-family-db.js <user_id>');
    console.log('Example: node clean-family-db.js 481473420668960778');
    process.exit(1);
}

cleanFamilyEntry(userId);