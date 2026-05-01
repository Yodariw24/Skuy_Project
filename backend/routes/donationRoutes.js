import express from 'express';
const router = express.Router();

// WAJIB pakai akhiran .js agar terbaca oleh Node.js ESM
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

// --- 1. PROFIL PROTOCOL (Dinamis via Username) ---
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  
  // Proteksi dasar: jika username kosong atau tidak valid
  if (!username) {
    return res.status(400).json({ success: false, message: "Username harus diisi!" });
  }

  try {
    // ILIKE sudah bagus agar case-insensitive (Ari atau ari tetap ketemu)
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
    res.status(500).json({ success: false, message: "Terjadi gangguan saat mengambil data profil." });
  }
});

// --- 2. TRANSACTIONAL ROUTES ---
// Pastikan kedepannya ini diproteksi middleware auth (misal: verifyToken)
router.post('/withdraw', withdrawBalance); 

// --- 3. STREAMER SPECIFIC DATA (Via ID) ---
// Menggunakan regex (:id(\\d+)) opsional jika ID kamu bertipe integer agar rute tidak bentrok
router.get('/:id/balance', getStreamerBalance);
router.get('/:id/wallet-history', getWalletHistory); 
router.get('/:id/history', getPublicHistory); 
router.get('/:id', getDonationsByStreamer);

// --- 4. DONATION ACTION ---
router.post('/', validateDonation, createDonation); 
router.put('/:id/status', updateDonationStatus); 

export default router;