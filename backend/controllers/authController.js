import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// --- 1. GOOGLE AUTH ---
export const googleAuth = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  try {
    // 1. Cek user di tabel users JOIN streamers untuk dapet status 2FA
    const queryCheck = `
      SELECT u.*, s.is_two_fa_enabled, s.display_name 
      FROM users u 
      LEFT JOIN streamers s ON u.id = s.user_id 
      WHERE u.email = $1
    `;
    let userResult = await req.db.query(queryCheck, [email]);
    let user = userResult.rows[0];

    if (!user) {
      // 2. Jika USER BARU
      const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      
      const newUser = await req.db.query(
        'INSERT INTO users (username, email, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [cleanUsername, email, 'creator', sub]
      );
      user = newUser.rows[0];

      // 3. Setup Profil Streamer
      await req.db.query(
        'INSERT INTO streamers (user_id, display_name, full_name, profile_picture) VALUES ($1, $2, $3, $4)',
        [user.id, name, name, picture]
      );
      
      // 4. Inisialisasi Saldo
      await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
      
      user.is_two_fa_enabled = false; // Default untuk user baru
    }

    // 5. Logic Login: Jika 2FA aktif, arahkan ke verifikasi dulu
    if (user.is_two_fa_enabled) {
        return res.json({
            requiresTwoFA: true,
            userId: user.id,
            message: "Sultan wajib verifikasi 2FA dulu!"
        });
    }

    // 6. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role || 'creator' },
      process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Login Google Berhasil, Ri!",
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.display_name || name,
        role: user.role || 'creator',
        profile_picture: picture,
        is_two_fa_enabled: user.is_two_fa_enabled
      }
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal login via Google, coba lagi Ri!" });
  }
};

// --- 2. SETUP 2FA ---
export const setup2FA = async (req, res) => {
  const { id, email, username } = req.user; 
  try {
    // Generate Secret baru dengan label aplikasi kita
    const secret = speakeasy.generateSecret({ 
        name: `Skuy.GG (${email || username})`,
        issuer: 'SkuyGG'
    });

    // Simpan secret ke database Railway
    await req.db.query(
      'UPDATE streamers SET two_fa_secret = $1, is_two_fa_enabled = false WHERE user_id = $2', 
      [secret.base32, id]
    );

    // Kirim QR Code ke Frontend
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qrCode: qrCodeUrl });
  } catch (err) {
    console.error("SETUP 2FA ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal inisialisasi 2FA!" });
  }
};

// --- 3. VERIFY & LOGIN ---
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  if (!token) return res.status(400).json({ message: "OTP wajib diisi!" });

  try {
    const query = `
      SELECT u.id, u.username, u.role, s.two_fa_secret, s.full_name, s.profile_picture 
      FROM users u
      JOIN streamers s ON u.id = s.user_id 
      WHERE u.id = $1
    `;
    const result = await req.db.query(query, [userId]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Data Sultan gak sinkron!" });

    const user = result.rows[0];

    // Verifikasi Token TOTP
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), // Bersihkan spasi
      window: 1 // Toleransi waktu 30 detik sebelum/sesudah
    });

    if (verified) {
      // Aktifkan status 2FA secara permanen
      await req.db.query('UPDATE streamers SET is_two_fa_enabled = true WHERE user_id = $1', [userId]);
      
      const appToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
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
            role: user.role || 'creator',
            is_two_fa_enabled: true 
        }
      });
    } else {
      res.status(400).json({ success: false, message: "Kode OTP salah atau expired!" });
    }
  } catch (err) {
    console.error("VERIFY 2FA ERROR:", err);
    res.status(500).json({ success: false, message: "Terjadi gangguan keamanan." });
  }
};

// --- 4. DISABLE 2FA ---
export const disable2FA = async (req, res) => {
  try {
    await req.db.query(
        'UPDATE streamers SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE user_id = $1', 
        [req.user.id]
    );
    res.json({ success: true, message: "2FA berhasil dimatikan." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mematikan protokol keamanan." });
  }
};