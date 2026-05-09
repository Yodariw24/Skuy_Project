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
        { 
            id: user.id, 
            username: user.username, 
            role: user.role || 'creator' 
        },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
    );
};

// --- 2. LOGIN MANUAL (PINTU MASUK UTAMA) ---
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

        // ✅ CEK STATUS 2FA
        if (user.is_two_fa_enabled) {
            // JANGAN kasih token dulu, suruh dia ke halaman OTP
            return res.json({ 
                success: true, 
                requiresTwoFA: true, 
                userId: user.id 
            });
        }

        // Kalau nggak aktif 2FA, langsung kasih token sakti
        res.json({ 
            success: true, 
            token: generateToken(user), 
            user: { id: user.id, username: user.username, profile_picture: user.profile_picture } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Engine Error." });
    }
});

// --- 3. VERIFY 2FA (PEMBUKTIAN KODE) ---
router.post('/verify-2fa', async (req, res) => {
    const { userId, token } = req.body;
    try {
        // Kita tarik ulang data user buat dapet secret-nya
        const { rows } = await req.db.query("SELECT * FROM users WHERE id = $1", [userId]);
        const user = rows[0];

        if (!user?.two_fa_secret) {
            return res.status(400).json({ success: false, message: "Secret hilang, setup ulang!" });
        }

        const secret = user.two_fa_secret.trim();
        const inputToken = token.trim().replace(/\s/g, '');

        // 🛡️ VERIFIKASI MURNI
        const isValid = authenticator.check(inputToken, secret);
        
        // Backup dengan window toleransi
        const isExtraValid = authenticator.verify({
            token: inputToken,
            secret: secret,
            window: 2 // Kasih nyawa 1 menit kalau jam HP telat
        });

        if (isValid || isExtraValid) {
            // ✅ LOGIN BERHASIL: Kasih token di sini!
            const tokenJwt = generateToken(user);
            
            res.json({ 
                success: true, 
                token: tokenJwt,
                user: { 
                    id: user.id, 
                    username: user.username, 
                    is_two_fa_enabled: true 
                } 
            });
        } else {
            const serverCode = authenticator.generate(secret);
            console.log(`[LOG_SULTAN] Jam Server: ${new Date().toLocaleTimeString()} | Expected: ${serverCode}`);
            
            res.status(400).json({ 
                success: false, 
                message: "Kode OTP Salah atau Expired!" 
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal verifikasi." });
    }
});

// --- 4. SETUP 2FA (UNTUK HALAMAN SETTINGS) ---
router.post('/setup-2fa', async (req, res) => {
    const { userId } = req.body;
    try {
        const { rows } = await req.db.query("SELECT username FROM users WHERE id = $1", [userId]);
        const secret = authenticator.generateSecret(); 
        const otpauth = authenticator.keyuri(rows[0].username, 'SkuyGG', secret);
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        await req.db.query("UPDATE users SET two_fa_secret = $1, is_two_fa_enabled = false WHERE id = $2", [secret, userId]);
        res.json({ success: true, qrCode: qrCodeUrl });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal setup QR." });
    }
});

export default router;