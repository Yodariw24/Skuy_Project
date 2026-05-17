/**
 * SKUYGG FINANCIAL & DONATION CORE CONTROLLER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI
 */

/**
 * 1. GET WALLET HISTORY (PRIVAT / INTERN DASHBOARD)
 * Menggabungkan mutasi donasi masuk (IN) dan penarikan saldo (OUT) secara real-time.
 */
export const getWalletHistory = async (req, res) => {
  // 🛡️ KUNCI PARAMETER: Prioritaskan ID kasta Streamer dari token login, fallback ke params URL
  const targetStreamerId = req.user?.streamer_id || req.user?.id || req.params.id;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, history: [], message: "ID Node tidak terdeteksi!" });
  }

  try {
    const query = `
      SELECT 
        id, 
        gross_amount AS amount, 
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
    
    const result = await req.db.query(query, [targetStreamerId]);
    return res.json({ success: true, history: result.rows }); 
  } catch (err) {
    console.error("🔥 Error getWalletHistory Node:", err.message);
    return res.status(500).json({ success: false, history: [] });
  }
};

/**
 * 2. GET STREAMER BALANCE (PRIVAT & PUBLIK FILTERED)
 * Menghitung saldo bersih streamer (Total Donasi Sukses 95% - Total Penarikan yang disetujui/pending).
 */
export const getStreamerBalance = async (req, res) => {
  // 🛡️ KUNCI PARAMETER: Ambil Streamer ID bawaan token session login user
  const targetStreamerId = req.user?.streamer_id || req.user?.id || req.params.id;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, total_saldo: 0, message: "ID Node tidak terdeteksi!" });
  }

  try {
    const query = `
      SELECT 
        (SELECT COALESCE(SUM(net_amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS total_saldo
    `;
    const result = await req.db.query(query, [targetStreamerId]);
    const balance = parseInt(result.rows[0].total_saldo) || 0;
    
    return res.json({ success: true, total_saldo: balance });
  } catch (err) {
    console.error("🔥 Error getStreamerBalance Node:", err.message);
    return res.status(500).json({ success: false, total_saldo: 0 });
  }
};

/**
 * 3. WITHDRAW BALANCE (PROSEDUR PENARIKAN SALDO SULTAN)
 * Mengecek kecukupan saldo sebelum melakukan pendaftaran antrean penarikan dana baru.
 */
export const withdrawBalance = async (req, res) => {
  const { userId, amount, bank } = req.body; 
  const targetStreamerId = req.user?.streamer_id || userId || req.params.id;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, message: "Akses penarikan ditolak, ID tidak valid!" });
  }

  try {
    // Jalankan kalkulasi saldo pengaman live sebelum eksekusi INSERT
    const balanceRes = await req.db.query(`
      SELECT 
        (SELECT COALESCE(SUM(net_amount), 0) FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS') - 
        (SELECT COALESCE(SUM(amount), 0) FROM withdrawals WHERE streamer_id = $1 AND UPPER(status) != 'REJECTED') 
      AS current_balance`, [targetStreamerId]);
    
    const currentBalance = parseInt(balanceRes.rows[0].current_balance) || 0;
    if (amount > currentBalance) {
      return res.status(400).json({ success: false, message: "Saldo tidak cukup buat ditarik segitu!" });
    }

    const formattedBank = typeof bank === 'object' ? JSON.stringify(bank) : String(bank);
    const result = await req.db.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [targetStreamerId, amount, formattedBank]
    );
    
    return res.json({ success: true, message: "Prosedur WD Berhasil Diinisialisasi!", data: result.rows[0] });
  } catch (err) { 
    console.error("🔥 Error withdrawBalance Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 4. CREATE DONATION (GATEWAY INISIALISASI TRANSAKSI)
 * Mendaftarkan transaksi donasi masuk baru di database, otomatis menghitung komisi platform 5% & kasta tiering.
 */
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  
  const gross = Number(amount);
  const fee = gross * 0.05; // Potongan komisi platform 5%
  const net = gross - fee;  

  // 🎖️ AUTOMATED TIER RESOLVER SHIELD
  let tier = 'STANDARD';
  if (gross >= 1000000) tier = 'MYTHIC';
  else if (gross >= 500000) tier = 'GOLD';
  else if (gross >= 100000) tier = 'SILVER';

  try {
    const query = `
      INSERT INTO donations (
        streamer_id, donatur_name, donatur_email, message, amount, 
        gross_amount, fee_amount, net_amount, 
        payment_method, tier, status, created_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING', NOW()) 
      RETURNING *
    `;

    const result = await req.db.query(query, [
      streamer_id,
      donatur_name,
      donatur_email,
      message,
      gross,
      gross,
      fee,
      net, 
      payment_method || 'QRIS_MOCK',
      tier
    ]);
    
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { 
    console.error("🔥 Error Create Donation Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 5. UPDATE DONATION STATUS (WEBHOOK VERIFIER & REAL-TIME SOCKET EMITTER)
 * Mengubah status donasi PENDING -> SUCCESS, auto-update dompet, dan menembakkan efek trigger Socket.io.
 */
export const updateDonationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;
  
  try {
    const checkQuery = `SELECT status, net_amount, streamer_id, donatur_name, gross_amount, message, tier FROM donations WHERE id = $1`;
    const checkResult = await req.db.query(checkQuery, [id]);
    const currentDonation = checkResult.rows[0];

    if (!currentDonation) {
      return res.status(404).json({ success: false, message: "Data transaksi tidak ditemukan!" });
    }

    if (currentDonation.status === 'SUCCESS') {
      return res.json({ success: true, message: "Transaksi ini sudah diverifikasi sebelumnya.", data: currentDonation });
    }

    const result = await req.db.query(
      "UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", 
      [status.toUpperCase(), id]
    );

    const donation = result.rows[0];

    // 🚀 TRANSMISI SOCKET.IO DAN INJEKSI SALDO AKTIF BERSIH
    if (status.toUpperCase() === 'SUCCESS' && donation) {
        await req.db.query(
          `UPDATE balance SET total_saldo = total_saldo + $1 WHERE streamer_id = $2`,
          [donation.net_amount, donation.streamer_id]
        );

        if (req.io) {
            req.io.emit(`new-donation-${donation.streamer_id}`, {
                donatur_name: donation.donatur_name,
                amount: donation.gross_amount, 
                message: donation.message,
                tier: donation.tier || 'STANDARD', 
                trigger_effect: true
            });
        }
    }
    
    return res.json({ success: true, message: "Status diperbarui & Transmisi saldo sukses!", data: donation });
  } catch (err) { 
    console.error("🔥 Error Update Status Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 6. GET PUBLIC HISTORY (HALAMAN PROFIL EXTERNAL)
 * Menampilkan 5 riwayat donasi sukses terakhir untuk dilihat publik di luar dashboard (Tanpa data privat).
 */
export const getPublicHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query(
      "SELECT donatur_name, gross_amount AS amount, message, created_date FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 5",
      [id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) { 
    console.error("🔥 Error getPublicHistory Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 7. GET DONATIONS BY STREAMER (MONITOR DATA MENTAH)
 * Mengambil seluruh list donasi terlepas dari status (PENDING/FAILED/SUCCESS) untuk kebutuhan log internal admin.
 */
export const getDonationsByStreamer = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.db.query(`SELECT * FROM donations WHERE streamer_id = $1 ORDER BY created_date DESC`, [id]);
    return res.json({ success: true, data: result.rows });
  } catch (err) { 
    console.error("🔥 Error getDonationsByStreamer Node:", err.message);
    return res.status(500).json({ success: false, data: [] }); 
  }
};