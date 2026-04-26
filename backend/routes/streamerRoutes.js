const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Import Controllers
const { 
  getAllStreamers, 
  createStreamer, 
  getStreamerByUsername, 
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto, 
  deleteProfilePhoto 
} = require('../controllers/streamerController');

// WAJIB: Import Widget Controller
const widgetController = require('../controllers/widgetController');

// Konfigurasi Multer (Singkat)
const upload = multer({ 
  dest: 'uploads/', 
  limits: { fileSize: 2 * 1024 * 1024 } 
});

// --- ROUTES ---

// Widget Settings (Ini yang bikin 404 kalau tidak ada)
router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

// Profile & Bank
router.get('/', getAllStreamers);
router.post('/', createStreamer);
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// Foto Profil
router.post('/upload-photo/:id', upload.single('profile_picture'), updateProfilePhoto);
router.delete('/photo/:id', deleteProfilePhoto);
router.get('/public/:username', getStreamerByUsername);

module.exports = router;