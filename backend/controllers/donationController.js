const pool = require('../config/db');

// 1. Ambil Riwayat Dompet (INCOME & OUTCOME)
// FIX: Menggunakan created_date (sesuai gambar pgAdmin) bukan created_at
const getWalletHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        id, 
        amount, 
        donatur_name::TEXT AS detail, 
        'INCOME'::TEXT AS type, 
        created_date, 
        status::TEXT 
      FROM donations 
      WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      
      UNION ALL
      
      SELECT 
        id, 
        amount, 
        'Penarikan Saldo'::TEXT AS detail, 
        'OUTCOME'::TEXT AS type, 
        created_at AS created_date, 
        status::TEXT 
      FROM withdrawals 
      WHERE streamer_id = $1
      
      ORDER BY created_date DESC
    `;
    const result = await pool.query(query, [id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("SQL ERROR DETAIL:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Riwayat Publik
const getPublicHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT donatur_name, amount, message, created_date FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY id DESC LIMIT 5",
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Hitung Total Saldo BERSIH
const getStreamerBalance = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS total_saldo
    `;
    const result = await pool.query(query, [id]);
    res.json({ success: true, total_saldo: parseInt(result.rows[0].total_saldo) || 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- FUNGSI LAINNYA (Pastikan created_date konsisten) ---

const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO donations (streamer_id, donatur_name, donatur_email, message, amount, payment_method, status, created_date) 
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW()) RETURNING *`,
      [streamer_id, donatur_name, donatur_email, message, amount, payment_method]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const withdrawBalance = async (req, res) => {
  const { streamer_id, amount, bank_info } = req.body;
  try {
    const formattedBankInfo = typeof bank_info === 'object' ? JSON.stringify(bank_info) : bank_info;
    const result = await pool.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [streamer_id, amount, formattedBankInfo]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getDonationsByStreamer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM donations WHERE streamer_id = $1 ORDER BY id DESC", [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateDonationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query("UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", [status, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { 
  createDonation, 
  getDonationsByStreamer, 
  getWalletHistory,
  updateDonationStatus, 
  getStreamerBalance, 
  withdrawBalance, 
  getPublicHistory 
};