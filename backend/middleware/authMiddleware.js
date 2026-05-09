import jwt from 'jsonwebtoken';

/**
 * 1. PROTECT: Satpam Utama (Cek Token & Inject User Data)
 * Memastikan setiap request ke route sensitif memiliki token valid.
 */
export const protect = async (req, res, next) => {
    let token;

    // 🛡️ 1. Cek apakah ada token di Header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil tokennya
            token = req.headers.authorization.split(' ')[1];

            // 🛡️ 2. Verifikasi Token (Gunakan secret yang sama dengan authRoutes)
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RAHASIA_SULTAN_SKUYGG');

            /**
             * 🛡️ 3. Sync Database: Ambil data user paling seger!
             * Kita ambil juga phone_number buat validasi 2FA di middleware jika butuh.
             */
            const query = `
                SELECT u.id, u.username, u.email, u.role, u.is_two_fa_enabled, u.profile_picture, s.phone_number 
                FROM users u
                LEFT JOIN streamers s ON u.id = s.user_id
                WHERE u.id = $1
            `;
            
            const { rows } = await req.db.query(query, [decoded.id]);

            if (rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: "User tak terdaftar di sistem SkuyGG!" 
                });
            }

            // 🛡️ 4. Injeksi data ke req.user
            req.user = rows[0];
            next();
        } catch (err) {
            console.error("🔥 SHIELD_BREAK_ERROR:", err.message);
            return res.status(401).json({ 
                success: false, 
                message: "Sesi expired, Ri! Login ulang dulu ya." 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Akses ditolak, lo belum login Sultan!" 
        });
    }
};

/**
 * 2. AUTHORIZE: Cek Role (Admin, Creator, dsb)
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Pastikan role user masuk dalam daftar izin
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Level lo [${req.user?.role || 'Guest'}] belum cukup buat akses ini!` 
            });
        }
        next();
    };
};