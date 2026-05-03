import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios'; // Pakai Axios buat nembak Fonnte
import 'dotenv/config';

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
        let userResult = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            await req.db.query('BEGIN');
            const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            
            const newUserRes = await req.db.query(
                'INSERT INTO users (username, email, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
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

        res.json({
            success: true,
            message: "Login Google Berhasil! 🔥",
            token: generateToken(user),
            user: {
                id: user.id,
                username: user.username,
                role: user.role || 'creator',
                full_name: name,
                profile_picture: picture
            }
        });
    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        console.error("GOOGLE AUTH ERROR:", err);
        res.status(500).json({ success: false, message: "Gagal login Google, Ri!" });
    }
});

// --- 3. LOGIN (MANUAL) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = `
            SELECT u.*, s.full_name, s.is_two_fa_enabled, s.profile_picture 
            FROM users u
            LEFT JOIN streamers s ON u.id = s.user_id
            WHERE u.email = $1
        `;
        const { rows } = await req.db.query(query, [email]);
        if (rows.length === 0) return res.status(404).json({ success: false, message: "Email tidak ditemukan!" });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Password Salah!" });

        // Jika 2FA Aktif, kirim OTP ke WhatsApp otomatis
        if (user.is_two_fa_enabled) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otpCode, user.id]);

            // KIRIM VIA FONNTE
            await axios.post('https://api.fonnte.com/send', {
                target: '6283148678039', // Ganti dengan field nomor HP dari database lo jika ada
                message: `*SKUYGG LOGIN CODE*\n\nHalo @${user.username}, kode login lo: *${otpCode}*\n\nJangan kasih tahu siapa-siapa ya! 🛡️`,
            }, {
                headers: { 'Authorization': process.env.WA_TOKEN }
            });

            return res.json({ requiresTwoFA: true, userId: user.id, message: "Cek WhatsApp buat kode login!" });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name, profile_picture: user.profile_picture } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error saat Login" });
    }
});

// --- 4. SETUP & VERIFY 2FA (WHATSAPP VERSION) ---

// Step A: Generate & Kirim OTP Aktivasi via WA
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Simpan OTP di kolom two_fa_secret
        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otpCode, userId]);

        // KIRIM VIA FONNTE
        await axios.post('https://api.fonnte.com/send', {
            target: '6283148678039', // Pake nomor lo yang di Fonnte tadi Ri
            message: `*SKUYGG SECURITY PROTOCOL*\n\nHalo @${rows[0].username}, masukkan kode ini buat aktifin 2FA lo: *${otpCode}*\n\nAkun Sultan harus aman! 🛡️`,
        }, {
            headers: { 'Authorization': process.env.WA_TOKEN }
        });

        res.json({ 
            success: true, 
            message: `Kode OTP sudah dikirim ke WhatsApp lo!` 
        });
    } catch (err) {
        console.error("FONNTE ERROR:", err.response?.data || err.message);
        res.status(500).json({ success: false, message: "Gagal kirim WhatsApp OTP" });
    }
});

// Step B: Verifikasi OTP & Aktifkan 2FA
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body; 
    try {
        const { rows } = await req.db.query(
            "SELECT u.*, s.two_fa_secret FROM users u JOIN streamers s ON u.id = s.user_id WHERE u.id = $1", 
            [userId]
        );
        const user = rows[0];

        if (!user || user.two_fa_secret !== token.trim()) {
            return res.status(400).json({ success: false, message: "Kode OTP Salah atau Kadaluwarsa!" });
        }

        // Aktifkan status 2FA
        await req.db.query("UPDATE streamers SET is_two_fa_enabled = true WHERE user_id = $1", [userId]);
        
        res.json({ 
            success: true, 
            message: "2FA Aktif! Akun lo sekarang aman banget! 🛡️",
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Verifikasi gagal" });
    }
});

export default router;