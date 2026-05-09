import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import api from '../api/axios' 
import { 
  Sun, Moon, Sparkles, ArrowRight, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, ShieldCheck, Wallet, Monitor, Video, Gamepad2
} from 'lucide-react'

const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

// --- COMPONENT: SULTAN LOGO ---
const SkuyLogo = ({ darkMode }) => (
  <Link to="/" className="flex items-center gap-3 group cursor-pointer">
    <div className="relative">
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ type: "spring", ...springConfig }}
        className="w-12 h-12 bg-violet-600 border-4 border-slate-950 rounded-2xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000]"
      >
        <Zap size={24} fill="currentColor" />
      </motion.div>
    </div>
    <span className={`text-2xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-950'}`}>
      SKUY<span className="text-violet-600">.GG</span>
    </span>
  </Link>
);

// --- COMPONENT: REVEAL ON SCROLL ---
const Reveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

// --- COMPONENT: FAQ ACCORDION ---
const FAQItem = ({ question, answer, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
      layout
      className={`mb-4 rounded-[2rem] border-4 border-slate-950 overflow-hidden transition-all ${darkMode ? 'bg-slate-900/50 border-white/10' : 'bg-white shadow-[8px_8px_0px_0px_#000]'}`}
    >
      <motion.button 
        layout
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-8 flex justify-between items-center text-left outline-none group"
      >
        <span className="font-black italic uppercase tracking-tight text-lg group-hover:text-violet-600 transition-colors">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", ...springConfig }}>
          <ChevronDown size={24} className="text-violet-600" strokeWidth={3} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 pb-8">
            <p className="text-sm text-slate-400 font-bold italic leading-relaxed border-t-2 border-slate-100 dark:border-white/5 pt-6">"{answer}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [streamers, setStreamers] = useState([]);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, springConfig);
  const navBg = useTransform(scrollYProgress, [0, 0.05], ["rgba(255, 255, 255, 0)", darkMode ? "rgba(10, 10, 14, 0.95)" : "rgba(255, 255, 255, 0.95)"]);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await api.get('/user/list');
        const data = res.data.success ? res.data.users : (Array.isArray(res.data) ? res.data : []);
        setStreamers(data); 
      } catch (err) {
        setStreamers([{ id: 1, username: 'ariwirayuda', full_name: 'Ari Wirayuda', bio: 'Engine Architect' }]);
      }
    }
    fetchStreamers()
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0e] text-white' : 'bg-[#F8FAFF] text-slate-900'} transition-colors duration-700 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden relative`}>
      
      {/* PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-violet-600 z-[1000] origin-left" style={{ scaleX }} />

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-center">
        <motion.nav 
          style={{ backgroundColor: navBg }} 
          className={`w-full max-w-7xl px-8 py-4 rounded-[2.5rem] border-4 border-slate-950 backdrop-blur-md flex justify-between items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all`}
        >
          <SkuyLogo darkMode={darkMode} />
          <div className="flex items-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className="w-11 h-11 border-2 border-slate-950 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </motion.button>
            <Link to="/auth" className="bg-slate-950 text-white text-[10px] font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-violet-600 transition-all shadow-[4px_4px_0px_0px_#7C3AED]">Join Squad</Link>
          </div>
        </motion.nav>
      </div>

      {/* --- HERO --- */}
      <section className="max-w-7xl mx-auto px-6 pt-64 pb-32 text-center relative z-10">
        <Reveal>
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-flex items-center gap-3 bg-white dark:bg-white/5 border-4 border-slate-950 px-6 py-2.5 rounded-full mb-12 shadow-[6px_6px_0px_0px_#7C3AED]"
          >
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Infrastructure Node v3.1 Online</span>
          </motion.div>

          <h1 className="text-6xl md:text-[140px] font-black leading-[0.8] tracking-tighter mb-14 uppercase italic">
            MAKIN <br />
            <span className="text-violet-600">PRO </span> 
            <span className="text-transparent" style={{ WebkitTextStroke: darkMode ? '2px #ffffff' : '2px #0f172a' }}>NGONTEN</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto mb-20 font-bold italic leading-relaxed">
            Naikkan level stream lo ke kasta Sultan. <br />
            <span className={`${darkMode ? 'text-white' : 'text-slate-950'} underline decoration-violet-500 decoration-4 italic`}>Otomatis, Transparan, & Tanpa Potongan Gila.</span>
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/auth" className="inline-block bg-violet-600 text-white font-black px-16 py-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 text-2xl uppercase italic transition-all hover:bg-slate-950">MULAI SEKARANG</Link>
          </motion.div>
        </Reveal>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative z-10 text-center">
        {/* Copywriting Fitur (CENTERED & REFINED) */}
        <Reveal>
          <div className="mb-24 flex flex-col items-center space-y-6">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-16 h-16 bg-violet-600 text-white rounded-3xl flex items-center justify-center border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]"
            >
              <Gamepad2 size={32} />
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">THE <span className="text-violet-600">SULTAN</span> PROTOCOL</h2>
            <p className="text-lg md:text-xl font-bold text-slate-400 italic max-w-2xl mx-auto">
              Bangun ekosistem donasi lo sendiri. Lebih dari sekadar overlay, ini adalah bukti nyata kalau stream lo beneran <span className={darkMode ? 'text-white' : 'text-slate-950'}>berkelas dunia.</span>
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 text-left">
          <motion.div whileHover={{ y: -10 }} className={`md:col-span-8 p-12 rounded-[4rem] border-4 border-slate-950 relative overflow-hidden transition-all ${darkMode ? 'bg-slate-900 shadow-[10px_10px_0px_0px_rgba(124,58,237,0.2)]' : 'bg-white shadow-[15px_15px_0px_0px_#7C3AED]'}`}>
            <div className="flex justify-between items-start mb-20 relative z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 bg-slate-950 text-white px-4 py-2 rounded-full w-fit">
                   <Zap size={12} className="text-violet-400" />
                   <span className="text-[9px] font-black uppercase tracking-widest italic">Fast Payout</span>
                </div>
                <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none">Smart <br /> <span className="text-violet-600">Donation</span></h3>
              </div>
              <div className="p-8 bg-violet-600 text-white rounded-[2.5rem] shadow-[6px_6px_0px_0px_#000] rotate-12 border-4 border-slate-950"><Wallet size={50} /></div>
            </div>
            <p className="text-slate-500 font-bold text-lg italic max-w-md leading-relaxed relative z-10">Duit masuk langsung cair ke e-wallet lo. Gak pake nunggu lama, gak pake drama admin.</p>
            <Gamepad2 size={200} className="absolute -bottom-10 -right-10 opacity-[0.05] text-slate-400 rotate-12" />
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="md:col-span-4 p-12 rounded-[4rem] border-4 border-slate-950 bg-slate-950 text-white flex flex-col justify-between shadow-[15px_15px_0px_0px_rgba(255,255,255,0.1)] group overflow-hidden relative">
            <div className="space-y-6 relative z-10">
               <Monitor size={40} className="text-violet-500" />
               <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">Overlay <br/> Master</h3>
            </div>
            <p className="text-slate-400 font-bold italic mt-10 relative z-10">Atur visual stream lo semudah drag-and-drop. Kustomisasi kasta Sultan buat penonton betah.</p>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className={`md:col-span-6 p-12 rounded-[4rem] border-4 border-slate-950 flex flex-col justify-between transition-all ${darkMode ? 'bg-slate-900 border-red-500/20 shadow-[15px_15px_0px_0px_rgba(239,68,68,0.2)]' : 'bg-white shadow-[15px_15px_0px_0px_#EF4444]'}`}>
             <div className="space-y-6">
                <Video size={40} className="text-red-500" />
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">Media <br /> <span className="text-red-500">Share</span></h3>
             </div>
             <p className="text-slate-500 font-bold italic mt-10">Biarkan fans lo yang jadi DJ. Putar video favorit mereka lewat donasi interaktif secara live.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className={`md:col-span-6 p-12 rounded-[4rem] border-4 border-slate-950 flex flex-col justify-between transition-all ${darkMode ? 'bg-slate-900 border-emerald-500/20 shadow-[15px_15px_0px_0px_rgba(16,185,129,0.2)]' : 'bg-slate-950 text-white shadow-[15px_15px_0px_0px_#10B981]'}`}>
             <div className="space-y-6">
                <Target size={40} className="text-emerald-500" />
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">Goal <br /> <span className="text-emerald-500">Tracker</span></h3>
             </div>
             <p className="text-slate-400 font-bold italic mt-10">Tunjukkan ambisi lo. Pantau target donasi secara real-time dengan bar progres yang gahar.</p>
          </motion.div>
        </div>
      </section>

      {/* --- ELITE SQUAD --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 text-center">
        <Reveal>
          <div className="flex flex-col items-center mb-24">
             <div className="w-20 h-2 bg-violet-600 rounded-full mb-8 shadow-lg" />
             <h2 className="text-7xl font-black italic uppercase tracking-tighter">ELITE <span className="text-violet-600">SQUAD</span></h2>
             <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px] mt-4 italic">Verified Creators on Railway Node</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          {streamers.slice(0, 8).map((s, i) => (
            <motion.div 
              key={s.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -15 }}
              className={`group p-10 rounded-[3.5rem] border-4 border-slate-950 transition-all ${darkMode ? 'bg-slate-900 shadow-[10px_10px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-white shadow-[10px_10px_0px_0px_#F1F5F9] hover:shadow-[12px_12px_0px_0px_#7C3AED]'}`}
            >
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] mb-10 overflow-hidden border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000]">
                <img 
                  src={s.profile_picture ? `https://skuyproject-production.up.railway.app/uploads/${s.profile_picture}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  alt={s.username}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
                />
              </div>
              <h3 className="text-3xl font-black italic mb-3 uppercase tracking-tighter leading-none">{s.full_name || s.username}</h3>
              <p className="text-slate-400 text-[11px] font-bold mb-10 italic truncate">"Verified Elite Node"</p>
              <Link to={`/${s.username}`} className="inline-flex items-center gap-3 text-xs font-black uppercase text-violet-600 tracking-widest group">
                INSPECT <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="max-w-4xl mx-auto px-6 py-40">
        <Reveal>
          <div className="flex flex-col items-center space-y-6 mb-20">
            <div className="p-5 bg-violet-600 text-white rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]"><HelpCircle size={32} strokeWidth={2.5}/></div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter">SULTAN <span className="text-violet-600">INTEL</span></h2>
          </div>
        </Reveal>
        <FAQItem darkMode={darkMode} question="Potongan adminnya berapa, Ri?" answer="Gak usah pusing. Skuy.GG pake sistem fee paling rendah cuma buat maintenance server. 95%++ donasi masuk kantong lo." />
        <FAQItem darkMode={darkMode} question="Keamanannya beneran terjamin?" answer="Shield kita pake Dual-OTP WhatsApp + Email. Database kita di Railway Cloud dengan enkripsi kasta tertinggi. Akun lo aman di markas pusat." />
        <FAQItem darkMode={darkMode} question="Support pembayaran apa aja?" answer="Semua QRIS, E-Wallet (Dana, OVO, GoPay), sampe Bank Transfer Sultan kita sikat habis tanpa delay!" />
      </section>

      {/* --- FOOTER SULTAN (VIOLET EDITION) --- */}
      <footer className="bg-violet-600 text-white border-t-8 border-slate-950 py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 rotate-12 scale-150 pointer-events-none">
           <Zap size={300} fill="white" />
        </div>
        
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
               <div className="w-10 h-10 bg-white text-violet-600 rounded-xl flex items-center justify-center border-2 border-slate-950 shadow-[3px_3px_0px_0px_#000]">
                  <Zap size={20} fill="currentColor" />
               </div>
               <span className="text-2xl font-black italic tracking-tighter uppercase text-white">SKUY.GG</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-100 italic">Built for the next-gen creator squad.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-12">
            <div className="text-center md:text-right">
              <h5 className="text-[9px] font-black text-violet-950 uppercase mb-4 tracking-widest italic">Connect Markas</h5>
              <div className="flex gap-6 font-black text-xs uppercase italic text-white">
                <a href="#" className="hover:text-violet-950 transition-colors">Twitter</a>
                <a href="#" className="hover:text-violet-950 transition-colors">Instagram</a>
                <a href="#" className="hover:text-violet-950 transition-colors">Discord</a>
              </div>
            </div>
            <Link to="/auth" className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-1 transition-all border-4 border-slate-950 text-[11px]">Join Dashboard</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-10 mt-16 pt-8 border-t-2 border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[0.5em] text-violet-100 italic relative z-10">
           <p>© 2026 Skuy.GG Engine • Karawang Industrial Pride</p>
           <p className="md:ml-auto">Engineered by Ari Wirayuda</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; cursor: crosshair; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: ${darkMode ? '#0a0a0e' : '#f8faff'}; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border: 3px solid ${darkMode ? '#0a0a0e' : '#f8faff'}; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default HomePage;