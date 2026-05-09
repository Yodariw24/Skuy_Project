import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import api from '../api/axios' 
import { 
  Sun, Moon, Play, Sparkles, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, Activity, ShieldCheck, 
  Globe, Rocket, Wallet, Monitor, Layers, Video, 
  MessageSquare, Layout, Fingerprint, ArrowRight
} from 'lucide-react'

// --- COMPONENT: SULTAN LOGO ---
const SkuyLogo = ({ darkMode }) => (
  <Link to="/" className="flex items-center gap-3 group">
    <div className="relative">
      <motion.div 
        whileHover={{ rotate: 360, scale: 1.1 }}
        className="w-10 h-10 bg-violet-600 border-4 border-slate-950 rounded-xl flex items-center justify-center text-white shadow-[4px_4px_0px_0px_#000]"
      >
        <Zap size={20} fill="currentColor" />
      </motion.div>
    </div>
    <span className={`text-xl font-black italic tracking-tighter uppercase ${darkMode ? 'text-white' : 'text-slate-950'}`}>
      SKUY<span className="text-violet-600">.GG</span>
    </span>
  </Link>
);

// --- COMPONENT: FEATURE CARD (SULTAN GRADE) ---
const FeatureCard = ({ icon: Icon, title, desc, color, span, darkMode }) => (
  <motion.div 
    whileHover={{ y: -10, scale: 1.02 }}
    className={`${span} p-10 rounded-[3rem] border-4 border-slate-950 relative overflow-hidden group transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white shadow-[10px_10px_0px_0px_#000] hover:shadow-[15px_15px_0px_0px_#000]'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] text-white`} style={{ backgroundColor: color }}>
      <Icon size={24} strokeWidth={3} />
    </div>
    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none">{title}</h3>
    <p className="text-slate-400 font-bold italic text-sm leading-relaxed">{desc}</p>
    <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
      <Icon size={150} />
    </div>
  </motion.div>
);

// --- COMPONENT: ELITE CARD (FACE RECOGNITION) ---
const EliteCard = ({ s, darkMode }) => {
  // Logic Foto: Cek uploads, kalau gagal pakai Dicebear
  const avatarUrl = s.profile_picture 
    ? `https://skuyproject-production.up.railway.app/uploads/${s.profile_picture}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`;

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`p-8 rounded-[3rem] border-4 border-slate-950 transition-all ${darkMode ? 'bg-white/5 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]' : 'bg-white shadow-[10px_10px_0px_0px_#F1F5F9] hover:shadow-[12px_12px_0px_0px_#7C3AED]'}`}
    >
      <div className="w-20 h-20 bg-slate-100 rounded-2xl mb-8 overflow-hidden border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000]">
        <img 
          src={avatarUrl} 
          alt={s.username} 
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
        />
      </div>
      <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2">{s.full_name || s.username}</h4>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 opacity-60">Verified Sultan</p>
      <Link to={`/${s.username}`} className="flex items-center gap-2 text-[10px] font-black text-violet-600 uppercase italic hover:gap-4 transition-all">
        VIEW STREAMPAGE <ArrowRight size={14} />
      </Link>
    </motion.div>
  );
};

function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [streamers, setStreamers] = useState([]);
  
  // Smooth Scroll Physics
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

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
    { icon: Wallet, title: "Sultan Pay", desc: "Terima donasi secepat kilat via QRIS, E-Wallet, & Bank Transfer tanpa potongan gila.", color: "#7C3AED", span: "md:col-span-6" },
    { icon: Monitor, title: "Overlay Pro", desc: "Widget alert super estetik & ringan buat OBS lo. Full custom tanpa ngadat.", color: "#0f172a", span: "md:col-span-6" },
    { icon: Video, title: "Media Share", desc: "Biar penonton lo bisa muter video YouTube favorit mereka langsung di stream.", color: "#ef4444", span: "md:col-span-4" },
    { icon: Target, title: "Goal Bar", desc: "Target donasi transparan buat memotivasi Squad lo dukung lo lebih brutal.", color: "#10b981", span: "md:col-span-4" },
    { icon: Trophy, title: "Hall of Fame", desc: "Sistem leaderboard buat nampilin para Sultan tertinggi di garis depan.", color: "#f59e0b", span: "md:col-span-4" }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0A0A0C] text-white' : 'bg-[#F8FAFF] text-slate-900'} transition-colors duration-500 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden`}>
      
      {/* Progress Bar Sultan */}
      <motion.div className="fixed top-0 left-0 right-0 h-2 bg-violet-600 origin-left z-[110]" style={{ scaleX }} />

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] p-6">
        <div className={`max-w-7xl mx-auto px-8 py-4 rounded-3xl border-4 border-slate-950 flex justify-between items-center backdrop-blur-md shadow-[6px_6px_0px_0px_#000] ${darkMode ? 'bg-white/5' : 'bg-white/80'}`}>
          <SkuyLogo darkMode={darkMode} />
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 border-2 border-slate-950 rounded-xl flex items-center justify-center bg-white dark:bg-white/10">
              {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </button>
            <Link to="/auth" className="hidden sm:block bg-slate-950 text-white text-[10px] font-black px-8 py-3 rounded-xl uppercase shadow-[4px_4px_0px_0px_#7C3AED]">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative pt-64 pb-32 px-6 text-center overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-7xl md:text-[160px] font-black leading-[0.8] tracking-tighter mb-12 uppercase italic">
            MODERN <br /> <span className="text-violet-600">SULTAN </span> ENGINE
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-bold italic mb-12">
            Infrastruktur dukungan kreator teraman, tercepat, dan paling estetik di Indonesia.
          </p>
          <Link to="/auth" className="inline-block bg-violet-600 text-white font-black px-12 py-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000] text-3xl uppercase italic hover:translate-y-2 hover:shadow-none transition-all">
            Join the Squad
          </Link>
        </motion.div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col items-center mb-20">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter">SULTAN <span className="text-violet-600">PROTOCOLS</span></h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] mt-4">Hardware & Software Optimized</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} darkMode={darkMode} />
          ))}
        </div>
      </section>

      {/* --- ELITE SQUAD --- */}
      <section className="bg-slate-950 py-32 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex justify-between items-end mb-20 border-b-4 border-white/10 pb-10">
            <h2 className="text-6xl font-black italic uppercase tracking-tighter">Elite <span className="text-violet-600">Squad</span></h2>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest hidden md:block">Real-time Verified Creators</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {streamers.slice(0, 8).map((s) => (
              <EliteCard key={s.id} s={s} darkMode={true} />
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SULTAN --- */}
      <section className="max-w-4xl mx-auto px-6 py-40">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Sultan <span className="text-violet-600">Intel</span></h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pencarian Fakta Lapangan</p>
        </div>
        <div className="space-y-6">
          {[
            { q: "Berapa potongan adminnya?", a: "Kita cuma ambil receh buat biaya sistem, 95%++ masuk kantong lo langsung Ri!" },
            { q: "Aman dari hacker gak?", a: "Shield kita pake Dual-OTP WA & Email. Lu ganti device, laporannya masuk ke markas pusat detik itu juga." },
            { q: "Pembayarannya bisa apa aja?", a: "Dari QRIS sampe Bank Sultan, semua kita sikat. Tanpa delay!" }
          ].map((item, i) => (
            <details key={i} className="group p-8 rounded-[2rem] border-4 border-slate-950 bg-white dark:bg-white/5 cursor-pointer shadow-[6px_6px_0px_0px_#000]">
              <summary className="font-black italic uppercase text-lg list-none flex justify-between items-center group-open:text-violet-600 transition-colors">
                {item.q} <ChevronDown className="group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-white/10 font-bold italic text-slate-500 leading-relaxed">
                "{item.a}"
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* --- FOOTER (SLEEK & SULTAN) --- */}
      <footer className="bg-white dark:bg-[#0A0A0C] border-t-8 border-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <SkuyLogo darkMode={darkMode} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Built for the next-gen creator squad.</p>
          </div>
          <div className="flex gap-12">
            <div className="text-center md:text-right">
              <h5 className="text-[9px] font-black text-slate-300 uppercase mb-4 tracking-widest">Connect Markas</h5>
              <div className="flex gap-6 font-black text-xs uppercase italic">
                <a href="#" className="hover:text-violet-600 transition-colors">Discord</a>
                <a href="#" className="hover:text-violet-600 transition-colors">Twitter</a>
              </div>
            </div>
            <Link to="/auth" className="bg-slate-950 text-white px-10 py-5 rounded-2xl font-black uppercase italic shadow-[6px_6px_0px_0px_#7C3AED] hover:translate-y-1 hover:shadow-none transition-all">GASS DASHBOARD</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t-2 border-slate-100 dark:border-white/5 text-[8px] font-black text-slate-400 uppercase tracking-[0.5em] text-center">
          © 2026 Skuy.GG Engine • Crafted in Karawang Industrial Pride
        </div>
      </footer>

      {/* CSS Sultan Smooth Scroll */}
      <style>{`
        html { scroll-behavior: smooth; }
        body { cursor: crosshair; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border: 2px solid #000; border-radius: 10px; }
      `}</style>
    </div>
  )
}

export default HomePage;