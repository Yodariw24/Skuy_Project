import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticator } from '@otplib/preset-default'; 
import QRCode from 'qrcode';
import 'dotenv/config';

const router = express.Router();

// --- 1. HELPER: GENERATE JWT ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 2. GOOGLE AUTH ---
router.post('/google', async (req, res) => {
    const { email, name, picture, sub } = req.body;
    try {
        const queryCheck = 'SELECT * FROM users WHERE email = $1';
        const userResult = await req.db.query(queryCheck, [email]);
        let user = userResult.rows[0];

        if (!user) {
            await req.db.query('BEGIN');
            const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            const newUserRes = await req.db.query(
                'INSERT INTO users (username, email, role, google_id, is_two_fa_enabled, profile_picture) VALUES ($1, $2, $3, $4, false, $5) RETURNING *',
                [cleanUsername, email, 'creator', sub, picture]
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
            return res.json({ requiresTwoFA: true, userId: user.id });
        }

        res.json({
            success: true,
            token: generateToken(user),
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role || 'creator', 
                full_name: name, 
                profile_picture: user.profile_picture || picture 
            }
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
            SELECT u.*, s.full_name, COALESCE(u.profile_picture, s.profile_picture) as final_picture
            FROM users u
            LEFT JOIN streamers s ON u.id = s.user_id
            WHERE u.email = $1
        `;
        const { rows } = await req.db.query(query, [email]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Email tidak ditemukan!" });

        const user = rows[0];
        if (!user.password) {
            return res.status(400).json({ success: false, message: "Akun terdaftar via Google. Silakan Login Google!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Password Salah!" });

        if (user.is_two_fa_enabled) {
            return res.json({ requiresTwoFA: true, userId: user.id });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role, profile_picture: user.final_picture } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error." });
    }
});

// --- 4. QR-CODE TOTP PROTOCOL (2FA) ---

router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID wajib ada!" });

    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User tidak ditemukan!" });

        const secret = authenticator.generateSecret().toUpperCase(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        await req.db.query(
            "UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = false WHERE id = $2", 
            [secret, userId]
        );

        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal generate QR." });
    }
});

router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user || !user.two_fa_secret) return res.status(400).json({ success: false, message: "Setup dulu, Ri!" });

        // ✅ VERIFIKASI DENGAN TOLERANSI WINDOW 2 (Lebih Kuat)
        const isValid = authenticator.verify({
            token: token.trim(),
            secret: user.two_fa_secret.toUpperCase(),
            window: 2 
        });

        if (isValid) {
            // ✅ UPDATE DATABASE JADI TRUE SECARA PERMANEN
            const result = await req.db.query(
                "UPDATE users SET is_two_fa_enabled = true WHERE id = $1 RETURNING *", 
                [userId]
            );
            
            const updatedUser = result.rows[0];
            res.json({ 
                success: true, 
                token: generateToken(updatedUser),
                user: { 
                    id: updatedUser.id, 
                    username: updatedUser.username, 
                    is_two_fa_enabled: true, 
                    role: updatedUser.role 
                } 
            });
        } else {
            res.status(400).json({ success: false, message: "Kode OTP Salah/Expired!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error." });
    }
});

router.post('/disable-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        await req.db.query("UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1", [userId]);
        res.json({ success: true, message: "2FA Dimatikan." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal." });
    }
});

export default router;