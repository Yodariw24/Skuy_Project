import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// FUNGSI 1: SETUP 2FA (Update: Gunakan user_id sebagai foreign key)
export const setup2FA = async (req, res) => {
  const { id, email, username } = req.user; 
  
  try {
    const secret = speakeasy.generateSecret({ 
      name: `Skuy.GG (${email || username})` 
    });
    
    // ✅ PERBAIKAN: Gunakan user_id agar sinkron dengan tabel users
    await req.db.query(
      'UPDATE streamers SET two_fa_secret = $1, is_two_fa_enabled = false WHERE user_id = $2', 
      [secret.base32, id]
    );
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    res.json({ 
      success: true, 
      message: "Protokol keamanan dibuat!",
      qrCode: qrCodeUrl 
    });
  } catch (err) {
    console.error("2FA SETUP ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal inisialisasi 2FA, Ri!" });
  }
};

// FUNGSI 2: VERIFIKASI & LOGIN (Final Gateway - SINKRONISASI ROLE)
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  if (!token) return res.status(400).json({ message: "Kode OTP wajib diisi!" });

  try {
    // ✅ PERBAIKAN VITAL: Gunakan JOIN agar narik data 'role' dari tabel users
    // Ini yang bikin menu My Wallet lo kebuka otomatis!
    const query = `
      SELECT u.id, u.username, u.role, s.two_fa_secret, s.full_name, s.profile_picture 
      FROM users u
      JOIN streamers s ON u.id = s.user_id 
      WHERE u.id = $1
    `;
    const result = await req.db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Data User & Streamer tidak sinkron, Ri!" });
    }

    const user = result.rows[0];

    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), 
      window: 1 
    });

    if (verified) {
      // 1. Permanenkan status 2FA di Database
      await req.db.query('UPDATE streamers SET is_two_fa_enabled = true WHERE user_id = $1', [userId]);
      
      // 2. Generate JWT (Pastikan role 'creator' masuk ke sini)
      const appToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );
      
      res.json({ 
        success: true, 
        message: "Otorisasi Berhasil! Selamat datang, Sultan.",
        token: appToken,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role, // Sekarang role 'creator' pasti kebawa ke Frontend
            profile_picture: user.profile_picture,
            is_two_fa_enabled: true
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Kode OTP salah atau expired!" });
    }
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi gangguan sistem keamanan." });
  }
};

// FUNGSI 3: DISABLE 2FA
export const disable2FA = async (req, res) => {
    try {
        await req.db.query(
            'UPDATE streamers SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE user_id = $1', 
            [req.user.id]
        );
        res.json({ success: true, message: "Keamanan 2FA telah dimatikan." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal mematikan 2FA." });
    }
};