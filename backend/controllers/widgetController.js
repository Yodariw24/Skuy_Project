// --- 1. UPDATE SETTINGS (Deploy Protocol dari Dashboard) ---
export const updateSettings = async (req, res) => {
    // Destructuring dengan default value agar aman Ri
    const { userId, widgetType, colors = {}, config = {} } = req.body;

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
        
        const values = [
            userId, 
            widgetType, 
            colors.primary || '#7C3AED', // Sultan Violet Default
            colors.accent || '#FF1493', 
            colors.text || '#ffffff', 
            colors.glow || '#7C3AED', 
            config.min_tip || 10000, 
            config.duration || 8,
            config.goal_title || 'SULTAN GOAL', 
            config.goal_target || 1000000
        ];
        
        const result = await req.db.query(query, values);

        // 🚀 REAL-TIME SYNC: Kirim sinyal update ke OBS via Socket.io
        if (req.io) {
            req.io.emit(`widget-update-${userId}`, {
                type: widgetType,
                settings: result.rows[0]
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Visual Protocol Deployed! 🚀",
            data: result.rows[0] 
        });
    } catch (err) {
        console.error("🔥 Widget Sync Error:", err.message);
        res.status(500).json({ success: false, message: "Gagal deploy visual" });
    }
};

// --- 2. GET SETTINGS (Dipanggil oleh Browser Source OBS) ---
export const getSettings = async (req, res) => {
    const { streamKey, widgetType } = req.params; // streamKey biasanya username
    
    try {
        const query = `
            SELECT ws.*, s.id as streamer_id
            FROM widget_settings ws
            JOIN streamers s ON s.user_id = ws.user_id
            WHERE LOWER(s.username) = LOWER($1) AND ws.widget_type = $2;
        `;
        
        const result = await req.db.query(query, [streamKey, widgetType]);
        
        // DATA FALLBACK: Biar OBS nggak item pas dipasang pertama kali
        if (result.rows.length === 0) {
            return res.status(200).json({ 
                success: true, 
                isDefault: true,
                data: {
                    primary_color: '#7C3AED',
                    accent_color: '#FF1493',
                    text_color: '#ffffff',
                    glow_color: '#7C3AED',
                    duration: 8,
                    min_tip: 10000,
                    goal_title: 'Support My Stream!',
                    goal_target: 500000
                } 
            });
        }
        
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("🔥 OBS Fetch Error:", err.message);
        res.status(500).json({ success: false, message: "Error fetching Skuy Engine settings" });
      }
};