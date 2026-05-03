import jwt from 'jsonwebtoken';
import axios from 'axios';

// --- 1. GOOGLE AUTH (WITH AUTO-SEND OTP) ---
export const googleAuth = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  try {
    const queryCheck = `
      SELECT u.id, u.username, u.email, u.role, u.is_two_fa_enabled, s.display_name 
      FROM users u 
      LEFT JOIN streamers s ON u.id = s.user_id 
      WHERE u.email = $1
    `;
    let userResult = await req.db.query(queryCheck, [email]);
    let user = userResult.rows[0];

    // Jika User Baru
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

    // ✅ LOGIC LOGIN: Jika 2FA aktif, kirim OTP otomatis & tahan Token
    if (user.is_two_fa_enabled === true) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simpan OTP ke DB
      await req.db.query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [otp, user.id]);

      // Kirim via Fonnte
      try {
        await axios.post('https://api.fonnte.com/send', {
            target: '6283148678039', // Sesuaikan target nomor Ri
            message: `KODE SKUY-GG: ${otp}. Masukkan kode ini untuk login ke akun lo!`,
        }, {
            headers: { Authorization: process.env.WA_TOKEN }
        });
      } catch (waErr) {
        console.error("Gagal kirim WA saat login:", waErr.message);
      }

      return res.json({
          requiresTwoFA: true,
          userId: user.id,
          message: "Protokol WA-OTP Aktif! Cek WA lo, Ri."
      });
    }

    // Jika 2FA tidak aktif, langsung kasih token
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
    res.status(500).json({ success: false, message: "Gagal login via Google!" });
  }
};

// --- 2. SETUP 2FA (UNTUK AKTIVASI PERTAMA) ---
export const setup2FA = async (req, res) => {
  const { id } = req.user; 
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await req.db.query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [otp, id]);

    await axios.post('https://api.fonnte.com/send', {
        target: '6283148678039', 
        message: `KODE AKTIVASI SKUY-GG: ${otp}. Masukkan kode ini untuk mengaktifkan perisai akun lo!`,
    }, {
        headers: { Authorization: process.env.WA_TOKEN }
    });

    res.json({ success: true, message: "OTP Aktivasi terkirim!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal kirim OTP" });
  }
};

// --- 3. VERIFY & LOGIN (SINKRONISASI TOTAL) ---
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  try {
    const query = `
      SELECT u.id, u.username, u.role, u.two_fa_secret, s.full_name, s.profile_picture 
      FROM users u 
      LEFT JOIN streamers s ON u.id = s.user_id
      WHERE u.id = $1
    `;
    const result = await req.db.query(query, [userId]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "User gak ketemu!" });
    const user = result.rows[0];

    // Bandingkan OTP
    if (user.two_fa_secret === token.trim()) {
      // ✅ Update status AKTIF & bersihkan secret
      await req.db.query(
        'UPDATE users SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE id = $1', 
        [userId]
      );
      
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
      res.status(400).json({ success: false, message: "Kode OTP WA salah!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Error verifikasi." });
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
    res.json({ success: true, message: "2FA berhasil dimatikan." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal matikan 2FA." });
  }
};