const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(express.json());

/**
 * HELPER: Generate JWT Token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

/**
 * 1. GOOGLE AUTH (SINKRON DENGAN 2FA)
 */
router.post('/google', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Token Google diperlukan" });

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();

        let { rows } = await pool.query("SELECT * FROM streamers WHERE email = $1", [email]);
        let streamer = rows[0];

        // Jika user baru, buatkan akun otomatis
        if (!streamer) {
            const username = name.replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000);
            const insertSql = `
                INSERT INTO streamers (username, email, full_name, profile_picture, role) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`;
            const newUser = await pool.query(insertSql, [username, email, name, picture, 'user']);
            streamer = newUser.rows[0];
        }

        // Cek Keamanan 2FA
        if (streamer.is_two_fa_enabled) {
            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        res.json({ 
            success: true, 
            token: generateToken(streamer), 
            data: streamer 
        });
    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(401).json({ success: false, message: "Verifikasi Google Gagal!" });
    }
});

/**
 * 2. SETUP 2FA (GENERATE QR)
 */
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID diperlukan" });

    try {
        const { rows } = await pool.query("SELECT email FROM streamers WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan" });

        const userEmail = rows[0].email || "SkuyGG_User";
        const secret = speakeasy.generateSecret({ 
            name: `Skuy.GG (${userEmail})`,
            issuer: 'Skuy.GG' 
        });

        await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [secret.base32, userId]);
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({ success: true, qrCode: qrCodeUrl, secret: secret.base32 });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup 2FA" });
    }
});

/**
 * 3. VERIFIKASI 2FA (AKTIVASI & LOGIN)
 */
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ success: false, message: "Data tidak lengkap" });

    try {
        const { rows } = await pool.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const streamer = rows[0];

        if (!streamer?.two_fa_secret) {
            return res.status(400).json({ success: false, message: "2FA belum di-setup!" });
        }

        const verified = speakeasy.totp.verify({
            secret: streamer.two_fa_secret,
            encoding: 'base32',
            token: token,
            window: 1 
        });

        if (verified) {
            // Pastikan status enabled aktif di database
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            res.json({ 
                success: true, 
                message: "2FA Verified!", 
                token: generateToken(streamer), 
                data: streamer 
            });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi 2FA" });
    }
});

/**
 * 4. LOGIN MANUAL
 */
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ success: false, message: "Input tidak lengkap" });

    try {
        const sql = "SELECT * FROM streamers WHERE (username = $1 OR email = $1) AND password = $2";
        const { rows } = await pool.query(sql, [identifier, password]);
        const streamer = rows[0];

        if (!streamer) {
            return res.status(401).json({ success: false, message: "Username/Password salah!" });
        }

        if (streamer.is_two_fa_enabled) {
            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        res.json({ 
            success: true, 
            token: generateToken(streamer), 
            data: streamer 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Login Error" });
    }
});

/**
 * 5. DISABLE 2FA
 */
router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query(
            "UPDATE streamers SET two_fa_secret = NULL, is_two_fa_enabled = false WHERE id = $1", 
            [userId]
        );
        res.json({ success: true, message: "Keamanan 2FA telah dimatikan." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal menonaktifkan 2FA" });
    }
});

module.exports = router;