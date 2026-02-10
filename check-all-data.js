const { db } = require('./database/db');

console.log('Memeriksa semua data di family_members...');

// Cek semua data di family_members
db.all('SELECT * FROM family_members', [], (err, rows) => {
    if (err) {
        console.error('Error saat mengecek family_members:', err);
        return;
    }
    
    if (rows.length > 0) {
        console.log('Data di family_members:');
        rows.forEach(row => {
            console.log(row);
        });
    } else {
        console.log('Tidak ada data di family_members');
    }
    
    console.log('\nMemeriksa semua data di family_requests...');
    
    // Cek semua data di family_requests
    db.all('SELECT * FROM family_requests', [], (reqErr, reqRows) => {
        if (reqErr) {
            console.error('Error saat mengecek family_requests:', reqErr);
            return;
        }
        
        if (reqRows.length > 0) {
            console.log('Data di family_requests:');
            reqRows.forEach(row => {
                console.log(row);
            });
        } else {
            console.log('Tidak ada data di family_requests');
        }
        
        console.log('\nMemeriksa semua data di families...');
        
        // Cek semua data di families
        db.all('SELECT * FROM families', [], (famErr, famRows) => {
            if (famErr) {
                console.error('Error saat mengecek families:', famErr);
                return;
            }
            
            if (famRows.length > 0) {
                console.log('Data di families:');
                famRows.forEach(row => {
                    console.log(row);
                });
            } else {
                console.log('Tidak ada data di families');
            }
            
            // Tutup koneksi database
            db.close((closeErr) => {
                if (closeErr) {
                    console.error('Error menutup database:', closeErr);
                } else {
                    console.log('Database connection ditutup.');
                }
            });
        });
    });
});