/**
 * SKUYGG ADMIN PROTECTION SHIELD
 * SYSTEM ENGINE BY: ARI (FINAL STERILE PRODUCTION LIGHT-SHIELD EDITION)
 * CALIBRATED: SUPPORT SUPER_ADMIN & HARDLOCKED OWNER EMAIL BYPASS
 */

export const adminProtect = (req, res, next) => {
  // 🛡️ SHIELD VERIFICATION: Cek apakah user ada dan rolenya murni otoritas tertinggi
  if (req.user) {
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    const userEmail = req.user.email ? req.user.email.toLowerCase() : '';

    // ✅ FIXED MULTI-TENANT WHITE-LIST: 
    // Loloskan jika rolenya 'SUPER_ADMIN', 'ADMIN', atau jika emailnya masuk jajaran direksi PT
    const superAdmins = ['ariwirayuda24@gmail.com', 'sabiqf123@gmail.com', 'desitaelisiah@gmail.com'];
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || superAdmins.includes(userEmail)) {
      return next(); // Lolos saringan kasta tertinggi, lanjut ke controller admin panel
    }
  } 
  
  // 🚨 REJECTION PROTOCOL: Blokir paksa jika level kekuasaan tidak mencukupi
  return res.status(403).json({ 
    success: false, 
    message: "Akses Ditolak! Jalur khusus ini hanya untuk Sultan level Admin PT SkuyGG, Ri." 
  });
};