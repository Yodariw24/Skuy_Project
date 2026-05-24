/**
 * SKUYGG FINANCIAL & DONATION CORE CONTROLLER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI (RE-CALIBRATED SECURE EDITION)
 */

import midtransClient from 'midtrans-client';

// Inisialisasi Core API Midtrans Sandbox (Gunakan credentials dari environment variables Railway)
const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true', // ✅ BOOTSTRAP: Konversi string env menjadi boolean murni
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

/**
 * 1. GET WALLET HISTORY (PRIVAT / INTERN DASHBOARD LOG MUTASI)
 */
export const getWalletHistory = async (req, res) => {
  const rawId = req.user?.streamer_id || req.user?.id || req.params.id;
  // ✅ FIXED CASTING LAYER: Konversi ke integer murni untuk menepis eror integer = character varying
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

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
        ('Penarikan Saldo (' || bank_info->>'bank_name' || ')')::TEXT AS description, 
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
 * 2. GET STREAMER BALANCE (FIXED & SYNCHRONIZED ACCOUNTS)
 * Menghitung saldo bersih yang tersedia (Saldo Utama - Antrean WD PENDING).
 */
export const getStreamerBalance = async (req, res) => {
  const rawId = req.user?.streamer_id || req.user?.id || req.params.id;
  // ✅ FIXED CASTING LAYER: Paksa string parameter mutasi dari params rute menjadi tipe Integer murni
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, total_saldo: 0, message: "ID Node tidak terdeteksi!" });
  }

  try {
    const query = `
      SELECT 
        COALESCE(b.total_saldo, 0) - COALESCE(w.pending_wd, 0) AS total_saldo
      FROM (
        SELECT $1::INT as streamer_id -- ✅ FIXED: Ubah VARCHAR menjadi INT agar simetris dengan relasi tabel balance
      ) s
      LEFT JOIN balance b ON b.streamer_id = s.streamer_id
      LEFT JOIN (
        SELECT streamer_id, COALESCE(SUM(amount), 0) as pending_wd 
        FROM withdrawals 
        WHERE UPPER(status) = 'PENDING' 
        GROUP BY streamer_id
      ) w ON w.streamer_id = s.streamer_id
    `;
    
    const result = await req.db.query(query, [targetStreamerId]);
    const balance = result.rows.length > 0 ? parseInt(result.rows[0].total_saldo, 10) : 0;
    
    return res.json({ success: true, total_saldo: balance < 0 ? 0 : balance });
  } catch (err) {
    console.error("🔥 Error getStreamerBalance Node:", err.message);
    return res.status(500).json({ success: false, total_saldo: 0 });
  }
};

/**
 * 3. WITHDRAW BALANCE (SECURED ATOMIC TRANSACTION GATEWAY) 🛡️
 */
