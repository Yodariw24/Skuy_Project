import fs from 'fs';
import path from 'path';

// --- 4. UPDATE PROFILE & THEME (SULTAN SYNC + PHONE FOR 2FA) ---
export const updateProfileInfo = async (req, res) => {
    const { userId, display_name, username, bio, instagram, tiktok, youtube, theme_color, phone_number } = req.body;
    const targetId = userId || req.params.id;

    if (!targetId) {
        return res.status(400).json({ success: false, message: "User ID tidak terdeteksi, Ri!" });
    }

    try {
        await req.db.query('BEGIN');
        const cleanPhone = phone_number ? phone_number.toString().replace(/\D/g, '') : null;

        // Update Tabel Streamers
        const streamerResult = await req.db.query(
            `UPDATE streamers 
             SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5, theme_color = $6, phone_number = $7
             WHERE user_id = $8 RETURNING *`,
            [display_name, bio, instagram, tiktok, youtube, theme_color || 'violet', cleanPhone, targetId]
        );

        if (streamerResult.rowCount === 0) {
            await req.db.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Data kreator tidak ditemukan!" });
        }

        // Sinkronisasi Username ke Tabel Users
        if (username) {
            const cleanUsername = username.toLowerCase().replace(/\s+/g, '');
            await req.db.query(`UPDATE users SET username = $1 WHERE id = $2`, [cleanUsername, targetId]);
            await req.db.query(`UPDATE streamers SET username = $1 WHERE user_id = $2`, [cleanUsername, targetId]);
        }

        await req.db.query('COMMIT');
        res.json({ 
            success: true, 
            message: "Profil & WhatsApp Berhasil Disinkronkan! ✨", 
            user: streamerResult.rows[0] 
        });

    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        console.error("🔥 UPDATE_PROFILE_ERROR:", err.message);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Username sudah dipakai sultan lain, Ri!" });
        }
        res.status(500).json({ success: false, error: "Gagal sinkronisasi data profil." });
    }
};

// --- 5. UPDATE BANK INFO (SULTAN SINKRON COLUMNS) ---
export const updateBankInfo = async (req, res) => {
    const { id } = req.params; // ID user (12)
    const { bank_name, bank_account_number, bank_account_name } = req.body;

    try {
        // ✅ NAMA KOLOM DISESUAIKAN DENGAN SQL ALTER TABLE: bank_name, bank_account_number, bank_account_name
        const result = await req.db.query(
            `UPDATE streamers 
             SET bank_name = $1, bank_account_number = $2, bank_account_name = $3 
             WHERE user_id = $4 
             RETURNING bank_name, bank_account_number, bank_account_name`,
            [bank_name, bank_account_number, bank_account_name, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: "Profil Streamer tidak ditemukan!" });
        }

        res.json({ 
            success: true, 
            message: "Rekening tersinkronisasi! 🚀", 
            data: result.rows[0] 
        });
    } catch (err) {
        console.error("⛔ BANK_UPDATE_ERROR:", err.message);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error: Pastikan kolom bank sudah dibuat di Railway!" 
        });
    }
};

// --- FUNGSI GET DATA ---
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
        res.status(500).json([]); 
    }
};

export const getStreamerByUsername = async (req, res) => {
    const { username } = req.params;
    try {
        const query = `
            SELECT s.id, u.id as user_id, u.username, u.email, s.phone_number, 
                   s.display_name, s.full_name, s.bio, s.instagram, s.tiktok, 
                   s.youtube, s.theme_color, s.profile_picture, u.role, u.is_two_fa_enabled,
                   s.bank_name, s.bank_account_number, s.bank_account_name
            FROM streamers s
            JOIN users u ON s.user_id = u.id
            WHERE LOWER(u.username) = LOWER($1)
        `;
        const result = await req.db.query(query, [username]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Kreator tidak ditemukan" });
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- PHOTO OPERATIONS ---
export const updateProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Mana gambarnya Ri?" });
        const newFileName = req.file.filename;
        const oldData = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const oldFile = oldData.rows[0]?.profile_picture;
        
        if (oldFile) {
            const oldPath = path.resolve(process.cwd(), 'uploads', oldFile);
            if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (e) {} }
        }
        
        await req.db.query("UPDATE streamers SET profile_picture = $1 WHERE user_id = $2", [newFileName, id]);
        await req.db.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [newFileName, id]);
        
        res.json({ success: true, filename: newFileName, message: "Avatar Sultan Meledak! 🔥" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal memproses gambar" });
    }
};

export const deleteProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const fileToDelete = data.rows[0]?.profile_picture;
        if (fileToDelete) {
            const filePath = path.resolve(process.cwd(), 'uploads', fileToDelete);
            if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
        }
        await req.db.query("UPDATE streamers SET profile_picture = NULL WHERE user_id = $1", [id]);
        await req.db.query("UPDATE users SET profile_picture = NULL WHERE id = $1", [id]);
        res.json({ success: true, message: "Kembali ke identitas default avatar." });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};