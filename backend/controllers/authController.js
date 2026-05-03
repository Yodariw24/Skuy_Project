import jwt from 'jsonwebtoken';
import axios from 'axios'; // Ganti speakeasy dengan axios untuk nembak Fonnte

// --- 1. GOOGLE AUTH ---
export const googleAuth = async (req, res) => {
  const { email, name, picture, sub } = req.body;

  try {
    const queryCheck = `
      SELECT u.*, s.is_two_fa_enabled, s.display_name 
      FROM users u 
      LEFT JOIN streamers s ON u.id = s.user_id 
      WHERE u.email = $1
    `;
    let userResult = await req.db.query(queryCheck, [email]);
    let user = userResult.rows[0];

    if (!user) {
      const cleanUsername = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      const newUser = await req.db.query(
        'INSERT INTO users (username, email, role, google_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [cleanUsername, email, 'creator', sub]
      );
      user = newUser.rows[0];

      await req.db.query(
        'INSERT INTO streamers (user_id, display_name, full_name, profile_picture, is_two_fa_enabled) VALUES ($1, $2, $3, $4, false)',
        [user.id, name, name, picture]
      );
      await req.db.query('INSERT INTO balance (streamer_id, total_saldo) VALUES ($1, 0)', [user.id]);
      user.is_two_fa_enabled = false;
    }

    // ✅ LOGIC LOGIN: Jika 2FA aktif, jangan kasih token dulu!
    if (user.is_two_fa_enabled) {
        // Kirim OTP via WA secara otomatis saat login (opsional) atau suruh user klik "Kirim Kode" di FE
        return res.json({
            requiresTwoFA: true,
            userId: user.id,
            message: "Protokol WA-OTP Aktif! Verifikasi dulu, Ri."
        });
    }

    // Generate JWT jika 2FA mati
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

// --- 2. SETUP 2FA (WHATSAPP VERSION) ---
export const setup2FA = async (req, res) => {
  const { id } = req.user; 
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit

  try {
    // Simpan OTP sementara ke DB
    await req.db.query(
      'UPDATE streamers SET two_fa_secret = $1 WHERE user_id = $2', 
      [otp, id]
    );

    // Kirim via Fonnte
    await axios.post('https://api.fonnte.com/send', {
        target: '6283148678039', // Pake nomor lo atau ambil dari user.phone
        message: `KODE SKUY-GG: ${otp}. Jangan kasih tahu siapa-siapa, Ri!`,
    }, {
        headers: { Authorization: process.env.WA_TOKEN }
    });

    res.json({ success: true, message: "OTP Meluncur ke WA lo!" });
  } catch (err) {
    console.error("WA SETUP ERROR:", err.message);
    res.status(500).json({ success: false, message: "Gagal kirim WA OTP" });
  }
};

// --- 3. VERIFY & LOGIN (WHATSAPP VERSION) ---
export const verify2FA = async (req, res) => {
  const { userId, token } = req.body;
  
  try {
    const query = `SELECT s.two_fa_secret, u.username, u.role FROM streamers s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1`;
    const result = await req.db.query(query, [userId]);
    
    if (result.rows.length === 0) return res.status(404).json({ message: "User gak sinkron!" });

    const user = result.rows[0];

    // ✅ BANDINGKAN OTP WA (Bukan Speakeasy!)
    if (user.two_fa_secret === token.trim()) {
      await req.db.query('UPDATE streamers SET is_two_fa_enabled = true, two_fa_secret = NULL WHERE user_id = $1', [userId]);
      
      const appToken = jwt.sign(
        { id: userId, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026',
        { expiresIn: '7d' }
      );

      res.json({ 
        success: true, 
        token: appToken,
        user: { id: userId, is_two_fa_enabled: true, role: user.role }
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
  const userId = req.user?.id || req.body.userId;
  try {
    await req.db.query(
        'UPDATE streamers SET is_two_fa_enabled = false, two_fa_secret = NULL WHERE user_id = $1', 
        [userId]
    );
    res.json({ success: true, message: "2FA berhasil dimatikan." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal matikan 2FA." });
  }
};