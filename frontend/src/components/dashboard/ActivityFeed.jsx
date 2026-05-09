import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios' 
import { 
  Clock, Heart, RefreshCcw, Zap, 
  Crown, Sparkles, Share2, CheckCircle2, TrendingUp 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ActivityFeed() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // --- 1. FETCH DATA DARI RAILWAY ---
  const fetchHistory = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    else setIsRefreshing(true);

    try {
      // ✅ Interceptor di axios.js udah otomatis nempel user_token, jadi aman Ri
      const res = await api.get('/api/user/activity-feed');
      
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
    // 🚀 GACOR MODE: Auto-refresh tiap 30 detik biar gak ketinggalan notif cuan
    const interval = setInterval(() => fetchHistory(true), 30000);
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
      
      {/* --- HEADER SULTAN --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Railway Live Stream Ops</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Recent <span className="text-violet-600">Support</span>
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
            {history.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 100 }}
                key={item.id} 
                className={`group relative bg-white p-8 md:p-12 rounded-[3.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-start md:items-center gap-10 hover:translate-y-[-4px] hover:translate-x-[-4px] hover:shadow-[16px_16px_0px_0px_#7C3AED] transition-all duration-500 overflow-hidden ${item.amount >= 100000 ? 'bg-amber-50/30' : ''}`}
              >
                {/* Background Decoration */}
                <div className="absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:opacity-20 transition-all group-hover:rotate-12 group-hover:scale-150">
                   {item.amount >= 100000 ? <Crown size={120} /> : <Heart size={120} />}
                </div>

                {/* Left Side: Avatar/Icon */}
                <div className="relative shrink-0">
                  <div className={`w-24 h-24 rounded-[2.5rem] border-4 border-slate-950 flex items-center justify-center transition-all duration-500 shadow-[6px_6px_0px_0px_#000] ${
                    item.amount >= 100000 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white rotate-6 group-hover:rotate-0' 
                    : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
                  }`}>
                    {item.amount >= 100000 ? <Crown size={40} strokeWidth={3} /> : <Heart size={40} strokeWidth={3} />}
                  </div>
                </div>
                
                {/* Right Side: Info */}
                <div className="flex-1 w-full min-w-0 z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="font-black italic text-slate-950 uppercase tracking-tighter text-3xl leading-none mb-4 flex items-center gap-3">
                        {item.donatur_name}
                        {item.amount >= 100000 && <Sparkles size={20} className="text-amber-500 animate-pulse" />}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl text-slate-600">
                          <Clock size={14} strokeWidth={3} /> {formatRelativeTime(item.created_at)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl">
                          <CheckCircle2 size={14} strokeWidth={3} /> Verified
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-5 md:p-7 rounded-[2.2rem] shadow-[6px_6px_0px_0px_#7C3AED] transform group-hover:rotate-2 transition-transform">
                      <p className={`text-2xl md:text-4xl font-black italic tracking-tighter leading-none ${
                        item.amount >= 100000 ? 'text-amber-400' : 'text-violet-400'
                      }`}>
                        Rp {Number(item.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {item.message && (
                    <div className="relative p-5 bg-slate-50 rounded-2xl border-l-8 border-slate-950 italic group-hover:bg-white transition-colors">
                      <p className="text-base text-slate-700 font-bold leading-relaxed">
                        "{item.message}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          /* --- EMPTY STATE --- */
          <div className="bg-white rounded-[4rem] border-4 border-slate-950 py-32 text-center flex flex-col items-center shadow-[16px_16px_0px_0px_#f1f5f9] group">
            <div className="w-28 h-28 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-10 border-4 border-slate-950 group-hover:rotate-12 transition-all duration-500">
              <Zap size={48} className="text-slate-300 group-hover:text-violet-600 animate-pulse" />
            </div>
            <div className="space-y-6 px-10">
              <p className="text-slate-400 font-black italic uppercase tracking-[0.5em] text-xs leading-loose">
                Energi Donasi Belum Terdeteksi
              </p>
              <button 
                onClick={() => {
                  const user = JSON.parse(localStorage.getItem('user'));
                  if (user) {
                    navigator.clipboard.writeText(`https://skuy-project.vercel.app/${user.username}`);
                  }
                }}
                className="flex items-center gap-3 mx-auto bg-[#7C3AED] text-white px-10 py-5 rounded-2xl text-xs font-black uppercase italic tracking-[0.2em] shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 active:shadow-none border-2 border-slate-950 transition-all"
              >
                <Share2 size={16} /> Aktifkan Link Sultan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed;