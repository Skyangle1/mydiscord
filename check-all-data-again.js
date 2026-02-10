const { db } = require('./database/db');

console.log('Memeriksa SEMUA data di tabel families...');

// Cek semua data di families
db.all('SELECT * FROM families', [], (err, rows) => {
    if (err) {
        console.error('Error saat mengecek families:', err);
        return;
    }
    
    if (rows.length > 0) {
        console.log('Semua data di families:');
        rows.forEach((row, index) => {
            console.log(`${index + 1}.`, row);
        });
    } else {
        console.log('Tidak ada data di families');
    }
    
    // Cek juga semua data di family_members
    console.log('\nMemeriksa SEMUA data di tabel family_members...');
    db.all('SELECT * FROM family_members', [], (memErr, memRows) => {
        if (memErr) {
            console.error('Error saat mengecek family_members:', memErr);
            return;
        }
        
        if (memRows.length > 0) {
            console.log('Semua data di family_members:');
            memRows.forEach((row, index) => {
                console.log(`${index + 1}.`, row);
            });
        } else {
            console.log('Tidak ada data di family_members');
        }
        
        // Cek juga semua data di family_requests
        console.log('\nMemeriksa SEMUA data di tabel family_requests...');
        db.all('SELECT * FROM family_requests', [], (reqErr, reqRows) => {
            if (reqErr) {
                console.error('Error saat mengecek family_requests:', reqErr);
                return;
            }
            
            if (reqRows.length > 0) {
                console.log('Semua data di family_requests:');
                reqRows.forEach((row, index) => {
                    console.log(`${index + 1}.`, row);
                });
            } else {
                console.log('Tidak ada data di family_requests');
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