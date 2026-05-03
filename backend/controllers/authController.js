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

    // Jika User Baru (Registrasi Otomatis)
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
      
      // Update OTP rahasia ke DB
      await req.db.query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [otp, user.id]);

      // Kirim via Fonnte
      try {
        await axios.post('https://api.fonnte.com/send', {
            target: '6283148678039', // Pastikan nomor target Sultan sudah dinamis nantinya
            message: `[SKUY-GG SECURITY] Kode verifikasi Anda adalah: ${otp}. Kode ini bersifat rahasia.`,
        }, {
            headers: { Authorization: process.env.WA_TOKEN }
        });
      } catch (waErr) {
        console.error("Fonnte API Error:", waErr.message);
      }

      return res.json({
          requiresTwoFA: true,
          userId: user.id,
          message: "Verification Protocol Required. Check your WhatsApp."
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
    res.status(500).json({ success: false, message: "Internal Authentication Error" });
  }
};

// --- 2. SETUP 2FA (AKTIVASI PERTAMA) ---
export const setup2FA = async (req, res) => {
  const { id } = req.user; // Diambil dari middleware autentikasi
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await req.db.query('UPDATE users SET two_fa_secret = $1 WHERE id = $2', [otp, id]);

    await axios.post('https://api.fonnte.com/send', {
        target: '6283148678039', 
        message: `[SKUY-GG] KODE AKTIVASI: ${otp}. Gunakan kode ini untuk mengaktifkan fitur perlindungan akun Sultan.`,
    }, {
        headers: { Authorization: process.env.WA_TOKEN }
    });

    res.json({ success: true, message: "Security code sent to WhatsApp." });
  } catch (err) {
    console.error("SETUP 2FA ERROR:", err.message);
    res.status(500).json({ success: false, message: "Failed to initiate 2FA setup." });
  }
};

// --- 3. VERIFY & LOGIN (PROSES VALIDASI) ---
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
    
    if (result.rows.length === 0) return res.status(404).json({ message: "Identity not found." });
    const user = result.rows[0];

    // Validasi OTP (Gunakan trim untuk mencegah spasi tak sengaja)
    if (user.two_fa_secret && user.two_fa_secret === token.trim()) {
      // ✅ Aktifkan status & bersihkan secret agar tidak bisa dipakai ulang
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
      res.status(400).json({ success: false, message: "Invalid or expired verification code." });
    }
  } catch (err) {
    console.error("VERIFY ERROR:", err.message);
    res.status(500).json({ success: false, message: "Verification process failed." });
  }
};

// --- 4. DISABLE 2FA ---
export const disable2FA = async (req, res) => {
  const userId = req.user?.id; // Pastikan id didapat dari token sesi saat ini
  try {
    await req.db.query(
        'UPDATE users SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1', 
        [userId]
    );
    res.json({ success: true, message: "Two-Factor Authentication deactivated." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to deactivate security protocol." });
  }
};