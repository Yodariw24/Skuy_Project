import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default'; 
import QRCode from 'qrcode';
import 'dotenv/config';

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- (Rute Google & Login Tetap Sama) ---

// --- 4. QR-CODE TOTP (AUTO-CONNECT & MASTER KEY) ---

router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        const secret = authenticator.generateSecret().toUpperCase(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // ✅ AUTO-CONNECT: Begitu user buka QR, status di DB langsung TRUE
        await req.db.query(
            "UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = true WHERE id = $2", 
            [secret, userId]
        );

        res.json({ 
            success: true, 
            qrCode: qrCodeUrl, 
            message: "2FA Aktif! Silakan scan, status sudah Connected otomatis. ✨" 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup QR." });
    }
});

router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user || !user.two_fa_secret) return res.status(400).json({ success: false, message: "Setup dulu!" });

        const secret = user.two_fa_secret.trim().toUpperCase();
        const inputToken = token.trim().replace(/\s/g, '');

        // 🛡️ MASTER KEY SULTAN: '241004' (Bypass kalau jam HP/Server ngaco)
        const masterKey = '241004'; 

        // ✅ VERIFIKASI DENGAN TOLERANSI WINDOW 10 ATAU MASTER KEY
        const isValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 10 
        }) || (inputToken === masterKey);

        if (isValid) {
            // Pastiin status tetep true (jaga-jaga kalau ada bug reset)
            await req.db.query("UPDATE users SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            res.json({ 
                success: true, 
                token: generateToken(user),
                user: { 
                    id: user.id, 
                    username: user.username, 
                    is_two_fa_enabled: true,
                    role: user.role 
                } 
            });
        } else {
            // Kasih tau angka yang sebenernya dimau server di log (cek di Railway!)
            const expected = authenticator.generate(secret);
            console.warn(`[OTP_FAIL] User: ${userId} | Input: ${inputToken} | Server_Mau: ${expected}`);
            
            res.status(400).json({ 
                success: false, 
                message: `OTP Salah! Gunakan kode dari HP lo atau Master Key lo, Ri!` 
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Error verifikasi." });
    }
});

router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await req.db.query("UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1", [userId]);
        res.json({ success: true, message: "Proteksi 2FA dicabut." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal." });
    }
});

export default router;