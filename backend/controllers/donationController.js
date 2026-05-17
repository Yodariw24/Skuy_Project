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
    // 💰 Saldo dikalkulasi dari net_amount (Saldo setelah dipotong komisi platform 5%)
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
    // Validasi saldo juga mengecek berdasarkan akumulasi net_amount
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

// --- 4. CREATE NEW DONATION (FIXED PARAMETERS & TIERING) ---
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  
  // 💰 SaaS Logic: Hitung Potongan 5% secara otomatis
  const gross = Number(amount);
  const fee = gross * 0.05; 
  const net = gross - fee;  

  // 🔥 LOGIC TIERING SULTAN
  let tier = 'STANDARD';
  if (gross >= 1000000) tier = 'MYTHIC';
  else if (gross >= 500000) tier = 'GOLD';
  else if (gross >= 100000) tier = 'SILVER';

  try {
    // Total ada 12 Kolom dan 10 Tanda Parameter ($1 - $10)
    const query = `
      INSERT INTO donations (
        streamer_id, donatur_name, donatur_email, message, amount, 
        gross_amount, fee_amount, net_amount, 
        payment_method, tier, status, created_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', NOW()) 
      RETURNING *
    `;

    // ✅ FIXED: Urutan array parameter disinkronkan 100% dengan urutan kolom SQL di atas
    const result = await req.db.query(query, [
      streamer_id,                     // $1
      donatur_name,                    // $2
      donatur_email,                   // $3
      message,                         // $4
      gross,                           // $5 -> Kolom amount
      gross,                           // $6 -> Kolom gross_amount
      fee,                             // $7 -> Kolom fee_amount
      net,                             // $8 -> Kolom net_amount
      payment_method || 'QRIS_MOCK',   // $9
      tier                             // $10
    ]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { 
    console.error("🔥 Error Create Donation Node:", err.message);
    res.status(500).json({ success: false, error: err.message }); 
  }
};

// --- 5. UPDATE DONATION STATUS (SIMULASI QR SUCCESS & AUTO BALANCE) ---
export const updateDonationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; // 'SUCCESS' atau 'REJECTED'
  try {
    // Ambil data status donasi saat ini untuk proteksi double injection saldo
    const checkQuery = `SELECT status, net_amount, streamer_id, donatur_name, gross_amount, message, tier FROM donations WHERE id = $1`;
    const checkResult = await req.db.query(checkQuery, [id]);
    const currentDonation = checkResult.rows[0];

    if (!currentDonation) {
      return res.status(404).json({ success: false, message: "Data transaksi tidak ditemukan!" });
    }

    // Jika status di database sudah sukses, jangan di-update lagi agar saldo tidak duplikat
    if (currentDonation.status === 'SUCCESS') {
      return res.json({ success: true, message: "Transaksi ini sudah diverifikasi sebelumnya.", data: currentDonation });
    }

    // Jalankan operasi update status transaksi ke database
    const result = await req.db.query(
      "UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", 
      [status.toUpperCase(), id]
    );

    const donation = result.rows[0];

    // Jika status berubah menjadi SUCCESS, suntik saldo bersih dan tembak Socket
    if (status.toUpperCase() === 'SUCCESS' && donation) {
        
        // 💰 AUTOMATED BALANCE ACCUMULATION: Masukkan net_amount ke tabel balance milik streamer
        await req.db.query(
          `UPDATE balance SET total_saldo = total_saldo + $1 WHERE streamer_id = $2`,
          [donation.net_amount, donation.streamer_id]
        );

        // 🔥 TRIGGER SOCKET ROOM SULTAN UNTUK REALTIME pop-up NOTIFIKASI MELEDAK DI FE
        if (req.io) {
            req.io.emit(`new-donation-${donation.streamer_id}`, {
                donatur_name: donation.donatur_name,
                amount: donation.gross_amount, // Nominal kotor agar pop-up alert terlihat besar dan memuaskan
                message: donation.message,
                tier: donation.tier || 'STANDARD', 
                trigger_effect: true
            });
        }
    }
    res.json({ success: true, message: "Status diperbarui & Transmisi saldo sukses!", data: donation });
  } catch (err) { 
    console.error("🔥 Error Update Status Node:", err.message);
    res.status(500).json({ success: false, error: err.message }); 
  }
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