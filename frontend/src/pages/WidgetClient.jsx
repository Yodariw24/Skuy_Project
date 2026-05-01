import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play } from 'lucide-react';
import { io } from 'socket.io-client'; // GANTI: Pakai Socket.io untuk Realtime Alert
import axios from 'axios'; // Buat ambil settingan awal

const WidgetClient = () => {
  const { type, key } = useParams(); // 'key' adalah ID Streamer
  const [activeAlert, setActiveAlert] = useState(null);
  const [settings, setSettings] = useState({
    primary: '#6366f1',
    accent: '#fbbf24',
    text: '#ffffff',
    glow: '#818cf8',
    duration: 8
  });

  // 1. FETCH SETTINGS VIA BACKEND RAILWAY
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`https://backend-lo.railway.app/api/streamers/settings/${key}`);
        if (res.data) {
          const data = res.data;
          setSettings(prev => ({
            ...prev,
            primary: data.theme_color === 'violet' ? '#6366f1' : data.theme_color || '#6366f1',
            glow: data.theme_color === 'violet' ? '#818cf8' : data.theme_color || '#818cf8',
          }));
        }
      } catch (err) {
        console.warn("Using default local settings.");
      }
    };
    if (key) fetchSettings();
  }, [key]);

  // 2. SOCKET.IO REALTIME PROTOCOL (GANTI SUPABASE CHANNEL)
  useEffect(() => {
    if (!key) return;

    // Hubungkan ke Backend Railway lo
    const socket = io('https://backend-lo.railway.app', {
      query: { streamerId: key }
    });

    // Dengarkan event 'new-donation' dari backend
    socket.on('new-donation', (data) => {
      // Trigger Alert
      setActiveAlert({
        sender: data.donatur_name,
        amount: data.amount,
        message: data.message,
        type: 'tip'
      });

      const timer = (settings.duration || 8) * 1000;
      setTimeout(() => setActiveAlert(null), timer);
    });

    // TESTER MANUAL (Tetap ada buat Ari testing di OBS)
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 't') {
        setActiveAlert({
          sender: "SKUY_TEST_STABLE",
          amount: 150000,
          message: "Widget udah konek Railway, Ri! Gacor! 🚀",
          type: type || 'tip'
        });
        setTimeout(() => setActiveAlert(null), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      socket.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, type, settings.duration]);

  const formatR = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

  const AlertRender = useMemo(() => {
    if (!activeAlert) return null;

    if (activeAlert.type === 'tip' || type === 'tip') {
      return (
        <motion.div 
          key="tip-alert"
          initial={{ opacity: 0, scale: 0.5, y: 100 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
          className="relative text-left"
        >
          <div style={{ backgroundColor: settings.glow }} className="absolute -inset-10 blur-[80px] opacity-40 rounded-full animate-pulse" />
          <div style={{ backgroundColor: settings.primary }} className="relative w-[450px] p-12 rounded-[50px] shadow-2xl border-t-4 border-white/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap size={140} fill="white" /></div>
            <p style={{ color: settings.text }} className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2 italic">Interaction Detected</p>
            <h2 style={{ color: settings.text }} className="text-4xl font-black italic tracking-tighter mb-6 leading-none uppercase">{activeAlert.sender}</h2>
            <div className="h-1 w-20 bg-white/20 rounded-full mb-6" />
            <p style={{ color: settings.text }} className="text-lg font-bold opacity-90 mb-8 leading-tight italic">"{activeAlert.message}"</p>
            <h1 style={{ color: settings.accent }} className="text-5xl font-black italic tracking-tighter drop-shadow-md">Rp {formatR(activeAlert.amount)}</h1>
          </div>
        </motion.div>
      );
    }

    if (type === 'mediashare') {
      return (
        <motion.div 
          key="media-alert"
          initial={{ y: 200, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: -100, opacity: 0 }}
          className="w-[500px]"
        >
          <div className="bg-slate-950 rounded-[45px] p-3 shadow-2xl border-[12px] border-white relative overflow-hidden text-left">
            <div className="aspect-video bg-slate-900 rounded-[30px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent z-10" />
              <div style={{ backgroundColor: settings.primary }} className="w-16 h-16 rounded-full flex items-center justify-center text-white z-20 shadow-2xl">
                <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <div className="absolute bottom-6 left-8 right-8 z-30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60 italic">Live Media Protocol</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: settings.duration }} style={{ backgroundColor: settings.primary }} className="h-full" />
                </div>
                <p className="text-[11px] font-black text-white italic truncate uppercase tracking-tighter mb-1 leading-none">Cloud Request</p>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">By: <span style={{ color: settings.accent }}>{activeAlert.sender}</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  }, [activeAlert, settings, type]);

  return (
    <div 
      className="w-screen h-screen flex items-center justify-center overflow-hidden font-sans"
      style={{ background: 'transparent' }} 
    >
      <AnimatePresence mode="wait">
        {AlertRender}
      </AnimatePresence>
    </div>
  );
};

export default WidgetClient;