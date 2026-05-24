/**
 * SKUYGG ADMIN PROTECTION SHIELD
 * SYSTEM ENGINE BY: ARI
 */

export const adminProtect = (req, res, next) => {
  // 🛡️ SHIELD VERIFICATION: Cek apakah user ada dan rolenya murni otoritas tertinggi
  // ✅ FIXED CASE-SENSITIVITY: Dipaksa ke UPPERCASE agar kebal dari salah ketik kapitalisasi di database Postgres (admin vs ADMIN)
  if (req.user && req.user.role && req.user.role.toUpperCase() === 'ADMIN') {
    return next(); // Lolos saringan, lanjut ke controller admin panel
  } 
  
  // 🚨 REJECTION PROTOCOL: Blokir paksa jika level kekuasaan tidak mencukupi
  return res.status(403).json({ 
    success: false, 
    message: "Akses Ditolak! Jalur khusus ini hanya untuk Sultan level Admin, Ri." 
  });
};