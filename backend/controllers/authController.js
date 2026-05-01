import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// FUNGSI 1: SETUP 2FA (Generate QR Code untuk Google Authenticator)
export const setup2FA = async (req, res) => {
  const { id, email, username } = req.user; // Diambil dari middleware verifyToken
  
  try {
    const secret = speakeasy.generateSecret({ 
      name: `Skuy.GG (${email || username})` 
    });
    
    // Simpan secret base32 ke database Railway
    // Gunakan req.db yang sudah kita inject di server.js tadi
    await req.db.query(
      'UPDATE streamers SET two_fa_secret = $1, is_two_fa_enabled = false WHERE id = $2', 
      [secret.base32, id]
    );
    
    // Generate QR Code dalam bentuk DataURL (Base64 Image)
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

// FUNGSI 2: VERIFIKASI & LOGIN (Final Gateway)
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  if (!token) return res.status(400).json({ message: "Kode OTP wajib diisi!" });

  try {
    const result = await req.db.query('SELECT * FROM streamers WHERE id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan!" });
    }

    const user = result.rows[0];

    // VERIFIKASI KODE TOTP (Time-based One Time Password)
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Hapus spasi kalau user copas
      window: 1 // Toleransi selisih waktu 30 detik
    });

    if (verified) {
      // 1. Permanenkan status 2FA di Database
      await req.db.query('UPDATE streamers SET is_two_fa_enabled = true WHERE id = $1', [userId]);
      
      // 2. Generate JWT (Tiket Masuk Dashboard)
      const appToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );
      
      // 3. Respon ke Frontend (Sesuai kebutuhan di AuthPage.jsx)
      res.json({ 
        success: true, 
        message: "Otorisasi Berhasil! Selamat datang, Sultan.",
        token: appToken,
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            role: user.role,
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
            'UPDATE streamers SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1', 
            [req.user.id]
        );
        res.json({ success: true, message: "Keamanan 2FA telah dimatikan." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Gagal mematikan 2FA." });
    }
};