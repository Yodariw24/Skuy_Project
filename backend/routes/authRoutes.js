import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Pakai bcryptjs biar lebih stabil di Railway
import nodemailer from 'nodemailer';
import 'dotenv/config';

// --- 1. SETUP NODEMAILER (RAILWAY READY) ---
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

// --- 3. REGISTER (SULTAN ONBOARDING) ---
router.post('/register', async (req, res) => {
    const { username, email, password, full_name } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Data belum lengkap, Ri!" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await req.db.query('BEGIN');

        const insertStreamer = `
            INSERT INTO streamers (username, email, password, full_name, role, theme_color) 
            VALUES ($1, $2, $3, $4, 'creator', 'violet') 
            RETURNING id, username, email
        `;
        const { rows } = await req.db.query(insertStreamer, [username, email, hashedPassword, full_name]);
        const newUser = rows[0];

        await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, $2)', [newUser.id, 0]);

        await req.db.query('COMMIT');
        
        res.status(201).json({ 
            success: true, 
            message: "Akun Sultan & Wallet Berhasil Dibuat! 🚀",
            user: newUser 
        });
    } catch (err) {
        await req.db.query('ROLLBACK');
        console.error("REGISTER ERROR:", err.message);
        res.status(500).json({ success: false, message: "Username/Email sudah terdaftar atau Database Error!" });
    }
});

// --- 4. LOGIN (CORE GATEWAY) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM streamers WHERE email = $1", [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Email tidak ditemukan!" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password Salah, Coba lagi!" });
        }

        if (user.is_two_fa_enabled) {
            return res.json({ 
                requiresTwoFA: true, 
                userId: user.id, 
                message: "Keamanan Tinggi Aktif! Cek OTP di Email lo." 
            });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Login Failure" });
    }
});

// --- 5. SETUP/RESEND 2FA (EMAIL ENGINE) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const { rows } = await req.db.query("SELECT email, username FROM streamers WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        const user = rows[0];
        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE id = $2", [otp, userId]);

        await transporter.sendMail({
            from: '"SkuyGG Security" <security@skuy.gg>',
            to: user.email,
            subject: `[${otp}] Otorisasi Masuk SkuyGG`,
            html: `
                <div style="font-family:sans-serif; max-width:400px; margin:auto; border:5px solid #000; padding:30px; border-radius:30px; background:#f8faff;">
                    <h2 style="font-style:italic; text-transform:uppercase;">Shield Protocol</h2>
                    <p style="font-weight:bold;">Halo @${user.username},</p>
                    <p>Gunakan kode di bawah untuk masuk:</p>
                    <div style="background:#7c3aed; color:#fff; padding:20px; border-radius:15px; text-align:center; font-size:35px; font-weight:900; letter-spacing:8px;">
                        ${otp}
                    </div>
                </div>
            `
        });
        res.json({ success: true, message: "Kode OTP meluncur ke email!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal memicu pengiriman email" });
    }
});

// --- 6. VERIFY 2FA ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM streamers WHERE id = $1", [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === token && token !== null) {
            await req.db.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1", [userId]);
            
            res.json({ 
                success: true, 
                token: generateToken(user), 
                user: { id: user.id, username: user.username, role: user.role } 
            });
        } else {
            res.status(400).json({ success: false, message: "OTP Invalid!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi" });
    }
});

export default router; // WAJIB PAKAI INI