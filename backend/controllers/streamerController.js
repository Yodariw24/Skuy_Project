const pool = require('../config/db');

// 1. Ambil SEMUA Streamer (Untuk Halaman Explore)
const getAllStreamers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM streamers ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Ambil SATU Streamer berdasarkan Username
const getStreamerByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM streamers WHERE LOWER(username) = LOWER($1)', 
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kreator tidak ditemukan" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Tambah Streamer Baru
const createStreamer = async (req, res) => {
  const { username, full_name, email } = req.body;
  try {
    const newUser = await pool.query(
      "INSERT INTO streamers (username, full_name, email) VALUES ($1, $2, $3) RETURNING *",
      [username, full_name, email]
    );
    res.json({ success: true, data: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. Update Informasi Bank/E-Wallet
const updateBankInfo = async (req, res) => {
  const { id } = req.params;
  const { bank_name, account_number, account_name } = req.body;

  try {
    const result = await pool.query(
      `UPDATE streamers 
       SET bank_name = $1, account_number = $2, account_name = $3 
       WHERE id = $4 RETURNING *`,
      [bank_name, account_number, account_name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ 
      success: true, 
      message: "Rekening berhasil diperbarui! 🚀", 
      data: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. UPDATE PROFILE, BIO & THEME (VERSI FIX TOTAL)
const updateProfileInfo = async (req, res) => {
  const { id } = req.params;
  
  // LOG: Liat di terminal backend pas klik save tema
  console.log("==> INPUT DATA:", req.body);

  const { 
    display_name, 
    bio, 
    instagram, 
    tiktok, 
    youtube, 
    theme_color // Pastikan ini dikirim dari Frontend
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE streamers 
       SET display_name = $1, 
           bio = $2, 
           instagram = $3, 
           tiktok = $4, 
           youtube = $5, 
           theme_color = $6 
       WHERE id = $7 RETURNING *`,
      [
        display_name, 
        bio, 
        instagram, 
        tiktok, 
        youtube, 
        theme_color || 'violet', // Default ke violet kalau kosong
        id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    console.log("==> DATABASE UPDATED:", result.rows[0].theme_color);

    res.json({ 
      success: true, 
      message: "Profil & Tema berhasil diperbarui! ✨", 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error("ERROR SQL UPDATE:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. UPDATE FOTO PROFIL
const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Tidak ada file yang diupload" });
    }

    const fileName = req.file.filename;

    const result = await pool.query(
      "UPDATE streamers SET profile_picture = $1 WHERE id = $2 RETURNING *",
      [fileName, id]
    );

    res.json({ 
      success: true, 
      url: fileName, 
      message: "Foto profil berhasil diupload! 🔥" 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 7. HAPUS FOTO PROFIL
const deleteProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      "UPDATE streamers SET profile_picture = NULL WHERE id = $1", 
      [id]
    );

    res.json({ success: true, message: "Foto dihapus, kembali ke default avatar." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  getAllStreamers, 
  getStreamerByUsername, 
  createStreamer,
  updateBankInfo,
  updateProfileInfo,
  updateProfilePhoto,
  deleteProfilePhoto
};