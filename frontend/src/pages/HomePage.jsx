import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import api from '../api/axios' 
import { 
  Sun, Moon, Play, Sparkles, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, Activity, ShieldCheck, 
  Globe, Rocket, Wallet, Monitor, Layers, Video, 
  MessageSquare, Layout, Fingerprint, ArrowRight, X, Heart, ShieldAlert
} from 'lucide-react'

// --- COMPONENT: SULTAN LOGO ---
const SkuyLogo = ({ darkMode }) => (
  <Link to="/" className="flex items-center gap-3 group cursor-pointer">
    <div className="relative">
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        className="w-12 h-12 bg-violet-600 border-4 border-slate-950 rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] transition-all"
      >
        <Zap size={24} fill="currentColor" />
      </motion.div>
    </div>
    <span className={`text-2xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-950'}`}>
      SKUY<span className="text-violet-600">.GG</span>
    </span>
  </Link>
);

// --- COMPONENT: FEATURE BLOCK ---
const FeatureBlock = ({ icon: Icon, title, desc, color, darkMode }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className={`p-10 rounded-[3rem] border-4 border-slate-950 transition-all relative overflow-hidden group ${darkMode ? 'bg-white/5 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-white shadow-[12px_12px_0px_0px_#000]'}`}
  >
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] text-white" style={{ backgroundColor: color }}>
      <Icon size={32} strokeWidth={3} />
    </div>
    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">{title}</h3>
    <p className={`text-sm font-bold italic leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700">
        <Icon size={200} />
    </div>
  </motion.div>
);

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [streamers, setStreamers] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", darkMode ? "rgba(10, 10, 12, 0.98)" : "rgba(255, 255, 255, 0.98)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(0,0,0,0)", darkMode ? "rgba(255,255,255,0.1)" : "rgba(15, 23, 42, 1)"]);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await api.get('/user/list');
        setStreamers(res.data.success ? res.data.users : res.data); 
      } catch (err) {
        setStreamers([{ id: 1, username: 'ariwirayuda', full_name: 'Ari Wirayuda', bio: 'Engine Architect' }]);
      }
    }
    fetchStreamers();
  }, []);

  const features = [
    { icon: Wallet, title: "Sultan Pay", desc: "Terima donasi secepat kilat via QRIS, E-Wallet, & Bank Transfer tanpa potongan gila.", color: "#7C3AED" },
    { icon: Monitor, title: "Overlay Hub", desc: "Widget alert OBS super estetik yang bisa lo kustomisasi sesuka hati lewat dashboard.", color: "#0F172A" },
    { icon: Video, title: "Media Share", desc: "Biarkan audiens lo memutar video YouTube favorit mereka langsung di stream lo.", color: "#EF4444" },
    { icon: Target, title: "Goal Tracker", desc: "Tunjukkan progress mimpi lo dengan Bar Milestone transparan biar Squad makin loyal.", color: "#10B981" },
    { icon: Trophy, title: "Hall of Fame", desc: "Klasemen Sultan tertinggi. Hargai mereka yang berdiri di garis terdepan dukungan.", color: "#F59E0B" },
    { icon: ShieldCheck, title: "Dual Guard", desc: "Proteksi kasta tertinggi. Login secured dengan verifikasi WhatsApp & Email Sultan.", color: "#6366F1" }
  ];

  const faqs = [
    { q: "BERAPA POTONGAN ADMINNYA, RI?", a: "Transparan banget. Kita cuma ambil biaya maintenance sistem, 95%++ masuk kantong lo langsung!" },
    { q: "DASHBOARDNYA BERAT GAK PAS STREAMING?", a: "Ringan banget! Engine kita dioptimasi buat low-latency, nggak bakal ganggu FPS game lo." },
    { q: "CARA WITHDRAW SALDO GIMANA?", a: "Klik tombol Withdraw di Wallet lo, saldo meluncur ke rekening/e-wallet secepat kilat tanpa ribet." }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0A0C] text-white' : 'bg-[#F8FAFF] text-slate-900'} transition-colors duration-500 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden relative`}>
      
      {/* --- FLOATING DECOR --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className={`absolute top-[-10%] left-[-5%] w-[600px] h-[600px] blur-[150px] rounded-full opacity-30 ${darkMode ? 'bg-violet-900' : 'bg-violet-200'}`} />
         <div className={`absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] blur-[150px] rounded-full opacity-20 ${darkMode ? 'bg-fuchsia-900' : 'bg-fuchsia-200'}`} />
      </div>

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-center">
        <motion.nav 
          style={{ backgroundColor: navBg, borderColor: navBorder }} 
          className="w-full max-w-7xl px-10 py-5 rounded-[3rem] border-4 backdrop-blur-md flex justify-between items-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <SkuyLogo darkMode={darkMode} />
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`w-12 h-12 border-2 border-slate-950 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${darkMode ? 'bg-white/10' : 'bg-slate-100'}`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <Link to="/auth" className="bg-slate-950 text-white text-[11px] font-black px-10 py-4 rounded-2xl uppercase tracking-widest shadow-[5px_5px_0px_0px_#7C3AED] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all">Launch Dashboard</Link>
          </div>
        </motion.nav>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 pt-64 pb-32 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="inline-flex items-center gap-4 bg-white dark:bg-white/5 border-4 border-slate-950 px-8 py-3 rounded-full mb-16 shadow-[8px_8px_0px_0px_#7C3AED]"
        >
          <ShieldCheck size={20} className="text-emerald-500" />
          <span className="text-[12px] font-black uppercase tracking-[0.4em] italic">Infrastructure v2.7 Sultan Node Online</span>
        </motion.div>

        <h1 className="text-6xl md:text-[150px] font-black leading-[0.8] tracking-tighter mb-16 uppercase italic">
          SULTAN <br /> 
          <span className="text-violet-600">PROTO</span>
          <span className="text-transparent" style={{ WebkitTextStroke: darkMode ? '3px #ffffff' : '3px #0f172a' }}>COL</span>
        </h1>

        <p className="text-xl md:text-3xl text-slate-500 max-w-4xl mx-auto mb-20 font-bold italic leading-relaxed">
          Platform dukungan kreator kasta tertinggi. <br />
          <span className="text-slate-950 dark:text-white underline decoration-violet-600 decoration-8 underline-offset-8 italic">Tanpa Delay. Tanpa Drama. Full Speed.</span>
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <Link to="/auth" className="w-full md:w-auto bg-violet-600 text-white font-black px-24 py-10 rounded-[3rem] shadow-[15px_15px_0px_0px_#000] border-4 border-slate-950 text-4xl uppercase italic hover:translate-y-[-5px] active:translate-y-2 active:shadow-none transition-all">Start Now</Link>
            <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/5 border-4 border-slate-950 rounded-[2rem] shadow-[6px_6px_0px_0px_#000]">
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-950 bg-violet-200" />)}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest italic">+2.4k Elite Squad Joined</p>
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID (COMPLITE) --- */}
      <section className="max-w-7xl mx-auto px-6 py-40 relative z-10">
        <div className="flex flex-col items-center mb-24">
            <h2 className="text-6xl font-black italic uppercase tracking-tighter text-center">Sultan <span className="text-violet-600">Modules</span></h2>
            <div className="w-32 h-3 bg-violet-600 mt-6 rounded-full shadow-[4px_4px_0px_0px_#000]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((f, i) => (
            <FeatureBlock key={i} {...f} darkMode={darkMode} />
          ))}
        </div>
      </section>

      {/* --- ELITE SQUAD (REAL FACE SYNC) --- */}
      <section className="bg-slate-950 py-40 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><Rocket size={400} /></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="text-left">
                <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-4">Elite <span className="text-violet-600">Squad</span></h2>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] italic leading-none">Verified Sultan Node Connectors</p>
            </div>
            <Link to="/auth" className="flex items-center gap-4 text-sm font-black uppercase italic tracking-widest text-violet-400 hover:text-white transition-colors group">
                JOIN THE ELITE <ArrowRight className="group-hover:translate-x-3 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-left">
            {streamers.slice(0, 8).map((s) => (
              <motion.div key={s.id} whileHover={{ y: -15, rotate: 2 }} className="group p-10 rounded-[3.5rem] border-4 border-white/10 bg-white/5 hover:bg-white/10 hover:border-violet-600 transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="w-24 h-24 bg-slate-800 rounded-3xl mb-10 overflow-hidden border-4 border-slate-950 shadow-[6px_6px_0px_0px_#7C3AED] relative">
                  <img 
                    src={s.profile_picture ? `https://skuyproject-production.up.railway.app/uploads/${s.profile_picture}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    alt={s.username}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
                  />
                </div>
                <h3 className="text-3xl font-black italic mb-2 uppercase tracking-tighter leading-none">{s.full_name || s.username}</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-10 italic">Elite Node #{s.id + 100}</p>
                <Link to={`/${s.username}`} className="inline-flex items-center gap-3 text-[10px] font-black uppercase text-violet-400 tracking-[0.2em] group">
                  INSPECT <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SULTAN --- */}
      <section className="max-w-4xl mx-auto px-6 py-40">
        <div className="flex items-center gap-6 mb-24 justify-center">
            <div className="p-5 bg-violet-600 text-white rounded-[1.5rem] skuy-border skuy-shadow"><HelpCircle size={40} strokeWidth={3} /></div>
            <h2 className="text-6xl font-black italic uppercase tracking-tighter">Sultan <span className="text-violet-600">Intel</span></h2>
        </div>
        <div className="space-y-6">
          {faqs.map((item, i) => (
            <details 
                key={i} 
                onToggle={(e) => setActiveFaq(e.target.open ? i : null)}
                className={`group p-10 rounded-[2.5rem] border-4 border-slate-950 transition-all cursor-pointer ${darkMode ? 'bg-white/5 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-white shadow-[10px_10px_0px_0px_#000]'}`}
            >
              <summary className="font-black italic uppercase text-2xl list-none flex justify-between items-center group-open:text-violet-600 transition-colors tracking-tighter">
                {item.q} <ChevronDown className={`transition-transform duration-500 ${activeFaq === i ? 'rotate-180' : ''}`} size={30} strokeWidth={3} />
              </summary>
              <p className="mt-8 pt-8 border-t-4 border-slate-100 dark:border-white/5 font-bold italic text-slate-500 text-xl leading-relaxed">
                "{item.a}"
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* --- FOOTER (PROPORTIONAL & SLEEK) --- */}
      <footer className={`py-20 border-t-8 border-slate-950 transition-colors ${darkMode ? 'bg-[#0A0A0C]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left space-y-6">
            <SkuyLogo darkMode={darkMode} />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Built for the next-generation creator squad.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-10">
            {['Discord', 'Twitter', 'Instagram', 'Docs'].map(link => (
                <a key={link} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-violet-600 transition-colors italic underline decoration-2 decoration-transparent hover:decoration-violet-600">{link}</a>
            ))}
          </div>

          <div className="text-center md:text-right space-y-4">
             <Link to="/auth" className="inline-block bg-slate-950 text-white px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-[6px_6px_0px_0px_#7C3AED] hover:translate-y-[-4px] active:translate-y-1 active:shadow-none transition-all">Gass Dashboard</Link>
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2026 Skuy.GG Engine • Crafted in Karawang</p>
          </div>
        </div>
      </footer>

      {/* --- SULTAN STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; cursor: crosshair; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${darkMode ? '#000' : '#f8faff'}; }
        ::-webkit-scrollbar-thumb { background: #7C3AED; border: 3px solid ${darkMode ? '#000' : '#f8faff'}; border-radius: 100px; }
        ::selection { background-color: #7C3AED; color: white; }
      `}</style>
    </div>
  )
}

export default HomePage;