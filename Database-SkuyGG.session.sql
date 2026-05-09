-- Pastiin kolom secret tipenya TEXT biar gak kepotong
ALTER TABLE users ALTER COLUMN two_fa_secret TYPE TEXT;

-- Reset data yang lama biar gak bentrok
UPDATE users SET two_fa_secret = NULL, is_two_fa_enabled = false WHERE id = 9;