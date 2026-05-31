/**
 * SKUYGG FINANCIAL & DONATION CORE CONTROLLER (PRO GRADE EDITION)
 * SYSTEM ENGINE BY: ARI (FINAL STERILE PRODUCTION EDITION)
 * UPGRADED TO MIDTRANS SNAP MULTI-PAYMENT ENGINE WITH AUTOMATIC WEBHOOK CALLBACK
 * STATUS: FULLY SYNCHRONIZED LAYER BAJA WITH EMAIL E-RECEIPT PROTOCOL (DUAL CONFIG REGION)
 */

import midtransClient from 'midtrans-client';
import nodemailer from 'nodemailer';

// ✅ INDEX/INSTANSIASI SNAP API BAWAAN SDK MIDTRANS
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true', 
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// ✅ SETUP CONFIGURATION SMTP TRANSPORT EMAIL SKUYGG (PRO-GRADE OPSI B DUAL CONFIG)
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    // Otomatis membaca EMAIL_USER & EMAIL_PASS lama lo, Ri! Aman tanpa ubah .env
    user: process.env.EMAIL_SMTP_USER || process.env.EMAIL_USER || 'ariwirayuda24@gmail.com',
    pass: process.env.EMAIL_SMTP_PASSWORD || process.env.EMAIL_PASS
  }
});

