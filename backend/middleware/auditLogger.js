/**
 * SKUYGG CENTRALIZED AUDIT LOGGER MIDDLEWARE
 * ARCHITECTURE BY: ARI WIRAYUDA (PRO-GRADE PT SYSTEM)
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
          // Identifikasi siapa aktornya (User login / parameter body)
          const userId = req.user?.id || req.body?.streamer_id || null;
          
          // Cari tahu apakah ada ID referensi transaksi (Order ID atau sejenisnya)
          const entityId = req.params?.id || req.body?.orderId || data?.orderId || data?.data?.id || null;

          // Bungkus data detail yang masuk dan keluar ke dalam Metadata JSONB
          const metadata = {
            endpoint: req.originalUrl,
            method: req.method,
            request_body: req.body ? { ...req.body, password: undefined, otp: undefined } : {}, // Sensor data sensitif
            response_data: data?.success ? { message: data.message || "Success" } : { error: data.error || "Failed" }
          };

          const query = `
            INSERT INTO system_audit_logs 
              (user_id, action_type, entity_id, metadata, ip_address, user_agent, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `;

          // Ambil data jaringan rill
          const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
          const userAgent = req.headers['user-agent'];

          // Tembak ke database log
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