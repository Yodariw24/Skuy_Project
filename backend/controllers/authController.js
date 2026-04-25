import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken'; // PENTING: Tambahkan import ini

// FUNGSI 1: SETUP 2FA (Bikin QR Code)
export const setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ 
      name: `Skuy.GG (${req.user.email || req.user.username})` 
    });
    
    // Simpan secret ke database streamers
    await pool.query('UPDATE streamers SET two_fa_secret = $1 WHERE id = $2', [secret.base32, req.user.id]);
    
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qrCode: qrCodeUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal Setup 2FA!" });
  }
};

// FUNGSI 2: VERIFIKASI 2FA (Pas Login)
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM streamers WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
    }

    const streamer = result.rows[0];

    // VERIFIKASI KODE OTP
    const verified = speakeasy.totp.verify({
      secret: streamer.two_fa_secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), 
      window: 2 
    });

    if (verified) {
      // 1. Aktifkan 2FA secara permanen
      await pool.query('UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1', [userId]);
      
      // 2. BIKIN JWT TOKEN (Tiket Masuk Dashboard)
      const appToken = jwt.sign(
        { id: streamer.id, username: streamer.username, role: streamer.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );
      
      // 3. Kirim respon lengkap ke Frontend
      res.json({ 
        success: true, 
        message: "Login Berhasil, Slebew!",
        token: appToken, // Token ini yang bakal disimpan di localStorage
        data: {
            id: streamer.id,
            username: streamer.username,
            full_name: streamer.full_name,
            role: streamer.role,
            profile_picture: streamer.profile_picture
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Kode OTP Salah atau Kadaluarsa!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};