import fs from 'fs';
import path from 'path';

// 1. Ambil SEMUA Streamer (Sinkronisasi Elit Kreator di Homepage)
export const getAllStreamers = async (req, res) => {
  try {
    const query = `
      SELECT s.id, u.username, s.display_name, s.full_name, s.profile_picture, s.theme_color, u.role 
      FROM streamers s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'creator'  -- ✅ Hanya tampilkan yang statusnya creator di database
      ORDER BY s.id DESC
    `;
    const result = await req.db.query(query);

    // ✅ FIX: Kirim result.rows (Array) secara langsung.
    // Fallback [] memastikan frontend tidak crash (White Screen) saat datanya kosong.
    const streamers = result.rows || [];
    
    res.json(streamers); 
  } catch (err) {
    console.error("🔥 Error GET ELIT KREATOR:", err.message);
    // ✅ Kirim array kosong saat error agar .map() di frontend tidak meledak
    res.status(500).json([]); 
  }
};

// 2. Ambil SATU Streamer berdasarkan Username
export const getStreamerByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const query = `
      SELECT s.id, u.username, s.display_name, s.full_name, s.bio, s.instagram, s.tiktok, s.youtube, s.theme_color, s.profile_picture, u.role
      FROM streamers s
      JOIN users u ON s.user_id = u.id
      WHERE LOWER(u.username) = LOWER($1)
    `;
    const result = await req.db.query(query, [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Kreator tidak ditemukan di Skuy System" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Update Informasi Rekening
export const updateBankInfo = async (req, res) => {
  const { id } = req.params; 
  const { bank_name, account_number, account_name } = req.body;

  try {
    const result = await req.db.query(
      `UPDATE streamers 
       SET bank_name = $1, account_number = $2, account_name = $3 
       WHERE user_id = $4 RETURNING bank_name, account_number, account_name`,
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

// 4. Update Profile & Theme
export const updateProfileInfo = async (req, res) => {
  const { id } = req.params;
  const { display_name, bio, instagram, tiktok, youtube, theme_color } = req.body;

  try {
    const result = await req.db.query(
      `UPDATE streamers 
       SET display_name = $1, bio = $2, instagram = $3, tiktok = $4, youtube = $5, theme_color = $6 
       WHERE user_id = $7 RETURNING id, display_name, bio, theme_color`,
      [display_name, bio, instagram, tiktok, youtube, theme_color || 'violet', id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Akses ditolak" });
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

// 5. Update Foto Profil
export const updateProfilePhoto = async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Sistem membutuhkan file gambar!" });
    }

    const oldData = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
    const oldFile = oldData.rows[0]?.profile_picture;

    if (oldFile) {
      const oldPath = path.resolve(process.cwd(), 'uploads', oldFile);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (fileErr) {
          console.warn("⚠️ Gagal hapus file lama:", fileErr.message);
        }
      }
    }

    const newFileName = req.file.filename;
    await req.db.query("UPDATE streamers SET profile_picture = $1 WHERE user_id = $2", [newFileName, id]);

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

// 6. Hapus Foto Profil
export const deleteProfilePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await req.db.query('SELECT profile_picture FROM streamers WHERE user_id = $1', [id]);
    const fileToDelete = data.rows[0]?.profile_picture;

    if (fileToDelete) {
      const filePath = path.resolve(process.cwd(), 'uploads', fileToDelete);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await req.db.query("UPDATE streamers SET profile_picture = NULL WHERE user_id = $1", [id]);
    res.json({ success: true, message: "Kembali ke identitas default avatar." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};