export const withdrawBalance = async (req, res) => {
  const { userId, amount, bank } = req.body; 
  const rawId = req.user?.streamer_id || userId || req.params.id;
  // ✅ FIXED CASTING LAYER: Amankan parameter ID penarikan murni bertipe data Integer
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, message: "Akses penarikan ditolak, ID tidak valid!" });
  }

  try {
    // Ambil saldo bersih terbaru yang tersedia menggunakan kalkulator on-the-fly
    const balanceRes = await req.db.query(`
      SELECT 
        COALESCE(b.total_saldo, 0) - COALESCE(w.pending_wd, 0) AS available_balance
      FROM (SELECT $1::INT as streamer_id) s -- ✅ FIXED: Ubah VARCHAR menjadi INT murni
      LEFT JOIN balance b ON b.streamer_id = s.streamer_id
      LEFT JOIN (
        SELECT streamer_id, COALESCE(SUM(amount), 0) as pending_wd 
        FROM withdrawals 
        WHERE UPPER(status) = 'PENDING' 
        GROUP BY streamer_id
      ) w ON w.streamer_id = s.streamer_id
    `, [targetStreamerId]);
    
    const availableBalance = balanceRes.rows.length > 0 ? parseInt(balanceRes.rows[0].available_balance, 10) : 0;
    
    if (parseInt(amount, 10) > availableBalance) {
      return res.status(400).json({ success: false, message: "Saldo available lo nggak cukup buat ditarik segitu, Ri!" });
    }

    const formattedBank = typeof bank === 'object' ? JSON.stringify(bank) : String(bank);
    const result = await req.db.query(
      "INSERT INTO withdrawals (streamer_id, amount, bank_info, status, created_at) VALUES ($1, $2, $3, 'PENDING', NOW()) RETURNING *",
      [targetStreamerId, parseInt(amount, 10), formattedBank]
    );
    
    return res.json({ success: true, message: "Prosedur WD Berhasil Diinisialisasi!", data: result.rows[0] });
  } catch (err) { 
    console.error("🔥 Error withdrawBalance Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 4. CREATE DONATION (MIDTRANS QRIS CHARGE INITIALIZER) 🏎️
 */
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  
  // ✅ FIXED: Amankan konversi streamer_id ke tipe Integer konstan sebelum masuk ke kueri Postgres
  const targetStreamerId = parseInt(streamer_id, 10);
  const gross = Number(amount);
  const fee = gross * 0.05; 
  const net = gross - fee;  
  const orderId = `SKUY-${Date.now()}`;

  let tier = 'STANDARD';
  if (gross >= 1000000) tier = 'MYTHIC';
  else if (gross >= 500000) tier = 'GOLD';
  else if (gross >= 100000) tier = 'SILVER';

  try {
    let parameter = {
        "payment_type": "qris", 
        "transaction_details": {
            "order_id": orderId,
            "gross_amount": gross // ✅ SECURE: Berupa nilai angka bulat murni sesuai regulasi API Midtrans
        },
        "item_details": [{
            "id": "DONATE-SKUY",
            "price": gross,
            "quantity": 1,
            "name": `Donasi SkuyGG to Streamer ID: ${targetStreamerId}`
        }],
        "customer_details": {
            "first_name": donatur_name,
            "email": donatur_email || "donor@skuy.gg"
        },
        "qris": {
            "acquirer": "gopay"
        }
    };

    const chargeResponse = await coreApi.charge(parameter);
    const qrCodeUrl = chargeResponse.actions && chargeResponse.actions[0] ? chargeResponse.actions[0].url : null;

    const query = `
      INSERT INTO donations (
        id, streamer_id, donatur_name, donatur_email, message, amount, 
        gross_amount, fee_amount, net_amount, 
        payment_method, tier, status, created_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', NOW()) 
      RETURNING *
    `;

    const result = await req.db.query(query, [
      orderId,
      targetStreamerId, // Menggunakan ID yang sudah dikonversi ke Integer
      donatur_name,
      donatur_email,
      message,
      gross,
      gross,
      fee,
      net, 
      payment_method || 'QRIS',
      tier
    ]);
    
    return res.status(201).json({ 
        success: true, 
        data: result.rows[0],
        qrCodeUrl: qrCodeUrl,
        orderId: orderId
    });
  } catch (err) { 
    console.error("❌ Error Create Donation Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 5. UPDATE DONATION STATUS (MUTATION PROTECTION SYSTEM & SOCKET EMITTER) 🛡️
 */
export const updateDonationStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body;
  const upperStatus = status.toUpperCase();
  
  try {
    await req.db.query('BEGIN');

    const checkQuery = `SELECT status, net_amount, streamer_id, donatur_name, gross_amount, message, tier FROM donations WHERE id = $1 FOR UPDATE`;
    const checkResult = await req.db.query(checkQuery, [id]);
    const currentDonation = checkResult.rows[0];

    if (!currentDonation) {
      await req.db.query('ROLLBACK');
      return res.status(404).json({ success: false, message: "Data transaksi tidak ditemukan!" });
    }

    if (currentDonation.status === 'SUCCESS') {
      await req.db.query('COMMIT');
      return res.json({ success: true, message: "Transaksi ini sudah diverifikasi sebelumnya.", data: currentDonation });
    }

    const result = await req.db.query(
      "UPDATE donations SET status = $1 WHERE id = $2 RETURNING *", 
      [upperStatus, id]
    );
    const donation = result.rows[0];

    if (upperStatus === 'SUCCESS' && donation) {
        // Parsing paksa ID streamer ke format angka bulat demi meredam letupan tipe data
        const streamerIdCast = parseInt(donation.streamer_id, 10);

        await req.db.query(`
          INSERT INTO balance (streamer_id, total_saldo) 
          VALUES ($1, $2)
          ON CONFLICT (streamer_id) 
          DO UPDATE SET total_saldo = balance.total_saldo + $2
        `, [streamerIdCast, donation.net_amount]);

        if (req.io) {
            req.io.emit(`new-donation-${streamerIdCast}`, {
                donatur_name: donation.donatur_name,
                amount: donation.gross_amount, 
                message: donation.message,
                tier: donation.tier || 'STANDARD', 
                trigger_effect: true
            });
        }
    }
    
    await req.db.query('COMMIT');
    return res.json({ success: true, message: "Status diperbarui & Transmisi saldo sukses!", data: donation });
  } catch (err) { 
    if (req.db) await req.db.query('ROLLBACK');
    console.error("🔥 Error Update Status Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 6. GET PUBLIC HISTORY (HALAMAN PROFIL EXTERNAL SULTAN FEED)
 */
export const getPublicHistory = async (req, res) => {
  const { id } = req.params;
  const streamerId = id ? parseInt(id, 10) : null;
  try {
    const result = await req.db.query(
      "SELECT donatur_name, gross_amount AS amount, message, created_date FROM donations WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS' ORDER BY created_date DESC LIMIT 5",
      [streamerId]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) { 
    console.error("🔥 Error getPublicHistory Node:", err.message);
    return res.status(500).json({ success: false, error: err.message }); 
  }
};

/**
 * 7. GET DONATIONS BY STREAMER (MONITOR DATA MENTAH PANEL DASHBOARD)
 */
export const getDonationsByStreamer = async (req, res) => {
  const { id } = req.params;
  const rawId = id || req.user?.streamer_id || req.user?.id;
  const targetId = rawId ? parseInt(rawId, 10) : null;
  try {
    const result = await req.db.query(`SELECT * FROM donations WHERE streamer_id = $1 ORDER BY created_date DESC`, [targetId]);
    return res.json({ success: true, data: result.rows });
  } catch (err) { 
    console.error("🔥 Error getDonationsByStreamer Node:", err.message);
    return res.status(500).json({ success: false, data: [] }); 
  }
};

/**
 * 8. GET STREAMER ANALYTICS (OMSET DONASI LIVE AGGREGATION SYSTEM) ✅
 */
export const getStreamerAnalytics = async (req, res) => {
  const rawId = req.user?.streamer_id || req.user?.id || req.params.id;
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ 
      success: false, 
      message: "ID Node tidak terdeteksi untuk kalkulasi analitik, Ri!" 
    });
  }

  try {
    const query = `
      SELECT 
        COALESCE(SUM(net_amount), 0)::INT as total_earnings,
        COUNT(id)::INT as total_donations,
        COUNT(DISTINCT donatur_name)::INT as unique_donaturs
      FROM donations 
      WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
    `;

    const result = await req.db.query(query, [targetStreamerId]);
    
    return res.json({ 
      success: true, 
      analytics: result.rows[0] 
    });
  } catch (err) {
    console.error("🔥 Error getStreamerAnalytics Node:", err.message);
    return res.status(500).json({ 
      success: false, 
      message: "Gagal memproses kalkulasi analitik pangkalan data." 
    });
  }
};