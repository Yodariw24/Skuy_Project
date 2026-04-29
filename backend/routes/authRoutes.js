const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.use(express.json());

// --- SETUP NODEMAILER (PENGIRIM EMAIL) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Isi email Gmail kamu di Railway
        pass: process.env.EMAIL_PASS  // Isi App Password 16 digit di Railway
    }
});

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
 * 2. SETUP 2FA (REQUEST OTP KE EMAIL)
 */
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    // Generate 6 digit angka acak untuk OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const { rows } = await pool.query("SELECT email FROM streamers WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        
        const userEmail = rows[0].email;

        // Simpan OTP sementara di database
        await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [otp, userId]);

        // KIRIM EMAIL KE USER
        await transporter.sendMail({
            from: '"SkuyGG Security" <noreply@skuy.gg>',
            to: userEmail,
            subject: `[${otp}] Kode Keamanan SkuyGG`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 4px solid #000; border-radius: 20px; text-align: center;">
                    <h1 style="text-transform: uppercase; font-style: italic;">Security Protocol</h1>
                    <p>Gunakan kode di bawah untuk mengaktifkan keamanan 2FA kamu:</p>
                    <div style="background: #7c3aed; color: #fff; padding: 20px; font-size: 40px; font-weight: bold; letter-spacing: 10px; border-radius: 10px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 10px; color: #999;">Jangan berikan kode ini kepada siapapun.</p>
                </div>
            `
        });

        res.json({ success: true, message: "Kode OTP telah dikirim ke email kamu!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal mengirim email OTP" });
    }
});

/**
 * 3. VERIFY 2FA (VERIFIKASI OTP EMAIL)
 */
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const streamer = rows[0];

        // Cek apakah token input sama dengan OTP di database
        if (streamer && streamer.two_fa_secret === token) {
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                message: "2FA Berhasil diaktifkan!",
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
            // Jika login dan 2FA aktif, trigger kirim OTP baru ke email
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [otp, streamer.id]);
            
            await transporter.sendMail({
                from: '"SkuyGG Security" <noreply@skuy.gg>',
                to: streamer.email,
                subject: `[${otp}] Kode Login SkuyGG`,
                html: `<h1 style="text-align:center;">Kode Login Kamu: ${otp}</h1>`
            });

            return res.json({ success: true, requires2FA: true, userId: streamer.id });
        }

        res.json({ success: true, token: generateToken(streamer), data: streamer });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Login Error" });
    }
});

module.exports = router;