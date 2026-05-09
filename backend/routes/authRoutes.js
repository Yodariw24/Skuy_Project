import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default'; 
import QRCode from 'qrcode';
import 'dotenv/config';

const router = express.Router();

// --- 1. HELPER: GENERATE JWT ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 2. GOOGLE AUTH & LOGIN MANUAL ---
// (Tetap pakai kodingan lo yang sudah ada, sudah benar logikanya)

// --- 3. QR-CODE SETUP ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Sultan tidak ditemukan!" });

        // Generate secret yang konsisten
        const secret = authenticator.generateSecret(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Simpan secret mentah (library bakal handle case sensitive)
        await req.db.query("UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = false WHERE id = $2", [secret, userId]);
        
        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal generate QR." });
    }
});

// --- 4. VERIFY 2FA (THE ULTIMATE FIX) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user?.two_fa_secret) return res.status(400).json({ success: false, message: "Setup dulu, Ri!" });

        // Pembersihan total: hapus spasi dan pastikan format secret bersih
        const secret = user.two_fa_secret.trim();
        const inputToken = token.trim().replace(/\s/g, '');

        // 🛡️ SOLUSI PALING AMPUH: Gunakan authenticator.check
        // 'window: 2' berarti mengecek 1 menit ke belakang dan 1 menit ke depan (Total 3 menit)
        // Ini jauh lebih stabil daripada generate manual satu per satu
        const isValid = authenticator.check(inputToken, secret);

        // Backup: Kalau tetap gagal, kita paksa cek pakai window manual yang lebih luas
        const isExtraValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 2 // Toleransi 1 menit
        });

        if (isValid || isExtraValid) {
            await req.db.query("UPDATE users SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            // Ambil data user terbaru untuk dikirim ke frontend
            const tokenJwt = generateToken(user);
            
            res.json({ 
                success: true, 
                token: tokenJwt,
                user: { 
                    id: user.id, 
                    username: user.username, 
                    is_two_fa_enabled: true 
                } 
            });
        } else {
            // Debugging buat lo di log Railway
            const serverCodeNow = authenticator.generate(secret);
            console.log(`[OTP_FAILED] User: ${userId} | Input: ${inputToken} | Server_Expects: ${serverCodeNow}`);
            
            res.status(400).json({ 
                success: false, 
                message: `OTP Salah! Cek sinkronisasi jam HP lo ya.` 
            });
        }
    } catch (err) {
        console.error("🔥 VERIFY_ERROR:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
});

router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await req.db.query("UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1", [userId]);
        res.json({ success: true, message: "2FA Dinonaktifkan." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal." });
    }
});

export default router;