import { body, validationResult } from 'express-validator';

export const validateDonation = [
    // 🛡️ 1. Validasi Streamer: Biar nggak salah alamat
    body('streamer_id')
        .notEmpty().withMessage('Donasi mau dikirim ke siapa nih, Ri?'),

    // 🛡️ 2. Validasi Nama: Bersihkan spasi berlebih
    body('donatur_name')
        .trim()
        .notEmpty().withMessage('Nama donatur wajib diisi biar lo tau siapa sultannya!')
        .isLength({ max: 50 }).withMessage('Nama kepanjangan, Maks 50 karakter ya!'),

    // 🛡️ 3. Validasi Email: Format harus bener (normalizeEmail biar gak dobel)
    body('donatur_email')
        .isEmail().withMessage('Format email lo nggak valid jirr!')
        .normalizeEmail(),

    // 🛡️ 4. Validasi Nominal: Minimal 10.000 (Sesuai kesepakatan)
    body('amount')
        .isFloat({ min: 10000 }).withMessage('Minimal donasi sultan adalah Rp 10.000')
        .isFloat({ max: 100000000 }).withMessage('Donasi maksimal Rp 100 Juta, Ri! Kebanyakan nanti kena limit.'),

    // 🛡️ 5. Validasi Payment: Mencegah error Midtrans/Payment Gateway
    body('payment_method')
        .notEmpty().withMessage('Pilih metode pembayaran dulu, Sultan!'),

    // 🛡️ 6. Validasi Pesan: Opsional tapi diproteksi
    body('message')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 250 }).withMessage('Pesan jangan kepanjangan, nanti capek bacanya!'),

    // 🏁 FINAL SULTAN CHECK
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Kita cuma kirim pesan error pertama biar user gak pusing
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg 
            });
        }
        next(); 
    }
];