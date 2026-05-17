import express from 'express';
const router = express.Router();

// Import semua fungsi dari Controller (Termasuk logic Tiering & Real-time)
import { 
    createDonation, 
    getDonationsByStreamer, 
    updateDonationStatus, 
    getStreamerBalance,
    getPublicHistory,
    getWalletHistory,
    withdrawBalance
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
 * --- 1. PUBLIC PROFILE PROTOCOL (Gate Jualan Sultan) ---
 * No Auth Needed: Untuk donatur melihat profil kreator sebelum nyawer
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

/**
 * --- 2. PUBLIC FINANSER & HISTORY NODES (No Auth Needed) ---
 * Akses publik bebas tanpa token untuk rendering di widget overlay / profil external
 */
router.get('/balance/:id', getStreamerBalance); 
router.get('/public-history/:id', getPublicHistory); 

/**
 * --- 3. SULTAN PRIVACY ROUTES (Auth Required) ---
 * Rute eksklusif yang benar-benar sensitif wajib lolos verifikasi token & inject ID
 */
router.post('/withdraw', protect, injectStreamerId, withdrawBalance); 
router.get('/history/:id', protect, injectStreamerId, getWalletHistory); 
router.get('/list/:id', protect, injectStreamerId, getDonationsByStreamer); 

/**
 * --- 4. REFINED ACTIVITY FEED (Auth Required) ---
 * Menggunakan req.user.streamer_id bawaan token & interceptor agar logs lancar jaya!
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
 * --- 5. DONATION ENGINE (Transaksi Meledak Protocol) ---
 * Jalur transaksi donasi QRIS/E-Wallet dan verifikator status sukses simulasi
 */
router.post('/create', validateDonation, createDonation); 
router.put('/status/:id', updateDonationStatus); 

export default router;