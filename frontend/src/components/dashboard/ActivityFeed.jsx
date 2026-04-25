import { useEffect, useState, useCallback } from 'react'
import api from '../../api/axios'
import { 
  MessageSquare, Clock, Heart, RefreshCcw, Zap, 
  TrendingUp, Crown, Sparkles, Share2, CheckCircle2 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function ActivityFeed({ userId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchHistory = useCallback(async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    else setIsRefreshing(true);

    try {
      // Endpoint: router.get('/:id/history', getPublicHistory)
      const res = await api.get(`/donations/${userId}/history`);
      
      // FIX: Ambil res.data.data karena Backend membungkusnya dalam objek success
      if (res.data && res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error("Gagal ambil history:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  // --- AUTO REFRESH SETIAP 30 DETIK ---
  useEffect(() => {
    if (userId) {
      fetchHistory();
      const interval = setInterval(() => fetchHistory(true), 30000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchHistory]);

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
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}h lalu`;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 font-sans">
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] italic">Live Feed</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Recent Support
          </h1>
        </div>
        
        <button 
          onClick={() => fetchHistory()}
          disabled={loading || isRefreshing}
          className="group relative p-4 bg-white border-2 border-slate-100 rounded-[1.8rem] hover:border-violet-600 transition-all active:scale-90 shadow-xl shadow-slate-100/50 overflow-hidden"
        >
          <RefreshCcw 
            size={20} 
            strokeWidth={3} 
            className={`text-slate-400 group-hover:text-violet-600 transition-all duration-700 ${isRefreshing || loading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
          />
        </button>
      </div>

      {/* --- FEED CONTENT --- */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
             <div className="relative">
                <div className="w-16 h-16 border-[6px] border-slate-100 rounded-full" />
                <div className="absolute top-0 w-16 h-16 border-[6px] border-violet-600 border-t-transparent rounded-full animate-spin" />
             </div>
             <p className="font-black italic uppercase tracking-[0.4em] text-[10px] text-slate-400 animate-pulse">Syncing Energy...</p>
          </div>
        ) : history.length > 0 ? (
          <AnimatePresence mode='popLayout'>
            {history.map((item, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.08 }}
                key={item.id || i} 
                className="group relative bg-white p-6 md:p-10 rounded-[3rem] border-2 border-slate-50 shadow-2xl shadow-slate-200/30 flex flex-col md:flex-row items-start md:items-center gap-8 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-50 transition-all duration-500"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                   <Sparkles size={120} />
                </div>

                {/* Left Side: Avatar/Icon */}
                <div className="relative shrink-0">
                  <div className={`w-20 h-20 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 shadow-xl ${
                    item.amount >= 100000 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white rotate-6 group-hover:rotate-0' 
                    : 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white'
                  }`}>
                    {item.amount >= 100000 ? <Crown size={32} strokeWidth={2.5} /> : <Heart size={32} strokeWidth={2.5} />}
                  </div>
                  {item.amount >= 100000 && (
                    <div className="absolute -bottom-2 -right-2 bg-slate-950 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border-2 border-white shadow-lg">
                      Whale 🐳
                    </div>
                  )}
                </div>
                
                {/* Right Side: Info */}
                <div className="flex-1 w-full min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-black italic text-slate-900 uppercase tracking-tighter text-2xl leading-none mb-3 group-hover:text-violet-600 transition-colors">
                        {item.donatur_name}
                      </h3>
                      <div className="flex items-center gap-3 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                          <Clock size={12} strokeWidth={3} /> {formatRelativeTime(item.created_date)}
                        </span>
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 size={12} strokeWidth={3} /> Success
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 group-hover:bg-violet-50 p-4 md:p-6 rounded-[2rem] border border-slate-100 group-hover:border-violet-100 transition-all">
                      <p className={`text-2xl md:text-3xl font-black italic tracking-tighter leading-none ${
                        item.amount >= 100000 ? 'text-orange-600' : 'text-violet-600'
                      }`}>
                        Rp {Number(item.amount).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Message Section */}
                  {item.message && (
                    <div className="relative pl-6 border-l-4 border-slate-100 group-hover:border-violet-200 transition-colors">
                      <p className="text-sm text-slate-500 italic font-bold leading-relaxed">
                        "{item.message}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          /* EMPTY STATE */
          <div className="bg-white rounded-[4rem] border-4 border-dashed border-slate-100 py-32 text-center flex flex-col items-center group transition-all duration-500 hover:border-violet-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-violet-50 transition-all duration-500">
              <Zap size={40} className="text-slate-200 group-hover:text-violet-400 animate-pulse" />
            </div>
            <div className="space-y-4 px-6">
              <p className="text-slate-400 font-black italic uppercase tracking-[0.4em] text-xs leading-loose">
                Belum ada energi masuk nih.
              </p>
              <button 
                onClick={() => navigator.clipboard.writeText(`skuy.gg/surya`)}
                className="flex items-center gap-2 mx-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-xl active:scale-95 transition-all"
              >
                <Share2 size={14} /> Share Link Saweran
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityFeed;