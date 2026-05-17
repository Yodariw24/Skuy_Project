import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import api from '../api/axios' 
import { 
  Sun, Moon, Sparkles, ArrowRight, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, ShieldCheck, Wallet, Monitor, Video, Gamepad2, Compass
} from 'lucide-react'

const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

// --- COMPONENT: SULTAN LOGO ---
const SkuyLogo = ({ darkMode }) => (
  <Link to="/" className="flex items-center gap-3 group cursor-pointer">
    <div className="relative">
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        transition={{ type: "spring", ...springConfig }}
        className="w-10 h-10 bg-violet-600 border-2 border-slate-950 rounded-xl flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#000]"
      >
        <Zap size={20} fill="currentColor" />
      </motion.div>
    </div>
    <span className={`text-xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-950'}`}>
      SKUY<span className="text-violet-600">.GG</span>
    </span>
  </Link>
);

// --- COMPONENT: REVEAL ON SCROLL ---
const Reveal = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
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
      className={`mb-4 rounded-[1.5rem] border-2 ${darkMode ? 'bg-slate-900/60 border-white/10 shadow-[6px_6px_20px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-950 shadow-[6px_6px_0px_0px_#000]'} overflow-hidden transition-all`}
    >
      <motion.button 
        layout
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-6 flex justify-between items-center text-left outline-none group"
      >
        <span className={`font-black italic uppercase tracking-tight text-base ${darkMode ? 'text-white group-hover:text-violet-400' : 'text-slate-950 group-hover:text-violet-600'} transition-colors`}>{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", ...springConfig }}>
          <ChevronDown size={18} className="text-violet-600" strokeWidth={3} />
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
            <p className="text-xs text-slate-400 font-bold italic leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">"{answer}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [streamers, setStreamers] = useState([]);
  
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, springConfig);
  const navBg = useTransform(scrollYProgress, [0, 0.05], ["rgba(255, 255, 255, 0)", darkMode ? "rgba(10, 10, 14, 0.95)" : "rgba(255, 255, 255, 0.95)"]);

  useEffect(() => {
    const fetchStreamers = async () => {
      try {
        const res = await api.get('/user/list');
        const data = res.data.success ? res.data.streamers : (Array.isArray(res.data) ? res.data : []);
        setStreamers(data); 
      } catch (err) {
        setStreamers([{ id: 1, username: 'gibran', display_name: 'Gibran Account', bio: 'Engine Architect' }]);
      }
    }
    fetchStreamers()
  }, []);

  // Menggandakan item array untuk membuat efek loop Marquee murni tanpa patah
  const marqueeStreamers = [...streamers, ...streamers, ...streamers, ...streamers];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#060608] text-white' : 'bg-[#F4F7FF] text-slate-900'} transition-colors duration-700 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden relative`}>
      
      {/* PROGRESS BAR */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-violet-600 z-[1000] origin-left" style={{ scaleX }} />

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-center">
        <motion.nav 
          style={{ backgroundColor: navBg }} 
          className={`w-full max-w-6xl px-6 py-3.5 rounded-[2rem] border-2 ${darkMode ? 'border-white/10' : 'border-slate-950'} backdrop-blur-md flex justify-between items-center ${darkMode ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'} transition-all`}
        >
          <SkuyLogo darkMode={darkMode} />
          
          <div className="flex items-center gap-6">
            <Link to="/explore" className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition-colors mt-0.5`}>
              <Compass size={14} /> Explore Hub
            </Link>
            
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className={`w-9 h-9 border-2 ${darkMode ? 'border-white/10' : 'border-slate-950'} rounded-xl flex items-center justify-center ${darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-100'} transition-all`}>
              {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </motion.button>
            <Link to="/auth" className="bg-slate-950 text-white text-[9px] font-black px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-violet-600 transition-all shadow-[3px_3px_0px_0px_#7C3AED] border border-transparent dark:border-white/10">Join Squad</Link>
          </div>
        </motion.nav>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="max-w-6xl mx-auto px-6 pt-64 pb-40 text-center relative z-10 flex flex-col items-center">
        <Reveal>
          <motion.div 
            animate={{ y: [0, -6, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className={`inline-flex items-center gap-3 bg-white ${darkMode ? 'dark:bg-slate-900 border-white/10' : 'border-slate-950'} border-2 px-5 py-2 rounded-full mb-10 shadow-[4px_4px_0px_0px_#7C3AED]`}
          >
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em]">Infrastructure Node v3.5 Secure</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-[110px] font-black leading-[0.85] tracking-tighter mb-10 uppercase italic">
            MONETIZE YOUR <br />
            <span className="text-violet-600">STREAM </span> 
            <span className="text-transparent" style={{ WebkitTextStroke: darkMode ? '2px #ffffff' : '2px #0f172a' }}>OPS</span>
          </h1>

          <p className="text-sm md:text-lg text-slate-400 max-w-xl mx-auto mb-14 font-bold italic leading-relaxed">
            Satu tautan premium untuk melacak pendapatan, mengelola overlay, dan menstabilkan performa live streaming lo ke kasta tertinggi.
          </p>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link to="/auth" className="inline-block bg-violet-600 text-white font-black px-12 py-5 rounded-2xl shadow-[6px_6px_0px_0px_#000] border-2 border-slate-950 text-base uppercase tracking-wider italic transition-all hover:bg-slate-950">
              Ignition Get Started 🚀
            </Link>
          </motion.div>
        </Reveal>
      </section>

      {/* --- LIVE AUTO-MARQUEE SECTION (ANIMASI GERAK STREAMER) --- */}
      <section className="py-12 border-y-4 border-slate-950 bg-slate-950/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#F4F7FF] dark:from-[#060608] to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#F4F7FF] dark:from-[#060608] to-transparent z-20 pointer-events-none" />
        
        {/* ROW GERAK 1: JALAN KE KIRI */}
        <div className="flex w-max gap-8 animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
          {marqueeStreamers.map((s, i) => (
            <motion.div 
              key={`mq1-${s.id}-${i}`}
              onClick={() => navigate(`/${s.username}`)} // ✅ KLIK AUTO MASUK KELIAT PROFILE & DONATE
              className={`w-64 shrink-0 group p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${darkMode ? 'bg-slate-900 border-white/10 hover:border-violet-500' : 'bg-white border-slate-950 hover:shadow-[4px_4px_0px_0px_#7C3AED] hover:-translate-y-1'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000] shrink-0">
                  <img 
                    src={s.profile_picture ? `https://skuyproject-production.up.railway.app/uploads/${s.profile_picture}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt={s.username}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="font-black italic text-md uppercase tracking-tight truncate leading-none mb-1">{s.display_name || s.username}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">@{s.username}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* LINK TOMBOL LIHAT LEBIH BANYAK (EXPLORE REDIRECT) */}
        <div className="max-w-6xl mx-auto text-center mt-12 relative z-30">
          <Link 
            to="/explore" 
            className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest italic px-8 py-3.5 rounded-xl border-2 ${darkMode ? 'bg-slate-900 border-white/20 text-violet-400 hover:bg-slate-800' : 'bg-white border-slate-950 text-violet-600 shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none'} transition-all`}
          >
            Explore More Creators <ArrowRight size={14} strokeWidth={3} />
          </Link>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-6xl mx-auto px-6 py-32 relative z-10 text-center">
        <Reveal>
          <div className="mb-24 flex flex-col items-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">THE <span className="text-violet-600">SULTAN</span> OPS CENTER</h2>
            <p className="text-sm font-bold text-slate-400 italic max-w-xl mx-auto">
              Infrastruktur terpusat untuk mengawal jalannya ekosistem donasi livestreaming kelas dunia.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          {/* Smart Donation Card */}
          <motion.div whileHover={{ y: -6 }} className={`md:col-span-8 p-8 md:p-10 rounded-[2.5rem] border-2 relative overflow-hidden transition-all ${darkMode ? 'bg-slate-900 border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]'}`}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-8 mb-16 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-slate-950 text-white px-3 py-1.5 rounded-full w-fit border dark:border-white/10">
                   <Zap size={10} className="text-violet-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest italic">Fast Settlement Ledger</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Smart <br /> <span className="text-violet-600">Donation</span></h3>
              </div>
              <div className="p-6 bg-violet-600 text-white rounded-2xl shadow-[4px_4px_0px_0px_#000] rotate-12 border-2 border-slate-950 w-fit"><Wallet size={36} /></div>
            </div>
            <p className="text-slate-400 font-bold text-sm italic max-w-sm leading-relaxed relative z-10">Aliran saldo terverifikasi instan, otomatis terbagi ke dalam kasta tiering donatur, dan siap dicairkan tanpa penahanan kas.</p>
          </motion.div>

          {/* Overlay Card */}
          <motion.div whileHover={{ y: -6 }} className={`md:col-span-4 p-8 md:p-10 rounded-[2.5rem] border-2 ${darkMode ? 'border-white/10 bg-slate-900' : 'border-slate-950 bg-slate-950'} text-white flex flex-col justify-between shadow-[10px_10px_0px_0px_rgba(124,58,237,0.05)] group overflow-hidden relative`}>
            <div className="space-y-4 relative z-10">
               <Monitor size={32} className="text-violet-500" />
               <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.9]">Overlay <br/> Master Hub</h3>
            </div>
            <p className="text-slate-400 font-bold text-xs italic mt-12 md:mt-0 relative z-10">Kustomisasi widget notifikasi visual OBS studio sesuka hati untuk mendongkrak retensi donatur.</p>
          </motion.div>

          {/* Media Share Card */}
          <motion.div whileHover={{ y: -6 }} className={`md:col-span-6 p-8 md:p-10 rounded-[2.5rem] border-2 transition-all ${darkMode ? 'bg-slate-900 border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.2)]' : 'bg-white border-slate-950 shadow-[10px_10px_0px_0px_#EF4444]'}`}>
             <div className="space-y-4">
                <Video size={32} className="text-red-500" />
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.9]">Media <br /> <span className="text-red-500">Share Engine</span></h3>
             </div>
             <p className="text-slate-400 font-bold text-xs italic mt-10">Ijinkan donatur menyematkan video interaktif pilihan mereka untuk diputar live di layar streaming.</p>
          </motion.div>

          {/* Goal Tracker Card */}
          <motion.div whileHover={{ y: -6 }} className={`md:col-span-6 p-8 md:p-10 rounded-[2.5rem] border-2 transition-all ${darkMode ? 'bg-slate-900 border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.2)]' : 'bg-white border-slate-950 shadow-[10px_10px_0px_0px_#10B981]'}`}>
             <div className="space-y-4">
                <Target size={32} className="text-emerald-500" />
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-[0.9]">Real-time <br /> <span className="text-emerald-500">Goal Tracker</span></h3>
             </div>
             <p className="text-slate-400 font-bold text-xs italic mt-10">Tampilkan target pendanaan pc gaming atau sub-goal secara akurat lewat bar indikator progres yang premium.</p>
          </motion.div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <Reveal>
          <div className="flex flex-col items-center space-y-4 mb-16">
            <div className="p-4 bg-violet-600 text-white rounded-xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_#000]"><HelpCircle size={24} strokeWidth={2.5}/></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">SULTAN <span className="text-violet-600">INTEL</span></h2>
          </div>
        </Reveal>
        <FAQItem darkMode={darkMode} question="Potongan adminnya berapa, Ri?" answer="Gak usah pusing. Skuy.GG pake sistem fee paling rendah cuma buat maintenance server pangkalan. 95%++ donasi murni bersih langsung masuk kantong lo." />
        <FAQItem darkMode={darkMode} question="Keamanannya beneran terjamin?" answer="Shield kita pake sistem pengunci Dual-OTP WhatsApp + Email. Database kita di Railway Cloud dengan enkripsi kasta tertinggi. Akun lo aman di markas pusat." />
        <FAQItem darkMode={darkMode} question="Support pembayaran apa aja?" answer="Semua QRIS nasional, E-Wallet (Dana, OVO, GoPay), sampe Bank Transfer Sultan kita sikat habis secara real-time tanpa delay!" />
      </section>

      {/* --- FOOTER SULTAN --- */}
      <footer className="bg-violet-600 text-white border-t-4 border-slate-950 py-16 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center gap-2.5 justify-center md:justify-start">
               <div className="w-9 h-9 bg-white text-violet-600 rounded-lg flex items-center justify-center border border-slate-950 shadow-[2px_2px_0px_0px_#000]">
                  <Zap size={18} fill="currentColor" />
               </div>
               <span className="text-xl font-black italic tracking-tighter uppercase text-white">SKUY.GG</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-violet-100 italic">Built for the next-gen creator squad.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-10">
            <div className="text-center md:text-right">
              <h5 className="text-[8px] font-black text-violet-950 uppercase mb-3 tracking-widest italic">Connect Markas</h5>
              <div className="flex gap-4 font-black text-xs uppercase italic text-white">
                <a href="#" className="hover:text-violet-950 transition-colors">Twitter</a>
                <a href="#" className="hover:text-violet-950 transition-colors">Instagram</a>
                <a href="#" className="hover:text-violet-950 transition-colors">Discord</a>
              </div>
            </div>
            <Link to="/auth" className="bg-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:translate-y-0.5 transition-all border-2 border-slate-950 text-[10px]">Join Dashboard</Link>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-violet-100 italic relative z-10">
           <p>© 2026 Skuy.GG Engine • Karawang Industrial Pride</p>
           <p className="md:ml-auto">Engineered by Ari Wirayuda</p>
        </div>
      </footer>

      {/* --- INFINITE MARQUEE CSS INJECTION --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        html { scroll-behavior: smooth; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${darkMode ? '#060608' : '#f4f7ff'}; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border: 2px solid ${darkMode ? '#060608' : '#f4f7ff'}; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default HomePage;