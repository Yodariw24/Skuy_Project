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
    updateBankInfo,
    updateProfileInfo,
    updateProfilePhoto, 
    deleteProfilePhoto 
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
        cb(null, `avatar-${req.params.id || 'new'}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 2 * 1024 * 1024 } // Batas 2MB
});

// --- 2. ENDPOINT KHUSUS DASHBOARD & THEME ---

// ✅ UPDATE TEMA: Supaya tampilan Sultan tetap estetik
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

// ✅ SYNC DASHBOARD: Mengambil data dari 3 tabel sekaligus (Users, Streamers, Balance)
router.get('/dashboard-sync', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "ID Sultan diperlukan!" });

    try {
        // ✅ MENGAMBIL STATUS 2FA LANGSUNG DARI TABEL USERS
        const query = `
            SELECT 
                u.id, u.username, u.role, u.is_two_fa_enabled, 
                s.full_name, s.display_name, s.profile_picture, s.theme_color, 
                COALESCE(b.total_saldo, 0) as total_saldo
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            LEFT JOIN balance b ON u.id = b.streamer_id
            WHERE u.id = $1
        `;
        const result = await req.db.query(query, [userId]);
        
        if (result.rows.length > 0) {
            const userData = result.rows[0];
            
            // Default Values agar Frontend tidak crash
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

// ✅ WALLET HISTORY
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

// --- 3. ROUTES STANDAR ---
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);
router.post('/upload-photo/:id', upload.single('profile_picture'), updateProfilePhoto);
router.delete('/photo/:id', deleteProfilePhoto);

export default router;