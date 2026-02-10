// Simulasi query yang digunakan dalam handler dengan cara yang benar
const { db } = require('./database/db');

console.log('Simulasi query seperti dalam handler dengan cara yang benar...');

const userId = '485762002380390400'; // User yang katanya sudah jadi kepala keluarga

console.log(`Mencari apakah user ${userId} adalah kepala keluarga...`);

// Gunakan metode callback seperti yang biasanya digunakan
db.get('SELECT * FROM families WHERE owner_id = ?', [userId], (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('Hasil query:', row);
    
    if (row) {
        console.log('USER DITEMUKAN sebagai kepala keluarga:', row);
    } else {
        console.log('USER TIDAK DITEMUKAN sebagai kepala keluarga');
    }
    
    // Juga coba query untuk user yang seharusnya jadi kepala keluarga
    const userId2 = '481473420668960778';
    console.log(`\nMencari apakah user ${userId2} adalah kepala keluarga...`);
    
    db.get('SELECT * FROM families WHERE owner_id = ?', [userId2], (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        console.log('Hasil query untuk user2:', row);
        
        if (row) {
            console.log('USER2 DITEMUKAN sebagai kepala keluarga:', row);
        } else {
            console.log('USER2 TIDAK DITEMUKAN sebagai kepala keluarga');
        }
        
        // Tutup koneksi
        db.close((err) => {
            if (err) {
                console.error('Error menutup database:', err);
            } else {
                console.log('\nDatabase connection ditutup.');
            }
        });
    });
});