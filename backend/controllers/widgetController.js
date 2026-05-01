// 1. Update Setting (Deploy Protocol dari Dashboard)
export const updateSettings = async (req, res) => {
    // Destructuring dengan default value agar aman
    const { userId, widgetType, colors = {}, config = {} } = req.body;

    // Proteksi: Pastikan data esensial ada
    if (!userId || !widgetType) {
        return res.status(400).json({ success: false, message: "Missing userId or widgetType" });
    }

    try {
        const query = `
            INSERT INTO widget_settings 
            (user_id, widget_type, primary_color, accent_color, text_color, glow_color, min_tip, duration, goal_title, goal_target)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, widget_type) 
            DO UPDATE SET 
                primary_color = EXCLUDED.primary_color,
                accent_color = EXCLUDED.accent_color,
                text_color = EXCLUDED.text_color,
                glow_color = EXCLUDED.glow_color,
                min_tip = EXCLUDED.min_tip,
                duration = EXCLUDED.duration,
                goal_title = EXCLUDED.goal_title,
                goal_target = EXCLUDED.goal_target,
                updated_at = NOW()
            RETURNING *;
        `;
        
        // Gunakan fallback agar data di Railway tetap konsisten
        const values = [
            userId, 
            widgetType, 
            colors.primary || '#6366f1', 
            colors.accent || '#fbbf24', 
            colors.text || '#ffffff', 
            colors.glow || '#818cf8', 
            config.min_tip || 10000, 
            config.duration || 8,
            config.goal_title || 'EVOLVE STREAM SETUP', 
            config.goal_target || 15000000
        ];
        
        const result = await req.db.query(query, values);

        // KIRIM SINYAL UPDATE KE WIDGET (Real-time via Socket.io)
        // Cek apakah req.io sudah di-inject dari server.js
        if (req.io) {
            req.io.to(`streamer_${userId}`).emit('widget-update', {
                type: widgetType,
                settings: result.rows[0]
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Protocol deployed to Railway Cloud! 🚀",
            data: result.rows[0] 
        });
    } catch (err) {
        console.error("🔥 Error updateSettings:", err.message);
        res.status(500).json({ success: false, message: "Gagal deploy protokol visual" });
    }
};

// 2. Get Setting (Dipanggil oleh Browser Source OBS)
export const getSettings = async (req, res) => {
    const { streamKey, widgetType } = req.params;
    
    try {
        // Menggunakan ILIKE agar pencarian username tidak sensitif huruf besar/kecil
        const query = `
            SELECT ws.* 
            FROM widget_settings ws
            JOIN streamers s ON s.id = ws.user_id
            WHERE s.username ILIKE $1 AND ws.widget_type = $2;
        `;
        
        const result = await req.db.query(query, [streamKey, widgetType]);
        
        // DATA DEFAULT: Biar OBS nggak blank pas pertama pasang
        if (result.rows.length === 0) {
            return res.status(200).json({ 
                success: true, 
                isDefault: true,
                data: {
                    primary_color: '#6366f1',
                    accent_color: '#fbbf24',
                    text_color: '#ffffff',
                    glow_color: '#818cf8',
                    duration: 8,
                    min_tip: 10000,
                    goal_title: 'Support My Journey!',
                    goal_target: 10000000
                } 
            });
        }
        
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("🔥 Error getSettings:", err.message);
        res.status(500).json({ success: false, message: "Error fetching Skuy Engine settings" });
      }
};