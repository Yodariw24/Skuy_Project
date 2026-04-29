const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- SETUP NODEMAILER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// 1. REQUEST OTP KE EMAIL
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const { rows } = await pool.query("SELECT email FROM streamers WHERE id = $1", [userId]);
        const userEmail = rows[0].email;
        await pool.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [otp, userId]);

        await transporter.sendMail({
            from: '"SkuyGG Security" <noreply@skuy.gg>',
            to: userEmail,
            subject: `[${otp}] Kode Keamanan SkuyGG`,
            html: `<div style="font-family:sans-serif; text-align:center; border:4px solid #000; padding:20px; border-radius:20px;">
                    <h1 style="font-style:italic;">SECURITY PROTOCOL</h1>
                    <p>Masukkan kode ini untuk verifikasi akun Sultan kamu:</p>
                    <h2 style="letter-spacing:10px; color:#7c3aed; font-size:40px;">${otp}</h2>
                   </div>`
        });
        res.json({ success: true, message: "OTP Terkirim!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim email" });
    }
});

// 2. VERIFY OTP
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await pool.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        if (rows[0].two_fa_secret === token) {
            await pool.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1", [userId]);
            res.json({ success: true, token: generateToken(rows[0]), data: rows[0] });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi" });
    }
});

// Masukkan login & google auth kamu di sini...
module.exports = router;