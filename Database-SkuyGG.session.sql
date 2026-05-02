-- 1. Hapus sementara data saldo yang lama agar tidak bentrok
TRUNCATE TABLE balance;

-- 2. Pastikan tabel balance punya kolom yang benar dan sinkron
-- Jika tabel balance menggunakan streamer_id, pastikan dia merujuk ke ID yang benar
ALTER TABLE balance DROP CONSTRAINT IF EXISTS balance_streamer_id_fkey;

-- 3. Tambahkan kembali constraint yang benar (referensi ke user_id atau id streamer yang baru)
-- Catatan: Sesuaikan 'streamer_id' dengan kolom yang ada di kodingan controller pendaftaran lo
ALTER TABLE balance 
ADD CONSTRAINT balance_streamer_id_fkey 
FOREIGN KEY (streamer_id) REFERENCES streamers(id) ON DELETE CASCADE;