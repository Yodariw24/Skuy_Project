const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const { 
  createDonation, 
  getDonationsByStreamer, 
  updateDonationStatus, 
  getStreamerBalance,
  getPublicHistory,
  getWalletHistory,
  withdrawBalance
} = require('../controllers/donationController');

const { validateDonation } = require('../middleware/validator');

// --- 1. ROUTE AMBIL PROFIL VIA USERNAME (FIXED TOTAL) ---
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // FIX: Nama tabel 'streamers' (bukan users)
    // FIX: Kolom 'profile_picture' (bukan avatar)
    const result = await pool.query(
      "SELECT id, username, display_name, full_name, bio, theme_color, profile_picture FROM streamers WHERE username ILIKE $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Creator tidak ditemukan" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    // Pesan ini akan muncul di terminal backend kamu kalau ada masalah
    console.error("SQL ERROR DI GUDANG STREAMERS:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. ROUTE SPESIFIK ---
router.post('/withdraw', withdrawBalance); 

// --- 3. ROUTE DENGAN PARAMETER :id ---
router.get('/:id/wallet-history', getWalletHistory); 
router.get('/:id/balance', getStreamerBalance);
router.get('/:id/history', getPublicHistory);
router.put('/:id/status', updateDonationStatus);
router.get('/:id', getDonationsByStreamer);

// --- 4. PUBLIC ROUTE ---
router.post('/', validateDonation, createDonation); 

module.exports = router;