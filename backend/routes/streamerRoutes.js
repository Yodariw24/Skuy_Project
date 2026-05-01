import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Controllers - WAJIB pakai akhiran .js
import { 
  getAllStreamers, 
  getStreamerByUsername, 
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto, 
  deleteProfilePhoto 
} from '../controllers/streamerController.js';

import * as widgetController from '../controllers/widgetController.js';

// Fix untuk __dirname di ES Modules (Agar folder uploads/ terbaca benar)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIG MULTER STORAGE ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
    // Buat folder uploads jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
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
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB Limit
});

// --- 2. ROUTES ---

// Widget Settings
router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

// Profile & Bank Management
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// --- 3. PHOTO PROTOCOL ---
router.post('/upload-photo/:id', upload.single('profile_picture'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Gak ada file yang diupload, Ri!" });
  }
  next();
}, updateProfilePhoto);

router.delete('/photo/:id', deleteProfilePhoto);

export default router; // Ganti module.exports