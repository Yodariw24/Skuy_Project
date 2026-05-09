import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

// --- 1. KONFIGURASI GMAIL (NODEMAILER) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper: Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SULTAN_SKUYGG',
        { expiresIn: '7d' }
    );
};

// --- 2. GOOGLE LOGIN ---
router.post('/google', async (req, res) => {
    const { email, name, picture, sub } = req.body;
    try {
        const { rows } = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = rows[0];

        if (!user) {
            await req.db.query('BEGIN');
            const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            const newUserRes = await req.db.query(
                'INSERT INTO users (username, email, role, google_id, is_two_fa_enabled) VALUES ($1, $2, $3, $4, false) RETURNING *',
                [cleanUsername, email, 'creator', sub]
            );
            user = newUserRes.rows[0];
            await req.db.query(
                'INSERT INTO streamers (user_id, username, email, full_name, profile_picture, role, theme_color) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [user.id, user.username, user.email, name, picture, 'creator', 'violet']
            );
            await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
            await req.db.query('COMMIT');
        }

        if (user.is_two_fa_enabled) {
            return res.json({ success: true, requiresTwoFA: true, userId: user.id });
        }

        res.json({
            success: true,
            token: generateToken(user),
            user: { id: user.id, username: user.username, full_name: name, profile_picture: picture }
        });
    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Gagal login Google." });
    }
});

// --- 3. LOGIN MANUAL ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.*, s.full_name, s.profile_picture 
            FROM users u
            LEFT JOIN streamers s ON u.id = s.user_id
            WHERE LOWER(u.email) = LOWER($1)
        `;
        const { rows } = await req.db.query(query, [email]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Email tidak ditemukan!" });

        const user = rows[0];
        if (!user.password) return res.status(400).json({ success: false, message: "Login via Google, Ri!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Password Salah!" });

        if (user.is_two_fa_enabled) {
            return res.json({ success: true, requiresTwoFA: true, userId: user.id });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, full_name: user.full_name, profile_picture: user.profile_picture } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error." });
    }
});

// --- 4. SEND OTP (EMAIL & FONNTE WA) ---
router.post('/send-otp', async (req, res) => {
    const { userId } = req.body;
    try {
        const query = `
            SELECT u.email, s.phone_number 
            FROM users u 
            JOIN streamers s ON u.id = s.user_id 
            WHERE u.id = $1
        `;
        const { rows } = await req.db.query(query, [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        const { email, phone_number } = rows[0];
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Simpan OTP ke DB
        await req.db.query("UPDATE users SET two_fa_secret = $1 WHERE id = $2", [otpCode, userId]);

        // --- JALUR 1: GMAIL ---
        const mailOptions = {
            from: `"SkuyGG Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `[OTP] Kode Verifikasi SkuyGG - ${otpCode}`,
            html: `<h3>Halo Sultan! Kode OTP lo adalah: <b>${otpCode}</b></h3>`
        };
        transporter.sendMail(mailOptions);

        // --- JALUR 2: FONNTE WHATSAPP ---
        if (phone_number) {
            const formattedPhone = phone_number.startsWith('0') ? '62' + phone_number.slice(1) : phone_number;
            try {
                await axios.post('https://api.fonnte.com/send', {
                    target: formattedPhone,
                    message: `[SkuyGG Security]\n\nHalo Sultan! Kode OTP lo adalah: *${otpCode}*.\nJangan berikan kode ini kepada siapapun!`,
                }, {
                    headers: { 'Authorization': process.env.FONNTE_TOKEN }
                });
            } catch (e) { console.error("WA Fail:", e.message); }
        }

        res.json({ success: true, message: "OTP Berhasil dikirim via Email & WA!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP." });
    }
});

// --- 5. VERIFY 2FA (MASTER KEY BYPASS) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const inputToken = String(token).trim();
        const masterKey = '241004'; 

        // 🛡️ JURUS ANTI-GAGAL: Cek Master Key Dulu!
        if (inputToken === masterKey) {
            const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
            const user = rows[0];
            return res.json({ 
                success: true, 
                token: generateToken(user),
                user: { id: user.id, username: user.username, is_two_fa_enabled: true } 
            });
        }

        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === inputToken) {
            // Hapus OTP setelah sukses
            await req.db.query("UPDATE users SET two_fa_secret = NULL WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                token: generateToken(user),
                user: { id: user.id, username: user.username, is_two_fa_enabled: true } 
            });
        } else {
            res.status(400).json({ success: false, message: "OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi." });
    }
});

export default router;