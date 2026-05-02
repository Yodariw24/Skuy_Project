import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import 'dotenv/config';

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

// --- 3. REGISTER (FIXED SYNC) ---
router.post('/register', async (req, res) => {
    const { username, email, password, full_name } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Data belum lengkap, Ri!" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Mulai Transaksi Database
        await req.db.query('BEGIN');

        // ✅ LANGKAH 1: Masukkan ke tabel USERS
        const insertUser = `
            INSERT INTO users (username, email, password, role) 
            VALUES ($1, $2, $3, 'creator') 
            RETURNING id, username, email, role
        `;
        const userRes = await req.db.query(insertUser, [username, email, hashedPassword]);
        const newUser = userRes.rows[0];

        // ✅ LANGKAH 2: Masukkan ke tabel STREAMERS (Hubungkan via user_id)
        const insertStreamer = `
            INSERT INTO streamers (user_id, username, email, full_name, role, theme_color) 
            VALUES ($1, $2, $3, $4, $5, 'violet')
        `;
        await req.db.query(insertStreamer, [newUser.id, newUser.username, newUser.email, full_name, newUser.role]);

        // ✅ LANGKAH 3: Setup Balance (Wallet)
        // Menggunakan newUser.id karena SQL lo merujuk balance(streamer_id) ke users(id)
        const insertBalance = `
            INSERT INTO balance (streamer_id, total_saldo) 
            VALUES ($1, $2)
        `;
        await req.db.query(insertBalance, [newUser.id, 0]);

        // Selesaikan Transaksi
        await req.db.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            message: "Akun Sultan & Wallet Berhasil Dibuat! 🚀",
            user: newUser 
        });
    } catch (err) {
        // Batalkan jika ada salah satu yang gagal
        await req.db.query('ROLLBACK');
        console.error("REGISTER ERROR:", err.message);
        res.status(500).json({ success: false, message: "Pendaftaran gagal, cek apakah email/username sudah dipakai." });
    }
});

// --- 4. LOGIN (FIXED JOIN) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.*, s.full_name, s.is_two_fa_enabled, s.two_fa_secret, s.profile_picture 
            FROM users u
            LEFT JOIN streamers s ON u.id = s.user_id
            WHERE u.email = $1
        `;
        const { rows } = await req.db.query(query, [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Email tidak ditemukan!" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password Salah!" });
        }

        if (user.is_two_fa_enabled) {
            return res.json({ 
                requiresTwoFA: true, 
                userId: user.id, 
                message: "2FA Aktif! Silakan verifikasi." 
            });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role, 
                full_name: user.full_name,
                profile_picture: user.profile_picture
            } 
        });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ success: false, message: "Server Error saat Login" });
    }
});

// --- 5. SETUP 2FA (EMAIL OTP) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const { rows } = await req.db.query("SELECT email, username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = rows[0];
        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otp, userId]);

        await transporter.sendMail({
            from: '"SkuyGG Security" <security@skuy.gg>',
            to: user.email,
            subject: `[${otp}] Kode Keamanan SkuyGG`,
            html: `<div style="padding:20px; border:1px solid #ddd;"><h2>OTP: ${otp}</h2></div>`
        });

        res.json({ success: true, message: "OTP terkirim ke email!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP" });
    }
});

// --- 6. VERIFY 2FA ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const query = `
            SELECT u.*, s.two_fa_secret 
            FROM users u
            JOIN streamers s ON u.id = s.user_id
            WHERE u.id = $1
        `;
        const { rows } = await req.db.query(query, [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === token && token !== null) {
            await req.db.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE user_id = $1", [userId]);
            
            res.json({ 
                success: true, 
                token: generateToken(user), 
                user: { id: user.id, username: user.username, role: user.role } 
            });
        } else {
            res.status(400).json({ success: false, message: "OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Verifikasi gagal" });
    }
});

export default router;