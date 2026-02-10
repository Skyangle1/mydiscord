const { db } = require('./database/db');

console.log('Memeriksa data keluarga secara detil...');

// Cek semua data di families dengan detail
db.each('SELECT * FROM families', [], (err, row) => {
    if (err) {
        console.error('Error saat mengecek families:', err);
        return;
    }
    
    console.log('Data keluarga ditemukan:');
    console.log('- owner_id:', JSON.stringify(row.owner_id));
    console.log('- family_name:', JSON.stringify(row.family_name));
    console.log('- owner_id length:', row.owner_id.length);
    console.log('- family_name length:', row.family_name.length);
    console.log('- owner_id char codes:', Array.from(row.owner_id).map(c => c.charCodeAt(0)));
    console.log('');
}, () => {
    console.log('Selesai iterasi semua data families');
    
    // Cek spesifik apakah user 485762002380390400 ada sebagai kepala keluarga
    console.log('\nMengecek apakah user 485762002380390400 ada sebagai kepala keluarga...');
    
    db.get('SELECT * FROM families WHERE owner_id = ?', ['485762002380390400'], (err, row) => {
        if (err) {
            console.error('Error saat mengecek user sebagai kepala keluarga:', err);
            return;
        }
        
        if (row) {
            console.log('USER DITEMUKAN sebagai kepala keluarga:', row);
        } else {
            console.log('USER TIDAK DITEMUKAN sebagai kepala keluarga');
        }
        
        // Cek juga user 481473420668960778
        console.log('\nMengecek apakah user 481473420668960778 ada sebagai kepala keluarga...');
        
        db.get('SELECT * FROM families WHERE owner_id = ?', ['481473420668960778'], (err, row) => {
            if (err) {
                console.error('Error saat mengecek user sebagai kepala keluarga:', err);
                return;
            }
            
            if (row) {
                console.log('USER DITEMUKAN sebagai kepala keluarga:', row);
            } else {
                console.log('USER TIDAK DITEMUKAN sebagai kepala keluarga');
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