import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios' 
import { 
  ArrowLeft, Zap, Wallet, CheckCircle2, 
  History, Skull, Heart, Info, Mail, User, Clock, ShieldCheck 
} from 'lucide-react' 

const themeMap = {
  violet: { gradient: 'from-violet-600 via-violet-700 to-fuchsia-600', text: 'text-violet-600', bg: 'bg-violet-600', bgLight: 'bg-violet-50', border: 'border-violet-100', shadow: 'shadow-violet-200', ring: 'focus:ring-violet-50/50', focusBorder: 'focus:border-violet-200' },
  emerald: { gradient: 'from-emerald-500 via-emerald-600 to-teal-500', text: 'text-emerald-600', bg: 'bg-emerald-600', bgLight: 'bg-emerald-50', border: 'border-emerald-100', shadow: 'shadow-emerald-200', ring: 'focus:ring-emerald-50/50', focusBorder: 'focus:border-emerald-200' },
  rose: { gradient: 'from-rose-500 via-rose-600 to-orange-500', text: 'text-rose-600', bg: 'bg-rose-600', bgLight: 'bg-rose-50', border: 'border-rose-100', shadow: 'shadow-rose-200', ring: 'focus:ring-rose-50/50', focusBorder: 'focus:border-rose-200' },
  amber: { gradient: 'from-amber-500 via-amber-600 to-yellow-500', text: 'text-amber-600', bg: 'bg-amber-600', bgLight: 'bg-amber-50', border: 'border-amber-100', shadow: 'shadow-amber-200', ring: 'focus:ring-amber-50/50', focusBorder: 'focus:border-amber-200' },
  sky: { gradient: 'from-sky-500 via-sky-600 to-indigo-500', text: 'text-sky-600', bg: 'bg-sky-600', bgLight: 'bg-sky-50', border: 'border-sky-100', shadow: 'shadow-sky-200', ring: 'focus:ring-sky-50/50', focusBorder: 'focus:border-sky-200' },
  slate: { gradient: 'from-slate-800 via-slate-900 to-black', text: 'text-slate-900', bg: 'bg-slate-900', bgLight: 'bg-slate-100', border: 'border-slate-200', shadow: 'shadow-slate-300', ring: 'focus:ring-slate-200/50', focusBorder: 'focus:border-slate-300' }
};

