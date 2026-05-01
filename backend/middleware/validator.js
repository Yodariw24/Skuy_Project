import { body, validationResult } from 'express-validator';

export const validateDonation = [
  // 1. Validasi Nama: Bersihkan spasi berlebih & proteksi karakter
  body('donatur_name')
    .trim()
    .notEmpty().withMessage('Nama donatur wajib diisi, Ri!')
    .isLength({ max: 50 }).withMessage('Nama kepanjangan, Sultan (Maks 50 karakter)'),

  // 2. Validasi Email: Format harus benar
  body('donatur_email')
    .isEmail().withMessage('Format email lo nggak valid jirr!')
    .normalizeEmail(),

  // 3. Validasi Nominal: Minimal 10.000
  body('amount')
    .isFloat({ min: 10000 }).withMessage('Minimal donasi sultan adalah Rp 10.000')
    .isFloat({ max: 100000000 }).withMessage('Donasi maksimal Rp 100 Juta, Ri! Kebanyakan nanti kena limit.'),

  // 4. Validasi Pesan: Opsional
  body('message')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 250 }).withMessage('Pesan jangan panjang-panjang, capek bacanya!'),

  // 5. Final Check
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }
    next(); 
  }
];