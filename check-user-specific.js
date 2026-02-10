const { db } = require('./database/db');

console.log('Memeriksa data user 481473420668960778 secara spesifik...');

// Cek apakah user ada di family_members
db.all('SELECT * FROM family_members WHERE user_id LIKE ?', ['%481473420668960778%'], (err, rows) => {
    if (err) {
        console.error('Error saat mengecek family_members:', err);
        return;
    }
    
    if (rows.length > 0) {
        console.log('User DITEMUKAN di family_members:');
        rows.forEach(row => {
            console.log(row);
        });
    } else {
        console.log('User TIDAK DITEMUKAN di family_members');
    }
    
    // Cek apakah user ada di family_requests
    db.all('SELECT * FROM family_requests WHERE requester_id LIKE ?', ['%481473420668960778%'], (reqErr, reqRows) => {
        if (reqErr) {
            console.error('Error saat mengecek family_requests:', reqErr);
            return;
        }
        
        if (reqRows.length > 0) {
            console.log('User DITEMUKAN di family_requests:');
            reqRows.forEach(row => {
                console.log(row);
            });
        } else {
            console.log('User TIDAK DITEMUKAN di family_requests');
        }
        
        // Cek semua user yang ada di family_members
        console.log('\nMemeriksa SEMUA user di family_members...');
        db.all('SELECT DISTINCT user_id FROM family_members', [], (allErr, allRows) => {
            if (allErr) {
                console.error('Error saat mengecek semua user di family_members:', allErr);
                return;
            }
            
            if (allRows.length > 0) {
                console.log('Semua user_id di family_members:');
                allRows.forEach(row => {
                    console.log(`- ${row.user_id}`);
                });
            } else {
                console.log('Tidak ada user di family_members');
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