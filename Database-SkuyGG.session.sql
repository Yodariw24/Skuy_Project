-- Pastikan tabel balance punya total_saldo (bukan amount)
ALTER TABLE balance ADD COLUMN IF NOT EXISTS total_saldo DECIMAL(15, 2) DEFAULT 0.00;

-- Pastikan tabel streamers punya kolom role dan theme_color
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'creator';
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS theme_color VARCHAR(50) DEFAULT 'violet';

-- Pastikan kolom 2FA tersedia karena kodingan lo sudah pakai logika 2FA
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS two_fa_secret TEXT;
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS is_two_fa_enabled BOOLEAN DEFAULT false;