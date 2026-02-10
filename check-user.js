const { db } = require('./database/db');

console.log('Memeriksa data user 481473420668960778...');

// Cek apakah user ada di family_members
db.get('SELECT * FROM family_members WHERE user_id = ?', ['481473420668960778'], (err, row) => {
    if (err) {
        console.error('Error saat mengecek family_members:', err);
        return;
    }
    
    if (row) {
        console.log('User ditemukan di family_members:', row);
        
        // Hapus user dari family_members
        db.run('DELETE FROM family_members WHERE user_id = ?', ['481473420668960778'], (deleteErr) => {
            if (deleteErr) {
                console.error('Error saat menghapus dari family_members:', deleteErr);
            } else {
                console.log('User berhasil dihapus dari family_members');
            }
            
            // Cek apakah user ada di family_requests
            db.get('SELECT * FROM family_requests WHERE requester_id = ?', ['481473420668960778'], (reqErr, reqRow) => {
                if (reqErr) {
                    console.error('Error saat mengecek family_requests:', reqErr);
                    return;
                }
                
                if (reqRow) {
                    console.log('User ditemukan di family_requests:', reqRow);
                    
                    // Hapus user dari family_requests
                    db.run('DELETE FROM family_requests WHERE requester_id = ?', ['481473420668960778'], (delReqErr) => {
                        if (delReqErr) {
                            console.error('Error saat menghapus dari family_requests:', delReqErr);
                        } else {
                            console.log('User berhasil dihapus dari family_requests');
                        }
                        
                        console.log('Pembersihan selesai!');
                        
                        // Tutup koneksi database
                        db.close((closeErr) => {
                            if (closeErr) {
                                console.error('Error menutup database:', closeErr);
                            } else {
                                console.log('Database connection ditutup.');
                            }
                        });
                    });
                } else {
                    console.log('User tidak ditemukan di family_requests');
                    
                    console.log('Pembersihan selesai!');
                    
                    // Tutup koneksi database
                    db.close((closeErr) => {
                        if (closeErr) {
                            console.error('Error menutup database:', closeErr);
                        } else {
                            console.log('Database connection ditutup.');
                        }
                    });
                }
            });
        });
    } else {
        console.log('User tidak ditemukan di family_members');
        
        // Cek apakah user ada di family_requests
        db.get('SELECT * FROM family_requests WHERE requester_id = ?', ['481473420668960778'], (reqErr, reqRow) => {
            if (reqErr) {
                console.error('Error saat mengecek family_requests:', reqErr);
                return;
            }
            
            if (reqRow) {
                console.log('User ditemukan di family_requests:', reqRow);
                
                // Hapus user dari family_requests
                db.run('DELETE FROM family_requests WHERE requester_id = ?', ['481473420668960778'], (delReqErr) => {
                    if (delReqErr) {
                        console.error('Error saat menghapus dari family_requests:', delReqErr);
                    } else {
                        console.log('User berhasil dihapus dari family_requests');
                    }
                    
                    console.log('Pembersihan selesai!');
                    
                    // Tutup koneksi database
                    db.close((closeErr) => {
                        if (closeErr) {
                            console.error('Error menutup database:', closeErr);
                        } else {
                            console.log('Database connection ditutup.');
                        }
                    });
                });
            } else {
                console.log('User tidak ditemukan di family_requests');
                
                console.log('User tidak ditemukan di kedua tabel, tidak perlu dibersihkan');
                
                // Tutup koneksi database
                db.close((closeErr) => {
                    if (closeErr) {
                        console.error('Error menutup database:', closeErr);
                    } else {
                        console.log('Database connection ditutup.');
                    }
                });
            }
        });
    }
});