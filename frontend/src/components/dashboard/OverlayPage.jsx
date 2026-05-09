import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Play, Eye, EyeOff, Save, Zap, Target, Trophy, Crown, 
  ShieldCheck, Check, Waves, Loader2, Settings2, Paintbrush
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/axios'; 

const OverlayPage = ({ activeSubMenu = 'tip', user }) => {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. BRANDING STATE (Sync with widget_settings table)
  const [colors, setColors] = useState({
    primary: '#7C3AED',   
    accent: '#FF1493',    
    text: '#ffffff',      
    glow: '#7C3AED'       
  });

  const [config, setConfig] = useState({ 
    min_tip: 10000, 
    duration: 8, 
    goal_title: 'SULTAN STREAM SETUP', 
    goal_target: 1000000,
    goal_current: 0
  });

  const formatR = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

  const featureMeta = {
    tip: { tag: "Engagement System", title: "Interaction", suffix: "Alerts", desc: "Ubah setiap apresiasi menjadi selebrasi visual yang memikat komunitas anda." },
    mediashare: { tag: "Multimedia Protocol", title: "Broadcast", suffix: "Media", desc: "Sinkronisasikan konten video pilihan donatur langsung ke dalam siaran anda." },
    milestone: { tag: "Growth Strategy", title: "Stream", suffix: "Objectives", desc: "Visualisasikan target ambisius anda dan biarkan komunitas membantu mencapainya." },
    leaderboard: { tag: "Loyalty Program", title: "Elite", suffix: "Supporters", desc: "Berikan panggung eksklusif bagi pendukung setia yang paling berkontribusi." }
  };

  const meta = featureMeta[activeSubMenu] || featureMeta.tip;

  // --- LOGIKA DEPLOY V2.3 (SULTAN SYNC) ---
  const handleDeploy = async () => {
    setLoading(true);
    try {
      // ✅ SINKRONISASI KE WIDGET CONTROLLER (Langkah 14)
      const res = await api.post('/api/user/widgets/update', {
        userId: user.id,
        widgetType: activeSubMenu, // Kirim tipe widget aktif
        colors,
        config
      });

      if (res.data.success) {
        Swal.fire({
          title: 'PROTOCOL DEPLOYED 🚀',
          text: 'Konfigurasi visual sudah aktif di Skuy Engine & OBS lo!',
          icon: 'success',
          confirmButtonColor: '#7C3AED',
          customClass: { popup: 'rounded-[3rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]' }
        });
      }
    } catch (err) {
      console.error("Deploy Fail:", err);
      Swal.fire({
        title: 'ENGINE ERROR', 
        text: 'Gagal deploy protokol. Cek koneksi Railway lo, Ri!', 
        icon: 'error',
        customClass: { popup: 'rounded-[3rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#EF4444]' }
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. UNIQUE VISUAL ARCHITECTURE
  const WidgetVisual = useMemo(() => {
    const variants = {
      tip: (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative text-left">
          <div style={{ backgroundColor: colors.glow }} className="absolute -inset-10 blur-[100px] opacity-20 animate-pulse rounded-full" />
          <div style={{ backgroundColor: colors.primary }} className="relative w-85 p-12 rounded-[50px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap size={140} fill="white" /></div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white opacity-60 mb-2 italic">Incoming Interaction</p>
            <h2 className="text-3xl font-black italic tracking-tighter text-white mb-6 leading-none uppercase">Sultan_Gaming</h2>
            <div className="h-2 w-16 bg-white/20 rounded-full mb-6" />
            <p className="text-sm font-bold text-white/90 italic mb-8">"UI SKUY.GG emang paling gokil!"</p>
            <h1 style={{ color: colors.accent }} className="text-4xl font-black italic tracking-tighter drop-shadow-md">Rp {formatR(75000)}</h1>
          </div>
        </motion.div>
      ),
      mediashare: (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="bg-slate-950 rounded-[45px] p-4 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 relative overflow-hidden">
            <div className="aspect-video bg-slate-900 rounded-[30px] flex items-center justify-center relative overflow-hidden border-2 border-white/5">
              <div style={{ backgroundColor: colors.primary }} className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl z-20 border-4 border-white/10">
                 <Play size={32} fill="currentColor" className="ml-1" />
              </div>
              <div className="absolute bottom-6 left-8 right-8 z-30 text-left">
                 <div className="h-2 w-full bg-white/10 rounded-full mb-4 overflow-hidden backdrop-blur-md">
                    <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} style={{ backgroundColor: colors.primary }} className="h-full shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                 </div>
                 <p className="text-[11px] font-black text-white italic truncate uppercase tracking-tight mb-1">Playing: ONE OK ROCK - Renegades</p>
              </div>
            </div>
          </div>
        </motion.div>
      ),
      milestone: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-white p-12 rounded-[50px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] border-4 border-slate-950 text-left">
          <div className="flex justify-between items-end mb-8 px-2">
            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-950">{config.goal_title}</h4>
            <span style={{ color: colors.primary }} className="text-3xl font-black italic">63%</span>
          </div>
          <div className="h-16 w-full bg-slate-100 rounded-[25px] p-2.5 border-4 border-slate-950 mb-8 shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: '63%' }} style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.glow})` }} className="h-full rounded-[15px] border-r-4 border-white/20 shadow-lg" />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-[0.2em]">Rp {formatR(config.goal_current)} / Rp {formatR(config.goal_target)}</p>
        </motion.div>
      ),
      leaderboard: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm space-y-4">
           <div className="flex justify-center items-end gap-4 mb-12">
              <div style={{ backgroundColor: colors.primary }} className="w-24 h-32 rounded-[30px] flex flex-col items-center justify-center shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative translate-y-[-15px] border-4 border-slate-950">
                 <Crown size={24} className="absolute -top-6 text-amber-400 fill-amber-400 drop-shadow-lg" />
                 <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30" />
              </div>
           </div>
           <div className="p-6 bg-white border-4 border-slate-950 rounded-[28px] flex justify-between items-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase italic text-slate-950 tracking-widest leading-none">Supporter Elite</p>
              <p style={{ color: colors.primary }} className="text-xs font-black italic tracking-tighter">Rp {formatR(2500000)}</p>
           </div>
        </motion.div>
      )
    };
    return variants[activeSubMenu] || variants.tip;
  }, [activeSubMenu, colors, config]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 text-left selection:bg-indigo-100 font-sans px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <span className="px-5 py-2 bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full italic shadow-lg"> {meta.tag} </span>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Railway Protocol v4.2</p>
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic text-slate-950 leading-[0.85]">
            {meta.title} <span style={{ color: colors.primary }}>{meta.suffix}</span>
          </h1>
          <p className="max-w-md text-slate-400 text-sm font-bold uppercase tracking-widest italic leading-relaxed"> {meta.desc} </p>
        </div>
        <button onClick={handleDeploy} disabled={loading} className="px-14 py-6 bg-slate-950 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] shadow-[8px_8px_0px_0px_#7C3AED] hover:translate-y-[-2px] hover:translate-x-[-2px] transition-all flex items-center gap-4 group active:scale-95 active:shadow-none">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Deploy Protocol'} <Save size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-8 space-y-12">
          {/* MOCKUP VIEWPORT */}
          <div className="relative bg-slate-50 border-4 border-slate-950 rounded-[80px] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden min-h-[600px] flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             <AnimatePresence mode="wait">
               <div key={activeSubMenu} className="w-full flex justify-center p-12 text-left"> {WidgetVisual} </div>
             </AnimatePresence>
          </div>

          {/* URL ENDPOINT CARD */}
          <div className="bg-slate-950 rounded-[55px] p-12 shadow-[15px_15px_0px_0px_#7C3AED] flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
             <div className="flex-1 w-full text-left relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-3 italic"> <ShieldCheck size={16} className="text-indigo-400" /> OBS Browser Source Protocol </h3>
                <div className="bg-white/5 border-2 border-white/10 p-6 rounded-3xl flex items-center justify-between backdrop-blur-md">
                    <code className="text-[11px] font-mono text-indigo-300 font-bold truncate italic mr-8"> {showUrl ? `https://skuy-project.vercel.app/widget/${user?.username}/${activeSubMenu}` : '••••••••••••••••••••••••••••••••••••••••'} </code>
                    <button onClick={() => setShowUrl(!showUrl)} className="text-white/40 hover:text-white transition-colors"> {showUrl ? <EyeOff size={22}/> : <Eye size={22}/>} </button>
                </div>
             </div>
             <button onClick={() => { navigator.clipboard.writeText(`https://skuy-project.vercel.app/widget/${user?.username}/${activeSubMenu}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`relative z-10 px-12 py-7 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-950 hover:bg-slate-50'}`}> {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Linked' : 'Copy Key'} </button>
          </div>
        </div>

        {/* CONTROLS SIDEBAR */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[60px] p-12 border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-5 mb-14 pb-8 border-b-4 border-slate-50">
              <div style={{ backgroundColor: colors.primary }} className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-slate-950"> <Settings2 size={28}/> </div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-950">Engine Config</h3>
            </div>

            <div className="space-y-12">
                {activeSubMenu === 'tip' && (
                  <div className="group text-left">
                     <label className="text-[10px] font-black uppercase text-slate-400 mb-5 block px-1 tracking-[0.2em] italic">Activation Threshold (IDR)</label>
                     <div className="bg-slate-50 border-4 border-slate-100 group-focus-within:border-slate-950 group-focus-within:bg-white rounded-[30px] p-8 transition-all">
                        <input type="number" value={config.min_tip} onChange={(e) => setConfig({...config, min_tip: e.target.value})} className="w-full bg-transparent font-black text-4xl outline-none tracking-tighter text-slate-950" />
                     </div>
                  </div>
                )}
                
                {activeSubMenu === 'milestone' && (
                  <div className="space-y-10">
                     <div className="group text-left">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block px-1 tracking-widest italic">Operation Objective</label>
                       <input type="text" value={config.goal_title} onChange={(e) => setConfig({...config, goal_title: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-7 font-black text-sm outline-none border-4 border-slate-100 focus:border-slate-950 focus:bg-white transition-all uppercase" />
                     </div>
                     <div className="group text-left">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block px-1 tracking-widest italic">Target Amount (IDR)</label>
                       <input type="number" value={config.goal_target} onChange={(e) => setConfig({...config, goal_target: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-7 font-black text-sm outline-none border-4 border-slate-100 focus:border-slate-950 focus:bg-white transition-all" />
                     </div>
                  </div>
                )}

                <div className="pt-10 border-t-4 border-slate-50">
                    <div className="flex items-center gap-4 mb-10"> <Paintbrush size={22} className="text-fuchsia-500" /> <h4 className="text-sm font-black uppercase italic tracking-widest text-slate-950">Aesthetic Nodes</h4> </div>
                    <div className="grid grid-cols-1 gap-5">
                      {Object.keys(colors).map((key) => (
                        <div key={key} className="group relative bg-white border-4 border-slate-100 p-6 rounded-[30px] hover:border-slate-950 transition-all cursor-pointer">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                              <div style={{ backgroundColor: colors[key] }} className="w-14 h-14 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]" />
                              <div className="text-left">
                                <p className="text-[12px] font-black text-slate-950 uppercase mb-1 italic">{key}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Channel Node</p>
                              </div>
                            </div>
                            <input type="color" value={colors[key]} onChange={(e) => setColors({...colors, [key]: e.target.value})} className="w-12 h-12 border-none bg-transparent cursor-pointer rounded-full overflow-hidden" />
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverlayPage;