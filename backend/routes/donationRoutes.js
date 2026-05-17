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
 * Rute eksklusif yang benar-benar sensitif wajib pakai Token Sultan (Login)
 */
router.post('/withdraw', protect, withdrawBalance); 
router.get('/history/:id', protect, getWalletHistory); 
router.get('/list/:id', protect, getDonationsByStreamer); 

/**
 * --- 4. REFINED ACTIVITY FEED (Auth Required) ---
 * ✅ FIXED: Menggunakan req.user.streamer_id bawaan Token agar data kasta donatur langsung tembus!
 */
router.get('/activity-feed', protect, async (req, res) => {
    try {
        // 🛡️ SAKTI: Ambil ID Kasta Streamer hasil query sync authMiddleware lo, Ri!
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