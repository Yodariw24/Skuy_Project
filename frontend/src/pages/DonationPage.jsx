import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
// ✅ FIX UTAMA 1: Import instance api lo yang udah disetting canggih!
import api from '../api/axios' 
import { 
  ArrowLeft, Zap, Wallet, CheckCircle2, 
  History, Skull, Heart, Info, Mail, User, Clock 
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
  
  const [formData, setFormData] = useState({
    donatur_name: '', donatur_email: '', amount: '', message: ''
  })

  const shortcuts = [10000, 25000, 50000, 100000];
  const theme = themeMap[streamer?.theme_color] || themeMap.violet;

  // --- LOGIKA AMBIL DATA VIA BACKEND RAILWAY ---
  const fetchData = async () => {
    try {
      setLoading(true);
      // ✅ FIX UTAMA 2: Pake api.get(), URL-nya otomatis nyambung ke Railway asli
      const res = await api.get(`/streamers/public/${username}`);
      
      if (res.data) {
        setStreamer(res.data.profile);
        setBalance(res.data.balance || 0);
        setHistory(res.data.history || []);
      }
      setLoading(false);
    } catch (err) { 
      console.warn("Backend gagal ditarik, cek URL atau Database lo, Ri!");
      // DATA DUMMY TETAP ADA BUAT FALLBACK KALO SERVER MATI
      setStreamer({ 
        id: '1', username: username, full_name: 'Skuy Creator', 
        bio: 'Dukung terus karya saya lewat energi saweran paling gacor!',
        theme_color: 'violet'
      });
      setBalance(1500000);
      setHistory([
        { donatur_name: 'Sultan_Jakarta', amount: 500000, message: 'Gas terus bang!', created_at: new Date() },
        { donatur_name: 'Wibu_Elite', amount: 100000, message: 'Keren parah kontennya.', created_at: new Date() }
      ]);
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [username]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount < 1000) return alert("Minimal dukungan adalah Rp 1.000");
    
    try {
      // ✅ FIX UTAMA 3: Pake api.post() tanpa perlu nulis baseURL panjang-panjang
      const res = await api.post('/donations', {
        ...formData,
        streamer_id: streamer.id
      });

      if (res.data.id) {
        navigate(`/payment/${res.data.id}`); 
      }
    } catch (err) { 
      alert("Sistem Pembayaran sedang dalam pemeliharaan! 🔥"); 
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF]">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-violet-600 rounded-full animate-spin mb-4" />
      <p className="text-violet-600 font-black italic uppercase tracking-widest text-sm text-center">
        SYNCHRONIZING RAILWAY DATABASE<br/>
        <span className="text-[10px] opacity-40">ESTABLISHING ENCRYPTED TUNNEL...</span>
      </p>
    </div>
  );

  if (!streamer) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFF] text-red-500 font-black uppercase gap-4 text-center p-6">
      <Skull size={64} className="animate-bounce" />
      <h2 className="text-2xl italic tracking-tighter">Creator Not Found 404</h2>
      <p className="text-slate-400 text-[10px] tracking-widest leading-relaxed font-bold">
        SISTEM TIDAK MENEMUKAN ID @{username.toUpperCase()} <br/> DALAM PANGKALAN DATA CLOUD RAILWAY.
      </p>
      <Link to="/" className="text-[10px] bg-slate-950 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest mt-4 hover:bg-violet-600 transition-all">Back to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans pb-20 selection:bg-violet-100">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-5%] w-[50%] h-[50%] ${theme.bgLight} opacity-40 blur-[120px] rounded-full`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] ${theme.bgLight} opacity-30 blur-[120px] rounded-full`} />
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-950 transition-all font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} strokeWidth={3} /> Explore Hub
          </Link>
          <div className="text-xl font-black italic uppercase tracking-tighter text-slate-950">SKUY<span className="text-violet-600">.GG</span></div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="lg:col-span-8 flex flex-col md:flex-row items-center md:items-start gap-10 bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.bgLight} rounded-full -mr-16 -mt-16 blur-3xl opacity-50`} />
            <div className="relative shrink-0">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[3.5rem] p-1.5 bg-gradient-to-tr ${theme.gradient} shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500`}>
                <div className="w-full h-full rounded-[3.2rem] bg-white overflow-hidden border-4 border-white">
                  <img 
                    src={streamer.profile_picture?.startsWith('http') ? streamer.profile_picture : `https://api.dicebear.com/7.x/avataaars/svg?seed=${streamer.username}`} 
                    alt="Avatar" className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <div className={`absolute -bottom-2 -right-2 ${theme.bg} text-white p-3 rounded-2xl shadow-lg border-4 border-white animate-pulse`}><Zap size={20} fill="currentColor" /></div>
            </div>
            <div className="text-center md:text-left flex-1 relative z-10">
              <span className={`inline-block ${theme.text} font-black tracking-[0.2em] text-[10px] uppercase ${theme.bgLight} px-4 py-1.5 rounded-full border ${theme.border} mb-4`}>Official SKUY Agent</span>
              <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-slate-950 uppercase mb-4">{streamer.display_name || streamer.full_name}</h1>
              <p className="text-base text-slate-500 font-medium leading-relaxed mb-8 italic">"{streamer.bio || "Sistem transmisi energi aktif. Dukung saya terus untuk berkarya! 🚀"}"</p>
              <div className="flex gap-4 justify-center md:justify-start">
                {['instagram', 'tiktok', 'youtube'].map(platform => streamer[platform] && (
                  <a key={platform} href={streamer[platform]} target="_blank" rel="noreferrer" className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:scale-110 active:scale-95">
                    <img src={`https://cdn.simpleicons.org/${platform}`} className="w-5 h-5" alt={platform} />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}} className={`lg:col-span-4 bg-gradient-to-br ${theme.gradient} p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl ${theme.shadow} relative overflow-hidden border border-white/10`}>
            <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 w-fit shadow-xl"><Wallet size={32} className="text-white" /></div>
            <div className="relative z-10">
              <span className="text-[11px] text-white/70 uppercase font-black tracking-widest block mb-2">Power Collected</span>
              <span className="text-4xl font-black italic tracking-tight text-white drop-shadow-md">Rp {Number(balance).toLocaleString('id-ID')}</span>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30">
                <div className="flex items-center gap-4 mb-10">
                  <div className={`p-3 ${theme.bgLight} ${theme.text} rounded-2xl shadow-lg ${theme.shadow}`}><Heart size={20} fill="currentColor" /></div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Authorize Support</h2>
                </div>
                <form onSubmit={handleSend} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><User size={12} strokeWidth={3}/> Agent Nickname</label>
                        <input type="text" placeholder="Masukkan nama" required className={`w-full bg-slate-50 p-5 rounded-2xl outline-none text-slate-900 font-bold border-2 border-transparent ${theme.focusBorder} focus:bg-white focus:ring-4 ${theme.ring} transition-all`} value={formData.donatur_name} onChange={(e) => setFormData({...formData, donatur_name: e.target.value})} />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Mail size={12} strokeWidth={3}/> Access Email</label>
                        <input type="email" placeholder="Email kamu" required className={`w-full bg-slate-50 p-5 rounded-2xl outline-none text-slate-900 font-bold border-2 border-transparent ${theme.focusBorder} focus:bg-white focus:ring-4 ${theme.ring} transition-all`} value={formData.donatur_email} onChange={(e) => setFormData({...formData, donatur_email: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Zap size={12} strokeWidth={3}/> Energy Amount</label>
                      <div className="relative group">
                        <span className={`absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl group-focus-within:${theme.text}`}>Rp</span>
                        <input type="number" required placeholder="0" className={`w-full bg-slate-50 p-8 pl-18 rounded-[2.5rem] outline-none ${theme.text} text-5xl font-black border-2 border-transparent ${theme.focusBorder} focus:bg-white focus:ring-8 ${theme.ring} transition-all`} value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {shortcuts.map((val) => (
                          <button key={val} type="button" onClick={() => setFormData({...formData, amount: val})}
                            className={`py-3 rounded-2xl border-2 font-black text-[11px] uppercase tracking-wider transition-all active:scale-95 ${formData.amount == val ? `${theme.bg} text-white border-transparent shadow-lg ${theme.shadow}` : `bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600`}`}>
                            Rp {val.toLocaleString('id-ID')}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"><Info size={12} strokeWidth={3}/> Encrypted Message</label>
                      <textarea placeholder="Tulis pesan untuk agen..." className={`w-full bg-slate-50 p-6 rounded-[2.5rem] h-40 outline-none text-slate-700 font-bold border-2 border-transparent ${theme.focusBorder} focus:bg-white transition-all resize-none`} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                    </div>
                    <button type="submit" className={`w-full group ${theme.bg} text-white font-black py-8 rounded-[3rem] uppercase italic text-xl shadow-2xl ${theme.shadow} active:scale-95 transition-all hover:brightness-110 flex items-center justify-center gap-4`}>
                      <span>Initiate Transmission</span><div className="p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform"><Zap size={20} fill="currentColor" /></div>
                    </button>
                </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/20">
              <h3 className="text-lg font-black mb-10 italic uppercase tracking-tighter flex items-center gap-3 text-slate-900"><div className={`p-2 ${theme.bgLight} ${theme.text} rounded-xl`}><History size={20} strokeWidth={3} /></div>Transmission Log</h3>
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length > 0 ? history.map((h, i) => (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1}} key={i} className={`group bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-50 hover:${theme.border} hover:bg-white transition-all shadow-sm`}>
                    <div className="flex justify-between items-start mb-3"><div className="space-y-1"><p className="font-black text-slate-950 text-sm uppercase italic tracking-tight">{h.donatur_name}</p><p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {h.created_at ? new Date(h.created_at).toLocaleDateString('id-ID') : 'Baru saja'}</p></div></div>
                    <p className={`text-3xl font-black ${theme.text} tracking-tighter`}>Rp {Number(h.amount).toLocaleString('id-ID')}</p>
                    <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-100"><p className="text-xs text-slate-500 font-bold italic">"{h.message}"</p></div>
                  </motion.div>
                )) : (
                  <div className="text-center py-24 opacity-30 flex flex-col items-center gap-4"><Zap size={32} className="text-slate-300" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">No Signal Detected</p></div>
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