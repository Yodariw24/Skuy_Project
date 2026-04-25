// Cek apakah user sudah login
export const protect = (req, res, next) => {
  // Logika verifikasi JWT Mas Ari di sini
  next();
};

// Cek Role (Creator atau User)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Role kamu nggak diizinkan masuk sini jirr!" });
    }
    next();
  };
};