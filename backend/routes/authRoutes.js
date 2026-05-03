import express from 'express';
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'; // Pindah ke Nodemailer
import 'dotenv/config';

// --- 1. SETUP NODEMAILER ---
// Pastikan EMAIL_USER dan EMAIL_PASS (App Password) sudah ada di Railway Variables
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
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 3. GOOGLE AUTH ---
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

// --- 4. REGISTER (MANUAL) ---
router.post('/register', async (req, res) => {
    const { username, email, password, full_name } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Data belum lengkap, Ri!" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await req.db.query('BEGIN');
        const userRes = await req.db.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
            [username, email, hashedPassword, 'creator']
        );
        const newUser = userRes.rows[0];

        await req.db.query(
            'INSERT INTO streamers (user_id, username, email, full_name, role, theme_color) VALUES ($1, $2, $3, $4, $5, $6)',
            [newUser.id, newUser.username, newUser.email, full_name, newUser.role, 'violet']
        );

        await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [newUser.id]);
        await req.db.query('COMMIT');
        
        res.status(201).json({ success: true, message: "Akun Sultan Berhasil Dibuat! 🚀", user: newUser });
    } catch (err) {
        if (req.db) await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Pendaftaran gagal." });
    }
});

// --- 5. LOGIN (MANUAL) ---
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

        // Jika 2FA Aktif, kirim OTP ke email secara otomatis saat login
        if (user.is_two_fa_enabled) {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otpCode, user.id]);

            const mailOptions = {
                from: `"TipFlow Security" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Kode Login TipFlow lo, Ri!',
                html: `<div style="border:2px solid #000; padding:20px;"><h2>Kode Login: ${otpCode}</h2></div>`
            };
            await transporter.sendMail(mailOptions);

            return res.json({ requiresTwoFA: true, userId: user.id, message: "Cek email buat kode login!" });
        }

        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name, profile_picture: user.profile_picture } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error saat Login" });
    }
});

// --- 6. SETUP & VERIFY 2FA (EMAIL VERSION) ---

// Step A: Generate & Kirim OTP Aktivasi
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT email FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const userEmail = rows[0].email;
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Simpan OTP di kolom two_fa_secret
        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otpCode, userId]);

        const mailOptions = {
            from: `"TipFlow Security" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🛡️ Aktivasi Keamanan TipFlow',
            html: `
                <div style="font-family:sans-serif; padding:20px; border:4px solid #000;">
                    <h2>Halo Sultan!</h2>
                    <p>Masukkan kode ini buat aktifin 2FA lo:</p>
                    <h1 style="background:#eee; padding:10px; text-align:center; letter-spacing:10px;">${otpCode}</h1>
                    <p>Jangan kasih tau siapa-siapa ya!</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: `Kode OTP sudah dikirim ke ${userEmail}!` 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Gagal kirim email OTP" });
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