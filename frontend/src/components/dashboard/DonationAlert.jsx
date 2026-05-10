import { useState, useEffect } from 'react';
import socket from '../../api/socket'; // Pastikan path socket lo bener
import { Sparkles, Zap, Trophy, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationAlert({ streamerId }) {
  const [activeDonation, setActiveDonation] = useState(null);

  useEffect(() => {
    // Dengerin sinyal meledak dari backend
    socket.on(`new-donation-${streamerId}`, (data) => {
      setActiveDonation(data);
      
      // Notif ilang otomatis setelah 5 detik
      setTimeout(() => {
        setActiveDonation(null);
      }, 5000);
    });

    return () => socket.off(`new-donation-${streamerId}`);
  }, [streamerId]);

  if (!activeDonation) return null;

  // 🛡️ PROTOKOL TIER VISUAL
  const tierStyles = {
    STANDARD: "bg-white border-slate-200 text-slate-800 shadow-xl",
    SILVER: "bg-slate-800 border-slate-400 text-white shadow-[0_0_20px_rgba(148,163,184,0.5)] border-2",
    GOLD: "bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-yellow-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] border-4",
    MYTHIC: "bg-slate-950 text-violet-400 border-violet-600 shadow-[0_0_50px_rgba(124,58,237,0.8)] border-4 animate-bounce"
  };

  const icons = {
    STANDARD: <Zap size={24} className="text-blue-500" />,
    SILVER: <Trophy size={24} className="text-slate-300" />,
    GOLD: <Crown size={32} className="text-yellow-200 animate-pulse" />,
    MYTHIC: <Sparkles size={40} className="text-fuchsia-500 animate-spin" />
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -100, opacity: 0, scale: 0.5 }}
        className={`fixed top-10 left-1/2 -translate-x-1/2 z-[999] p-8 rounded-[3rem] w-full max-w-lg border-b-[10px] ${tierStyles[activeDonation.tier]}`}
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md">
            {icons[activeDonation.tier]}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">New Donation Received</h2>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              {activeDonation.donatur_name} <span className="text-sm not-italic opacity-70">donated</span>
            </h1>
            <p className="text-4xl font-black font-mono">
              Rp {Number(activeDonation.amount).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="mt-4 p-4 bg-black/5 rounded-2xl w-full italic font-bold text-lg">
            "{activeDonation.message}"
          </div>

          {activeDonation.tier === 'MYTHIC' && (
            <div className="absolute -inset-4 bg-violet-600/20 blur-3xl -z-10 rounded-full animate-pulse" />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}