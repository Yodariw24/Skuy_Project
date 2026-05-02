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
    limits: { fileSize: 2 * 1024 * 1024 } 
});

// --- 2. ENDPOINT KHUSUS DASHBOARD & WALLET (SOLUSI 404 & WHITE SCREEN) ---

// ✅ SYNC DASHBOARD: Pastikan role 'creator' terkirim dengan benar
router.get('/dashboard-sync', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "UserId mana, Ri?" });

    try {
        const query = `
            SELECT u.id, u.username, u.role, s.full_name, s.profile_picture, b.total_saldo
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            LEFT JOIN balance b ON u.id = b.streamer_id
            WHERE u.id = $1
        `;
        const result = await req.db.query(query, [userId]);
        
        if (result.rows.length > 0) {
            // Kita pastiin role nggak undefined. Kalau null di DB, paksa jadi 'creator'
            const userData = result.rows[0];
            userData.role = userData.role || 'creator'; 
            
            res.json({ success: true, user: userData });
        } else {
            res.status(404).json({ success: false, message: "User gak ketemu!" });
        }
    } catch (err) {
        console.error("SYNC ERROR:", err.message);
        res.status(500).json({ success: false, message: "Gagal sinkron dashboard" });
    }
});

// ✅ WALLET HISTORY: Fix 'filter is not a function' dengan return array kosong jika data nihil
router.get('/wallet/history/:id', async (req, res) => {
    try {
        // Query ambil saldo
        const resBalance = await req.db.query('SELECT total_saldo FROM balance WHERE streamer_id = $1', [req.params.id]);
        
        // Query ambil history (Gue asumsikan tabel lo namanya 'transactions')
        // Balikin array [] supaya frontend lo gak crash pas pake .filter() atau .map()
        const resHistory = await req.db.query('SELECT * FROM transactions WHERE streamer_id = $1 ORDER BY created_at DESC LIMIT 10', [req.params.id]);

        res.json({ 
            success: true, 
            balance: resBalance.rows[0]?.total_saldo || 0,
            history: resHistory.rows || [] // WAJIB ARRAY biar gak white screen
        });
    } catch (err) {
        res.status(500).json({ success: false, history: [], message: "Gagal ambil history" });
    }
});

// --- 3. ROUTES STANDAR ---
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// Widget & Photo
router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);
router.post('/upload-photo/:id', upload.single('profile_picture'), updateProfilePhoto);
router.delete('/photo/:id', deleteProfilePhoto);

export default router;