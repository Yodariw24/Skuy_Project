import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// --- 1. GOOGLE AUTH (LOGIN DENGAN CEK QR 2FA) ---
export const googleAuth = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  try {
    const queryCheck = `
      SELECT u.id, u.username, u.email, u.role, u.is_two_fa_enabled, u.two_fa_secret, s.display_name 
      FROM users u 
      LEFT JOIN streamers s ON u.id = s.user_id 
      WHERE u.email = $1
    `;
    let userResult = await req.db.query(queryCheck, [email]);
    let user = userResult.rows[0];

    // Registrasi otomatis jika user baru
    if (!user) {
      const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      const newUser = await req.db.query(
        'INSERT INTO users (username, email, role, google_id, is_two_fa_enabled) VALUES ($1, $2, $3, $4, false) RETURNING *',
        [cleanUsername, email, 'creator', sub]
      );
      user = newUser.rows[0];

      await req.db.query(
        'INSERT INTO streamers (user_id, display_name, full_name, profile_picture) VALUES ($1, $2, $3, $4)',
        [user.id, name, name, picture]
      );
      await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
    }

    // ✅ LOGIC LOGIN: Jika 2FA aktif, tahan token dan minta input dari aplikasi Authenticator
    if (user.is_two_fa_enabled) {
      return res.json({
        requiresTwoFA: true,
        userId: user.id,
        message: "Protokol Keamanan Aktif. Masukkan kode dari aplikasi Authenticator Anda."
      });
    }

    // Jika 2FA tidak aktif, langsung rilis JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'creator' },
      process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.display_name || name,
        role: user.role || 'creator',
        profile_picture: picture,
        is_two_fa_enabled: false
      }
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal autentikasi sistem." });
  }
};

// --- 2. SETUP 2FA (GENERATE QR CODE PERTAMA KALI) ---
export const setup2FA = async (req, res) => {
  const { id, username } = req.user; // Pastikan middleware auth sudah ngasih data ini

  try {
    // Generate secret key unik untuk user ini
    const secret = authenticator.generateSecret();
    
    // Simpan secret ke DB (Status belum enable, nunggu verifikasi pertama)
    await req.db.query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [secret, id]);

    // Bikin link buat QR Code (Muncul sebagai "Skuy.GG (username)" di HP)
    const otpauth = authenticator.keyuri(username, 'Skuy.GG', secret);
    
    // Ubah link jadi gambar Base64 QR Code
    const qrCodeImage = await QRCode.toDataURL(otpauth);

    res.json({ 
      success: true, 
      qrCode: qrCodeImage, 
      manualKey: secret, // Buat jaga-jaga kalau kamera HP user rusak
      message: "QR Code berhasil di-generate." 
    });
  } catch (err) {
    console.error("SETUP 2FA ERROR:", err.message);
    res.status(500).json({ success: false, message: "Gagal menyiapkan protokol QR." });
  }
};

// --- 3. VERIFY & ACTIVATE (VALIDASI KODE DARI HP USER) ---
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  try {
    const result = await req.db.query(
      `SELECT u.id, u.username, u.role, u.two_fa_secret, s.full_name, s.profile_picture 
       FROM users u LEFT JOIN streamers s ON u.id = s.user_id 
       WHERE u.id = $1`, 
      [userId]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan." });
    const user = result.rows[0];

    // ✅ VALIDASI PAKAI OTPLIB (Sesuai waktu saat ini)
    const isValid = authenticator.check(token.trim(), user.two_fa_secret);

    if (isValid) {
      // Aktifkan 2FA secara permanen
      await req.db.query('UPDATE users SET is_two_fa_enabled = true WHERE id = $1', [userId]);
      
      const appToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );

      res.json({ 
        success: true, 
        token: appToken,
        user: { 
          id: user.id, 
          username: user.username,
          full_name: user.full_name,
          profile_picture: user.profile_picture,
          is_two_fa_enabled: true, 
          role: user.role 
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Kode verifikasi salah atau sudah kadaluwarsa." });
    }
  } catch (err) {
    console.error("VERIFY ERROR:", err.message);
    res.status(500).json({ success: false, message: "Proses verifikasi gagal." });
  }
};

// --- 4. DISABLE 2FA ---
export const disable2FA = async (req, res) => {
  const userId = req.user?.id;
  try {
    await req.db.query(
        'UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1', 
        [userId]
    );
    res.json({ success: true, message: "Protokol keamanan telah dinonaktifkan." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mematikan fitur keamanan." });
  }
};