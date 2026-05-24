import React, { useState, useEffect, useRef } from 'react';
// Jalur api socket terpusat lo
import socket from '../../api/socket'; 
import { Sparkles, Zap, Trophy, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationAlert({ streamerId }) {
  const [activeDonation, setActiveDonation] = useState(null);
  
  // ✅ LOCK MEMORY POINTER: Amankan referensi alamat memori timer agar terbebas dari tabrakan saweran bertubi-tubi
  const alertTimerRef = useRef(null);

  useEffect(() => {
    if (!streamerId) return;

    const eventName = `new-donation-${streamerId}`;

    // Mendengarkan sinyal meledak live dari backend Railway lo
    socket.on(eventName, (data) => {
      // ✅ ANTI-CRASH BANNER: Bersihkan sisa timer antrean donasi sebelumnya secara instan jika ada
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);

      setActiveDonation(data);
      
      // Mengunci slot pembersihan alert otomatis setelah durasi 5 detik murni
      alertTimerRef.current = setTimeout(() => {
        setActiveDonation(null);
      }, 5000);
    });

    // Cleanup Protocol: Matiin listener pas komponen unmount biar gak dobel koneksi
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      socket.off(eventName);
    };
  }, [streamerId]);

  // 🛡️ PROTOKOL TIER VISUAL SULTAN
  const tierStyles = {
    STANDARD: "bg-white border-slate-200 text-slate-800 shadow-xl",
    SILVER: "bg-slate-800 border-slate-400 text-white shadow-[0_0_20px_rgba(148,163,184,0.5)] border-2",
    GOLD: "bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-yellow-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4",
    MYTHIC: "bg-slate-950 text-violet-400 border-violet-600 shadow-[0_0_50px_rgba(124,58,237,0.8)] border-4"
  };

  const icons = {
    STANDARD: <Zap size={24} className="text-blue-500" />,
    SILVER: <Trophy size={24} className="text-slate-300" />,
    GOLD: <Crown size={32} className="text-yellow-200 animate-pulse" />,
    MYTHIC: <Sparkles size={40} className="text-fuchsia-500 animate-spin" />
  };

  return (
    <AnimatePresence mode="wait">
      {activeDonation && (
        <motion.div
          // ✅ FIXED RE-ANIMATION: Memberikan unique key dari ID transaksi agar Framer Motion memicu ulang transisi masuk
          key={`alert-node-${activeDonation.id || Date.now()}`}
          initial={{ y: -120, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -120, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          transition={{ type: 'spring', damping: 14, stiffness: 120 }}
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-[999] p-8 rounded-[3rem] w-full max-w-lg border-b-[10px] ${tierStyles[activeDonation.tier?.toUpperCase()] || tierStyles.STANDARD}`}
        >
          <div className="flex flex-col items-center text-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-black/5 backdrop-blur-sm flex items-center justify-center">
              {icons[activeDonation.tier?.toUpperCase()] || icons.STANDARD}
            </div>
            
            <div className="space-y-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50 italic">New Donation Received</h2>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                {activeDonation.donatur_name} <span className="text-sm not-italic opacity-60">donated</span>
              </h1>
              <p className="text-4xl font-black font-mono tracking-tight">
                Rp {Number(activeDonation.amount).toLocaleString('id-ID')}
              </p>
            </div>

            {activeDonation.message && (
              <div className="mt-2 p-4 bg-black/5 rounded-2xl w-full italic font-bold text-lg border border-black/5 break-words">
                "{activeDonation.message}"
              </div>
            )}

            {activeDonation.tier?.toUpperCase() === 'MYTHIC' && (
              <div className="absolute -inset-10 bg-violet-600/10 blur-3xl -z-10 rounded-full animate-pulse pointer-events-none" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}