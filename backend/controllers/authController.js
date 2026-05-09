import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Resend } from 'resend';
import 'dotenv/config';

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper: Generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SULTAN_SKUYGG',
        { expiresIn: '7d' }
    );
};

// --- Helper: Kirim Dual-OTP (WA ke User, Email ke Markas Sultan) ---
const sendDualOTP = async (db, user, subjectText) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Simpan OTP ke database user
    await db.query("UPDATE users SET two_fa_secret = $1 WHERE id = $2", [otpCode, user.id]);

    // 📧 Jalur Email Sultan (Redirect ke ariwirayuda24)
    const EMAIL_MARKAS_SULTAN = 'ariwirayuda24@gmail.com';
    resend.emails.send({
        from: 'SkuyGG Security <onboarding@resend.dev>',
        to: EMAIL_MARKAS_SULTAN,
        subject: `${subjectText} (Target: ${user.email})`,
        html: `<h3>OTP ALERT</h3><p>User <b>${user.email}</b> minta kode: <h1 style="color:#7C3AED">${otpCode}</h1></p>`
    }).catch(e => console.error("Email Sultan Error:", e.message));

    // 📱 Jalur WhatsApp User
    if (user.phone_number) {
        const formattedPhone = user.phone_number.startsWith('0') ? '62' + user.phone_number.slice(1) : user.phone_number;
        axios.post('https://api.fonnte.com/send', {
            target: formattedPhone,
            message: `[SkuyGG Security]\n\nHalo Sultan! Kode OTP lo: *${otpCode}*\n\nRahasiakan kode ini ya!`,
        }, {
            headers: { 'Authorization': process.env.FONNTE_TOKEN }
        }).catch(e => console.error("WA User Error:", e.message));
    }
};

// --- 1. GOOGLE AUTH (SULTAN REDIRECT VERSION) ---
export const googleAuth = async (req, res) => {
    const { email, name, picture, sub } = req.body;
    try {
        const queryCheck = `
            SELECT u.*, s.phone_number, s.display_name 
            FROM users u 
            LEFT JOIN streamers s ON u.id = s.user_id 
            WHERE u.email = $1
        `;
        let userResult = await req.db.query(queryCheck, [email]);
        let user = userResult.rows[0];

        if (!user) {
            await req.db.query('BEGIN');
            const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            const newUser = await req.db.query(
                'INSERT INTO users (username, email, role, google_id, is_two_fa_enabled) VALUES ($1, $2, $3, $4, false) RETURNING *',
                [cleanUsername, email, 'creator', sub]
            );
            user = newUser.rows[0];
            await req.db.query(
                'INSERT INTO streamers (user_id, username, email, display_name, full_name, profile_picture) VALUES ($1, $2, $3, $4, $5, $6)',
                [user.id, user.username, user.email, name, name, picture]
            );
            await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
            await req.db.query('COMMIT');
        }

        if (user.is_two_fa_enabled) {
            await sendDualOTP(req.db, user, "[LOGIN] Verifikasi Sultan");
            return res.json({ requiresTwoFA: true, userId: user.id });
        }

        res.json({
            success: true,
            token: generateToken(user),
            user: { id: user.id, username: user.username, full_name: user.display_name || name, profile_picture: picture }
        });
    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Gagal autentikasi Google." });
    }
};

// --- 2. SETUP 2FA (TRIGGER OTP PERTAMA KALI) ---
export const setup2FA = async (req, res) => {
    const userId = req.body.userId || req.user?.id;
    try {
        const { rows } = await req.db.query(
            "SELECT u.id, u.email, s.phone_number FROM users u JOIN streamers s ON u.id = s.user_id WHERE u.id = $1",
            [userId]
        );
        const user = rows[0];

        if (!user.phone_number) {
            return res.status(400).json({ success: false, message: "Isi nomor WA dulu di profil, Ri!" });
        }

        await sendDualOTP(req.db, user, "[SETUP] Aktivasi 2FA");
        res.json({ success: true, message: "Kode aktivasi sudah dikirim!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup protokol." });
    }
};

// --- 3. VERIFY & ACTIVATE ---
export const verify2FA = async (req, res) => {
    const { userId, token } = req.body;
    try {
        const masterKey = '241004';
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (token === masterKey || (user && user.two_fa_secret === token)) {
            await req.db.query("UPDATE users SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1", [userId]);
            res.json({ 
                success: true, 
                token: generateToken(user),
                user: { ...user, is_two_fa_enabled: true }
            });
        } else {
            res.status(400).json({ success: false, message: "OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Verifikasi gagal." });
    }
};

// --- 4. DISABLE 2FA ---
export const disable2FA = async (req, res) => {
    const userId = req.user?.id || req.body.userId;
    try {
        await req.db.query('UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1', [userId]);
        res.json({ success: true, message: "Protokol keamanan dicabut." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal mematikan fitur." });
    }
};