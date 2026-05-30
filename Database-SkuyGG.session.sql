-- Pastikan user_id milik email lo terdaftar di tabel streamers
SELECT id, user_id, username FROM streamers WHERE user_id = (SELECT id FROM users WHERE email = 'ariwirayuda24@gmail.com');