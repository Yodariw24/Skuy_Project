import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Controllers
import { 
    getAllStreamers, 
    getStreamerByUsername, 
    updateBankInfo
} from '../controllers/streamerController.js';
import * as widgetController from '../controllers/widgetController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIG MULTER STORAGE ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 2 * 1024 * 1024 } 
});

// --- 2. ENDPOINT DASHBOARD & WALLET ---

// ✅ FIX WALLET HISTORY: Disesuaikan agar bisa dipanggil via /api/wallet/history/:id
router.get('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resBalance = await req.db.query('SELECT total_saldo FROM balance WHERE streamer_id = $1', [id]);
        const resHistory = await req.db.query(
            'SELECT * FROM transactions WHERE streamer_id = $1 ORDER BY created_at DESC LIMIT 10', 
            [id]
        );

        res.json({ 
            success: true, 
            balance: resBalance.rows[0]?.total_saldo || 0,
            history: resHistory.rows || [] 
        });
    } catch (err) {
        console.error("WALLET_HISTORY_ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal menarik riwayat transaksi." });
    }
});

router.get('/dashboard-sync', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "ID Sultan diperlukan!" });

    try {
        const query = `
            SELECT 
                u.id, u.username, u.role, u.is_two_fa_enabled, 
                s.full_name, s.display_name, s.profile_picture, s.theme_color, s.bio, s.instagram, s.tiktok, s.youtube,
                COALESCE(b.total_saldo, 0) as total_saldo
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            LEFT JOIN balance b ON u.id = b.streamer_id
            WHERE u.id = $1
        `;
        const result = await req.db.query(query, [userId]);
        
        if (result.rows.length > 0) {
            const userData = result.rows[0];
            userData.role = userData.role || 'creator'; 
            userData.theme_color = userData.theme_color || 'violet';
            res.json({ success: true, user: userData });
        } else {
            res.status(404).json({ success: false, message: "Data tidak ditemukan." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal sinkronisasi cloud." });
    }
});

// --- 3. PROFIL & AVATAR ---

router.post('/upload-avatar', upload.single('image'), async (req, res) => {
    const { userId } = req.body;
    if (!req.file || !userId) return res.status(400).json({ success: false, message: "Data tidak lengkap!" });

    try {
        const filename = req.file.filename;
        // Simpan ke streamers & users untuk sinkronisasi
        await req.db.query('UPDATE streamers SET profile_picture = $1 WHERE user_id = $2', [filename, userId]);
        await req.db.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [filename, userId]);
        
        res.json({ success: true, message: "Avatar updated!", filename });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal simpan foto." });
    }
});

router.post('/delete-avatar', async (req, res) => {
    const { userId } = req.body;
    try {
        await req.db.query('UPDATE streamers SET profile_picture = NULL WHERE user_id = $1', [userId]);
        await req.db.query('UPDATE users SET profile_picture = NULL WHERE id = $1', [userId]);
        res.json({ success: true, message: "Avatar reset!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal hapus foto." });
    }
});

router.put('/update-profile', async (req, res) => {
    const { userId, display_name, bio, instagram, tiktok, youtube } = req.body;
    try {
        const query = `
            UPDATE streamers 
            SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5 
            WHERE user_id = $6 
            RETURNING *
        `;
        const result = await req.db.query(query, [display_name, bio, instagram, tiktok, youtube, userId]);
        
        if(result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal update profil." });
    }
});

// --- 4. STANDAR ROUTES ---
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);
router.put('/update-theme', async (req, res) => {
    const { theme_color, userId } = req.body;
    try {
        await req.db.query('UPDATE streamers SET theme_color = $1 WHERE user_id = $2', [theme_color, userId]);
        res.json({ success: true, message: "Theme Updated!" });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

export default router;