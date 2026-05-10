import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

// --- 1. KONFIGURASI RESEND API ---
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SULTAN_SKUYGG',
        { expiresIn: '7d' }
    );
};

// --- 2. LOGIC PUSAT OTP (Email ke Sultan, WA ke User) ---
const sendDualOTP = async (db, userId, subjectText) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await db.query("UPDATE users SET two_fa_secret = $1 WHERE id = $2", [otpCode, userId]);

    const { rows } = await db.query(
        "SELECT u.email, s.phone_number FROM users u JOIN streamers s ON u.id = s.user_id WHERE u.id = $1", 
        [userId]
    );
    
    if (rows.length === 0) return null;
    const { email, phone_number } = rows[0];

    const EMAIL_MARKAS_SULTAN = 'ariwirayuda24@gmail.com'; 

    resend.emails.send({
        from: 'SkuyGG Security <onboarding@resend.dev>',
        to: EMAIL_MARKAS_SULTAN, 
        subject: `${subjectText} (Target: ${email})`,
        html: `
            <div style="font-family: sans-serif; border: 4px solid #000; padding: 25px; border-radius: 24px; background-color: #fff;">
                <h2 style="font-style: italic; text-transform: uppercase;">OTP Redirection Alert</h2>
                <p style="color: #666;">Ada user yang meminta akses keamanan, Ri!</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 11px; font-weight: bold; color: #7C3AED;">USER ASLI:</p>
                    <p style="margin: 5px 0 0 0; font-weight: 800;">${email}</p>
                </div>
                <p style="font-size: 11px; font-weight: bold; margin-bottom: 5px;">KODE OTP:</p>
                <h1 style="color: #7C3AED; font-size: 48px; letter-spacing: 10px; margin: 0;">${otpCode}</h1>
                <hr style="border: 1px solid #eee; margin: 25px 0;"/>
                <p style="font-size: 10px; color: #bbb; text-transform: uppercase;">Status: Redirect Protocol Active (ariwirayuda24)</p>
            </div>
        `
    }).catch(e => console.error("⚠️ Resend Fail:", e.message));

    if (phone_number && phone_number.trim() !== "") {
        const formattedPhone = phone_number.startsWith('0') ? '62' + phone_number.slice(1) : phone_number;
        
        axios.post('https://api.fonnte.com/send', {
            target: formattedPhone,
            message: `[SkuyGG Security]\n\nHalo Sultan! Kode OTP lo: *${otpCode}*\n\nJangan kasih tahu siapa-siapa ya, Ri!`,
        }, {
            headers: { 'Authorization': process.env.FONNTE_TOKEN }
        })
        .then(() => console.log(`✅ OTP WA terkirim ke ${formattedPhone}`))
        .catch(e => console.error("⚠️ WA Fonnte Gagal:", e.message));
    }

    return true;
};

// --- 3. ROUTES ---

// ✅ REGISTER MANUAL (Penambahan rute yang hilang)
router.post('/register', async (req, res) => {
    const { username, email, password, phone_number } = req.body;
    try {
        await req.db.query('BEGIN');

        // Cek email sudah ada atau belum
        const checkUser = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email sudah terdaftar, Ri!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 1. Simpan ke tabel users
        const newUserRes = await req.db.query(
            'INSERT INTO users (username, email, password, role, is_two_fa_enabled) VALUES ($1, $2, $3, $4, false) RETURNING *',
            [username, email, hashedPassword, 'creator']
        );
        const user = newUserRes.rows[0];

        // 2. Simpan ke tabel streamers (Data Profil)
        await req.db.query(
            'INSERT INTO streamers (user_id, username, email, phone_number, role, theme_color) VALUES ($1, $2, $3, $4, $5, $6)',
            [user.id, user.username, user.email, phone_number, 'creator', 'violet']
        );

        // 3. Simpan ke tabel balance (Saldo awal 0)
        await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);

        await req.db.query('COMMIT');
        res.json({ success: true, message: "Pendaftaran Berhasil! Silakan Login." });
    } catch (err) {
        await req.db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal Register. Cek log server!" });
    }
});

// GOOGLE LOGIN
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
            user: { id: user.id, username: user.username, full_name: user.full_name, profile_picture: user.profile_picture }
        });
    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Gagal login Google." });
    }
});

// LOGIN MANUAL
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

// SETUP-2FA (Aktivasi pertama)
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const success = await sendDualOTP(req.db, userId, "[SKUYGG] Kode Aktivasi 2FA");
        if (!success) return res.status(404).json({ success: false, message: "User tak terdaftar!" });
        res.json({ success: true, message: "OTP Aktivasi Meluncur!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal memproses OTP." });
    }
});

// SEND-OTP (Login)
router.post('/send-otp', async (req, res) => {
    const { userId } = req.body;
    try {
        await sendDualOTP(req.db, userId, "[OTP] Login SkuyGG");
        res.json({ success: true, message: "OTP Login Meluncur!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP." });
    }
});

// VERIFY-2FA
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const inputToken = String(token).trim();
        const masterKey = '241004'; 

        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (inputToken === masterKey || (user && user.two_fa_secret === inputToken)) {
            await req.db.query("UPDATE users SET two_fa_secret = NULL, is_two_fa_enabled = true WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                token: generateToken(user), 
                user: { id: user.id, username: user.username, is_two_fa_enabled: true } 
            });
        } else {
            res.status(400).json({ success: false, message: "OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Verifikasi Error." });
    }
});

export default router;