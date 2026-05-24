/**
 * SKUYGG FINANCIAL & DONATION CORE CONTROLLER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI (FINAL STERILE PRODUCTION EDITION)
 * UPGRADED TO MIDTRANS SNAP MULTI-PAYMENT ENGINE WITH AUTOMATIC WEBHOOK CALLBACK
 */

import midtransClient from 'midtrans-client';

// ✅ INEDX/INSTANSIASI SNAP API BAWAAN SDK MIDTRANS
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true', 
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

/**
 * 1. GET WALLET HISTORY (PRIVAT / INTERN DASHBOARD LOG MUTASI)
 */
export const getWalletHistory = async (req, res) => {
  const rawId = req.user?.streamer_id || req.user?.id || req.params.id;
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, history: [], message: "ID Node tidak terdeteksi!" });
  }

  try {
    const query = `
      SELECT 
        id::TEXT, 
        gross_amount AS amount, 
        donatur_name::TEXT AS description, 
        'IN'::TEXT AS type, 
        created_date AS created_at, 
        status::TEXT 
      FROM donations 
      WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      
      UNION ALL
      
      SELECT 
        id::TEXT, 
        amount, 
        -- SECURITY PROTECTION LAYER: Mencegah letupan syntax json jika format bank_info rusak
        CASE 
          WHEN bank_info::TEXT LIKE '{%}' THEN ('Penarikan Saldo (' || COALESCE(bank_info->>'bank_name', 'Bank') || ')')::TEXT
          ELSE ('Penarikan Saldo (' || bank_info::TEXT || ')')::TEXT
        END AS description, 
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
    return res.status(500).json({ success: false, history: [], error: err.message });
  }
};

/**
 * 2. GET STREAMER BALANCE (PRO-GRADE LIVE AGGREGATION ENGINE) 💰
 */
export const getStreamerBalance = async (req, res) => {
  const rawId = req.user?.streamer_id || req.user?.id || req.params.id;
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, total_saldo: 0, message: "ID Node tidak terdeteksi!" });
  }

  try {
    const query = `
      SELECT (
        -- Hitung total donasi bersih (net_amount) yang sukses masuk
        SELECT COALESCE(SUM(net_amount), 0)::INT 
        FROM donations 
        WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      ) - (
        -- Dikurangi total penarikan dana yang berstatus SUCCESS atau PENDING
        SELECT COALESCE(SUM(amount), 0)::INT 
        FROM withdrawals 
        WHERE streamer_id = $1 AND UPPER(status) IN ('SUCCESS', 'PENDING')
      ) AS total_saldo
    `;
    
    const result = await req.db.query(query, [targetStreamerId]);
    const balance = result.rows.length > 0 ? parseInt(result.rows[0].total_saldo, 10) : 0;
    
    return res.json({ 
      success: true, 
      total_saldo: balance < 0 ? 0 : balance 
    });
  } catch (err) {
    console.error("🔥 Error getStreamerBalance Live Node:", err.message);
    return res.status(500).json({ success: false, total_saldo: 0 });
  }
};

/**
 * 3. WITHDRAW BALANCE (SECURED ATOMIC TRANSACTION GATEWAY) 🛡️
 */
export const withdrawBalance = async (req, res) => {
  const { userId, amount, bank } = req.body; 
  const rawId = req.user?.streamer_id || userId || req.params.id;
  const targetStreamerId = rawId ? parseInt(rawId, 10) : null;

  if (!targetStreamerId) {
    return res.status(400).json({ success: false, message: "Akses penarikan ditolak, ID tidak valid!" });
  }

  try {
    const balanceRes = await req.db.query(`
      SELECT (
        SELECT COALESCE(SUM(net_amount), 0)::INT 
        FROM donations 
        WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      ) - (
        SELECT COALESCE(SUM(amount), 0)::INT 
        FROM withdrawals 
        WHERE streamer_id = $1 AND UPPER(status) IN ('SUCCESS', 'PENDING')
      ) AS available_balance
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
 * 4. CREATE DONATION (MIDTRANS SNAP ALL-IN-ONE GATEWAY) 🏎️
 */
export const createDonation = async (req, res) => {
  const { streamer_id, donatur_name, donatur_email, message, amount, payment_method } = req.body;
  
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
    // Payload fleksibel dibuka lebar agar semua opsi pembayaran di Sandbox aktif otomatis
    let parameter = {
        "transaction_details": {
            "order_id": orderId,
            "gross_amount": gross
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
        }
    };

    // Memproses multi-payment token bawaan Snap
    const snapResponse = await snap.createTransaction(parameter);
    
    const snapToken = snapResponse.token;
    const redirectUrl = snapResponse.redirect_url;

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
      targetStreamerId,
      donatur_name,
      donatur_email,
      message,
      gross,
      gross,
      fee,
      net, 
      payment_method || 'MIDTRANS_SNAP', 
      tier
    ]);
    
    return res.status(201).json({ 
        success: true, 
        data: result.rows[0],
        snapToken: snapToken,      
        redirectUrl: redirectUrl,  
        orderId: orderId
    });
  } catch (err) { 
    console.error("❌ Error Create Donation via Snap Engine:", err.message);
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

    // Emit data live socket langsung dipicu
    if (upperStatus === 'SUCCESS' && donation) {
        const streamerIdCast = parseInt(donation.streamer_id, 10);

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

/**
 * ✅ AUTOMATIC ENGINE: MIDTRANS WEBHOOK/CALLBACK NOTIFICATION HANDLER ⚡
 * Daftarkan fungsi ini ke router POST kamu (Contoh backend route: router.post('/midtrans-callback', handleMidtransCallback))
 * Dan pastikan URL ini juga dipasang di Dashboard Midtrans -> Settings -> Access Notification
 */
export const handleMidtransCallback = async (req, res) => {
  try {
    const notification = req.body;
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let updateToStatus = 'PENDING';

    if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
            updateToStatus = 'CHALLENGE';
        } else if (fraudStatus === 'accept') {
            updateToStatus = 'SUCCESS';
        }
    } else if (transactionStatus === 'settlement') {
        updateToStatus = 'SUCCESS'; 
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
        updateToStatus = 'FAILED';
    } else if (transactionStatus === 'pending') {
        updateToStatus = 'PENDING';
    }

    // Eksekusi pembaruan status terproteksi dengan Database Transaction SQL
    await req.db.query('BEGIN');
    const checkResult = await req.db.query(`SELECT status, streamer_id, donatur_name, gross_amount, message, tier FROM donations WHERE id = $1 FOR UPDATE`, [orderId]);
    const donationData = checkResult.rows[0];

    if (!donationData) {
        await req.db.query('ROLLBACK');
        return res.status(404).json({ message: 'Order ID tidak ditemukan di database Skuy.GG!' });
    }

    if (donationData.status !== 'SUCCESS') {
        await req.db.query(`UPDATE donations SET status = $1 WHERE id = $2`, [updateToStatus, orderId]);
        
        // Memicu trigger live alert socket IO agar animasi gif/suara muncul seketika di overlay streamer
        if (updateToStatus === 'SUCCESS' && req.io) {
            req.io.emit(`new-donation-${parseInt(donationData.streamer_id, 10)}`, {
                donatur_name: donationData.donatur_name,
                amount: donationData.gross_amount,
                message: donationData.message,
                tier: donationData.tier || 'STANDARD',
                trigger_effect: true
            });
        }
    }
    
    await req.db.query('COMMIT');
    return res.status(200).json({ status: 'OK', message: 'Webhook Skuy.GG Terproses Berhasil' });

  } catch (error) {
    if (req.db) await req.db.query('ROLLBACK');
    console.error("🔥 Error di Webhook Midtrans:", error.message);
    return res.status(500).json({ error: error.message });
  }
};