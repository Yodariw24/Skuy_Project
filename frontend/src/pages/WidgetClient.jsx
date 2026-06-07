import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crown, Heart } from 'lucide-react';
import { io } from 'socket.io-client'; 
import api from '../api/axios'; 

const WidgetClient = () => {
  const { username, type } = useParams(); 
  const [activeAlert, setActiveAlert] = useState(null);
  
  // ✅ LOCK POINTER: Amankan slot memori timer agar terbebas dari tabrakan multi-donation
  const timerRef = useRef(null);

  const [settings, setSettings] = useState({
    primary_color: '#7C3AED',
    accent_color: '#FF1493',
    text_color: '#ffffff',
    glow_color: '#7C3AED',
    duration: 8,
    streamer_id: null
  });

  // --- 1. FETCH SETTINGS VIA USERNAME (Sync Railway Cloud) ---
  useEffect(() => {
    // 🌐 SULTAN OBS HACK: Bikin body HTML jadi transparan penuh biar di OBS gak ada background putih
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none';

    const fetchSettings = async () => {
      try {
        const res = await api.get(`/user/widgets/settings/${username}/${type || 'tip'}`);
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.warn("⚠️ Widget Node Offline, menggunakan konfigurasi visual pangkalan.");
      }
    };
    if (username) fetchSettings();

    return () => {
       // Cleanup
       document.body.style.backgroundColor = '';
       document.body.style.backgroundImage = '';
    };
  }, [username, type]);

  // --- 2. SOCKET.IO REAL-TIME PROTOCOL (STABILIZED) 📡 ---
  useEffect(() => {
    if (!settings.streamer_id) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app';
    const cleanSocketUrl = socketUrl.replace(/\/api$/, ""); 

    // Connect ke core engine WebSocket di Railway
    const socket = io(cleanSocketUrl);
    const channel = `new-donation-${settings.streamer_id}`;
    
    socket.on(channel, (data) => {
      // ✅ ANTI-CRASH SHIELD: Bersihkan sisa antrean timer donasi sebelumnya jika ada
      if (timerRef.current) clearTimeout(timerRef.current);

      setActiveAlert({
        sender: data.donatur_name,
        amount: data.amount,
        message: data.message,
        alertType: 'tip'
      });

      // Timer Sultan: Menggunakan referensi memori statis pointer
      timerRef.current = setTimeout(() => {
        setActiveAlert(null);
      }, (settings.duration || 8) * 1000);
    });

    // Dengarkan jika ada kustomisasi warna/tema real-time dari Dashboard lo, Ri!
    socket.on(`widget-update-${settings.streamer_id}`, (update) => {
        if (update.type === type) {
            setSettings(update.settings);
        }
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      socket.off(channel);
      socket.off(`widget-update-${settings.streamer_id}`);
      socket.disconnect();
    };
    // ✅ FIXED DEPENDENCY: Menghapus settings.duration dari array agar OBS tidak dc-rc terus-menerus
  }, [settings.streamer_id, type]);

  const formatR = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

  // --- 3. DYNAMIC METRICS OVERLAY RENDER ---
  const AlertRender = useMemo(() => {
    if (!activeAlert) return null;

    const isSultan = activeAlert.amount >= 100000;

    return (
      <motion.div 
        key="skuy-alert-v2"
        initial={{ opacity: 0, scale: 0.8, y: 50, rotate: -5 }} 
        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }} 
        exit={{ opacity: 0, scale: 1.1, y: -20, filter: "blur(15px)" }}
        transition={{ type: 'spring', damping: 14, stiffness: 110 }}
        className="relative text-left"
      >
        {/* Glow Dynamic Background Effect */}
        <div 
          style={{ backgroundColor: settings.glow_color }} 
          className="absolute -inset-10 blur-[100px] opacity-40 rounded-full animate-pulse pointer-events-none" 
        />

        {/* Card Body Neo-Brutalism */}
        <div 
          style={{ backgroundColor: isSultan ? '#0f172a' : settings.primary_color }} 
          className="relative w-[500px] p-12 rounded-[3.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 overflow-hidden"
        >
          {/* Background Vector Silhouette */}
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 text-white pointer-events-none">
            {isSultan ? <Crown size={160} fill="currentColor" /> : <Zap size={160} fill="currentColor" />}
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/20 rounded-lg text-white">
                 {isSultan ? <Crown size={18} className="text-amber-400" fill="currentColor" /> : <Heart size={18} fill="currentColor" />}
               </div>
               <p style={{ color: settings.text_color }} className="text-[11px] font-black uppercase tracking-[0.4em] opacity-80 italic">
                 {isSultan ? 'Sultan Contribution' : 'New Interaction'}
               </p>
            </div>

            <h2 style={{ color: settings.text_color }} className="text-5xl font-black italic tracking-tighter mb-6 destruction-title uppercase truncate">
              {activeAlert.sender}
            </h2>

            <div className="h-2 w-24 bg-white/20 rounded-full mb-8" />

            <div className="min-h-[60px]">
                <p style={{ color: settings.text_color }} className="text-xl font-bold opacity-90 leading-tight italic break-words">
                  "{activeAlert.message || 'Gak ada pesan, yang penting gacor!'}"
                </p>
            </div>

            <div className="mt-10 pt-8 border-t-4 border-white/10 flex items-center justify-between">
                <h1 style={{ color: isSultan ? '#fbbf24' : settings.accent_color }} className="text-5xl font-black italic tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                  Rp {formatR(activeAlert.amount)}
                </h1>
                <Zap size={32} className="text-white/20 animate-bounce" fill="currentColor" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }, [activeAlert, settings]);

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden" style={{ background: 'transparent' }}>
      <AnimatePresence mode="wait">
        {AlertRender}
      </AnimatePresence>
    </div>
  );
};

export default WidgetClient;