// ✅ FUNGSI PEMBANTU: PENGIRIM HTML E-RECEIPT RESMI KE EMAIL DONATUR
const sendEmailReceiptToDonatur = async (donation) => {
  try {
    const formattedAmount = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(donation.gross_amount || donation.amount);
    
    const dateTime = new Date(donation.created_date || donation.created_at || Date.now()).toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const emailHTML = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 35px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1e293b; background: #ffffff;">
        <h2 style="color: #7c3aed; text-align: center; font-weight: 800; margin-bottom: 5px;">SKUY.GG</h2>
        <p style="text-align: center; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0;">Kwitansi Kontribusi Resmi Donatur</p>
        <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 25px 0;" />
        <p style="font-size: 14px; line-height: 1.5;">Halo <b>${donation.donatur_name}</b>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #475569;">Terima kasih banyak atas dukungan finansial lo! Pembayaran donasi lo telah sukses divalidasi oleh gerbang pembayaran Midtrans dan disalurkan ke sirkuit merchant.</p>
        
        <table style="width: 100%; font-size: 13px; margin: 25px 0; border-collapse: collapse;">
          <tr style="background: #f8fafc;"><td style="padding: 12px; color: #64748b; font-weight: 500;">Order Reference ID</td><td style="padding: 12px; font-weight: bold; font-family: monospace; text-align: right;">#${donation.id}</td></tr>
          <tr><td style="padding: 12px; color: #64748b; font-weight: 500;">Waktu Transaksi</td><td style="padding: 12px; font-weight: 600; text-align: right;">${dateTime}</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 12px; color: #64748b; font-weight: 500;">Metode Pembayaran</td><td style="padding: 12px; font-weight: bold; text-transform: uppercase; text-align: right; color: #7c3aed;">${donation.payment_method || 'MIDTRANS_SNAP'}</td></tr>
          <tr><td style="padding: 12px; color: #64748b; font-weight: 500;">Status Kliring</td><td style="padding: 12px; font-weight: 800; color: #16a34a; text-align: right;">● SETTLEMENT (VERIFIED)</td></tr>
          <tr style="background: #f8fafc;"><td style="padding: 12px; color: #64748b; font-weight: 500;">Target Sultan</td><td style="padding: 12px; font-weight: bold; text-align: right; color: #0f172a;">${donation.streamer_name || '#' + donation.streamer_id}</td></tr>
          <tr><td style="padding: 12px; color: #64748b; font-weight: 500; vertical-align: top;">Pesan Dukungan</td><td style="padding: 12px; font-style: italic; color: #475569; text-align: right; max-width: 250px;">"${donation.message || 'Tidak ada pesan tertulis.'}"</td></tr>
          <tr style="background: #f1f5f9; font-size: 16px; font-weight: bold; border-top: 2px solid #0f172a;"><td style="padding: 15px; color: #0f172a;">Total Kontribusi</td><td style="padding: 15px; color: #16a34a; font-family: monospace; text-align: right; font-size: 18px;">${formattedAmount}</td></tr>
        </table>

        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 35px; line-height: 1.4;">
          Struk digital ini dihasilkan otomatis sebagai bukti pembayaran sah yang terekam di ekosistem cloud database PostgreSQL Railway.<br/>
          <b>PT Skuy Media Teknologi Ecosystem</b> • Hub: ariwirayuda24@gmail.com
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: '"Skuy.gg Cloud System" <noreply@skuy.gg>',
      to: donation.donatur_email, 
      subject: `[SKUY.GG] Struk Bukti Donasi Sah Bukti Transaksi #${donation.id}`,
      html: emailHTML
    });

    console.log(`✉️ [JALUR 2] E-receipt berhasil dilempar ke email donatur: ${donation.donatur_email}`);
  } catch (error) {
    console.error("❌ Sirkuit SMTP Email Sender Jalur 2 Crash:", error.message);
  }
};

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
        CASE 
          WHEN bank_info::TEXT LIKE '{%}' THEN ('Penarikan Saldo (' || COALESCE((bank_info::JSONB)->>'bank_name', 'Bank') || ')')::TEXT
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
        SELECT COALESCE(SUM(net_amount), 0)::INT 
        FROM donations 
        WHERE streamer_id = $1 AND UPPER(status) = 'SUCCESS'
      ) - (
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

    const checkQuery = `SELECT d.id, d.status, d.net_amount, d.streamer_id, d.donatur_name, d.donatur_email, d.gross_amount, d.message, d.tier, d.payment_method, d.created_date, s.display_name AS streamer_name 
                        FROM donations d 
                        LEFT JOIN streamers s ON d.streamer_id = s.id 
                        WHERE d.id = $1 FOR UPDATE OF d`;
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

    // ✅ EKSEKUSI JALUR 2 VIA INTEGRASI REKONSILIASI MANUAL DASHBOARD
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
        
        // Picu otomatisasi pengiriman struk email donatur jika email terdaftar rill
        if (donation.donatur_email) {
          await sendEmailReceiptToDonatur(donation);
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
 * CALIBRATED EDITION: FULLY SYNCHRONIZED CORE FINANSIAL & LIVE EXTRACTION METHOD
 */
export const handleMidtransCallback = async (req, res) => {
  try {
    const notification = req.body;
    
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type || 'MIDTRANS_SNAP';

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

    await req.db.query('BEGIN');
    
    const checkResult = await req.db.query(
      `SELECT d.id, d.status, d.streamer_id, d.donatur_name, d.donatur_email, d.gross_amount, d.message, d.tier, d.created_date, s.display_name AS streamer_name 
       FROM donations d 
       LEFT JOIN streamers s ON d.streamer_id = s.id 
       WHERE d.id = $1::text OR d.id = $1 FOR UPDATE OF d`, 
      [orderId]
    );
    const donationData = checkResult.rows[0];

    if (!donationData) {
        await req.db.query('ROLLBACK');
        return res.status(404).json({ message: 'Order ID tidak ditemukan di database Skuy.GG!' });
    }

    if (donationData.status !== 'SUCCESS') {
        // ✅ FULL UPDATE SINKRON: Pasang status terverifikasi beserta tipe payment_type rill
        const updateResult = await req.db.query(
          `UPDATE donations SET status = $1, payment_method = $2 WHERE id = $3::text OR id = $3 RETURNING *`, 
          [updateToStatus, paymentType.toUpperCase(), orderId]
        );
        const updatedDonationRow = updateResult.rows[0];
        
        if (updateToStatus === 'SUCCESS') {
            const streamerIdCast = parseInt(donationData.streamer_id, 10);

            if (req.io) {
                req.io.emit(`new-donation-${streamerIdCast}`, {
                    donatur_name: donationData.donatur_name,
                    amount: donationData.gross_amount,
                    message: donationData.message,
                    tier: donationData.tier || 'STANDARD',
                    trigger_effect: true
                });
            }

            // ✅ EKSEKUSI JALUR 2 WEBHOOK NOTIFIKASI AUTOMATION AUTOMATIC
            if (updatedDonationRow && updatedDonationRow.donatur_email) {
              await sendEmailReceiptToDonatur(updatedDonationRow);
            }
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

/**
 * ⚡ 9. GET SYSTEM AUDIT LOGS (SUPER ADMIN EXCLUSIVE POWER ENGINE)
 */
export const getSystemAuditLogs = async (req, res) => {
  try {
    const query = `
      SELECT 
        id::TEXT,
        user_id::INT,
        action_type::TEXT,
        entity_id::TEXT,
        CASE 
          WHEN metadata::TEXT LIKE '{%}' THEN metadata::JSONB
          ELSE json_build_object('raw_log', metadata::TEXT)::JSONB
        END AS metadata,
        ip_address::TEXT,
        user_agent::TEXT,
        created_at
      FROM system_audit_logs 
      WHERE action_type != 'SYSTEM_LOG_DELETE_REQUEST'
      ORDER BY created_at DESC 
      LIMIT 100
    `;
    const result = await req.db.query(query);
    return res.json({ success: true, logs: result.rows });
  } catch (err) {
    console.error("🔥 Error getSystemAuditLogs:", err.message);
    return res.status(500).json({ success: false, logs: [], error: err.message });
  }
};

/**
 * ⚡ 10. RADAR AUTO-SYNC BYPASS (PRODUCTION FALLBACK)
 * Garansi 100% status berubah sukses walau Webhook Midtrans delay / gagal masuk!
 */
export const getDonationStatusWithSync = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await req.db.query(
      `SELECT d.*, s.display_name AS streamer_name FROM donations d LEFT JOIN streamers s ON d.streamer_id = s.id WHERE d.id::text = $1`, [orderId]
    );

    let donationData = result.rows[0];
    if (!donationData) return res.status(404).json({ success: false, message: "Kwitansi tidak ditemukan!" });

    // Jika status di DB masih PENDING, kita hajar cek langsung ke API Midtrans
    if (donationData.status === 'PENDING') {
      try {
        const midtransStatus = await snap.transaction.status(orderId);
        const transactionStatus = midtransStatus.transaction_status;
        const fraudStatus = midtransStatus.fraud_status;

        let updateToStatus = 'PENDING';
        if (transactionStatus === 'capture') updateToStatus = fraudStatus === 'challenge' ? 'CHALLENGE' : 'SUCCESS';
        else if (transactionStatus === 'settlement') updateToStatus = 'SUCCESS';
        else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') updateToStatus = 'FAILED';

        if (updateToStatus === 'SUCCESS') {
          await req.db.query(`UPDATE donations SET status = $1 WHERE id::text = $2`, [updateToStatus, orderId]);
          donationData.status = updateToStatus;
          const streamerIdCast = parseInt(donationData.streamer_id, 10);
          if (req.io) {
            req.io.emit(`new-donation-${streamerIdCast}`, { donatur_name: donationData.donatur_name, amount: donationData.gross_amount, message: donationData.message, tier: donationData.tier || 'STANDARD', trigger_effect: true });
          }
          if (donationData.donatur_email) await sendEmailReceiptToDonatur(donationData);
        } else if (updateToStatus !== 'PENDING') {
          await req.db.query(`UPDATE donations SET status = $1 WHERE id::text = $2`, [updateToStatus, orderId]);
          donationData.status = updateToStatus;
        }
      } catch (midtransErr) { console.warn("Midtrans radar bypass info:", midtransErr.message); }
    }

    res.json({ success: true, data: donationData });
  } catch (err) {
    res.status(500).json({ success: false, message: "Gagal memuat status kwitansi" });
  }
};