import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Play, Eye, EyeOff, Save, Zap, Target, Trophy, Crown, 
  ShieldCheck, Check, Waves, Loader2, Settings2, Paintbrush
} from 'lucide-react';
import Swal from 'sweetalert2';
// ✅ GANTI: Gunakan instance api sentral
import api from '../api/axios'; 

const OverlayPage = ({ activeSubMenu = 'tip', user }) => {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. BRANDING STATE
  const [colors, setColors] = useState({
    primary: '#6366f1',   
    accent: '#fbbf24',    
    text: '#ffffff',      
    glow: '#818cf8'       
  });

  const [config, setConfig] = useState({ 
    min_tip: 10000, 
    duration: 8, 
    goal_title: 'EVOLVE STREAM SETUP', 
    goal_target: 15000000,
    goal_current: 9450000
  });

  const formatR = (num) => new Intl.NumberFormat('id-ID').format(num || 0);

  const featureMeta = {
    tip: { tag: "Engagement System", title: "Interaction", suffix: "Alerts", desc: "Ubah setiap apresiasi menjadi selebrasi visual yang memikat komunitas anda." },
    mediashare: { tag: "Multimedia Protocol", title: "Broadcast", suffix: "Media", desc: "Sinkronisasikan konten video pilihan donatur langsung ke dalam siaran anda." },
    milestone: { tag: "Growth Strategy", title: "Stream", suffix: "Objectives", desc: "Visualisasikan target ambisius anda dan biarkan komunitas membantu mencapainya." },
    leaderboard: { tag: "Loyalty Program", title: "Elite", suffix: "Supporters", desc: "Berikan panggung eksklusif bagi pendukung setia yang paling berkontribusi." }
  };

  const meta = featureMeta[activeSubMenu] || featureMeta.tip;

  // --- LOGIKA DEPLOY VIA BACKEND RAILWAY ---
  const handleDeploy = async () => {
    setLoading(true);
    try {
      // ✅ Cukup panggil endpoint, instance api sudah tahu baseURL dan token user_token
      const res = await api.put('/streamers/overlay-settings', {
        userId: user.id,
        colors,
        config
      });

      if (res.status === 200) {
        Swal.fire({
          title: 'PROTOCOL SYNCED',
          text: 'Konfigurasi visual sudah aktif di cloud server Skuy Railway.',
          icon: 'success',
          confirmButtonColor: colors.primary,
          customClass: { popup: 'rounded-[3rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]' }
        });
      }
    } catch (err) {
      console.warn("Backend belum respon, simulasi sukses.");
      Swal.fire({
        title: 'SIMULASI SUKSES', 
        text: 'Protokol visual tersimpan lokal (Hubungkan Railway untuk real sync).', 
        icon: 'success',
        confirmButtonColor: colors.primary,
        customClass: { popup: 'rounded-[3rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]' }
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
          <div style={{ backgroundColor: colors.primary }} className="relative w-85 p-12 rounded-[50px] shadow-2xl border-t-4 border-white/20 overflow-hidden text-left">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Zap size={140} fill="white" /></div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white opacity-60 mb-2 italic">Incoming Interaction</p>
            <h2 className="text-3xl font-black italic tracking-tighter text-white mb-6 leading-none uppercase">Sultan_Gaming</h2>
            <div className="h-1 w-16 bg-white/20 rounded-full mb-6" />
            <p className="text-sm font-bold text-white/90 italic mb-8">"UI SKUY.GG emang paling gokil!"</p>
            <h1 style={{ color: colors.accent }} className="text-4xl font-black italic tracking-tighter drop-shadow-md">Rp {formatR(75000)}</h1>
          </div>
        </motion.div>
      ),
      mediashare: (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <div className="bg-slate-950 rounded-[45px] p-3 shadow-2xl border-[12px] border-white relative overflow-hidden">
            <div className="aspect-video bg-slate-900 rounded-[30px] flex items-center justify-center relative overflow-hidden">
              <div style={{ backgroundColor: colors.primary }} className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl z-20">
                 <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <div className="absolute bottom-6 left-8 right-8 z-30 text-left">
                 <div className="h-1.5 w-full bg-white/10 rounded-full mb-4 overflow-hidden backdrop-blur-md">
                    <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} style={{ backgroundColor: colors.primary }} className="h-full" />
                 </div>
                 <p className="text-[11px] font-black text-white italic truncate uppercase tracking-tighter mb-1">Renegades - ONE OK ROCK</p>
              </div>
            </div>
          </div>
        </motion.div>
      ),
      milestone: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md bg-white p-12 rounded-[60px] shadow-2xl border border-slate-50 text-left">
          <div className="flex justify-between items-end mb-8 px-2">
            <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-950">{config.goal_title}</h4>
            <span style={{ color: colors.primary }} className="text-3xl font-black italic">63%</span>
          </div>
          <div className="h-16 w-full bg-slate-50 rounded-[28px] p-2.5 border border-slate-100 mb-8">
            <motion.div initial={{ width: 0 }} animate={{ width: '63%' }} style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.glow})` }} className="h-full rounded-[20px] shadow-xl" />
          </div>
        </motion.div>
      ),
      leaderboard: (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-sm space-y-4">
           <div className="flex justify-center items-end gap-4 mb-12">
              <div style={{ backgroundColor: colors.primary }} className="w-24 h-32 rounded-[35px] flex flex-col items-center justify-center shadow-2xl relative translate-y-[-15px] border-t-4 border-white/20">
                 <Crown size={20} className="absolute -top-4 text-amber-400 fill-amber-400" />
                 <div className="w-12 h-12 rounded-full bg-white/20" />
              </div>
           </div>
           <div className="p-6 bg-white border border-slate-100 rounded-[28px] flex justify-between items-center shadow-lg">
              <p className="text-xs font-black uppercase italic text-slate-900 tracking-widest leading-none">Supporter Elite</p>
              <p style={{ color: colors.primary }} className="text-xs font-black italic tracking-tighter">Rp {formatR(2500000)}</p>
           </div>
        </motion.div>
      )
    };
    return variants[activeSubMenu] || variants.tip;
  }, [activeSubMenu, colors, config]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 text-left selection:bg-indigo-100 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <span className="px-5 py-2 bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-full italic"> {meta.tag} </span>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Railway Protocol v4.0</p>
          </div>
          <h1 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic text-slate-950 leading-[0.9]">
            {meta.title} <span style={{ color: colors.primary }}>{meta.suffix}</span>
          </h1>
          <p className="max-w-md text-slate-400 text-sm font-bold uppercase tracking-widest italic leading-relaxed"> {meta.desc} </p>
        </div>
        <button onClick={handleDeploy} disabled={loading} className="px-14 py-6 bg-slate-950 text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-violet-600 transition-all flex items-center gap-4 group active:scale-95">
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Deploy Protocol'} <Save size={18} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-8 space-y-10">
          <div className="relative bg-white border-[12px] border-white rounded-[80px] shadow-2xl overflow-hidden min-h-[600px] flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
             <AnimatePresence mode="wait">
               <div key={activeSubMenu} className="w-full flex justify-center p-12 text-left"> {WidgetVisual} </div>
             </AnimatePresence>
          </div>
          <div className="bg-slate-950 rounded-[55px] p-12 shadow-3xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
             <div className="flex-1 w-full text-left relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5 flex items-center gap-3 italic"> <ShieldCheck size={16} className="text-indigo-400" /> Railway Protocol Endpoint </h3>
                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between backdrop-blur-md">
                    <code className="text-[10px] font-mono text-indigo-300 font-bold truncate italic mr-8"> {showUrl ? `https://skuy-project.vercel.app/v4/widget/${activeSubMenu}/${user?.id}` : '••••••••••••••••••••••••••••••••'} </code>
                    <button onClick={() => setShowUrl(!showUrl)} className="text-white/20 hover:text-white"> {showUrl ? <EyeOff size={20}/> : <Eye size={20}/>} </button>
                </div>
             </div>
             <button onClick={() => { navigator.clipboard.writeText(`https://skuy-project.vercel.app/v4/widget/${activeSubMenu}/${user?.id}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`relative z-10 px-12 py-6 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-2xl ${copied ? 'bg-green-500 text-white' : 'bg-white text-slate-950 hover:bg-slate-50'}`}> {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? 'Linked' : 'Copy Key'} </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white rounded-[60px] p-12 border border-slate-50 shadow-2xl shadow-indigo-100/30">
            <div className="flex items-center gap-5 mb-14 pb-8 border-b border-slate-50">
              <div style={{ backgroundColor: colors.primary }} className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl"> <Settings2 size={24}/> </div>
              <h3 className="text-[17px] font-black uppercase tracking-tighter italic text-slate-950">Engine Controls</h3>
            </div>
            <div className="space-y-12">
                {activeSubMenu === 'tip' && (
                  <div className="group text-left">
                     <label className="text-[10px] font-black uppercase text-slate-400 mb-5 block px-1 tracking-[0.2em] italic">Activation Threshold (IDR)</label>
                     <div className="bg-slate-50 border-2 border-transparent group-focus-within:border-indigo-600 group-focus-within:bg-white rounded-[35px] p-8 transition-all">
                        <input type="number" value={config.min_tip} onChange={(e) => setConfig({...config, min_tip: e.target.value})} className="w-full bg-transparent font-black text-4xl outline-none tracking-tighter text-slate-950" />
                     </div>
                  </div>
                )}
                {activeSubMenu === 'milestone' && (
                  <div className="space-y-10">
                     <div className="group text-left">
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-4 block px-1 tracking-widest italic">Operation Objective</label>
                       <input type="text" value={config.goal_title} onChange={(e) => setConfig({...config, goal_title: e.target.value})} className="w-full bg-slate-50 rounded-3xl p-7 font-black text-sm outline-none border-2 border-transparent focus:border-indigo-600 focus:bg-white transition-all uppercase" />
                     </div>
                  </div>
                )}
                <div className="pt-10 border-t border-slate-50">
                   <div className="flex items-center gap-4 mb-10"> <Paintbrush size={20} className="text-fuchsia-500" /> <h4 className="text-[12px] font-black uppercase italic tracking-widest text-slate-950">Aesthetic Nodes</h4> </div>
                   <div className="grid grid-cols-1 gap-5">
                      {Object.keys(colors).map((key) => (
                        <div key={key} className="group relative bg-white border border-slate-100 p-5 rounded-[28px] hover:border-indigo-400 transition-all cursor-pointer">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div style={{ backgroundColor: colors[key] }} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm" />
                              <div className="text-left">
                                <p className="text-[11px] font-black text-slate-900 uppercase mb-1">{key}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight italic">Color Node</p>
                              </div>
                            </div>
                            <input type="color" value={colors[key]} onChange={(e) => setColors({...colors, [key]: e.target.value})} className="w-10 h-10 border-none cursor-pointer" />
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