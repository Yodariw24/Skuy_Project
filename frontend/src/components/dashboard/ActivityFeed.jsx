import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios' 
import { 
  Clock, Heart, RefreshCcw, Zap, 
  Crown, Sparkles, Share2, CheckCircle2, Gem, User, ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

// 🎨 COMPONENT TIER CONFIGURATION SHIELD WITH PREMIUM ICONS & LUXURY GRADIENTS
const tierConfig = {
  MYTHIC: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10 hover:from-amber-500/15 hover:via-orange-500/15 hover:to-rose-500/15',
    border: 'border-amber-500',
    shadow: 'hover:shadow-[16px_16px_0px_0px_#F59E0B]',
    text: 'text-amber-500',
    badge: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border-2 border-amber-600',
    badgeText: 'Mythic Donatur 🔥',
    iconBg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg shadow-amber-200/50',
    icon: <Crown size={36} strokeWidth={3} className="animate-bounce" />
  },
  GOLD: {
    bg: 'bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 hover:from-yellow-500/10 hover:via-amber-500/10 hover:to-orange-500/10',
    border: 'border-amber-400',
    shadow: 'hover:shadow-[16px_16px_0px_0px_#D97706]',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 border-2 border-amber-300',
    badgeText: 'Gold Tier 🌟',
    iconBg: 'bg-amber-100 text-amber-600 border-2 border-amber-300',
    icon: <Sparkles size={34} strokeWidth={3} className="animate-pulse" />
  },
  SILVER: {
    bg: 'bg-gradient-to-br from-slate-50 via-zinc-50 to-white hover:bg-slate-100/50',
    border: 'border-slate-400',
    shadow: 'hover:shadow-[16px_16px_0px_0px_#64748B]',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-800 border-2 border-slate-300',
    badgeText: 'Silver Tier 💎',
    iconBg: 'bg-slate-100 text-slate-600 border-2 border-slate-300',
    icon: <Gem size={34} strokeWidth={3} />
  },
  STANDARD: {
    bg: 'bg-white hover:bg-violet-50/10',
    border: 'border-slate-950',
    shadow: 'hover:shadow-[16px_16px_0px_0px_#7C3AED]',
    text: 'text-violet-600',
    badge: 'bg-violet-50 text-violet-700 border-2 border-violet-200',
    badgeText: 'Standard Tier ✨',
    iconBg: 'bg-violet-50 text-violet-600 border-2 border-violet-100',
    icon: <Heart size={34} strokeWidth={3} fill="currentColor" />
  }
};

