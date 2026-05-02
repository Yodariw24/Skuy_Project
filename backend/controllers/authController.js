import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';

// --- 1. GOOGLE AUTH (FUNGSI BARU UNTUK REGIS/LOGIN GOOGLE) ---
export const googleAuth = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  try {
    // 1. Cek apakah user sudah ada di database berdasarkan email
    let userResult = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user = userResult.rows[0];

    if (!user) {
      // 2. Jika USER BARU: Masukkan ke tabel users
      // Generate username unik dari nama (hilangkan spasi + angka random)
      const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      
      const newUser = await req.db.query(
        'INSERT INTO users (username, email, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [cleanUsername, email, 'creator', sub]
      );
      user = newUser.rows[0];

      // 3. Masukkan ke tabel streamers agar profil otomatis terbuat
      await req.db.query(
        'INSERT INTO streamers (user_id, display_name, full_name, profile_picture) VALUES ($1, $2, $3, $4)',
        [user.id, name, name, picture]
      );
      
      // 4. Inisialisasi saldo awal di tabel balance (Biar gak 404 pas buka wallet)
      await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
    }

    // 5. Generate JWT Token (Bawa role 'creator' agar menu terbuka)
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
        is_two_fa_enabled: false
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
    const secret = speakeasy.generateSecret({ name: `Skuy.GG (${email || username})` });
    await req.db.query(
      'UPDATE streamers SET two_fa_secret = $1, is_two_fa_enabled = false WHERE user_id = $2', 
      [secret.base32, id]
    );
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({ success: true, qrCode: qrCodeUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal inisialisasi 2FA!" });
  }
};

// --- 3. VERIFY & LOGIN (OBAT UNDEFINED ROLE) ---
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
    const verified = speakeasy.totp.verify({
      secret: user.two_fa_secret,
      encoding: 'base32',
      token: token.replace(/\s/g, ''), 
      window: 1 
    });

    if (verified) {
      await req.db.query('UPDATE streamers SET is_two_fa_enabled = true WHERE user_id = $1', [userId]);
      const appToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role || 'creator' },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );
      res.json({ 
        success: true, 
        token: appToken,
        user: { ...user, role: user.role || 'creator', is_two_fa_enabled: true }
      });
    } else {
      res.status(400).json({ success: false, message: "OTP salah!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Terjadi gangguan keamanan." });
  }
};

// --- 4. DISABLE 2FA ---
export const disable2FA = async (req, res) => {
  try {
    await req.db.query('UPDATE streamers SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: "2FA dimatikan." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal mematikan 2FA." });
  }
};