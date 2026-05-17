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
    updateProfileInfo 
} from '../controllers/streamerController.js';
import * as widgetController from '../controllers/widgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminProtect } from '../middleware/adminMiddleware.js'; // Import Shield Admin

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. MULTER CONFIG (Avatar Upload) ---
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

// --- 2. ENDPOINTS ---

/**
 * ✅ WALLET HISTORY NODE
 */
router.get('/wallet/history/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT id, amount, status, created_at, bank_info 
            FROM withdrawals 
            WHERE streamer_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await req.db.query(query, [id]);
        res.json({ success: true, history: result.rows });
    } catch (err) {
        console.error("❌ Wallet History Error:", err.message);
        res.status(500).json({ success: false, message: "Gagal mengambil riwayat transaksi." });
    }
});

/**
 * ✅ DASHBOARD SYNC (SaaS Pro Upgrade)
 * Menarik data role dan category_id untuk identitas SaaS
 */
router.get('/dashboard-sync', protect, async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.username, u.email, u.role, u.is_two_fa_enabled, 
                   s.full_name, s.display_name, s.profile_picture, s.theme_color, s.bio, 
                   s.instagram, s.tiktok, s.youtube, s.phone_number,
                   s.bank_name, s.bank_account_number, s.bank_account_name,
                   s.category_id,
                   COALESCE(b.total_saldo, 0) as total_saldo
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            LEFT JOIN balance b ON u.id = b.streamer_id
            WHERE u.id = $1
        `;
        const result = await req.db.query(query, [req.user.id]);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Sultan tidak terdaftar." });
        }
    } catch (err) { 
        console.error("❌ Dashboard Sync Error:", err.message);
        res.status(500).json({ success: false, message: "Gagal sinkron pangkalan data." }); 
    }
});

/**
 * ✅ PROFILE & BANK ACTIONS
 */
router.post('/upload-avatar', protect, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "Mana fotonya Ri?" });
    try {
        const filename = req.file.filename;
        await req.db.query('UPDATE streamers SET profile_picture = $1 WHERE user_id = $2', [filename, req.user.id]);
        await req.db.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [filename, req.user.id]);
        res.json({ success: true, filename });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.put('/update-profile', protect, updateProfileInfo);
router.put('/bank/:id', protect, updateBankInfo);

/**
 * ✅ THEME & WIDGETS
 */
router.put('/update-theme', protect, async (req, res) => {
    const { theme_color } = req.body;
    try {
        await req.db.query('UPDATE streamers SET theme_color = $1 WHERE user_id = $2', [theme_color, req.user.id]);
        res.json({ success: true, message: "Tema sultan diterapkan!" });
    } catch (err) { res.status(500).json({ success: false }); }
});

router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', protect, widgetController.updateSettings);

/**
 * ✅ PUBLIC ROUTES (Discovery SaaS)
 */
// Menampilkan semua kategori agar user bisa milih di Dashboard Settings
router.get('/categories', async (req, res) => {
    try {
        const result = await req.db.query('SELECT * FROM categories ORDER BY name ASC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

router.get('/public/:username', getStreamerByUsername);
router.get('/list', getAllStreamers);

/**
 * ✅ ADMIN COMMAND CENTER (Strict Protocol)
 */
router.get('/admin/platform-stats', protect, adminProtect, async (req, res) => {
    try {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT SUM(fee_amount) FROM donations WHERE status = 'SUCCESS') as total_revenue,
                (SELECT COUNT(*) FROM withdrawals WHERE status = 'PENDING') as pending_withdrawals
        `;
        const result = await req.db.query(query);
        res.json({ success: true, stats: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

export default router;