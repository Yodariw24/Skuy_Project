import fs from 'fs';
import path from 'path';

// 1. Ambil SEMUA Streamer (Sinkronisasi Elit Kreator di Homepage)
export const getAllStreamers = async (req, res) => {
    try {
        const query = `
            SELECT s.id, u.username, s.display_name, s.full_name, s.profile_picture, s.theme_color, u.role 
            FROM streamers s
            JOIN users u ON s.user_id = u.id
            WHERE u.role = 'creator' 
            ORDER BY s.id DESC
        `;
        const result = await req.db.query(query);
        res.json(result.rows || []); 
    } catch (err) {
        console.error("🔥 Error GET ELIT KREATOR:", err.message);
        res.status(500).json([]); 
    }
};

// 2. Ambil SATU Streamer (Dibutuhkan untuk Profile & 2FA Check)
export const getStreamerByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const query = `
            SELECT s.id, u.id as user_id, u.username, u.email, s.phone_number, 
                   s.display_name, s.full_name, s.bio, s.instagram, s.tiktok, 
                   s.youtube, s.theme_color, s.profile_picture, u.role, u.is_two_fa_enabled
            FROM streamers s
            JOIN users u ON s.user_id = u.id
            WHERE LOWER(u.username) = LOWER($1)
        `;
        const result = await req.db.query(query, [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Kreator tidak ditemukan" });
        }
        
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Update Informasi Rekening
export const updateBankInfo = async (req, res) => {
    const { id } = req.params; 
    const { bank_name, account_number, account_name } = req.body;
    try {
        const result = await req.db.query(
            `UPDATE streamers SET bank_name = $1, account_number = $2, account_name = $3 
             WHERE user_id = $4 RETURNING bank_name, account_number, account_name`,
            [bank_name, account_number, account_name, id]
        );
        res.json({ success: true, message: "Rekening tersinkronisasi! 🚀", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. Update Profile & Theme (SULTAN SYNC + PHONE FOR 2FA)
export const updateProfileInfo = async (req, res) => {
    const { id } = req.params; // user_id dari params
    const { 
        display_name, 
        username, 
        bio, 
        instagram, 
        tiktok, 
        youtube, 
        theme_color, 
        phone_number 
    } = req.body;

    try {
        await req.db.query('BEGIN'); // Transaksi biar aman Ri

        // Bersihkan format nomor HP (Hanya angka biar Fonnte gak bingung)
        const cleanPhone = phone_number ? phone_number.replace(/\D/g, '') : null;

        // A. Update Tabel Streamers
        const streamerResult = await req.db.query(
            `UPDATE streamers 
             SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5, theme_color = $6, phone_number = $7
             WHERE user_id = $8 RETURNING *`,
            [display_name, bio, instagram, tiktok, youtube, theme_color || 'violet', cleanPhone, id]
        );

        if (streamerResult.rowCount === 0) {
            await req.db.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }

        // B. Sinkronisasi Username ke Tabel Users (Penting buat Login)
        if (username) {
            const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
            await req.db.query(
                `UPDATE users SET username = $1 WHERE id = $2`,
                [cleanUsername, id]
            );
            // Samakan username di tabel streamers juga
            await req.db.query(
                `UPDATE streamers SET username = $1 WHERE user_id = $2`,
                [cleanUsername, id]
            );
        }

        await req.db.query('COMMIT');

        res.json({ 
            success: true, 
            message: "Profil, Username & WhatsApp Berhasil Disinkronkan! ✨", 
            data: streamerResult.rows[0] 
        });

    } catch (err) {
        await req.db.query('ROLLBACK');
        console.error("🔥 UPDATE_PROFILE_ERROR:", err.message);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Username sudah dipakai sultan lain, Ri!" });
        }
        res.status(500).json({ success: false, error: "Gagal sinkronisasi data profil." });
    }
};

// 5. Update Foto Profil (Sinkron ke dua tabel)
export const updateProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Mana gambarnya Ri?" });

        const newFileName = req.file.filename;

        // Hapus file lama kalau ada
        const oldData = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const oldFile = oldData.rows[0]?.profile_picture;

        if (oldFile) {
            const oldPath = path.resolve(process.cwd(), 'uploads', oldFile);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch (e) { console.warn("Hapus file gagal"); }
            }
        }

        // Update di kedua tabel (Sync Sultan)
        await req.db.query("UPDATE streamers SET profile_picture = $1 WHERE user_id = $2", [newFileName, id]);
        await req.db.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [newFileName, id]);

        res.json({ success: true, filename: newFileName, message: "Avatar Sultan Meledak! 🔥" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal memproses gambar" });
    }
};

// 6. Hapus Foto Profil
export const deleteProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const fileToDelete = data.rows[0]?.profile_picture;

        if (fileToDelete) {
            const filePath = path.resolve(process.cwd(), 'uploads', fileToDelete);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await req.db.query("UPDATE streamers SET profile_picture = NULL WHERE user_id = $1", [id]);
        await req.db.query("UPDATE users SET profile_picture = NULL WHERE id = $1", [id]);
        res.json({ success: true, message: "Kembali ke identitas default avatar." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};