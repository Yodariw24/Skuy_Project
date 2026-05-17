export const adminProtect = (req, res, next) => {
  // Cek apakah role-nya ADMIN (Data diambil dari authMiddleware sebelumnya)
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Akses Ditolak! Hanya untuk Sultan level Admin." 
    });
  }
};