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

// --- SETUP 2FA (AUTO-CONNECT) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        
        // Paksa generate secret & bersihkan spasi
        const secret = authenticator.generateSecret().toUpperCase().trim(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // ✅ AUTO-CONNECT: Status langsung TRUE
        await req.db.query(
            "UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = true WHERE id = $2", 
            [secret, userId]
        );

        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup QR." });
    }
});

// --- VERIFY 2FA (BYPASS MODE) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user || !user.two_fa_secret) return res.status(400).json({ success: false, message: "Setup dulu!" });

        // 🛡️ PEMBERSIHAN TOTAL: Hapus semua karakter aneh & spasi dari DB
        const secret = String(user.two_fa_secret).replace(/\s/g, '').toUpperCase();
        const inputToken = String(token).replace(/\s/g, '');

        // 🔑 MASTER KEY DARURAT
        const masterKey = '241004'; 

        // Verifikasi sangat longgar (Window 10 = +/- 5 menit)
        const isValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 10 
        }) || (inputToken === masterKey);

        if (isValid) {
            const tokenJwt = generateToken(user);
            res.json({ 
                success: true, 
                token: tokenJwt,
                user: { id: user.id, username: user.username, is_two_fa_enabled: true } 
            });
        } else {
            // Debugging: Liat di Railway Log apa yang dimau server
            const serverCode = authenticator.generate(secret);
            console.log(`[DEBUG] Input: ${inputToken} | Server_Mau: ${serverCode} | Secret_DB: ${secret}`);
            
            res.status(400).json({ success: false, message: "OTP Salah! Gunakan Master Key." });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi." });
    }
});

export default router;