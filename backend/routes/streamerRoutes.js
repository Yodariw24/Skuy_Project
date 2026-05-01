const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import Controllers
const { 
  getAllStreamers, 
  getStreamerByUsername, 
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto, 
  deleteProfilePhoto 
} = require('../controllers/streamerController');

const widgetController = require('../controllers/widgetController');

// --- 1. CONFIG MULTER STORAGE (PRO VERSION) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Pastikan folder ada, kalau gak ada kita buat otomatis
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Format: user-id-timestamp.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.params.id || 'new'}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Gunakan JPG/PNG/WebP.'), false);
  }
};

const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit 2MB biar gak berat di Railway
});

// --- 2. ROUTES ---

// Widget Settings (Crucial for OBS Alerts)
router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

// Profile & Bank Management
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);

// Gunakan ID dari parameter untuk update (Pastikan divalidasi di controller)
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// --- 3. PHOTO PROTOCOL ---
// Route ini yang dipanggil dari ProfileSettings.jsx tadi
router.post('/upload-photo/:id', upload.single('profile_picture'), (req, res, next) => {
  // Error handling khusus multer
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Gak ada file yang diupload, Ri!" });
  }
  next();
}, updateProfilePhoto);

router.delete('/photo/:id', deleteProfilePhoto);

module.exports = router;