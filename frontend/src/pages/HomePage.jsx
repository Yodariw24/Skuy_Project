import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  Sun, Moon, Play, ChevronRight, Sparkles, 
  Heart, ArrowRight, Star, Trophy, Target, Zap, 
  HelpCircle, ChevronDown, UserCircle2, Video, Activity, AlertCircle
} from 'lucide-react'

// --- IMPORT KONEKSI SUPABASE ---
import { supabase } from '../supabaseClient' 

// --- COMPONENT: SAKURA PETAL ---
const SakuraPetal = ({ delay }) => {
  const size = Math.random() * 10 + 5;
  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 0, rotate: 0 }}
      animate={{ y: '100vh', x: [0, 40, -40, 20], opacity: [0, 0.7, 0.7, 0], rotate: 360 }}
      transition={{ duration: Math.random() * 5 + 10, repeat: Infinity, delay: delay, ease: "linear" }}
      className="absolute bg-fuchsia-200/40 rounded-full pointer-events-none blur-[0.5px]"
      style={{ width: size, height: size * 1.4, zIndex: 1 }}
    />
  );
};

// --- COMPONENT: FAQ ACCORDION ---
const FAQItem = ({ question, answer, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`mb-4 rounded-3xl border transition-all ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'} overflow-hidden`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 flex justify-between items-center text-left outline-none">
        <span className="font-black italic uppercase tracking-tighter text-sm leading-none">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={18} className="text-violet-600" /></motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6">
            <p className="text-xs text-slate-400 font-medium italic">"{answer}"</p>
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
  const navBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 0)", darkMode ? "rgba(10, 10, 12, 0.9)" : "rgba(255, 255, 255, 0.9)"]);

  useEffect(() => {
    const fetchStreamers = async () => {
      const { data } = await supabase.from('streamers').select('*')
      if (data) setStreamers(data)
    }
    fetchStreamers()
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#FAFAFB] text-slate-900'} transition-colors duration-1000 font-sans selection:bg-violet-600 selection:text-white overflow-x-hidden relative`}>
      
      {/* --- MESH & SAKURA --- */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] ${darkMode ? 'bg-violet-900/20' : 'bg-violet-100/60'} blur-[140px] rounded-full`} 
        />
        {[...Array(15)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: -50 }}><SakuraPetal delay={i * 1.2} /></div>
        ))}
      </div>

      {/* --- NAVBAR --- */}
      <div className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-center">
        <motion.nav style={{ backgroundColor: navBg }} className="w-full max-w-7xl px-8 py-3.5 rounded-[2.5rem] border border-white/10 backdrop-blur-2xl flex justify-between items-center shadow-2xl transition-all">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{ rotate: 180 }} className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">S</motion.div>
            <span className={`text-xl font-black italic tracking-tighter uppercase leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>SKUY<span className="text-violet-600">.GG</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full hover:bg-violet-600/10 text-slate-400 cursor-pointer">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block" />
            <Link to="/auth" className={`hidden md:block text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'} hover:text-violet-600 transition-all`}>Masuk</Link>
            <Link to="/auth" className="bg-violet-600 text-white text-[10px] font-black px-8 py-3 rounded-full uppercase tracking-widest hover:bg-violet-700 shadow-xl shadow-violet-600/20 active:scale-95 transition-all">Gabung Squad kuy</Link>
          </div>
        </motion.nav>
      </div>

      {/* --- HERO --- */}
      <section className="max-w-6xl mx-auto px-6 pt-52 pb-24 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-violet-600/10 text-violet-600 px-5 py-2 rounded-full mb-10 border border-violet-600/20 shadow-sm">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Platform SawerKuyy Gacor Indonesia</span>
        </motion.div>
        <h1 className="text-6xl md:text-[120px] font-black leading-[0.85] tracking-tighter mb-12 uppercase italic">MAKIN <span className="text-violet-600">PRO</span><br /><span className="text-transparent" style={{ WebkitTextStroke: darkMode ? '1.5px #ffffff' : '1.5px #6d28d9' }}>NGONTEN</span></h1>
        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-medium italic leading-relaxed">Unlock potensi maksimal interaksi bareng fans favoritmu lewat fitur donasi paling <span className="text-violet-600 font-bold underline underline-offset-8 decoration-violet-300">slebew</span>.</p>
        <Link to="/auth" className="bg-violet-600 text-white font-black px-14 py-6 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(109,40,217,0.6)] hover:shadow-violet-600/80 transition-all text-xl uppercase italic">Gabung Squad Kuy</Link>
      </section>

      {/* --- BENTO TOOLS SQUAD --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col items-center mb-24 text-center">
          <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.5em] mb-4">Elite Ecosystem</span>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4">TOOLSNYA <span className="text-violet-600">SQUAD KREATIF</span></h2>
          <div className="w-20 h-1.5 bg-violet-600 rounded-full mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <motion.div whileHover={{ y: -10 }} className={`md:col-span-7 p-12 rounded-[4rem] border relative overflow-hidden group transition-all ${darkMode ? 'bg-white/5 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/40'}`}>
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={120} /></div>
            <div className="flex justify-between items-start mb-16">
              <div className="space-y-4 w-full max-w-xs relative z-10">
                 {[{n: 'Sultan_Reza', a: '1.5M', m: 'Gacor parah bang!'}, {n: 'Wibu_Elite', a: '500k', m: 'Semangat ngontennya!'}].map((d, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} className={`flex items-center gap-4 p-5 rounded-3xl ${darkMode ? 'bg-black/40' : 'bg-slate-50'} border border-transparent hover:border-violet-600/30 transition-all shadow-inner`}>
                      <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Heart size={20} fill="currentColor"/></div>
                      <div>
                        <p className="text-sm font-black uppercase italic tracking-tighter">{d.n} • <span className="text-violet-600">Rp {d.a}</span></p>
                        <p className="text-[10px] text-slate-400 font-bold italic line-clamp-1">"{d.m}"</p>
                      </div>
                    </motion.div>
                 ))}
              </div>
              <div className="p-6 bg-violet-600/10 text-violet-600 rounded-3xl animate-bounce border border-violet-600/20"><Zap size={40} fill="currentColor"/></div>
            </div>
            <h3 className="text-4xl font-black italic uppercase mb-2">Tip Donation</h3>
            <p className="text-slate-400 text-sm font-bold italic">Terima energi dukungan secepat kilat via QRIS tanpa potongan ribet.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className={`md:col-span-5 p-12 rounded-[4rem] border flex flex-col justify-between transition-all bg-gradient-to-br from-violet-600 via-indigo-700 to-violet-900 text-white shadow-2xl border-white/10 relative overflow-hidden group`}>
            <div className="aspect-video bg-black/30 backdrop-blur-xl rounded-[3rem] flex items-center justify-center border border-white/20 shadow-2xl relative overflow-hidden">
               <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="bg-white p-7 rounded-full text-violet-600 relative z-10"><Play fill="currentColor" size={32}/></motion.div>
            </div>
            <div className="mt-10 relative z-10 text-right">
              <h3 className="text-4xl font-black italic uppercase leading-none mb-2 tracking-tighter">MEDIA<br/>SHARE</h3>
              <p className="text-white/60 text-xs font-bold italic">Meme atau musik pilihan fans langsung gas di layar streaming.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className={`md:col-span-5 p-12 rounded-[4rem] border flex flex-col justify-between transition-all ${darkMode ? 'bg-[#0f0f12] border-white/5 shadow-inner' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3"><div className="p-3 bg-violet-600 text-white rounded-2xl shadow-lg"><Target size={22}/></div><span className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">Goal Progress</span></div>
                <span className="font-mono font-black text-violet-600">80%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/10 h-6 rounded-full overflow-hidden mb-6 p-1.5 border border-transparent dark:border-white/5">
                <motion.div initial={{ width: 0 }} whileInView={{ width: '80%' }} transition={{ duration: 2 }} className="h-full bg-violet-600 rounded-full shadow-[0_0_20px_rgba(109,40,217,0.6)]" />
              </div>
              <div className="flex justify-between items-end">
                <p className="font-black italic text-2xl tracking-tighter">Rp 4.000k</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Target: 5.0M</p>
              </div>
            </div>
            <div className="mt-12">
              <h3 className="text-4xl font-black italic uppercase mb-2">Milestone</h3>
              <p className="text-slate-400 text-sm font-bold italic leading-relaxed">Upgrade setup impian bareng squad paling royal mendukung karyamu.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className={`md:col-span-7 rounded-[4rem] border overflow-hidden flex flex-col transition-all ${darkMode ? 'bg-[#0f0f12] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="bg-violet-600 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3"><Trophy size={22} className="text-yellow-300" /><span className="text-[11px] font-black uppercase tracking-[0.4em]">Elite Ranking Squad</span></div>
              <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase">Update Realtime</span>
            </div>
            <div className="p-12 space-y-6">
              {[ { n: 'Sultan_Jakarta', a: '15.2M', icon: '🏆' }, { n: 'Sultan Gamers', a: '12.8M', icon: '🥈' } ].map((l, i) => (
                <div key={i} className="flex justify-between items-center pb-5 border-b border-slate-50 dark:border-white/5 last:border-0 group cursor-default">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{l.icon}</span>
                    <span className="font-black italic text-2xl uppercase tracking-tighter group-hover:text-violet-600 transition-colors">{l.n}</span>
                  </div>
                  <span className="font-black text-violet-600 text-2xl font-mono tracking-tighter">Rp {l.a}</span>
                </div>
              ))}
              <div className="pt-8">
                <h3 className="text-4xl font-black italic uppercase mb-2">Leaderboard</h3>
                <p className="text-slate-400 text-sm font-bold italic">Kasih panggung khusus buat fans paling suportif yang ada di garis depan.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- EXPLORE CREATORS --- */}
      <section className="max-w-7xl mx-auto px-6 py-20 relative z-10 text-center">
        <h2 className="text-6xl font-black italic uppercase tracking-tighter mb-4">ELITE <span className="text-violet-600">CREATORS</span></h2>
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-20 animate-pulse">
          <AlertCircle size={14} className="text-amber-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest italic">Data updated live from database system</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {streamers.map((s) => (
            <motion.div key={s.id} whileHover={{ y: -15 }} className={`group p-10 rounded-[4rem] border transition-all ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-100 hover:shadow-2xl shadow-violet-900/10'}`}>
              <div className="w-20 h-20 bg-slate-100 dark:bg-white/10 rounded-[2.5rem] mb-10 overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group-hover:border-violet-600 transition-all">
                <img 
                  src={s.profile_picture ? (s.profile_picture.startsWith('http') ? s.profile_picture : `https://hkcjensvqghsbpceydiv.supabase.co/storage/v1/object/public/uploads/${s.profile_picture}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={s.username}
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`; }}
                />
              </div>
              <h3 className="text-3xl font-black italic mb-2 uppercase tracking-tighter leading-none">{s.full_name || s.username}</h3>
              <p className="text-slate-400 text-[12px] font-bold mb-10 italic line-clamp-1">"{s.bio || 'Legend Creator Gacor'}"</p>
              <Link to={`/${s.username}`} className="inline-flex items-center gap-2 text-[11px] font-black uppercase text-violet-600 tracking-widest group">Gas Support <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" /></Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FAQ SQUAD --- */}
      <section className="max-w-4xl mx-auto px-6 py-24 relative z-10 text-left">
        <div className="flex items-center gap-6 mb-16"><div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-600/30"><HelpCircle size={24}/></div><h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">FAQ <span className="text-violet-600">SQUAD</span></h2></div>
        <div className="space-y-2">
          <FAQItem darkMode={darkMode} question="Apa itu Skuy?" answer="Skuy adalah platform yang bisa bantu kamu dapetin dukungan finansial langsung dari fans." />
          <FAQItem darkMode={darkMode} question="Siapa aja yang bisa pakai Skuy?" answer="Siapa aja! Mau kamu baru mulai ngonten atau udah punya banyak fans, semua bisa pakai Skuy." />
          <FAQItem darkMode={darkMode} question="Gimana cara bikin akun Skuy?" answer="Sekarang kita lagi buka Beta Testing! Kalau kamu mau jadi salah satu Kreator pertama yang nyobain Skuy, tinggal gabung Squad yaa." />
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-32 relative bg-violet-600 text-white overflow-hidden py-32 selection:bg-white selection:text-violet-700">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 flex whitespace-nowrap opacity-10 pointer-events-none select-none">
          <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="text-[200px] font-black italic uppercase px-4">SKUY.GG SKUY.GG SKUY.GG SKUY.GG SKUY.GG</motion.div>
        </div>
        <div className="max-w-7xl mx-auto px-10 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-7xl md:text-[130px] font-black italic uppercase leading-[0.75] mb-12 tracking-tighter drop-shadow-2xl">SIAP JADI<br/>LEGENDA?</h2>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/auth" className="bg-white text-violet-600 font-black px-16 py-7 rounded-[3rem] shadow-3xl text-2xl uppercase italic inline-block transition-all">Join Squad Sekarang kuy</Link></motion.div>
          <div className="w-full mt-32 pt-10 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white text-violet-700 rounded-xl flex items-center justify-center font-black text-xs shadow-lg">S</div>
              <span className="font-black italic tracking-tighter text-2xl uppercase leading-none text-white">SKUY<span className="text-violet-200">.GG</span></span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-100">© 2026 Skuy.GG Studio • Indonesia Pride</p>
          </div>
        </div>
      </footer>

      {/* --- FIX SCROLL & SAKURA --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        html, body { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          overflow-y: auto !important; 
          height: auto !important;
          margin: 0;
          padding: 0;
        }
        #root { height: auto !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #6d28d9; border-radius: 10px; }
        @keyframes sakuraFall {
          0% { transform: translateY(-50px) rotate(0deg) translateX(0px); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(100vh) rotate(360deg) translateX(30px); opacity: 0; }
        }
        .animate-sakura-fall { animation: sakuraFall linear infinite; }
      `}</style>
    </div>
  )
}

export default HomePage;