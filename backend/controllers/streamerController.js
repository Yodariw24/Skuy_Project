import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. UPDATE PROFILE & THEME (SULTAN SYNC + PHONE FOR 2FA)
 * Memperbarui metadata sosial media, skema warna tema, dan nomor WhatsApp
 */
export const updateProfileInfo = async (req, res) => {
    const { userId, display_name, username, bio, instagram, tiktok, youtube, theme_color, phone_number, category_id } = req.body;
    const targetId = userId || req.params.id;

    if (!targetId) {
        return res.status(400).json({ success: false, message: "User ID tidak terdeteksi, Ri!" });
    }

    try {
        await req.db.query('BEGIN');
        const cleanPhone = phone_number ? phone_number.toString().replace(/\D/g, '') : null;

        // Update Tabel Streamers (Sekaligus mengunci kategori id yang dipilih di dashboard)
        await req.db.query(
            `UPDATE streamers 
             SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5, theme_color = $6, phone_number = $7, category_id = $8
             WHERE user_id = $9`,
            [display_name, bio, instagram, tiktok, youtube, theme_color || 'violet', cleanPhone, category_id || null, targetId]
        );

        // Sinkronisasi Username ke Tabel Users & Streamers secara berkala
        let cleanUsername = username;
        if (username) {
            cleanUsername = username.toLowerCase().replace(/\s+/g, '');
            await req.db.query(`UPDATE users SET username = $1 WHERE id = $2`, [cleanUsername, targetId]);
            await req.db.query(`UPDATE streamers SET username = $1 WHERE user_id = $2`, [cleanUsername, targetId]);
        }

        // ✅ UPGRADE RETURN STRUCTURAL DATA: Tarik data gabungan terbaru agar front-end dapet data super segar!
        const finalDataRes = await req.db.query(`
            SELECT u.username, s.display_name, s.bio, s.instagram, s.tiktok, s.youtube, s.theme_color, s.phone_number, s.category_id, s.profile_picture
            FROM streamers s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = $1
        `, [targetId]);

        if (finalDataRes.rowCount === 0) {
            await req.db.query('ROLLBACK');
            return res.status(404).json({ success: false, message: "Data kreator tidak ditemukan!" });
        }

        await req.db.query('COMMIT');
        return res.json({ 
            success: true, 
            message: "Profil & WhatsApp Berhasil Disinkronkan! ✨", 
            user: finalDataRes.rows[0] 
        });

    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        console.error("🔥 UPDATE_PROFILE_ERROR:", err.message);
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: "Username sudah dipakai sultan lain, Ri!" });
        }
        return res.status(500).json({ success: false, error: "Gagal sinkronisasi data profil." });
    }
};

/**
 * 2. UPDATE BANK INFO (SULTAN SINKRON COLUMNS)
 * Mengunci kredensial rekening bank untuk kebutuhan withdraw dana platform
 */
export const updateBankInfo = async (req, res) => {
    const { id } = req.params; 
    const { bank_name, bank_account_number, bank_account_name } = req.body;

    try {
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

        return res.json({ 
            success: true, 
            message: "Rekening tersinkronisasi! 🚀", 
            data: result.rows[0] 
        });
    } catch (err) {
        console.error("⛔ BANK_UPDATE_ERROR:", err.message);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error: Gagal mengunci data bank." 
        });
    }
};

/**
 * 3. GET ALL STREAMERS (EXPLORE HUB INTERCEPTOR)
 * Mendukung pembacaan filter kategori (?category=id) dinamis untuk halaman Explore baru
 */
export const getAllStreamers = async (req, res) => {
    const { category } = req.query;

    try {
        let query = `
            SELECT s.id, u.username, s.display_name, s.full_name, s.profile_picture, s.theme_color, u.role, s.bio, c.name as category_name
            FROM streamers s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE u.role = 'creator'
        `;
        
        const params = [];
        if (category && category !== 'Semua') {
            query += ` AND s.category_id = $1`;
            params.push(category);
        }
        
        query += ` ORDER BY s.id DESC`;
        
        const result = await req.db.query(query, params);
        return res.json({ success: true, streamers: result.rows || [] }); 
    } catch (err) {
        console.error("🔥 Error getAllStreamers Node:", err.message);
        return res.status(500).json({ success: false, streamers: [] }); 
    }
};

/**
 * 4. GET STREAMER BY USERNAME (PUBLIC PROFILE DISCOVERY)
 * Menampilkan profile page publik kreator berdasarkan rute parameter nama unik
 */
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
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Kreator tidak ditemukan" });
        }
        return res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("🔥 Error getStreamerByUsername:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * 5. UPDATE PROFILE PHOTO (AVATAR TRANSMISSION LAYER)
 * Menangani penggantian foto profil dan menghapus berkas aset lama dari storage local disk
 */
export const updateProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "Mana gambarnya Ri?" });
        const newFileName = req.file.filename;
        const oldData = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const oldFile = oldData.rows[0]?.profile_picture;
        
        if (oldFile) {
            // ✅ FIXED FILE REFERENCE PATH: Mengunci alamat direktori absolut agar kebal error pemindahan kontainer cloud
            const oldPath = path.join(__dirname, '../uploads/', oldFile);
            if (fs.existsSync(oldPath)) { try { fs.unlinkSync(oldPath); } catch (e) {} }
        }
        
        await req.db.query("UPDATE streamers SET profile_picture = $1 WHERE user_id = $2", [newFileName, id]);
        await req.db.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [newFileName, id]);
        
        return res.json({ success: true, filename: newFileName, message: "Avatar Sultan Meledak! 🔥" });
    } catch (err) {
        console.error("🔥 Error updateProfilePhoto:", err.message);
        return res.status(500).json({ success: false, message: "Gagal memproses gambar" });
    }
};

/**
 * 6. DELETE PROFILE PHOTO (RESET TO IDENTITAS DEFAULT)
 */
export const deleteProfilePhoto = async (req, res) => {
    const { id } = req.params;
    try {
        const data = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
        const fileToDelete = data.rows[0]?.profile_picture;
        if (fileToDelete) {
            const filePath = path.join(__dirname, '../uploads/', fileToDelete);
            if (fs.existsSync(filePath)) { fs.unlinkSync(filePath); }
        }
        await req.db.query("UPDATE streamers SET profile_picture = NULL WHERE user_id = $1", [id]);
        await req.db.query("UPDATE users SET profile_picture = NULL WHERE id = $1", [id]);
        return res.json({ success: true, message: "Kembali ke identitas default avatar." });
    } catch (err) {
        console.error("🔥 Error deleteProfilePhoto:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};