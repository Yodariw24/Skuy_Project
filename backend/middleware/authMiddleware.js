import jwt from 'jsonwebtoken';

// 1. PROTECT: Satpam Utama (Cek Token & Inject User Data)
export const protect = async (req, res, next) => {
  let token;

  // Cek apakah ada token di Header Authorization (Format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Ambil tokennya doang
      token = req.headers.authorization.split(' ')[1];

      // Verifikasi Token pakai JWT_SECRET yang ada di .env Railway
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RAHASIA_SLEBEW_2026');

      // Ambil data user terbaru dari DB Railway (Inject ke request)
      const { rows } = await req.db.query(
        'SELECT id, username, email, role, is_two_fa_enabled FROM streamers WHERE id = $1', 
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: "User sudah tidak terdaftar di Skuy system." });
      }

      // Simpan data user ke objek req supaya bisa dipake di controller mana aja
      req.user = rows[0];
      next();
    } catch (err) {
      console.error("🔥 JWT ERROR:", err.message);
      return res.status(401).json({ success: false, message: "Token lo udah expired atau nggak valid, login lagi jirr!" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Akses ditolak, lo belum login!" });
  }
};

// 2. AUTHORIZE: Cek Role (Admin, Creator, dsb)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah ada (hasil dari protect)
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Role [${req.user?.role}] nggak diizinkan akses fitur ini!` 
      });
    }
    next();
  };
};