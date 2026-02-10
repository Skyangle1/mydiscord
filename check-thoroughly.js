const { db } = require('./database/db');

console.log('Mengecek secara menyeluruh apakah user 485762002380390400 ada di database...');

// Cek di semua tabel
console.log('1. Mengecek di tabel families...');
db.get("SELECT * FROM families WHERE owner_id LIKE '%485762002380390400%'", [], (err, row) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    if (row) {
        console.log('DITEMUKAN di families:', row);
    } else {
        console.log('TIDAK DITEMUKAN di families');
    }
    
    console.log('\n2. Mengecek di tabel family_members...');
    db.get("SELECT * FROM family_members WHERE user_id LIKE '%485762002380390400%'", [], (err, row) => {
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        if (row) {
            console.log('DITEMUKAN di family_members:', row);
        } else {
            console.log('TIDAK DITEMUKAN di family_members');
        }
        
        console.log('\n3. Mengecek di tabel family_requests...');
        db.get("SELECT * FROM family_requests WHERE requester_id LIKE '%485762002380390400%'", [], (err, row) => {
            if (err) {
                console.error('Error:', err);
                return;
            }
            
            if (row) {
                console.log('DITEMUKAN di family_requests:', row);
            } else {
                console.log('TIDAK DITEMUKAN di family_requests');
            }
            
            // Cek dengan query persis
            console.log('\n4. Mengecek dengan query persis...');
            db.get("SELECT * FROM families WHERE owner_id = '485762002380390400'", [], (err, row) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }
                
                if (row) {
                    console.log('DITEMUKAN SECARA PERSIS di families:', row);
                } else {
                    console.log('TIDAK DITEMUKAN SECARA PERSIS di families');
                }
                
                // Cek semua owner_id yang ada
                console.log('\n5. Mengecek semua owner_id yang ada di families...');
                db.all('SELECT owner_id FROM families', [], (err, rows) => {
                    if (err) {
                        console.error('Error:', err);
                        return;
                    }
                    
                    console.log('Semua owner_id di families:', rows.map(r => `'${r.owner_id}'`));
                    
                    // Tutup koneksi
                    db.close((closeErr) => {
                        if (closeErr) {
                            console.error('Error menutup database:', closeErr);
                        } else {
                            console.log('\nDatabase connection ditutup.');
                        }
                    });
                });
            });
        });
    });
});