function ActivityFeed() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // --- 1. FETCH DATA LIVE FROM NODE RAILWAY ---
  const fetchHistory = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    else setIsRefreshing(true);

    try {
      // ✅ ENDPOINT ACCURACY: Menembak rute privat dashboard /donations/activity-feed lo, Ri
      const res = await api.get('/api/donations/activity-feed');
      
      if (res.data && res.data.success) {
        setHistory(res.data.donations || []);
      }
    } catch (err) {
      console.error("Gagal sinkron feed Railway:", err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    // 🚀 LIVE STREAM SYNC: Refresh latar belakang tiap 15 detik biar responsif tanpa membebani server
    const interval = setInterval(() => fetchHistory(true), 15000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Baru saja';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Baru saja';
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Baru saja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}j lalu`;
    return `${Math.floor(diffInHours / 24)}h lalu`;
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 px-2 font-sans text-left">
      
      {/* --- HEADER SULTAN HUB --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Railway Live Stream Ops</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Live <span className="text-violet-600">Activity</span> Feed
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-2">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status Sync</p>
             <p className="text-[10px] font-bold text-emerald-500 uppercase italic">All Systems Operational</p>
          </div>
          <button 
            onClick={() => fetchHistory()}
            disabled={loading || isRefreshing}
            className="group relative p-5 bg-white border-4 border-slate-950 rounded-2xl hover:bg-slate-50 transition-all active:translate-y-1 shadow-[6px_6px_0px_0px_#000]"
          >
            <RefreshCcw 
              size={22} 
              strokeWidth={3} 
              className={`text-slate-950 transition-all duration-700 ${isRefreshing || loading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
            />
          </button>
        </div>
      </div>

      {/* --- FEED CONTENT --- */}
      <div className="space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-[8px] border-slate-100 rounded-[2rem] rotate-45" />
                <div className="absolute inset-0 border-[8px] border-violet-600 border-t-transparent rounded-[2rem] animate-spin rotate-45" />
              </div>
              <p className="font-black italic uppercase tracking-[0.5em] text-[10px] text-slate-400 animate-pulse">Scanning Railway Nodes...</p>
          </div>
        ) : history.length > 0 ? (
          <AnimatePresence mode='popLayout'>
            {history.map((item, i) => {
              // 🛡️ DYNAMIC TIER RESOLVER: Menghubungkan visualisasi dengan data 'tier' Postgres
              const currentTier = item.tier?.toUpperCase() || 'STANDARD';
              const cfg = tierConfig[currentTier] || tierConfig.STANDARD;

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -40, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3), type: 'spring', stiffness: 140, damping: 15 }}
                  key={item.id} 
                  className={`group relative p-8 md:p-12 rounded-[3.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center gap-10 hover:translate-y-[-4px] hover:translate-x-[-4px] ${cfg.shadow} ${cfg.bg} transition-all duration-500 overflow-hidden`}
                >
                  {/* Floating Translucent Background Icon */}
                  <div className="absolute -top-6 -right-6 p-8 opacity-[0.02] group-hover:opacity-10 text-slate-950 transition-all group-hover:rotate-12 group-hover:scale-150 pointer-events-none duration-700">
                     {cfg.icon}
                  </div>

                  {/* Left Side: Avatar Box / Dynamic Tier Icon */}
                  <div className="relative shrink-0 mx-auto md:mx-0">
                    <div className={`w-24 h-24 rounded-[2.5rem] border-4 border-slate-950 flex items-center justify-center transition-all duration-500 shadow-[6px_6px_0px_0px_#000] ${cfg.iconBg} group-hover:scale-105 group-hover:rotate-3`}>
                      {cfg.icon}
                    </div>
                  </div>
                  
                  {/* Right Side: Information Panel */}
                  <div className="flex-1 w-full min-w-0 z-10 text-center md:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                      <div>
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 justify-center md:justify-start">
                          <h3 className="font-black italic text-slate-950 uppercase tracking-tighter text-3xl leading-none flex items-center gap-2">
                            <User size={22} className="text-slate-400" strokeWidth={3} /> {item.donatur_name}
                          </h3>
                          {/* 🎖️ DYNAMIC BADGE SULTAN TIER */}
                          <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-sm tracking-widest ${cfg.badge}`}>
                            {cfg.badgeText}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          {/* ✅ DATABASE ACCURACY: Membaca created_date dari tabel donations */}
                          <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl text-slate-600 border border-slate-200">
                            <Clock size={14} strokeWidth={3} /> {formatRelativeTime(item.created_date)}
                          </span>
                          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl border border-emerald-200 font-black">
                            <CheckCircle2 size={14} strokeWidth={3} /> SUCCESS PAYMENT
                          </span>
                        </div>
                      </div>

                      {/* NOMINAL PANEL BOX (Menggunakan gross_amount) */}
                      <div className="bg-slate-950 p-5 md:p-7 rounded-[2.2rem] shadow-[6px_6px_0px_0px_#000] transform group-hover:rotate-2 group-hover:scale-105 transition-all duration-300 border-2 border-slate-900 mx-auto lg:mx-0 w-fit">
                        <p className={`text-2xl md:text-4xl font-black italic tracking-tighter leading-none ${cfg.text}`}>
                          Rp {Number(item.gross_amount || item.amount).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {item.message && (
                      <div className="relative p-5 bg-white rounded-2xl border-l-8 border-slate-950 italic group-hover:bg-slate-50/50 transition-colors border border-slate-100 shadow-inner text-left">
                        <p className="text-base text-slate-700 font-bold leading-relaxed">
                          "{item.message}"
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          /* --- BEAUTIFUL EMPTY STATE HUB --- */
          <div className="bg-white rounded-[4rem] border-4 border-slate-950 py-32 text-center flex flex-col items-center shadow-[16px_16px_0px_0px_#f1f5f9] group border-dashed hover:border-solid transition-all duration-500">
            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-10 border-4 border-slate-200 group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white transition-all duration-500 shadow-[6px_6px_0px_0px_#f1f5f9] group-hover:shadow-[6px_6px_0px_0px_#000]">
              <ShieldAlert size={48} className="text-slate-300 group-hover:text-violet-400 transition-colors animate-pulse" />
            </div>
            <div className="space-y-6 px-10">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-400 group-hover:text-slate-950 transition-colors">No Signals Detected</h3>
              <p className="text-slate-400 font-bold italic uppercase tracking-[0.2em] text-xs max-w-sm mx-auto leading-relaxed">
                Belum ada transaksi masuk dari para Sultan. Bagikan tautan profil unik milikmu sekarang!
              </p>
              <button 
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem('user'));
                  if (user) {
                    navigator.clipboard.writeText(`https://skuy-project.vercel.app/${user.username}`);
                    Swal.fire({
                      title: 'BERHASIL',
                      text: 'Link profil publik lo udah dicopy, gass sebar, Ri!',
                      icon: 'success',
                      customClass: { popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#7C3AED]' }
                    });
                  }
                }}
                className="flex items-center gap-3 mx-auto mt-8 bg-[#7C3AED] text-white px-10 py-5 rounded-2xl text-xs font-black uppercase italic tracking-[0.2em] shadow-[0_6px_0_0_#4c1d95] hover:shadow-[0_4px_0_0_#4c1d95] active:translate-y-1 active:shadow-none border-2 border-slate-950 transition-all"
              >
                <Share2 size={16} /> Salin Link Sultan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed;