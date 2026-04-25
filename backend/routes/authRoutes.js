const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy'); 
const QRCode = require('qrcode');      

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(express.json());

// --- 1. GOOGLE AUTH ---
router.post('/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let result = await pool.query("SELECT * FROM streamers WHERE email = $1", [email]);
        let streamer = result.rows[0];

        if (!streamer) {
            const username = name.replace(/\s+/g, '').toLowerCase() + '_' + Math.floor(Math.random() * 1000);
            const insertSql = `
                INSERT INTO streamers (username, email, full_name, profile_picture, role) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`;
            const newUser = await pool.query(insertSql, [username, email, name, picture, 'user']);
            streamer = newUser.rows[0];
        }

        const appToken = jwt.sign(
            { id: streamer.id, username: streamer.username, role: streamer.role },
            process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
            { expiresIn: '7d' }
        );

        res.json({ success: true, token: appToken, data: streamer });
    } catch (err) {
        res.status(401).json({ success: false, message: "Verifikasi Google Gagal!" });
    }
});

// --- 2. SETUP 2FA ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body; 
    try {
        const secret = speakeasy.generateSecret({ name: `Skuy.GG (${userId})` });
        await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [secret.base32, userId]);
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        res.json({ success: true, qrCode: qrCodeUrl, secret: secret.base32 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 3. VERIFIKASI 2FA ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const result = await pool.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const streamer = result.rows[0];

        const verified = speakeasy.totp.verify({
            secret: streamer.two_fa_secret,
            encoding: 'base32',
            token: token,
            window: 2 
        });

        if (verified) {
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            const appToken = jwt.sign(
                { id: streamer.id, role: streamer.role }, 
                process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026', 
                { expiresIn: '7d' }
            );

            res.json({ success: true, message: "2FA Gacor!", token: appToken, data: streamer });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- BARU: DISABLE 2FA (Agar tombol Matikan Keamanan berfungsi) ---
router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query(
            "UPDATE streamers SET two_fa_secret = NULL, is_two_fa_enabled = false WHERE id = $1", 
            [userId]
        );
        res.json({ success: true, message: "2FA Berhasil dimatikan!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 4. LOGIN MANUAL ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query("SELECT * FROM streamers WHERE username = $1 AND password = $2", [username, password]);

        if (result.rows.length > 0) {
            const streamer = result.rows[0];
            if (streamer.is_two_fa_enabled) {
                return res.json({ success: true, requires2FA: true, userId: streamer.id });
            }
            const token = jwt.sign({ id: streamer.id, role: streamer.role }, process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026', { expiresIn: '7d' });
            res.json({ success: true, token, data: streamer });
        } else {
            res.status(401).json({ success: false, message: "Username/Password salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 5. DATA DASHBOARD ---
router.get('/:streamer_id/balance', async (req, res) => {
    const { streamer_id } = req.params;
    try {
        const sql = "SELECT SUM(amount) as total_saldo FROM donations WHERE streamer_id = $1 AND status = 'SUCCESS'";
        const result = await pool.query(sql, [streamer_id]);
        res.json({ success: true, total_saldo: result.rows[0].total_saldo || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;