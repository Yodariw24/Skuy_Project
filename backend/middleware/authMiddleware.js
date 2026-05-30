import jwt from 'jsonwebtoken';

/**
 * 1. PROTECT: Satpam Utama (Cek Token & Inject User Data Termutakhir)
 * Memastikan setiap request ke route sensitif memiliki token valid bawaan session.
 */
export const protect = async (req, res, next) => {
    let token;

    // 🛡️ 1. Cek validitas format header Authorization awal
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Ambil tokennya murni setelah string 'Bearer '
            token = req.headers.authorization.split(' ')[1];

            // 🛡️ 2. Verifikasi Token (Menggunakan secret pangkalan yang sama dengan authRoutes)
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'RAHASIA_SULTAN_SKUYGG');

            /**
             * 🛡️ 3. Sync Database: Ambil data user paling seger dari PostgreSQL Railway!
             * ✅ FIXED MAPPING: Seleksi s.profile_picture dan s.id AS streamer_id langsung terinjeksi sempurna
             */
            const query = `
                SELECT u.id, u.username, u.email, u.role, u.is_two_fa_enabled, 
                       s.profile_picture, s.phone_number, s.id AS streamer_id
                FROM users u
                LEFT JOIN streamers s ON u.id = s.user_id
                WHERE u.id = $1
            `;
            
            const { rows } = await req.db.query(query, [parseInt(decoded.id, 10)]);

            if (rows.length === 0) {
                return res.status(401).json({ 
                    success: false, 
                    message: "User tak terdaftar di sistem SkuyGG!" 
                });
            }

            // 🛡️ 4. Injeksi data komplit ke dalam object request session
            req.user = rows[0];
            
            // ✅ EXPEDITED FORCE CASTING: Menjamin properti streamer_id berformat integer murni di memori request
            if (req.user.streamer_id) {
                req.user.streamer_id = parseInt(req.user.streamer_id, 10);
            }

            return next(); // Lanjut ke middleware berikutnya atau langsung ke controller
        } catch (err) {
            console.error("🔥 SHIELD_BREAK_ERROR:", err.message);
            return res.status(401).json({ 
                success: false, 
                message: "Sesi expired, Ri! Login ulang dulu ya." 
            });
        }
    }

    // 🛡️ 5. FALLBACK ACCESS DENIED: Jika token kosong, null, atau format header hancur berkeping-keping
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: "Akses ditolak, lo belum login Sultan!" 
        });
    }
};

/**
 * 2. AUTHORIZE: Cek Tingkatan Role (Admin, Creator, dsb)
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Pastikan level kekuasaan user masuk dalam daftar whitelist izin rute
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Level lo [${req.user?.role || 'Guest'}] belum cukup buat akses gerbang ini!` 
            });
        }
        next();
    };
};