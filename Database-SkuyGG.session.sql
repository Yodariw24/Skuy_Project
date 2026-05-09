-- Tambahin kolom sosmed & bio di tabel streamers
ALTER TABLE streamers 
ADD COLUMN instagram VARCHAR(255),
ADD COLUMN tiktok VARCHAR(255),
ADD COLUMN youtube VARCHAR(255);
