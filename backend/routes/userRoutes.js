import express from 'express';
const router = express.Router();
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import Controllers
import { 
  getAllStreamers, 
  getStreamerByUsername, 
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto, 
  deleteProfilePhoto 
} from '../controllers/streamerController.js';

import * as widgetController from '../controllers/widgetController.js';

// Fix untuk __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 1. CONFIG MULTER STORAGE ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/');
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

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 2 * 1024 * 1024 } 
});

// --- 2. ROUTES DASAR ---
router.get('/', getAllStreamers);
router.get('/public/:username', getStreamerByUsername);
router.put('/bank/:id', updateBankInfo);
router.put('/profile/:id', updateProfileInfo); 

// --- 3. FIX ERROR 404 DASHBOARD & WALLET ---
// Tambahkan endpoint ini agar request /api/user/dashboard-sync tidak 404
router.get('/dashboard-sync', async (req, res) => {
    try {
        // Ambil data user + streamer lewat JOIN (menggunakan pool dari req.db)
        const query = `
            SELECT u.id, u.username, u.role, s.full_name, s.profile_picture, b.total_saldo
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            LEFT JOIN balance b ON s.id = b.streamer_id
            WHERE u.id = $1
        `;
        // Catatan: req.user.id harusnya dikirim dari middleware auth
        const result = await req.db.query(query, [req.query.userId]); 
        
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Data tidak ditemukan" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Tambahkan endpoint ini agar request /api/wallet/history/:id tidak 404
router.get('/history/:id', async (req, res) => {
    try {
        const query = 'SELECT * FROM balance WHERE streamer_id = $1';
        const result = await req.db.query(query, [req.params.id]);
        res.json({ success: true, data: result.rows[0] || { total_saldo: 0 } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 4. WIDGET & PHOTO ---
router.get('/widgets/settings/:streamKey/:widgetType', widgetController.getSettings);
router.post('/widgets/update', widgetController.updateSettings);

router.post('/upload-photo/:id', upload.single('profile_picture'), updateProfilePhoto);
router.delete('/photo/:id', deleteProfilePhoto);

export default router;