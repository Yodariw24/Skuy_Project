const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // WAJIB buat hashing password
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- 1. SETUP NODEMAILER ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

// --- 2. HELPER: GENERATE JWT ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 3. REGISTER (Biar data masuk ke Railway) ---
router.post('/register', async (req, res) => {
    const { username, email, password, full_name } = req.body;
    try {
        // Hash password sebelum simpan (Biar login gak Invalid)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO streamers (username, email, password, full_name, role) 
            VALUES ($1, $2, $3, $4, 'creator') 
            RETURNING id, username, email
        `;
        
        // req.db didapat dari index.js yang kita buat tadi
        const { rows } = await req.db.query(query, [username, email, hashedPassword, full_name]);
        
        res.status(201).json({ 
            success: true, 
            message: "Akun Sultan Berhasil Dibuat! 🚀",
            user: rows[0] 
        });
    } catch (err) {
        console.error("REGISTER ERROR:", err.message);
        res.status(500).json({ success: false, message: "Username atau Email sudah dipakai, Ri!" });
    }
});

// --- 4. LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM streamers WHERE email = $1", [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Email tidak terdaftar!" });
        }

        const user = rows[0];
        
        // Bandingkan password input dengan hash di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password Salah!" });
        }

        // Kalau user aktifin 2FA, jangan kasih token dulu
        if (user.is_two_fa_enabled) {
            return res.json({ 
                requiresTwoFA: true, 
                userId: user.id, 
                message: "Masukkan Kode OTP dari Email lo!" 
            });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Login Error" });
    }
});

// --- 5. SETUP 2FA (Kirim OTP) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const { rows } = await req.db.query("SELECT email FROM streamers WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User tak ada" });

        const userEmail = rows[0].email;
        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [otp, userId]);

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
        res.json({ success: true, message: "OTP Terkirim ke Email!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim email" });
    }
});

// --- 6. VERIFY 2FA ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === token) {
            await req.db.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                token: generateToken(user), 
                user: { id: user.id, username: user.username, role: user.role } 
            });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi" });
    }
});

module.exports = router;