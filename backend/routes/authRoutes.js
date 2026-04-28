const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Pastikan config ini pakai DATABASE_URL Supabase
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const speakeasy = require('speakeasy'); 
const QRCode = require('qrcode');      

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(express.json());

// --- HELPER: GENERATE JWT ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 1. GOOGLE AUTH (SINKRON DENGAN 2FA) ---
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

        // CEK: Apakah user Google ini aktifkan 2FA? 
        // Startup biasanya tetap minta 2FA walau login Google demi keamanan ekstra.
        if (streamer.is_two_fa_enabled) {
            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        const appToken = generateToken(streamer);
        res.json({ success: true, token: appToken, data: streamer });
    } catch (err) {
        res.status(401).json({ success: false, message: "Verifikasi Google Gagal!" });
    }
});

// --- 2. SETUP 2FA (PERBAIKAN: Pakai Email User di QR) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body; 
    try {
        const userResult = await pool.query("SELECT email FROM streamers WHERE id = $1", [userId]);
        const userEmail = userResult.rows[0]?.email || "SkuyGG_User";

        const secret = speakeasy.generateSecret({ 
            name: `Skuy.GG (${userEmail})`,
            issuer: 'Skuy.GG' // Nama aplikasi di Google Authenticator
        });

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

        if (!streamer.two_fa_secret) throw new Error("2FA belum di-setup!");

        const verified = speakeasy.totp.verify({
            secret: streamer.two_fa_secret,
            encoding: 'base32',
            token: token,
            window: 1 // Lebih ketat lebih bagus (window 2 agak terlalu longgar)
        });

        if (verified) {
            // Update status jika pertama kali setup
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1", [userId]);
            
            const appToken = generateToken(streamer);
            res.json({ success: true, message: "2FA Gacor!", token: appToken, data: streamer });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 4. LOGIN MANUAL (GANTI KE USERNAME/EMAIL) ---
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body; // identifier bisa email atau username
        
        // LOGIN MODERN: Cari bisa pakai username ATAU email
        const sql = "SELECT * FROM streamers WHERE (username = $1 OR email = $1) AND password = $2";
        const result = await pool.query(sql, [identifier, password]);

        if (result.rows.length > 0) {
            const streamer = result.rows[0];
            
            // CEK 2FA
            if (streamer.is_two_fa_enabled) {
                return res.json({ success: true, requires2FA: true, userId: streamer.id });
            }

            const token = generateToken(streamer);
            res.json({ success: true, token, data: streamer });
        } else {
            res.status(401).json({ success: false, message: "Username/Password salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- 5. DISABLE 2FA ---
router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query(
            "UPDATE streamers SET two_fa_secret = NULL, is_two_fa_enabled = false WHERE id = $1", 
            [userId]
        );
        res.json({ success: true, message: "Keamanan 2FA telah dimatikan." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;