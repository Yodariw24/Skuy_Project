const express = require('express');
const router = express.Router();
// req.db sudah di-inject di server.js, jadi kita gak butuh require pool lagi di sini kalau mau konsisten
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

// --- 1. PROFIL PROTOCOL (Dinamis via Username) ---
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // ILIKE biar case-insensitive (Ari atau ari sama aja)
    const result = await req.db.query(
      "SELECT id, username, display_name, full_name, bio, theme_color, profile_picture FROM streamers WHERE username ILIKE $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Sultan tidak ditemukan di database Railway!" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("🔥 DATABASE PROFILE ERROR:", err.message);
    res.status(500).json({ success: false, message: "Gagal mengambil data Sultan." });
  }
});

// --- 2. TRANSACTIONAL ROUTES (Urutan Statis di Atas) ---
// Catatan: Pastikan endpoint withdraw ini diproteksi middleware auth nantinya
router.post('/withdraw', withdrawBalance); 

// --- 3. STREAMER SPECIFIC DATA (Via ID) ---
router.get('/:id/balance', getStreamerBalance);
router.get('/:id/wallet-history', getWalletHistory); 
router.get('/:id/history', getPublicHistory); // History publik untuk halaman donasi
router.get('/:id', getDonationsByStreamer);

// --- 4. DONATION ACTION ---
router.post('/', validateDonation, createDonation); 
router.put('/:id/status', updateDonationStatus); // ID di sini adalah donationId

module.exports = router;