function DonationPage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [streamer, setStreamer] = useState(null)
  const [balance, setBalance] = useState(0)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    donatur_name: '', donatur_email: '', amount: '', message: ''
  })

  const shortcuts = [10000, 25000, 50000, 100000];
  const theme = themeMap[streamer?.theme_color] || themeMap.violet;

  // --- LOGIKA FETCH DATA SULTAN (Railway Sync) ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // ✅ SINKRON: Panggil endpoint public profile
      const res = await api.get(`/donations/profile/${username}`);
      
      if (res.data.success) {
        const data = res.data.data;
        setStreamer(data);

        // ✅ FETCH SALDO & HISTORY SECARA PARALEL
        const [resBalance, resHistory] = await Promise.all([
          api.get(`/donations/${data.id}/balance`),
          api.get(`/donations/public-history/${data.id}`)
        ]);

        if (resBalance.data.success) setBalance(resBalance.data.total_saldo);
        if (resHistory.data.success) setHistory(resHistory.data.data);
      }
    } catch (err) { 
      console.error("Node railway unreachable:", err.message);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [username]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount < 10000) return alert("Minimal dukungan Sultan adalah Rp 10.000");
    
    setSubmitting(true);
    try {
      // ✅ SINKRON: Kirim donasi ke backend
      const res = await api.post('/donations/create', {
        ...formData,
        streamer_id: streamer.id,
        payment_method: 'QRIS' // Default protocol
      });

      if (res.data.success) {
        // Arahkan ke halaman status atau checkout (sesuai flow lo)
        alert("Instruksi Pembayaran Meluncur! Cek email lo, Ri!");
        // window.location.href = res.data.payment_url;
      }
    } catch (err) { 
      alert("Energi transmission failed! Cek koneksi lo."); 
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-[8px] border-slate-100 rounded-3xl rotate-45" />
        <div className="absolute inset-0 border-[8px] border-violet-600 border-t-transparent rounded-3xl animate-spin rotate-45" />
      </div>
      <p className="mt-10 text-violet-600 font-black italic uppercase tracking-[0.4em] text-xs text-center animate-pulse">
        Establishing Railway Tunnel...
      </p>
    </div>
  );

  if (!streamer) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF] text-rose-500 font-black uppercase gap-6 text-center p-6">
      <Skull size={80} strokeWidth={2.5} />
      <h2 className="text-4xl italic tracking-tighter">Node Not Found</h2>
      <p className="text-slate-400 text-xs tracking-[0.2em] leading-loose max-w-xs font-bold">
        SISTEM TIDAK MENEMUKAN ID @{username.toUpperCase()} DALAM CLOUD RAILWAY SKUYGG.
      </p>
      <Link to="/" className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest mt-4 shadow-2xl hover:bg-violet-600 transition-all border-4 border-slate-900">Back to Hub</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans pb-24 selection:bg-violet-100">
      {/* Dynamic Glow Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] ${theme.bgLight} opacity-50 blur-[150px] rounded-full`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] ${theme.bgLight} opacity-40 blur-[150px] rounded-full`} />
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b-4 border-slate-950/5 p-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-[0.3em]">
            <ArrowLeft size={20} strokeWidth={4} /> Explore
          </Link>
          <div className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">SKUY<span className={theme.text}>.GG</span></div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-16">
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* CREATOR PROFILE CARD */}
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-12 bg-white p-10 md:p-14 rounded-[4rem] border-4 border-slate-950 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-40 h-40 ${theme.bgLight} rounded-full -mr-20 -mt-20 blur-3xl opacity-60`} />
            
            <div className="relative shrink-0">
              <div className={`w-40 h-40 md:w-48 md:h-48 rounded-[3.5rem] p-2 bg-slate-950 shadow-[10px_10px_0px_0px_${theme.bg.replace('bg-', '#')}]`}>
                <div className="w-full h-full rounded-[3rem] bg-white overflow-hidden border-4 border-white">
                  <img 
                    src={streamer.profile_picture ? (streamer.profile_picture.startsWith('http') ? streamer.profile_picture : `${import.meta.env.VITE_API_URL}/uploads/${streamer.profile_picture}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.username}`} 
                    alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.username}` }}
                  />
                </div>
              </div>
              {streamer.is_two_fa_enabled && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border-4 border-white group-hover:rotate-12 transition-transform">
                  <ShieldCheck size={24} strokeWidth={3} />
                </div>
              )}
            </div>

            <div className="text-center md:text-left flex-1 relative z-10">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                 <span className={`${theme.text} font-black tracking-[0.3em] text-[10px] uppercase ${theme.bgLight} px-5 py-2 rounded-full border-2 ${theme.border}`}>Sultan Level Agent</span>
                 {streamer.is_two_fa_enabled && <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border-2 border-emerald-100">Verified</span>}
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-slate-950 uppercase mb-6 leading-none">{streamer.display_name || streamer.username}</h1>
              <p className="text-lg text-slate-500 font-bold leading-relaxed mb-10 italic max-w-xl">"{streamer.bio || "Sistem transmisi energi aktif. Dukung saya terus untuk berkarya! 🚀"}"</p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                {['instagram', 'tiktok', 'youtube'].map(platform => streamer[platform] && (
                  <a key={platform} href={streamer[platform]} target="_blank" rel="noreferrer" className="p-5 bg-slate-50 hover:bg-white rounded-3xl border-4 border-transparent hover:border-slate-950 shadow-sm transition-all hover:-translate-y-1 active:scale-95">
                    <img src={`https://cdn.simpleicons.org/${platform}`} className="w-6 h-6" alt={platform} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* BALANCE CARD */}
          <motion.div initial={{opacity:0, y:30}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className={`lg:col-span-4 bg-slate-950 p-12 rounded-[4rem] text-white flex flex-col justify-between shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden border-4 border-slate-900 group`}>
            <div className={`absolute top-0 right-0 p-10 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700`}><Zap size={200} fill="white" /></div>
            <div className="p-5 bg-white/10 backdrop-blur-2xl rounded-3xl border-2 border-white/20 w-fit shadow-2xl"><Wallet size={36} strokeWidth={2.5} /></div>
            <div className="relative z-10 mt-12">
              <span className="text-[11px] text-white/40 uppercase font-black tracking-[0.4em] block mb-4 italic">Power Collected</span>
              <span className={`text-4xl md:text-5xl font-black italic tracking-tighter ${theme.text} drop-shadow-[0_0_15px_rgba(124,58,237,0.4)]`}>Rp {Number(balance).toLocaleString('id-ID')}</span>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* DONATION FORM */}
          <div className="lg:col-span-7">
            <div className="bg-white p-10 md:p-16 rounded-[4.5rem] border-4 border-slate-950 shadow-[20px_20px_0px_0px_#F1F5F9]">
                <div className="flex items-center gap-5 mb-14">
                  <div className={`p-4 ${theme.bg} text-white rounded-3xl shadow-xl rotate-3`}><Heart size={28} strokeWidth={3} fill="currentColor" /></div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-950">Initialize Support</h2>
                </div>

                <form onSubmit={handleSend} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic">Agent Alias</label>
                        <input type="text" placeholder="Masukkan nama" required className={`w-full bg-slate-50 p-6 rounded-3xl outline-none text-slate-950 font-black border-4 border-slate-100 ${theme.focusBorder} focus:bg-white transition-all`} value={formData.donatur_name} onChange={(e) => setFormData({...formData, donatur_name: e.target.value})} />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic">Access Mail</label>
                        <input type="email" placeholder="Email aktif" required className={`w-full bg-slate-50 p-6 rounded-3xl outline-none text-slate-950 font-black border-4 border-slate-100 ${theme.focusBorder} focus:bg-white transition-all`} value={formData.donatur_email} onChange={(e) => setFormData({...formData, donatur_email: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic text-left block">Support Energy Nominal</label>
                      <div className="relative group">
                        <span className={`absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-4xl group-focus-within:${theme.text}`}>Rp</span>
                        <input type="number" required placeholder="0" className={`w-full bg-slate-50 p-10 pl-24 rounded-[3.5rem] outline-none ${theme.text} text-6xl font-black border-4 border-slate-100 ${theme.focusBorder} focus:bg-white transition-all shadow-inner tracking-tighter`} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {shortcuts.map((val) => (
                          <button key={val} type="button" onClick={() => setFormData({...formData, amount: val})}
                            className={`py-5 rounded-2xl border-4 font-black text-[12px] uppercase tracking-widest transition-all active:translate-y-1 ${formData.amount == val ? `${theme.bg} text-white border-slate-950 shadow-[6px_6px_0px_0px_#000]` : `bg-white text-slate-400 border-slate-100 hover:border-slate-300`}`}>
                            Rp {val.toLocaleString('id-ID')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2 italic">Encrypted Intel</label>
                      <textarea placeholder="Tulis pesan untuk agen..." className={`w-full bg-slate-50 p-8 rounded-[3rem] h-48 outline-none text-slate-900 font-bold border-4 border-slate-100 ${theme.focusBorder} focus:bg-white transition-all resize-none italic shadow-inner`} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                    </div>

                    <button type="submit" disabled={submitting} className={`w-full group ${theme.bg} text-white font-black py-10 rounded-[4rem] uppercase italic text-2xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-2 border-4 border-slate-950 transition-all hover:brightness-110 flex items-center justify-center gap-6 disabled:opacity-50`}>
                      {submitting ? 'TRANSMITTING...' : <>Initiate Support <Zap size={28} strokeWidth={3} fill="currentColor" /></>}
                    </button>
                </form>
            </div>
          </div>

          {/* HISTORY FEED */}
          <div className="lg:col-span-5">
            <div className="bg-white p-10 md:p-12 rounded-[4rem] border-4 border-slate-950 shadow-[20px_20px_0px_0px_#F8FAFF] sticky top-24">
              <h3 className="text-2xl font-black mb-14 italic uppercase tracking-tighter flex items-center gap-4 text-slate-950">
                <div className={`p-3 ${theme.bg} text-white rounded-2xl shadow-lg border-2 border-slate-950`}><History size={24} strokeWidth={3} /></div>
                Transmission Feed
              </h3>
              
              <div className="space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                {history.length > 0 ? history.map((h, i) => (
                  <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay: i * 0.05}} key={i} className={`group bg-slate-50/50 p-8 rounded-[3rem] border-4 border-slate-100 hover:border-slate-950 hover:bg-white transition-all shadow-sm`}>
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                            <p className="font-black text-slate-950 text-lg uppercase italic tracking-tight">{h.donatur_name}</p>
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-black uppercase tracking-widest bg-slate-100/50 w-fit px-3 py-1.5 rounded-full">
                                <Clock size={12} strokeWidth={3} /> {h.created_date ? new Date(h.created_date).toLocaleDateString('id-ID') : 'VORTEX'}
                            </div>
                        </div>
                        <div className={`p-2 ${theme.bgLight} ${theme.text} rounded-xl border-2 ${theme.border}`}><Zap size={14} fill="currentColor" /></div>
                    </div>
                    <p className={`text-4xl font-black ${theme.text} tracking-tighter mb-4`}>Rp {Number(h.amount).toLocaleString('id-ID')}</p>
                    {h.message && <div className="p-5 bg-white rounded-[2rem] border-2 border-slate-100 italic"><p className="text-sm text-slate-500 font-bold leading-relaxed">"{h.message}"</p></div>}
                  </motion.div>
                )) : (
                  <div className="text-center py-32 opacity-30 flex flex-col items-center gap-6">
                    <Zap size={48} className="text-slate-300 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">No Support Signal Yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DonationPage;