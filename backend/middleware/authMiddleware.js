import jwt from 'jsonwebtoken';

/**
 * 1. PROTECT: Satpam Utama (Cek Token & Inject User Data)
 * Memastikan setiap request ke route sensitif memiliki token valid.
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Cek apakah ada token di Header Authorization (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil tokennya
      token = req.headers.authorization.split(' ')[1];

      // 2. Verifikasi Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026');

      /**
       * 3. Ambil data user terbaru dari DB Railway.
       * ✅ FIX: Langsung ambil is_two_fa_enabled dari tabel users (lebih kenceng!)
       */
      const query = `
        SELECT id, username, email, role, is_two_fa_enabled 
        FROM users 
        WHERE id = $1
      `;
      
      const { rows } = await req.db.query(query, [decoded.id]);

      if (rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "User sudah tidak terdaftar di sistem SkuyGG." 
        });
      }

      // 4. Simpan data user ke objek req
      req.user = rows[0];
      next();
    } catch (err) {
      console.error("🔥 JWT ERROR:", err.message);
      // Status 401 akan memicu auto-logout di frontend
      return res.status(401).json({ 
        success: false, 
        message: "Token expired atau tidak valid, silakan login kembali!" 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Akses ditolak, lo belum login!" 
    });
  }
};

/**
 * 2. AUTHORIZE: Cek Role (Admin, Creator, dsb)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah ada (hasil dari middleware protect)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role [${req.user?.role || 'Guest'}] tidak diizinkan akses fitur ini!` 
      });
    }
    next();
  };
};