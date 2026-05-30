/**
 * SKUYGG FINANCIAL & DONATION CORE ROUTER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI (FINAL STERILE PRODUCTION EDITION)
 * OPTIMIZED: REMOVED INTERCEPTOR REDUNDANCY FOR HIGH-THROUGHPUT PERFORMANCE
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
    handleMidtransCallback, // ✅ IMPORT WEBHOOK ENGINE BARU UNTUK OTOMATISASI SANDBOX
    getSystemAuditLogs // ✅ IMPORT ENGINE POWER BARU UNTUK DATA LOG ADMIN CONTROL
} from '../controllers/donationController.js';

import { validateDonation } from '../middleware/validator.js';
import { protect } from '../middleware/authMiddleware.js';

// ✅ IMPORT MIDDLEWARE AUDIT LOG UTAMA
import { logActivity } from '../middleware/auditLogger.js';

/**
 * 🛡️ INTERNAL MIDDLEWARE: OWNER ROLE VALIDATOR
 * Memastikan token yang masuk bener-bener milik SUPER_ADMIN (Ari) sebelum diizinkan mengintip log
 */
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Akses ilegal! Anda bukan Pemegang Kuasa PT SkuyGG, Ri!" });
    }
};

// --- ===================================================================== ---
// --- 1. SULTAN PRIVACY ROUTES (Auth Required) - TARUH DI ATAS AGAR AMAN    ---
// --- ===================================================================== ---
// ⚡ NOTE: injectStreamerId dieliminasi karena req.user.streamer_id sudah disuplai instan oleh middleware protect!

// 📸 MONITOR: Catat setiap request penarikan saldo rill dari akun streamer
router.post('/withdraw', protect, logActivity('WITHDRAW_REQUESTED'), withdrawBalance); 
router.get('/history', protect, getWalletHistory); 

// ✅ SINKRON: Endpoint penggerak grafik Recharts dinamis untuk halaman analitik performa lo, Ri!
router.get('/analytics-report', protect, getStreamerAnalytics);

// ✅ CLEAN & PRO-GRADE: Menggabungkan list-internal menggunakan tanda tanya (?) agar parameter bersifat opsional dan ringkas
router.get('/list-internal/:id?', protect, getDonationsByStreamer);

/**
 * --- REFINED ACTIVITY FEED (Auth Required) ---
 */
router.get('/activity-feed', protect, async (req, res) => {
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

// 📸 MONITOR: Rekam setiap kali ada donatur yang menekan tombol kirim donasi (inisialisasi QRIS)
router.post('/create', validateDonation, logActivity('DONATION_INITIATED'), createDonation); 

// 📸 MONITOR: Rekam mutasi perubahan status manual (jika ada)
router.put('/status/:id', logActivity('MANUAL_STATUS_UPDATED'), updateDonationStatus); 

// ✅ MIDTRANS WEBHOOK CALLBACK ENDPOINT
// 📸 MONITOR: Rekam log respon otomatis saat sistem diserang webhook sukses paska simulasi di Sandbox
router.post('/midtrans-callback', logActivity('PAYMENT_WEBHOOK_RECEIVED'), handleMidtransCallback);


// --- ===================================================================== ---
// --- 4. SUPER ADMIN HQ CONTROL CENTER (Exclusive Governance Layer)          ---
// --- ===================================================================== ---

// ✅ TERKUNCI DOUBLE SHIELD: Wajib lolos validasi token sesi login (protect) DAN verifikasi role database (isAdmin)
router.get('/super-admin/audit-logs', protect, isAdmin, getSystemAuditLogs);

export default router;