/**
 * SKUYGG CENTRALIZED AUDIT LOGGER MIDDLEWARE
 * ARCHITECTURE BY: ARI WIRAYUDA (PRO-GRADE PT SYSTEM)
 * RE-CALIBRATED EDITION: BACKEND WEBHOOK ENTITY EXTRACTOR SINKRON
 * STATUS: STERILE PRODUCTION LIGHT-SHIELD PRO-GRADE
 */

export const logActivity = (actionType) => {
  return async (req, res, next) => {
    // Tangkap fungsi bawaan res.json asli untuk kita intip hasil akhirnya
    const originalJson = res.json;

    res.json = function (data) {
      // Kembalikan fungsi asli res.json agar user/frontend lo gak keganggu delay
      originalJson.apply(res, arguments);

      // Jalankan pencatatan log di latar belakang (Asynchronous - Fire and Forget)
      process.nextTick(async () => {
        try {
          // 1. Ambil data jaringan rill lebih awal
          const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          const userAgent = req.headers['user-agent'];

          // 2. Cari tahu apakah ada ID referensi transaksi (Order ID atau sejenisnya)
          const entityId = req.params?.id || req.body?.order_id || req.body?.orderId || data?.orderId || data?.data?.id || null;

          // 3. Identifikasi siapa aktor utamanya (User login / parameter body)
          let userId = req.user?.id || req.body?.streamer_id || null;

          // 🧠 EXCLUSIVE ADVANCED DETECTOR:
          // Jika ini adalah aksi otomatis dari Webhook Midtrans, user_id rill dipastikan kosong di request session.
          // Kita paksa sistem melakukan kueri instan ke tabel donations menggunakan entityId (order_id) 
          // untuk menemukan siapa user_id (streamer_id) pemilik asli dari uang donasi tersebut!
          if (!userId && actionType === 'PAYMENT_WEBHOOK_RECEIVED' && entityId) {
            try {
              // Cari streamer_id dari data transaksi donasi (Gunakan String casting agar kebal alphanumeric ID)
              const donationCheck = await req.db.query(
                "SELECT streamer_id FROM donations WHERE id = $1::text OR id = $1", 
                [String(entityId)]
              );
              
              if (donationCheck.rows.length > 0) {
                const streamerId = donationCheck.rows[0].streamer_id;
                
                // 🛡️ ADAPTIVE CASTING: Cek jika streamerId adalah angka valid, lakukan parsing. Jika tidak, kirim string mentah.
                const targetStreamerId = isNaN(streamerId) ? streamerId : parseInt(streamerId, 10);

                // Cari user_id asli yang terikat dengan profil streamer tersebut
                const userCheck = await req.db.query(
                  "SELECT user_id FROM streamers WHERE id = $1 OR id::text = $2::text", 
                  [isNaN(targetStreamerId) ? 0 : targetStreamerId, String(streamerId)]
                );
                
                if (userCheck.rows.length > 0) {
                  userId = userCheck.rows[0].user_id;
                }
              }
            } catch (dbErr) {
              console.error("⚠️ Gagal mengekstrak relasi webhook actor log:", dbErr.message);
            }
          }

          // 4. Bungkus data detail yang masuk dan keluar ke dalam Metadata JSONB
          const metadata = {
            endpoint: req.originalUrl,
            method: req.method,
            request_body: req.body ? { ...req.body, password: undefined, otp: undefined, serverKey: undefined } : {}, // Sensor data sensitif
            response_data: data?.success || data?.status === 'OK' ? { message: data.message || "Success" } : { error: data.error || "Failed" }
          };

          const query = `
            INSERT INTO system_audit_logs 
              (user_id, action_type, entity_id, metadata, ip_address, user_agent, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `;

          // Tembak ke database log dengan data yang sudah disinkronkan sempurna
          await req.db.query(query, [
            userId ? parseInt(userId, 10) : null,
            actionType,
            entityId ? String(entityId) : null,
            JSON.stringify(metadata),
            ip,
            userAgent
          ]);

        } catch (err) {
          console.error("⚠️ Gagal mencatat system audit log:", err.message);
        }
      });
    };

    next();
  };
};