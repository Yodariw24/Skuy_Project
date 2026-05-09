import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

// --- 1. KONFIGURASI RESEND API (Anti-Timeout & Port Block) ---
const resend = new Resend(process.env.RESEND_API_KEY);

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

// --- 4. SETUP-2FA & SEND-OTP (Integrated Dual Channel) ---
const sendDualOTP = async (db, userId, subjectText) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.query("UPDATE users SET two_fa_secret = $1 WHERE id = $2", [otpCode, userId]);

    const { rows } = await db.query(
        "SELECT u.email, s.phone_number FROM users u JOIN streamers s ON u.id = s.user_id WHERE u.id = $1", 
        [userId]
    );
    
    if (rows.length === 0) return null;
    const { email, phone_number } = rows[0];

    // JALUR 1: RESEND API (Email)
    resend.emails.send({
        from: 'SkuyGG Security <onboarding@resend.dev>',
        to: email,
        subject: `${subjectText} - ${otpCode}`,
        html: `<h3>Halo Sultan!</h3><p>Kode OTP lo adalah: <b>${otpCode}</b></p>`
    }).catch(e => console.error("Resend API Error:", e.message));

    // JALUR 2: FONNTE (WhatsApp)
    if (phone_number && phone_number.trim() !== "") {
        const formattedPhone = phone_number.startsWith('0') ? '62' + phone_number.slice(1) : phone_number;
        axios.post('https://api.fonnte.com/send', {
            target: formattedPhone,
            message: `[SkuyGG Security]\n\nHalo Sultan! Kode OTP lo: *${otpCode}*`,
        }, {
            headers: { 'Authorization': process.env.FONNTE_TOKEN }
        }).catch(e => console.error("WA Fonnte Error:", e.message));
    }

    return true;
};

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

router.post('/send-otp', async (req, res) => {
    const { userId } = req.body;
    try {
        await sendDualOTP(req.db, userId, "[OTP] Login SkuyGG");
        res.json({ success: true, message: "OTP Login Meluncur!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP." });
    }
});

// --- 5. VERIFY-2FA (With Master Key) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const inputToken = String(token).trim();
        const masterKey = '241004'; 

        if (inputToken === masterKey) {
            const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
            return res.json({ success: true, token: generateToken(rows[0]), user: rows[0] });
        }

        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === inputToken) {
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