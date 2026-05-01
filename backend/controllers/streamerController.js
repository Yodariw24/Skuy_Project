import fs from 'fs';
import path from 'path';

// 1. Ambil SEMUA Streamer (Untuk Halaman Explore / Search)
export const getAllStreamers = async (req, res) => {
  try {
    const result = await req.db.query('SELECT id, username, display_name, full_name, profile_picture, theme_color FROM streamers ORDER BY id DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Ambil SATU Streamer berdasarkan Username (Case Insensitive)
export const getStreamerByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await req.db.query(
      'SELECT id, username, display_name, full_name, bio, instagram, tiktok, youtube, theme_color, profile_picture FROM streamers WHERE LOWER(username) = LOWER($1)', 
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kreator tidak ditemukan di Skuy System" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Update Informasi Rekening Sultan
export const updateBankInfo = async (req, res) => {
  const { id } = req.params;
  const { bank_name, account_number, account_name } = req.body;

  try {
    const result = await req.db.query(
      `UPDATE streamers 
       SET bank_name = $1, account_number = $2, account_name = $3 
       WHERE id = $4 RETURNING bank_name, account_number, account_name`,
      [bank_name, account_number, account_name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User tak terdaftar" });
    }

    res.json({ 
      success: true, 
      message: "Protokol Rekening berhasil diperbarui! 🚀", 
      data: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. UPDATE PROFILE, BIO & THEME (Sync dengan Frontend)
export const updateProfileInfo = async (req, res) => {
  const { id } = req.params;
  const { display_name, bio, instagram, tiktok, youtube, theme_color } = req.body;

  try {
    const result = await req.db.query(
      `UPDATE streamers 
       SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5, theme_color = $6 
       WHERE id = $7 RETURNING *`,
      [display_name, bio, instagram, tiktok, youtube, theme_color || 'violet', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Akses ditolak atau User tak ada" });
    }

    res.json({ 
      success: true, 
      message: "Profil & Tema tersinkronisasi! ✨", 
      data: result.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. UPDATE FOTO PROFIL (With Auto-Purge Old File)
export const updateProfilePhoto = async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Sistem membutuhkan file gambar!" });
    }

    // 1. Cari dulu nama file lama di DB
    const oldData = await req.db.query('SELECT profile_picture FROM streamers WHERE id = $1', [id]);
    const oldFile = oldData.rows[0]?.profile_picture;

    // 2. Hapus file lama dari storage Railway agar tidak numpuk
    if (oldFile) {
      const oldPath = path.join(process.cwd(), 'uploads', oldFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 3. Update dengan nama file baru
    const newFileName = req.file.filename;
    await req.db.query("UPDATE streamers SET profile_picture = $1 WHERE id = $2", [newFileName, id]);

    res.json({ 
      success: true, 
      filename: newFileName, 
      message: "Avatar Sultan Berhasil Diupload! 🔥" 
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ success: false, message: "Gagal memproses gambar" });
  }
};

// 6. HAPUS FOTO PROFIL
export const deleteProfilePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await req.db.query('SELECT profile_picture FROM streamers WHERE id = $1', [id]);
    const fileToDelete = data.rows[0]?.profile_picture;

    if (fileToDelete) {
      const filePath = path.join(process.cwd(), 'uploads', fileToDelete);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await req.db.query("UPDATE streamers SET profile_picture = NULL WHERE id = $1", [id]);
    res.json({ success: true, message: "Kembali ke identitas default avatar." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};