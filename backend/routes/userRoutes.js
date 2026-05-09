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
        // ✅ FIX: Nama file dibikin rapi tanpa butuh params ID lagi
        cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 2 * 1024 * 1024 } // Batas 2MB biar server gak jebol
});

// --- 2. ENDPOINT KHUSUS DASHBOARD & THEME ---

router.put('/update-theme', async (req, res) => {
    const { theme_color, userId } = req.body;
    const targetId = userId || req.query.userId;

    if (!theme_color) return res.status(400).json({ success: false, message: "Warna temanya mana, Ri?" });

    try {
        const query = `
            UPDATE streamers 
            SET theme_color = $1 
            WHERE user_id = $2 
            RETURNING theme_color
        `;
        const result = await req.db.query(query, [theme_color, targetId]);

        if (result.rows.length > 0) {
            res.json({ success: true, message: "Visual Protocol Applied! ✨", theme: result.rows[0].theme_color });
        } else {
            res.status(404).json({ success: false, message: "User tidak ditemukan!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal sinkronisasi tema." });
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
        console.error("DASHBOARD SYNC ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal sinkronisasi cloud." });
    }
});

router.get('/wallet/history/:id', async (req, res) => {
    try {
        const resBalance = await req.db.query('SELECT total_saldo FROM balance WHERE streamer_id = $1', [req.params.id]);
        const resHistory = await req.db.query(
            'SELECT * FROM transactions WHERE streamer_id = $1 ORDER BY created_at DESC LIMIT 10', 
            [req.params.id]
        );

        res.json({ 
            success: true, 
            balance: resBalance.rows[0]?.total_saldo || 0,
            history: resHistory.rows || [] 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal menarik riwayat transaksi." });
    }
});

// --- 3. ROUTES PROFIL & AVATAR (100% MATCH DENGAN FRONTEND) ---

// ✅ UPLOAD AVATAR (Nangkap file 'image' dari FormData frontend)
router.post('/upload-avatar', upload.single('image'), async (req, res) => {
    const { userId } = req.body;
    
    if (!req.file) return res.status(400).json({ success: false, message: "Fotonya mana, Ri?" });
    if (!userId) return res.status(400).json({ success: false, message: "Akses Ditolak: ID Sultan tidak valid!" });

    try {
        const filename = req.file.filename;
        // Update nama file foto di database
        await req.db.query('UPDATE streamers SET profile_picture = $1 WHERE user_id = $2', [filename, userId]);
        
        res.json({ success: true, message: "Avatar updated!", filename });
    } catch (err) {
        console.error("UPLOAD ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal nyimpen foto ke database." });
    }
});

// ✅ DELETE AVATAR
router.post('/delete-avatar', async (req, res) => {
    const { userId } = req.body;
    try {
        await req.db.query('UPDATE streamers SET profile_picture = NULL WHERE user_id = $1', [userId]);
        res.json({ success: true, message: "Avatar reset to default!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal hapus foto." });
    }
});

// ✅ UPDATE PROFIL
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
        console.error("UPDATE PROFILE ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal update profil." });
    }
});


// --- 4. ROUTES STANDAR LAINNYA ---
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);

router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

export default router;