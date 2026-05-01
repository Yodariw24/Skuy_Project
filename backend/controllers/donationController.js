// Kita tidak perlu import Pool karena sudah di-inject ke req.db di server.js
// Tapi kita butuh helper jika ada logika yang butuh library pg secara langsung

// 1. Ambil Riwayat Dompet (INCOME & OUTCOME)
export const getWalletHistory = async (req, res) => {
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
    const result = await req.db.query(query, [id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("🔥 WALLET HISTORY ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Riwayat Publik (Untuk Halaman Profile Creator)
export const getPublicHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query(
      "SELECT donatur_name, amount, message, created_date FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 5",
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Hitung Total Saldo BERSIH (Live Calculation)
export const getStreamerBalance = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS total_saldo
    `;
    const result = await req.db.query(query, [id]);
    const balance = parseInt(result.rows[0].total_saldo) || 0;
    res.json({ success: true, total_saldo: balance });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 4. Create New Donation (Initial PENDING)
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  try {
    const result = await req.db.query(
      `INSERT INTO donations (streamer_id, donatur_name, donatur_email, message, amount, payment_method, status, created_date) 
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', NOW()) RETURNING *`,
      [streamer_id, donatur_name, donatur_email, message, amount, payment_method]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 5. Withdraw Request (Sultan Payout)
export const withdrawBalance = async (req, res) => {
  const { streamer_id, amount, bank_info } = req.body;
  try {
    // 1. Cek Saldo Dulu Sebelum Withdraw
    const balanceQuery = `
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS current_balance`;
    
    const balanceRes = await req.db.query(balanceQuery, [streamer_id]);
    const currentBalance = parseInt(balanceRes.rows[0].current_balance) || 0;

    if (amount > currentBalance) {
        return res.status(400).json({ success: false, message: "Saldo tidak cukup, Ri! Gagal narik." });
    }

    // Pastikan bank_info disimpan sebagai string agar PostgreSQL tidak bingung jika kolomnya TEXT/VARCHAR
    const formattedBankInfo = typeof bank_info === 'object' ? JSON.stringify(bank_info) : String(bank_info);
    
    const result = await req.db.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [streamer_id, amount, formattedBankInfo]
    );
    res.json({ success: true, message: "Permintaan WD diproses Railway!", data: result.rows[0] });
  } catch (err) {
    console.error("WD ERROR:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 6. Update Status (Socket.io Trigger)
export const updateDonationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;
  try {
    const result = await req.db.query(
      "UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", 
      [status.toUpperCase(), id]
    );

    if (status.toUpperCase() === 'SUCCESS' && result.rows[0]) {
        const donation = result.rows[0];
        // Pastikan req.io sudah di-inject di server.js
        if (req.io) {
            req.io.to(`streamer_${donation.streamer_id}`).emit('new-donation', {
                donatur_name: donation.donatur_name,
                amount: donation.amount,
                message: donation.message
            });
        }
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getDonationsByStreamer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query("SELECT * FROM donations WHERE streamer_id = $1 ORDER BY created_date DESC", [id]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};