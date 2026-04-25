const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// --- 1. KONFIGURASI PENYIMPANAN MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder 'uploads' sudah dibuat manual di root backend
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Membuat nama file unik: profile-timestamp-random.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter agar hanya file gambar yang bisa diupload
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit ukuran 2MB
});

// --- 2. IMPORT CONTROLLERS ---
const { 
  getAllStreamers, 
  createStreamer, 
  getStreamerByUsername, 
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto, // Fungsi baru untuk upload
  deleteProfilePhoto  // Fungsi baru untuk delete
} = require('../controllers/streamerController');

// --- 3. DEFINISI JALUR (ROUTES) ---

router.get('/', getAllStreamers);
router.post('/', createStreamer);

// Jalur Update Bank & Profile Info
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// --- JALUR FOTO PROFIL ---
// Upload Foto: Gunakan middleware upload.single('profile_picture')
// 'profile_picture' adalah nama field yang dikirim dari FormData di Frontend
router.post('/upload-photo/:id', upload.single('profile_picture'), updateProfilePhoto);

// Hapus Foto (Kembali ke default)
router.delete('/photo/:id', deleteProfilePhoto);

// Jalur Profil Publik (Tanpa Auth)
router.get('/public/:username', getStreamerByUsername);

module.exports = router;