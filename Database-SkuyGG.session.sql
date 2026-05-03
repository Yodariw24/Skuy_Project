-- Satukan status ke tabel users
UPDATE users 
SET is_two_fa_enabled = true 
WHERE id IN (SELECT user_id FROM streamers WHERE is_two_fa_enabled = true);