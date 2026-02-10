// Simulasi query yang digunakan dalam handler dengan benar
const { db } = require('./database/db');

console.log('Simulasi query seperti dalam handler dengan benar...');

const userId = '485762002380390400'; // User yang katanya sudah jadi kepala keluarga

console.log(`Mencari apakah user ${userId} adalah kepala keluarga...`);

// Buat statement baru untuk setiap query
const result = db.prepare('SELECT * FROM families WHERE owner_id = ?').get(userId);

console.log('Hasil query:', result);

if (result) {
    console.log('USER DITEMUKAN sebagai kepala keluarga:', result);
} else {
    console.log('USER TIDAK DITEMUKAN sebagai kepala keluarga');
}

// Juga coba query untuk user yang seharusnya jadi kepala keluarga
const userId2 = '481473420668960778';
console.log(`\nMencari apakah user ${userId2} adalah kepala keluarga...`);

const result2 = db.prepare('SELECT * FROM families WHERE owner_id = ?').get(userId2);

console.log('Hasil query untuk user2:', result2);

if (result2) {
    console.log('USER2 DITEMUKAN sebagai kepala keluarga:', result2);
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