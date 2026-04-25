const { body, validationResult } = require('express-validator');

const validateDonation = [
  body('donatur_email').isEmail().withMessage('Format email tidak valid!'),
  body('amount').isFloat({ min: 1000 }).withMessage('Minimal donasi adalah Rp 1.000'),
  body('donatur_name').notEmpty().withMessage('Nama donatur tidak boleh kosong'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // Jika aman, lanjut ke controller
  }
];

module.exports = { validateDonation };