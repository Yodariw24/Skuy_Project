import express from 'express';
const router = express.Router();

// Import fungsi dari Controller (Termasuk perbaikan logika finansial & analitik)
import { 
    createDonation, 
    getDonationsByStreamer, 
    updateDonationStatus, 
    getStreamerBalance,
    getPublicHistory,
    getWalletHistory,
    withdrawBalance,
    getStreamerAnalytics // ✅ SINKRON: Import fungsi agregasi analitik Postgres lo
} from '../controllers/donationController.js';

import { validateDonation } from '../middleware/validator.js';
import { protect } from '../middleware/authMiddleware.js';

/**
 * 🛡️ INTERNAL MIDDLEWARE: AUTOMATED ID CONVERTER INTERCEPTOR
 * Fungsi sakti untuk menjamin req.user.streamer_id selalu terisi 
 * berdasarkan data join asli database sebelum dilempar ke controller.
 */
const injectStreamerId = async (req, res, next) => {
    try {
        if (!req.user?.id) return next();
        
        // Pancing ID streamer asli dari database berdasarkan User ID yang sedang aktif login
        const streamerCheck = await req.db.query(
            "SELECT id FROM streamers WHERE user_id = $1", 
            [req.user.id]
        );
        
        if (streamerCheck.rows.length > 0) {
            // Kunci streamer_id asli ke dalam object request session
            req.user.streamer_id = streamerCheck.rows[0].id;
        } else {
            // Fallback darurat jika user ternyata belum terdaftar sebagai streamer
            req.user.streamer_id = req.user.id;
        }
        next();
    } catch (err) {
        console.error("🔥 Interceptor ID Error:", err.message);
        next();
    }
};

/**
 * --- 1. PUBLIC GATEWAY PROTOCOLS (No Auth Needed) ---
 * Akses publik terbuka tanpa token untuk donatur, widget OBS overlay, dan landing page explorer
 */
router.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ success: false, message: "Mana username-nya, Ri?" });

    try {
        const result = await req.db.query(
            `SELECT s.id, s.user_id, s.username, s.display_name, s.bio, s.theme_color, s.profile_picture, u.is_two_fa_enabled 
             FROM streamers s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.username ILIKE $1`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Sultan tidak terdeteksi!" });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("🔥 Profile Fetch Error:", err.message);
        res.status(500).json({ success: false, message: "Database Ngadat!" });
    }
});

// Jalur pencarian chip kategori & list terbuka untuk Landing Page & Explore Hub lo, Ri ✅
router.get('/categories', async (req, res) => {
    try {
        const result = await req.db.query("SELECT id, name FROM categories ORDER BY name ASC");
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/list', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT s.id, s.username, s.display_name, s.bio, s.profile_picture, c.name as category_name 
            FROM streamers s
            LEFT JOIN categories c ON s.category_id = c.id
        `;
        const params = [];
        if (category && category !== 'Semua') {
            query += " WHERE s.category_id = $1";
            params.push(category);
        }
        const result = await req.db.query(query, params);
        res.json({ success: true, streamers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, streamers: [] });
    }
});

router.get('/balance/:id', getStreamerBalance); 
router.get('/public-history/:id', getPublicHistory); 

/**
 * --- 2. SULTAN PRIVACY ROUTES (Auth Required) 🛡️ ---
 * Rute eksklusif internal dashboard yang diproteksi ketat menggunakan enkripsi token session
 */
router.post('/withdraw', protect, injectStreamerId, withdrawBalance); 
router.get('/history', protect, injectStreamerId, getWalletHistory); 
router.get('/list-internal', protect, injectStreamerId, getDonationsByStreamer); // Diubah jalurnya agar tidak bentrok dengan list publik

// ✅ SINKRON: Endpoint penggerak grafik Recharts dinamis untuk halaman analitik performa lo, Ri!
router.get('/analytics-report', protect, injectStreamerId, getStreamerAnalytics);

/**
 * --- 3. REFINED ACTIVITY FEED (Auth Required) ---
 */
router.get('/activity-feed', protect, injectStreamerId, async (req, res) => {
    try {
        const targetStreamerId = req.user.streamer_id || req.user.id;

        const result = await req.db.query(
            "SELECT * FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 15",
            [targetStreamerId]
        );
        res.json({ success: true, donations: result.rows });
    } catch (err) {
        console.error("🔥 Activity Feed Error:", err.message);
        res.status(500).json({ success: false, donations: [] });
    }
});

/**
 * --- 4. DONATION ENGINE (Transaksi Gateway Protocol) ---
 */
router.post('/create', validateDonation, createDonation); 
router.put('/status/:id', updateDonationStatus); 

export default router;