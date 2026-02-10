const { db } = require('./database/db');

console.log('Membersihkan semua data lama secara menyeluruh...');

// Hapus semua data dari tabel
db.serialize(() => {
    // Hapus semua data dari tabel family_requests
    db.run('DELETE FROM family_requests', (err) => {
        if (err) {
            console.error('Error menghapus family_requests:', err);
        } else {
            console.log('Semua data family_requests dihapus');
        }
        
        // Hapus semua data dari tabel family_members
        db.run('DELETE FROM family_members', (err) => {
            if (err) {
                console.error('Error menghapus family_members:', err);
            } else {
                console.log('Semua data family_members dihapus');
            }
            
            // Hapus semua data dari tabel families
            db.run('DELETE FROM families', (err) => {
                if (err) {
                    console.error('Error menghapus families:', err);
                } else {
                    console.log('Semua data families dihapus');
                }
                
                // Verifikasi bahwa semua tabel kosong
                console.log('\nVerifikasi data setelah pembersihan:');
                
                db.get('SELECT COUNT(*) as count FROM families', [], (err, row) => {
                    if (err) console.error('Error cek families:', err);
                    else console.log(`Jumlah keluarga: ${row.count}`);
                    
                    db.get('SELECT COUNT(*) as count FROM family_members', [], (err, row) => {
                        if (err) console.error('Error cek family_members:', err);
                        else console.log(`Jumlah anggota keluarga: ${row.count}`);
                        
                        db.get('SELECT COUNT(*) as count FROM family_requests', [], (err, row) => {
                            if (err) console.error('Error cek family_requests:', err);
                            else console.log(`Jumlah permintaan keluarga: ${row.count}`);
                            
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
                    });
                });
            });
        });
    });
});