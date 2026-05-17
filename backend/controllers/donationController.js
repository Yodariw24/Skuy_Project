// --- 1. AMBIL RIWAYAT DOMPET (SULTAN SYNC) ---
export const getWalletHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        id, 
        gross_amount AS amount, -- Donatur & Streamer melihat nominal kotor di riwayat
        donatur_name::TEXT AS description, 
        'IN'::TEXT AS type, 
        created_date AS created_at, 
        status::TEXT 
      FROM donations 
      WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      UNION ALL
      SELECT 
        id, amount, 
        'Penarikan Saldo'::TEXT AS description, 
        'OUT'::TEXT AS type, 
        created_at, 
        status::TEXT 
      FROM withdrawals 
      WHERE streamer_id = $1
      ORDER BY created_at DESC
    `;
    const result = await req.db.query(query, [id]);
    res.json({ success: true, history: result.rows }); 
  } catch (err) {
    res.status(500).json({ success: false, history: [] });
  }
};

// --- 2. HITUNG SALDO LIVE (SaaS Potongan Fix) ---
export const getStreamerBalance = async (req, res) => {
  const { id } = req.params;
  try {
    // 💰 Saldo dikalkulasi dari net_amount (Saldo setelah dipotong komisi 5%)
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(net_amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
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

// --- 3. WITHDRAW REQUEST ---
export const withdrawBalance = async (req, res) => {
  const { userId, amount, bank } = req.body; 
  const targetId = userId || req.params.id;
  try {
    // Validasi saldo juga harus mengecek net_amount
    const balanceRes = await req.db.query(`
      SELECT 
        (SELECT COALESCE(SUM(net_amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS current_balance`, [targetId]);
    
    const currentBalance = parseInt(balanceRes.rows[0].current_balance) || 0;
    if (amount > currentBalance) return res.status(400).json({ success: false, message: "Saldo tidak cukup!" });

    const formattedBank = typeof bank === 'object' ? JSON.stringify(bank) : String(bank);
    const result = await req.db.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [targetId, amount, formattedBank]
    );
    res.json({ success: true, message: "WD Diproses!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- 4. CREATE NEW DONATION (DENGAN SAAS FEE & LOGIC TIERING) ---
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  
  // 💰 SaaS Logic: Hitung Potongan 5% secara otomatis
  const gross = Number(amount);
  const fee = gross * 0.05; 
  const net = gross - fee;  

  // 🔥 LOGIC TIERING SULTAN (Berdasarkan nominal yang dikirim donatur)
  let tier = 'STANDARD';
  if (gross >= 1000000) tier = 'MYTHIC';
  else if (gross >= 500000) tier = 'GOLD';
  else if (gross >= 100000) tier = 'SILVER';

  try {
    const query = `
      INSERT INTO donations (
        streamer_id, donatur_name, donatur_email, message, amount, 
        gross_amount, fee_amount, net_amount, 
        payment_method, status, tier, created_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING', $10, NOW()) 
      RETURNING *
    `;
    const result = await req.db.query(query, [
      streamer_id, donatur_name, donatur_email, message, gross,
      gross, fee, net, 
      payment_method, tier
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- 5. UPDATE DONATION STATUS (SIMULASI FAKE QR SUCCESS & MELEDAK CLOUD) ---
export const updateDonationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; // 'SUCCESS' atau 'REJECTED'
  try {
    const result = await req.db.query(
      "UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", 
      [status.toUpperCase(), id]
    );

    const donation = result.rows[0];

    if (status.toUpperCase() === 'SUCCESS' && donation) {
        // 🔥 TRIGGER SOCKET ROOM SULTAN DENGAN DATA TIER UNTUK ANIMASI FE
        if (req.io) {
            req.io.emit(`new-donation-${donation.streamer_id}`, {
                donatur_name: donation.donatur_name,
                amount: donation.gross_amount, // Menampilkan angka gross biar kelihatan besar di alert screen
                message: donation.message,
                tier: donation.tier || 'STANDARD', 
                trigger_effect: true
            });
        }
    }
    res.json({ success: true, data: donation });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

// --- 6. RIWAYAT PUBLIK & LIST ---
export const getPublicHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query(
      "SELECT donatur_name, gross_amount AS amount, message, created_date FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 5",
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
};

export const getDonationsByStreamer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query(`SELECT * FROM donations WHERE streamer_id = $1 ORDER BY created_date DESC`, [id]);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ success: false, data: [] }); }
};