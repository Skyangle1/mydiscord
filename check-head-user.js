const { db } = require('./database/db');

console.log('Memeriksa apakah user 485762002380390400 terdaftar sebagai kepala keluarga...');

// Cek apakah user ada di families sebagai owner
db.get('SELECT * FROM families WHERE owner_id = ?', ['485762002380390400'], (err, row) => {
    if (err) {
        console.error('Error saat mengecek families:', err);
        return;
    }
    
    if (row) {
        console.log('User DITEMUKAN sebagai kepala keluarga:', row);
    } else {
        console.log('User TIDAK DITEMUKAN sebagai kepala keluarga');
    }
    
    // Cek juga di family_members
    db.get('SELECT * FROM family_members WHERE user_id = ?', ['485762002380390400'], (memErr, memRow) => {
        if (memErr) {
            console.error('Error saat mengecek family_members:', memErr);
            return;
        }
        
        if (memRow) {
            console.log('User DITEMUKAN sebagai anggota keluarga:', memRow);
        } else {
            console.log('User TIDAK DITEMUKAN sebagai anggota keluarga');
        }
        
        // Cek juga di family_requests
        db.get('SELECT * FROM family_requests WHERE requester_id = ?', ['485762002380390400'], (reqErr, reqRow) => {
            if (reqErr) {
                console.error('Error saat mengecek family_requests:', reqErr);
                return;
            }
            
            if (reqRow) {
                console.log('User DITEMUKAN dalam permintaan keluarga:', reqRow);
            } else {
                console.log('User TIDAK DITEMUKAN dalam permintaan keluarga');
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