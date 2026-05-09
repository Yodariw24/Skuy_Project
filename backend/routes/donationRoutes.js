import express from 'express';
const router = express.Router();

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

// --- 1. PUBLIC PROFILE PROTOCOL ---
// Dipakai di halaman donasi (No Auth Needed)
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
        res.status(500).json({ success: false, message: "Database Ngadat!" });
    }
});

// --- 2. SULTAN PRIVACY ROUTES (Auth Required) ---
// Dipakai di Dashboard (Butuh Login)
router.post('/withdraw', protect, withdrawBalance); 
router.get('/history/:id', protect, getWalletHistory); 
router.get('/balance/:id', protect, getStreamerBalance);
router.get('/activity-feed', protect, async (req, res) => {
    // Rute instan buat feed di dashboard tanpa ribet passing ID di URL
    try {
        const result = await req.db.query(
            "SELECT * FROM donations WHERE streamer_id = $1 AND status = 'SUCCESS' ORDER BY created_date DESC LIMIT 10",
            [req.user.id]
        );
        res.json({ success: true, donations: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, donations: [] });
    }
});

// --- 3. PUBLIC HISTORY (For Profile Page) ---
router.get('/public-history/:id', getPublicHistory); 

// --- 4. DONATION ENGINE ---
router.post('/create', validateDonation, createDonation); 
router.put('/status/:id', updateDonationStatus); 

// Fallback buat narik semua data donasi (Admin/Dev only)
router.get('/list/:id', protect, getDonationsByStreamer);

export default router;