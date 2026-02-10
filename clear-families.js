const { db } = require('./database/db');

console.log('Menghapus semua data keluarga...');

// Hapus semua data dari tabel families
db.run('DELETE FROM families', (err) => {
    if (err) {
        console.error('Error menghapus data keluarga:', err);
        return;
    }
    
    console.log('Semua data keluarga telah dihapus.');
    
    // Hapus semua data dari tabel family_members
    db.run('DELETE FROM family_members', (err) => {
        if (err) {
            console.error('Error menghapus data anggota keluarga:', err);
            return;
        }
        
        console.log('Semua data anggota keluarga telah dihapus.');
        
        // Hapus semua data dari tabel family_requests
        db.run('DELETE FROM family_requests', (err) => {
            if (err) {
                console.error('Error menghapus data permintaan keluarga:', err);
                return;
            }
            
            console.log('Semua data permintaan keluarga telah dihapus.');
            console.log('Proses selesai!');
            
            // Tutup koneksi database
            db.close((err) => {
                if (err) {
                    console.error('Error menutup database:', err);
                } else {
                    console.log('Database connection ditutup.');
                }
            });
        });
    });
});