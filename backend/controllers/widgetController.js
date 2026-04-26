const pool = require('../config/db');

// 1. Update Setting (Deploy Protocol)
exports.updateSettings = async (req, res) => {
    // Destructuring dengan default value agar tidak error saat dikirim kosong
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
        
        // Gunakan fallback (||) agar tidak null di Database
        const values = [
            userId, 
            widgetType, 
            colors.primary || '#6366f1', 
            colors.accent || '#fbbf24', 
            colors.text || '#ffffff', 
            colors.glow || '#818cf8', 
            config.min_tip || 1000, 
            config.duration || 8,
            config.goal_title || 'Donation Goal', 
            config.goal_target || 1000000
        ];
        
        const result = await pool.query(query, values);
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error updateSettings:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 2. Get Setting (Dipanggil oleh OBS Widget Client)
exports.getSettings = async (req, res) => {
    const { streamKey, widgetType } = req.params;
    
    try {
        const query = `
            SELECT ws.* FROM widget_settings ws
            JOIN users u ON u.id = ws.user_id
            WHERE u.stream_key = $1 AND ws.widget_type = $2;
        `;
        const result = await pool.query(query, [streamKey, widgetType]);
        
        // JANGAN ERROR 404 kalau data tidak ada, tapi kasih DATA DEFAULT
        // Ini supaya widget di OBS tidak mati/error saat streamer baru pertama kali pakai
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
                    goal_title: 'Support Me!',
                    goal_target: 1000000
                } 
            });
        }
        
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error getSettings:", err.message);
        res.status(500).json({ success: false, message: "Error fetching settings" });
    }
};