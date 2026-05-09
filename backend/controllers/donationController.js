// --- 1. AMBIL RIWAYAT DOMPET (SULTAN SYNC FOR EARNINGSVIEW) ---
export const getWalletHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        id, 
        amount, 
        donatur_name::TEXT AS description, 
        'IN'::TEXT AS type, 
        created_date AS created_at, 
        status::TEXT 
      FROM donations 
      WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      
      UNION ALL
      
      SELECT 
        id, 
        amount, 
        'Penarikan Saldo'::TEXT AS description, 
        'OUT'::TEXT AS type, 
        created_at, 
        status::TEXT 
      FROM withdrawals 
      WHERE streamer_id = $1
      
      ORDER BY created_at DESC
    `;
    const result = await req.db.query(query, [id]);
    res.json({ success: true, history: result.rows }); // Key 'history' sinkron dengan FE
  } catch (err) {
    console.error("🔥 WALLET HISTORY ERROR:", err.message);
    res.status(500).json({ success: false, history: [] });
  }
};

// --- 2. HITUNG TOTAL SALDO BERSIH (LIVE CALCULATION) ---
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
    res.status(500).json({ success: false, total_saldo: 0 });
  }
};

// --- 3. WITHDRAW REQUEST (SULTAN PAYOUT) ---
export const withdrawBalance = async (req, res) => {
  const { userId, amount, bank } = req.body; // Sesuaikan dengan key dari EarningsView.jsx
  const targetId = userId || req.params.id;

  try {
    // Cek Saldo Dulu
    const balanceRes = await req.db.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS current_balance`, [targetId]);
    
    const currentBalance = parseInt(balanceRes.rows[0].current_balance) || 0;

    if (amount > currentBalance) {
        return res.status(400).json({ success: false, message: "Saldo tidak cukup, Ri!" });
    }

    const formattedBank = typeof bank === 'object' ? JSON.stringify(bank) : String(bank);
    
    const result = await req.db.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [targetId, amount, formattedBank]
    );
    res.json({ success: true, message: "WD Sultan diproses!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- 4. CREATE NEW DONATION ---
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

// --- 5. UPDATE DONATION STATUS (WITH SOCKET.IO) ---
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
        if (req.io) {
            req.io.emit(`new-donation-${donation.streamer_id}`, {
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

// --- 6. RIWAYAT PUBLIK (FOR PROFILE) ---
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