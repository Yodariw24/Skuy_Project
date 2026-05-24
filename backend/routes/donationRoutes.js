/**
 * SKUYGG FINANCIAL & DONATION CORE ROUTER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI (RE-CALIBRATED SECURE INTERCEPTOR)
 */

import express from 'express';
const router = express.Router();

// Import fungsi dari Controller (Termasuk perbaikan logika finansial, analitik & webhook callback)
import { 
    createDonation, 
    getDonationsByStreamer, 
    updateDonationStatus, 
    getStreamerBalance,
    getPublicHistory,
    getWalletHistory,
    withdrawBalance,
    getStreamerAnalytics,
    handleMidtransCallback // ✅ IMPORT WEBHOOK ENGINE BARU UNTUK OTOMATISASI SANDBOX
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
            [parseInt(req.user.id, 10)] // ✅ FIXED: Amankan kueri pencarian user_id bertipe Integer
        );
        
        if (streamerCheck.rows.length > 0) {
            // Kunci streamer_id asli ke dalam object request session (Integer)
            req.user.streamer_id = parseInt(streamerCheck.rows[0].id, 10);
        } else {
            // ✅ FIXED FALLBACK: Paksa konversi ke integer murni agar tidak merusak kueri controller
            req.user.streamer_id = parseInt(req.user.id, 10);
        }
        next();
    } catch (err) {
        console.error("🔥 Interceptor ID Error:", err.message);
        next();
    }
};

// --- ===================================================================== ---
// --- 1. SULTAN PRIVACY ROUTES (Auth Required) - TARUH DI ATAS AGAR AMAN    ---
// --- ===================================================================== ---

router.post('/withdraw', protect, injectStreamerId, withdrawBalance); 
router.get('/history', protect, injectStreamerId, getWalletHistory); 

// ✅ SINKRON: Endpoint penggerak grafik Recharts dinamis untuk halaman analitik performa lo, Ri!
router.get('/analytics-report', protect, injectStreamerId, getStreamerAnalytics);

// ✅ CLEAN & PRO-GRADE: Menggabungkan list-internal menggunakan tanda tanya (?) agar parameter bersifat opsional dan ringkas
router.get('/list-internal/:id?', protect, injectStreamerId, getDonationsByStreamer);

/**
 * --- REFINED ACTIVITY FEED (Auth Required) ---
 */
router.get('/activity-feed', protect, injectStreamerId, async (req, res) => {
    try {
        const targetStreamerId = req.user.streamer_id || req.user.id;
        const castId = parseInt(targetStreamerId, 10); // ✅ SAFETY FIRST

        const result = await req.db.query(
            "SELECT * FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 15",
            [castId]
        );
        res.json({ success: true, donations: result.rows });
    } catch (err) {
        console.error("🔥 Activity Feed Error:", err.message);
        res.status(500).json({ success: false, donations: [] });
    }
});


// --- ===================================================================== ---
// --- 2. PUBLIC GATEWAY PROTOCOLS (No Auth Needed - Diletakkan di Bawah)     ---
// --- ===================================================================== ---

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
            params.push(parseInt(category, 10)); // ✅ SAFETY: Cast kueri filter kategori ke integer
        }
        query += " ORDER BY s.id DESC";
        const result = await req.db.query(query, params);
        res.json({ success: true, streamers: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, streamers: [] });
    }
});

// ✅ FIXED POSITION: Rute dinamis ditaruh di paling bawah agar tidak membajak path statis internal dashboard
router.get('/balance/:id', getStreamerBalance); 
router.get('/public-history/:id', getPublicHistory); 

router.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ success: false, message: "Mana username-nya, Ri?" });

    try {
        // ✅ FIXED TYPO: Membersihkan objek request database asli (req.db)
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

// --- ===================================================================== ---
// --- 3. DONATION ENGINE (Transaksi Gateway Protocol Webhook)               ---
// --- ===================================================================== ---
router.post('/create', validateDonation, createDonation); 
router.put('/status/:id', updateDonationStatus); 

// ✅ MIDTRANS WEBHOOK CALLBACK ENDPOINT
// Endpoint penampung data notifikasi otomatis pasca simulasi sukses dilakukan di Sandbox kit.
// Wajib ditaruh di rute publik (Bebas Middleware 'protect') agar robot Midtrans bisa menembak sukses ke sistem.
router.post('/midtrans-callback', handleMidtransCallback);

export default router;