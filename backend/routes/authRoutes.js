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
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 3. GOOGLE AUTH (NEW: LOGIN & REGIS OTOMATIS) ---
router.post('/google', async (req, res) => {
    const { email, name, picture, sub } = req.body;

    try {
        // 1. Cek apakah email sudah ada
        let userResult = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (!user) {
            // 2. Jika USER BARU: Mulai Transaksi
            await req.db.query('BEGIN');

            const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            
            const newUserRes = await req.db.query(
                'INSERT INTO users (username, email, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [cleanUsername, email, 'creator', sub]
            );
            user = newUserRes.rows[0];

            // 3. Masukkan ke tabel streamers
            await req.db.query(
                'INSERT INTO streamers (user_id, username, email, full_name, profile_picture, role, theme_color) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [user.id, user.username, user.email, name, picture, 'creator', 'violet']
            );

            // 4. Inisialisasi Wallet
            await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);

            await req.db.query('COMMIT');
        }

        // 5. Kirim Token & Data User
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

        const insertUser = `
            INSERT INTO users (username, email, password, role) 
            VALUES ($1, $2, $3, 'creator') 
            RETURNING id, username, email, role
        `;
        const userRes = await req.db.query(insertUser, [username, email, hashedPassword]);
        const newUser = userRes.rows[0];

        const insertStreamer = `
            INSERT INTO streamers (user_id, username, email, full_name, role, theme_color) 
            VALUES ($1, $2, $3, $4, $5, 'violet')
        `;
        await req.db.query(insertStreamer, [newUser.id, newUser.username, newUser.email, full_name, newUser.role]);

        await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [newUser.id]);

        await req.db.query('COMMIT');
        
        res.status(201).json({ success: true, message: "Akun Sultan Berhasil Dibuat! 🚀", user: newUser });
    } catch (err) {
        await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Pendaftaran gagal, email/username mungkin sudah ada." });
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

        if (user.is_two_fa_enabled) {
            return res.json({ requiresTwoFA: true, userId: user.id, message: "2FA Aktif!" });
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

// --- 6. SETUP & VERIFY 2FA (EMAIL OTP) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
        const { rows } = await req.db.query("SELECT email FROM users WHERE id = $1", [userId]);
        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        await req.db.query("UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2", [otp, userId]);
        await transporter.sendMail({
            from: '"SkuyGG Security" <security@skuy.gg>',
            to: rows[0].email,
            subject: `[${otp}] Kode Keamanan SkuyGG`,
            html: `<h2>Kode OTP lo: ${otp}</h2>`
        });
        res.json({ success: true, message: "OTP terkirim ke email!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal kirim OTP" });
    }
});

router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const query = `SELECT u.*, s.two_fa_secret FROM users u JOIN streamers s ON u.id = s.user_id WHERE u.id = $1`;
        const { rows } = await req.db.query(query, [userId]);
        const user = rows[0];

        if (user && user.two_fa_secret === token) {
            await req.db.query("UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE user_id = $1", [userId]);
            res.json({ success: true, token: generateToken(user), user: { id: user.id, username: user.username, role: user.role } });
        } else {
            res.status(400).json({ success: false, message: "OTP Salah!" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Verifikasi gagal" });
    }
});

export default router;