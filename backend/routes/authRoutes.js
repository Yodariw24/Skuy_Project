const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(express.json());

// HELPER: Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

/**
 * 1. GOOGLE AUTH
 */
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, picture } = ticket.getPayload();

        let { rows } = await pool.query("SELECT * FROM streamers WHERE email = $1", [email]);
        let streamer = rows[0];

        if (!streamer) {
            const username = name.replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000);
            const insertSql = `
                INSERT INTO streamers (username, email, full_name, profile_picture, role) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`;
            const newUser = await pool.query(insertSql, [username, email, name, picture, 'user']);
            streamer = newUser.rows[0];
        }

        if (streamer.is_two_fa_enabled) {
            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        res.json({ success: true, token: generateToken(streamer), data: streamer });
    } catch (err) {
        res.status(401).json({ success: false, message: "Verifikasi Google Gagal!" });
    }
});

/**
 * 2. SETUP 2FA (GENERATE QR)
 */
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await pool.query("SELECT email, username FROM streamers WHERE id = $1", [userId]);
        const streamer = rows[0];
        
        const cleanLabel = (streamer.username || streamer.email || 'User').replace(/\s+/g, '_');
        const secret = speakeasy.generateSecret({ 
            length: 20, 
            name: `SkuyGG:${cleanLabel}`, 
            issuer: 'SkuyGG' 
        });

        await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [secret.base32, userId]);

        res.json({ 
            success: true, 
            qrData: secret.otpauth_url, 
            secret: secret.base32      
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal memproses security" });
    }
});

/**
 * 3. VERIFY 2FA
 */
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const streamer = rows[0];

        const verified = speakeasy.totp.verify({
            secret: streamer.two_fa_secret,
            encoding: 'base32',
            token: token,
            window: 1 
        });

        if (verified) {
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                token: generateToken(streamer), 
                data: streamer 
            });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi" });
    }
});

/**
 * 4. LOGIN MANUAL
 */
router.post('/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const { rows } = await pool.query(
            "SELECT * FROM streamers WHERE (username = $1 OR email = $1) AND password = $2", 
            [identifier, password]
        );
        const streamer = rows[0];

        if (!streamer) return res.status(401).json({ success: false, message: "Username/Password salah!" });

        if (streamer.is_two_fa_enabled) {
            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        res.json({ success: true, token: generateToken(streamer), data: streamer });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Login Error" });
    }
});

module.exports = router;