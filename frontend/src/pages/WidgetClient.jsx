import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Crown, Heart, Play, Activity } from 'lucide-react';
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
    streamer_id: null,
    config: {} // ✅ SULTAN SYNC: Tambahan state config buat nampung data milestone/goal
  });

  // --- 1. FETCH SETTINGS VIA USERNAME (Sync Railway Cloud) ---
  useEffect(() => {
    // 🌐 SULTAN OBS HACK: Bikin body HTML jadi transparan penuh biar di OBS gak ada background putih
    document.documentElement.style.backgroundColor = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none';
    const rootNode = document.getElementById('root');
    if (rootNode) rootNode.style.backgroundColor = 'transparent';

    const fetchSettings = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, "") : 'https://skuyproject-production.up.railway.app';
        
        // 🚀 1. BYPASS INTERCEPTOR: Pakai native fetch biar OBS gak ditendang ke halaman Login (penyebab Whitescreen)
        const profileRes = await fetch(`${API_BASE}/api/donations/profile/${username}`);
        const profileData = await profileRes.json();
        
        let targetId = null;
        if (profileData.success && profileData.data) {
           targetId = profileData.data.id;
           setSettings(prev => ({ ...prev, streamer_id: targetId }));
        } else {
           return;
        }

        // 2. Tarik visual config (Abaikan jika 401/404, widget tetap jalan pakai warna default)
        const settingsRes = await fetch(`${API_BASE}/api/user/widgets/settings/${username}/${type || 'tip'}`);
        if (settingsRes.ok) {
           const settingsData = await settingsRes.json();
           if (settingsData.success && settingsData.data) {
             setSettings(prev => ({ ...prev, ...settingsData.data, streamer_id: targetId }));
           }
        }
      } catch (err) {
        console.warn("⚠️ Widget Node Offline, menggunakan konfigurasi visual pangkalan.");
      }
    };
    if (username) fetchSettings();

    return () => {
       // Cleanup
       document.documentElement.style.backgroundColor = '';
       document.body.style.backgroundColor = '';
       document.body.style.backgroundImage = '';
       if (rootNode) rootNode.style.backgroundColor = '';
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

      // 📈 SULTAN SYNC: Auto-nambah progress bar Milestone saat donasi masuk!
      if (type === 'milestone') {
         setSettings(prev => {
            if (prev.config && prev.config.goal_current !== undefined) {
               return { ...prev, config: { ...prev.config, goal_current: Number(prev.config.goal_current) + Number(data.amount) } };
            }
            return prev;
         });
      }
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

  // ✅ CALCULATION ENGINE UNTUK MILESTONE
  const target = Number(settings.config?.goal_target) || 1000000;
  const current = Number(settings.config?.goal_current) || 0;
  const pct = Math.min(Math.round((current / target) * 100), 100) || 0;

  return (
    <div className="w-screen h-screen overflow-hidden relative font-sans" style={{ background: 'transparent' }}>
      
      {/* --- 1. TIP ALERT PROTOCOL --- */}
      {(!type || type === 'tip') && (
        <div className="w-full h-full flex items-center justify-center">
          {!activeAlert && (
             <div className="absolute top-5 left-5 px-4 py-2 bg-slate-950/40 backdrop-blur-md rounded-xl border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 shadow-xl">
               <Activity size={14} className="animate-pulse text-emerald-400" />
               Tip Alert: Listening Sinyal Sultan...
             </div>
          )}
          <AnimatePresence mode="wait">
            {AlertRender}
          </AnimatePresence>
        </div>
      )}

      {/* --- 2. MILESTONE PROTOCOL --- */}
      {type === 'milestone' && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-10 left-10 w-full max-w-md bg-white p-10 rounded-[50px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 text-left">
          <div className="flex justify-between items-end mb-8 px-2">
            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-950 truncate max-w-[250px]">{settings.config?.goal_title || 'SULTAN TARGET'}</h4>
            <span style={{ color: settings.primary_color }} className="text-3xl font-black italic">{pct}%</span>
          </div>
          <div className="h-16 w-full bg-slate-100 rounded-[25px] p-2.5 border-4 border-slate-950 mb-8 shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.5, type: 'spring' }} style={{ background: `linear-gradient(90deg, ${settings.primary_color}, ${settings.glow_color})` }} className="h-full rounded-[15px] border-r-4 border-white/20 shadow-lg" />
          </div>
          <p className="text-[12px] font-black uppercase text-slate-400 text-center tracking-[0.2em]">Rp {formatR(current)} / Rp {formatR(target)}</p>
        </motion.div>
      )}

      {/* --- 3. LEADERBOARD PROTOCOL --- */}
      {type === 'leaderboard' && (
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="absolute top-10 right-10 w-full max-w-sm space-y-4">
           <div className="flex justify-center items-end gap-4 mb-12">
              <div style={{ backgroundColor: settings.primary_color }} className="w-24 h-32 rounded-[30px] flex flex-col items-center justify-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative translate-y-[-15px] border-4 border-slate-950">
                 <Crown size={24} className="absolute -top-6 text-amber-400 fill-amber-400 drop-shadow-lg animate-bounce" />
                 <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-black italic text-sm">#1</div>
              </div>
           </div>
           <div className="p-6 bg-white border-4 border-slate-950 rounded-[28px] flex justify-between items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase italic text-slate-950 tracking-widest leading-none">Supporter Elite</p>
              <p style={{ color: settings.primary_color }} className="text-xs font-black italic tracking-tighter">Standby Mode</p>
           </div>
        </motion.div>
      )}

      {/* --- 4. MEDIASHARE PROTOCOL --- */}
      {type === 'mediashare' && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-10 left-10 w-full max-w-lg">
          <div className="bg-slate-950 rounded-[45px] p-4 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 relative overflow-hidden">
            <div className="aspect-video bg-slate-900 rounded-[30px] flex items-center justify-center relative overflow-hidden border-2 border-white/5">
              <div style={{ backgroundColor: settings.primary_color }} className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl z-20 border-4 border-white/10">
                 <Play size={32} fill="currentColor" className="ml-1 animate-pulse" />
              </div>
              <div className="absolute bottom-6 left-8 right-8 z-30 text-left">
                 <div className="h-2 w-full bg-white/10 rounded-full mb-4 overflow-hidden backdrop-blur-md">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3, repeat: Infinity }} style={{ backgroundColor: settings.primary_color }} className="h-full shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                 </div>
                 <p className="text-[11px] font-black text-white italic truncate uppercase tracking-tight mb-1 opacity-50">Media Protocol: STANDBY</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default WidgetClient;