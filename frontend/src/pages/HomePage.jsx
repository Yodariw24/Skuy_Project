import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import api from '../api/axios' 
import { 
  Sun, Moon, Play, Sparkles, 
  Heart, ArrowRight, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, Activity, ShieldCheck, 
  Globe, Rocket, Wallet, Monitor, Layers
} from 'lucide-react'

// --- LOGO COMPONENT: SULTAN ZAP ---
const SkuyLogo = ({ darkMode }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative">
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-12 h-12 bg-violet-600 border-4 border-slate-950 rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[2px_2px_0px_0px_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all"
      >
        <Zap size={24} fill="currentColor" />
      </motion.div>
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-pulse" />
    </div>
    <span className={`text-2xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-950'}`}>
      SKUY<span className="text-violet-600">.GG</span>
    </span>
  </div>
);

// --- COMPONENT: FEATURE BADGE ---
const Badge = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-full border-2 border-white/10 shadow-lg">
    <Icon size={12} className="text-violet-400" />
    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{text}</span>
  </div>
);

// --- COMPONENT: FAQ ACCORDION ---
const FAQItem = ({ question, answer, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`mb-4 rounded-[2rem] border-4 border-slate-950 transition-all ${darkMode ? 'bg-white/5 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]' : 'bg-white shadow-[8px_8px_0px_0px_#000]'} overflow-hidden`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-8 flex justify-between items-center text-left outline-none group">
        <span className="font-black italic uppercase tracking-tight text-lg leading-none group-hover:text-violet-600 transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="bg-slate-100 p-2 rounded-xl dark:bg-white/10">
          <ChevronDown size={20} className="text-violet-600" strokeWidth={3} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8">
            <p className="text-sm text-slate-500 font-bold italic leading-relaxed border-t-2 border-slate-100 dark:border-white/5 pt-6">"{answer}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [streamers, setStreamers] = useState([]);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", darkMode ? "rgba(10, 10, 12, 0.95)" : "rgba(255, 255, 255, 0.95)"]);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await api.get('/api/user/list');
        setStreamers(Array.isArray(res.data) ? res.data : []); 
      } catch (err) {
        setStreamers([{ id: 1, username: 'ariwirayuda', full_name: 'Ari Wirayuda', bio: 'Engine Architect Skuy.GG', profile_picture: null }]);
      }
    }
    fetchStreamers()
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0A0C] text-white' : 'bg-[#F8FAFF] text-slate-900'} transition-colors duration-500 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden relative`}>
      
      {/* --- BACKGROUND NODES --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity }}
          className={`absolute top-[-20%] left-[-10%] w-[80%] h-[80%] ${darkMode ? 'bg-violet-900/10' : 'bg-violet-200/30'} blur-[150px] rounded-full`} 
        />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] ${darkMode ? 'bg-fuchsia-900/10' : 'bg-fuchsia-100/30'} blur-[150px] rounded-full`} />
      </div>

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-center">
        <motion.nav style={{ backgroundColor: navBg }} className="w-full max-w-7xl px-8 py-4 rounded-[2.5rem] border-4 border-slate-950 backdrop-blur-2xl flex justify-between items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <SkuyLogo darkMode={darkMode} />
          
          <div className="hidden lg:flex items-center gap-10">
            {['Features', 'Elite Squad', 'Pricing', 'Docs'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-violet-600 transition-colors">{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="w-11 h-11 border-2 border-slate-950 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-all shadow-[3px_3px_0px_0px_#000]">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <Link to="/auth" className="bg-slate-950 text-white text-[10px] font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-violet-600 shadow-[4px_4px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all">Launch Dashboard</Link>
          </div>
        </motion.nav>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 pt-64 pb-32 text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-3 bg-white dark:bg-white/5 border-4 border-slate-950 px-6 py-2.5 rounded-full mb-12 shadow-[6px_6px_0px_0px_#7C3AED]">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Infrastructure Node v2.3 Online</span>
        </motion.div>

        <h1 className="text-6xl md:text-[140px] font-black leading-[0.8] tracking-tighter mb-14 uppercase italic">
          REVOLUSI <br />
          <span className="text-violet-600">SULTAN </span> 
          <span className="text-transparent" style={{ WebkitTextStroke: darkMode ? '2px #ffffff' : '2px #0f172a' }}>KONTEN</span>
        </h1>

        <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto mb-20 font-bold italic leading-relaxed">
          Platform dukungan kreator paling secured di Indonesia. <br />
          <span className="text-slate-950 dark:text-white underline decoration-violet-500 decoration-4">Zero delays, Zero drama, Full power.</span>
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link to="/auth" className="w-full md:w-auto bg-violet-600 text-white font-black px-16 py-8 rounded-[2rem] shadow-[12px_12px_0px_0px_#000] hover:bg-slate-950 transition-all text-2xl uppercase italic active:translate-y-2 active:shadow-none">Gabung Squad Kuy</Link>
          <div className="flex items-center gap-4 px-8 py-4 bg-white dark:bg-white/5 border-4 border-slate-950 rounded-2xl">
            <div className="flex -space-x-4">
              {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />)}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">+2.4k Sultan Active</p>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <motion.div whileHover={{ y: -10 }} className={`md:col-span-8 p-14 rounded-[4rem] border-4 border-slate-950 relative overflow-hidden transition-all ${darkMode ? 'bg-white/5' : 'bg-white shadow-[15px_15px_0px_0px_#7C3AED]'}`}>
            <div className="flex justify-between items-start mb-20">
              <div className="space-y-6">
                <Badge icon={Zap} text="Lightning Transaction" />
                <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Smart <br /> <span className="text-violet-600">Donation</span></h3>
              </div>
              <div className="p-8 bg-violet-600 text-white rounded-[2.5rem] shadow-[6px_6px_0px_0px_#000] rotate-12">
                <Wallet size={50} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-10">
               {['QRIS Ready', 'Instant Withdraw', 'Zero Cut'].map(t => (
                 <div key={t} className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-xl font-black text-[10px] uppercase italic">{t}</div>
               ))}
            </div>
            <p className="text-slate-500 font-bold text-lg italic max-w-md">Terima energi dukungan secepat kilat dengan notifikasi real-time di layar stream lo.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="md:col-span-4 p-14 rounded-[4rem] border-4 border-slate-950 bg-slate-950 text-white flex flex-col justify-between shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
              <Monitor size={250} />
            </div>
            <div className="space-y-6 relative z-10">
               <Badge icon={Monitor} text="OBS Protocol" />
               <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">Overlay <br/> Master</h3>
            </div>
            <p className="text-slate-400 font-bold italic relative z-10 mt-10">Widget alert paling estetik yang bisa lo kustomisasi sesuka hati lewat dashboard.</p>
          </motion.div>

        </div>
      </section>

      {/* --- ELITE SQUAD --- */}
      <section id="elite squad" className="max-w-7xl mx-auto px-6 py-32 text-center">
        <div className="flex flex-col items-center mb-24">
           <div className="w-20 h-2 bg-violet-600 rounded-full mb-8" />
           <h2 className="text-7xl font-black italic uppercase tracking-tighter">ELITE <span className="text-violet-600">SQUAD</span></h2>
           <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px] mt-4">Verified Creators on Railway Node</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          {streamers.map((s) => (
            <motion.div key={s.id} whileHover={{ y: -15, rotate: 1 }} className={`group p-10 rounded-[3.5rem] border-4 border-slate-950 transition-all ${darkMode ? 'bg-white/5 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-white shadow-[10px_10px_0px_0px_#F1F5F9] hover:shadow-[10px_10px_0px_0px_#7C3AED]'}`}>
              <div className="w-24 h-24 bg-slate-100 dark:bg-white/10 rounded-[2rem] mb-10 overflow-hidden border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] relative">
                <img 
                  src={s.profile_picture ? `https://skuyproject-production.up.railway.app/uploads/${s.profile_picture}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                  alt={s.username}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
                />
              </div>
              <h3 className="text-3xl font-black italic mb-3 uppercase tracking-tighter leading-none">{s.full_name || s.username}</h3>
              <p className="text-slate-400 text-[11px] font-bold mb-10 italic line-clamp-2 leading-relaxed">"{s.bio || 'Elite Creator SkuyGG'}"</p>
              <Link to={`/${s.username}`} className="inline-flex items-center gap-3 text-xs font-black uppercase text-violet-600 tracking-widest group">
                INSPECT PROFILE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="max-w-4xl mx-auto px-6 py-40">
        <div className="flex items-center gap-6 mb-20 justify-center">
          <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#7C3AED]">
            <HelpCircle size={32} strokeWidth={2.5}/>
          </div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">SULTAN <span className="text-violet-600">INTEL</span></h2>
        </div>
        <FAQItem darkMode={darkMode} question="Potongan adminnya berapa, Ri?" answer="Di Skuy.GG kita pake sistem transparan. Potongan minimal cuma buat biaya payment gateway, sisanya full masuk kantong lo!" />
        <FAQItem darkMode={darkMode} question="Aman gak nih buat jangka panjang?" answer="Udah Dual-OTP WhatsApp + Email Sultan. Database kita di Railway Cloud dengan enkripsi kasta tertinggi." />
        <FAQItem darkMode={darkMode} question="Cara narik duitnya gimana?" answer="Klik Withdraw di dashboard, duit langsung meluncur ke Rekening atau E-Wallet lo secepat kilat!" />
      </section>

      {/* --- FOOTER SULTAN --- */}
      <footer className="relative bg-violet-600 text-white overflow-hidden py-40 border-t-8 border-slate-950">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="grid grid-cols-6 gap-10 rotate-12 scale-150">
              {[...Array(24)].map((_, i) => <Zap key={i} size={100} />)}
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-10 relative z-10 flex flex-col items-center">
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="mb-12">
            <Rocket size={80} strokeWidth={2.5} />
          </motion.div>
          <h2 className="text-7xl md:text-[140px] font-black italic uppercase leading-[0.7] mb-16 tracking-tighter text-center">
            GAK USAH<br/>LAMA-LAMA
          </h2>
          <Link to="/auth" className="bg-white text-slate-950 font-black px-20 py-10 rounded-[2rem] text-3xl uppercase italic shadow-[10px_10px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all">START NOW</Link>
          
          <div className="w-full mt-40 pt-10 border-t-4 border-black/20 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-black uppercase tracking-[0.4em]">
             <p>© 2026 Skuy.GG Engine • Karawang Industrial Pride</p>
             <div className="flex gap-10">
                <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
                <a href="#" className="hover:text-slate-900 transition-colors">Discord</a>
             </div>
          </div>
        </div>
      </footer>

      {/* --- GLOBAL RESET --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; cursor: crosshair; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #6d28d9; border: 3px solid #000; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default HomePage;