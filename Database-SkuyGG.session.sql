-- 1. Hapus dulu aturan lama yang bikin error
ALTER TABLE balance DROP CONSTRAINT IF EXISTS balance_streamer_id_fkey;

-- 2. Kosongkan tabel balance (biar data sampah nggak bikin bentrok)
TRUNCATE TABLE balance;

-- 3. Pasang aturan baru: hubungkan balance langsung ke users(id) 
-- karena di kodingan lo newUser.id itu berasal dari tabel users
ALTER TABLE balance 
ADD CONSTRAINT balance_streamer_id_fkey 
FOREIGN KEY (streamer_id) REFERENCES users(id) ON DELETE CASCADE;