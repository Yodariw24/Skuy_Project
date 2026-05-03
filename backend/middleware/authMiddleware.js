import jwt from 'jsonwebtoken';

/**
 * 1. PROTECT: Satpam Utama (Cek Token & Inject User Data)
 * Memastikan setiap request ke route sensitif memiliki token valid.
 */
export const protect = async (req, res, next) => {
  let token;

  // Cek apakah ada token di Header Authorization (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil tokennya doang
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi Token pakai JWT_SECRET yang ada di .env (RAHASIA_SLEBEW_2026)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026');

      /**
       * Mengambil data user terbaru dari DB Railway.
       * Kita JOIN dengan tabel streamers agar dapet status is_two_fa_enabled yang real-time.
       */
      const query = `
        SELECT u.id, u.username, u.email, u.role, s.is_two_fa_enabled 
        FROM users u
        LEFT JOIN streamers s ON u.id = s.user_id
        WHERE u.id = $1
      `;
      
      const { rows } = await req.db.query(query, [decoded.id]);

      if (rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: "User sudah tidak terdaftar di sistem SkuyGG." 
        });
      }

      // Simpan data user ke objek req supaya bisa dipake di controller mana aja
      req.user = rows[0];
      next();
    } catch (err) {
      console.error("🔥 JWT ERROR:", err.message);
      // Status 401 memicu auto-logout di interceptor Axios frontend lo
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
    // Pastikan req.user sudah ada (hasil dari protect)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role [${req.user?.role}] tidak diizinkan akses fitur ini!` 
      });
    }
    next();
  };
};