-- Tambah kolom yang mungkin kurang di tabel streamers
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE streamers ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tambah kolom role di tabel users kalau belum ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'creator';