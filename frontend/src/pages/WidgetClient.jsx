import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Play } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../api/axios';

// PAKSA KE LOCALHOST 3000 AGAR TIDAK NYASAR KE RENDER
const SOCKET_URL = 'http://localhost:3000';

const WidgetClient = () => {
  const { type, key } = useParams();
  const [activeAlert, setActiveAlert] = useState(null);
  const [settings, setSettings] = useState({
    primary: '#6366f1',
    accent: '#fbbf24',
    text: '#ffffff',
    glow: '#818cf8',
    duration: 8
  });

  // 1. FETCH SETTINGS (Warna & Durasi)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get(`/streamers/widgets/settings/${key}/${type}`);
        if (res.data && res.data.success) {
          const db = res.data.data;
          setSettings({
            primary: db.primary_color || '#6366f1',
            accent: db.accent_color || '#fbbf24',
            text: db.text_color || '#ffffff',
            glow: db.glow_color || '#818cf8',
            duration: parseInt(db.duration) || 8
          });
        }
      } catch (err) {
        console.warn("Menggunakan setting default.");
      }
    };
    if (key && type) fetchSettings();
  }, [type, key]);

  // 2. SOCKET.IO REAL-TIME
  useEffect(() => {
    // Paksa transport websocket agar tidak diblokir CORS/Render
    const socket = io(SOCKET_URL, { 
      transports: ['websocket'],
      upgrade: false 
    });

    socket.on('connect', () => {
      console.log("✅ Terhubung ke SKUY Lokal Port 3000");
      socket.emit('join-protocol', key);
    });

    socket.on('new-alert', (data) => {
      if (data.type === type) {
        setActiveAlert(data);
        const timer = (settings.duration || 8) * 1000;
        setTimeout(() => setActiveAlert(null), timer);
      }
    });

    // TESTER MANUAL (Tekan 'T' di keyboard)
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 't') {
        setActiveAlert({
          sender: "SKUY_TESTER",
          amount: 100000,
          message: "Sistem sudah GACOR, Ari! 🔥",
          type: type
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

    if (type === 'tip') {
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
            <p style={{ color: settings.text }} className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2 italic">Incoming Interaction</p>
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
              <div style={{ backgroundColor: settings.primary }} className="w-16 h-16 rounded-full flex items-center justify-center text-white z-20">
                <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <div className="absolute bottom-6 left-8 right-8 z-30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/60 italic">Media Protocol Active</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full mb-4 overflow-hidden">
                   <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: settings.duration }} style={{ backgroundColor: settings.primary }} className="h-full" />
                </div>
                <p className="text-[11px] font-black text-white italic truncate uppercase tracking-tighter mb-1 leading-none">Media Request</p>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">By: <span style={{ color: settings.accent }}>{activeAlert.sender}</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  }, [activeAlert, settings, type]);

  // PAKSA TRANSPARAN DI ATAS SEMUANYA
  return (
    <div 
      className="w-screen h-screen flex items-center justify-center overflow-hidden font-sans"
      style={{ background: 'transparent !important', backgroundColor: 'transparent' }} 
    >
      <AnimatePresence mode="wait">
        {AlertRender}
      </AnimatePresence>
    </div>
  );
};

export default WidgetClient;