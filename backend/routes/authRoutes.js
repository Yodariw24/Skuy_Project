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
// (Gue asumsikan ini sudah aman karena lo bilang kodenya sudah oke)

// --- 3. SETUP 2FA ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        // Paksa generate secret base32 yang standar
        const secret = authenticator.generateSecret(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // Simpan secret mentah ke DB
        await req.db.query("UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = false WHERE id = $2", [secret, userId]);
        
        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal generate QR." });
    }
});

// --- 4. VERIFY 2FA (THE REAL FIX) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        // Tarik data user lengkap
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user || !user.two_fa_secret) {
            return res.status(400).json({ success: false, message: "Setup dulu, Ri!" });
        }

        // MEMBERSIHKAN DATA (Hapus spasi, pastikan uppercase)
        const secret = user.two_fa_secret.trim().toUpperCase();
        const inputToken = token.trim().replace(/\s/g, '');

        // 🛡️ STRATEGI PAMUNGKAS:
        // Gunakan authenticator.check untuk validasi yang lebih akurat
        const isValid = authenticator.check(inputToken, secret);

        // Jika cara standar gagal, kita pake verify dengan toleransi 'window: 2'
        // (Berarti mengecek 1 menit ke belakang dan 1 menit ke depan)
        const isExtraValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 2 
        });

        if (isValid || isExtraValid) {
            // Update status 2FA jadi Aktif
            await req.db.query("UPDATE users SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            // ✅ WAJIB: Kirim token JWT biar langsung login ke dashboard
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
            const serverCode = authenticator.generate(secret);
            console.log(`[FAILED_OTP] User: ${userId} | Input: ${inputToken} | Server_Want: ${serverCode}`);
            
            res.status(400).json({ 
                success: false, 
                message: "Kode OTP Salah! Cek jam HP lo, harus otomatis." 
            });
        }
    } catch (err) {
        console.error("🔥 VERIFY_ERROR:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error." });
    }
});

export default router;