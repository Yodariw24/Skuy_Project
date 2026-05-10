import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Copy, Eye, Save, Sparkles, Volume2, Image as ImageIcon, Globe, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

function TipAlertView({ user }) {
  // ✅ Widget URL Protocol (Safe Guard with Optional Chaining)
  const overlayUrl = `https://skuy-gg.vercel.app/widget/${user?.username || 'username'}/tip`;
  
  // ✅ State Sultan
  const [minDonation, setMinDonation] = useState(10000);
  const [duration, setDuration] = useState(10);

  // --- 🛡️ SULTAN SLIM TOAST ---
  const showSultanToast = (title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'skuy-slim-toast',
        title: 'skuy-toast-content'
      }
    });
    Toast.fire({
      icon: 'success',
      title: title
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(overlayUrl);
    showSultanToast('<b>LINK COPIED</b> <span>Siap tempel di OBS!</span>');
  };

  const handleSave = () => {
    showSultanToast('<b>SYNC SUCCESS</b> <span>Config tersimpan di Cloud.</span>');
  };

  // 🛡️ SAFE GUARD: Jika data user belum ada, tampilkan loading daripada White Blank
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Zap size={40} className="text-violet-600" />
        </motion.div>
        <p className="font-black italic uppercase text-slate-400 animate-pulse">Syncing Engine Node...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 text-left pb-32"
    >
      {/* --- SECTION 1: HEADER --- */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-violet-600 text-white border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] rounded-2xl">
          <Bell size={32} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Alert Protocol
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase rounded-md tracking-widest">v2.4 Active</span>
            <p className="text-xs font-bold text-slate-400 italic">"Ubah dukungan menjadi selebrasi visual yang legendaris."</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* --- LEFT: CONFIGURATION --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* URL CARD */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#000]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
                <Globe size={18} className="text-[#7C3AED]" /> OBS Browser Source
              </h3>
              <Zap size={16} className="text-amber-400 fill-current" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <input 
                  readOnly 
                  value={overlayUrl}
                  className="w-full bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl font-mono text-[11px] font-bold text-slate-500 outline-none transition-all group-hover:border-slate-200"
                />
              </div>
              <button 
                onClick={handleCopy}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-[#7C3AED] transition-all shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none flex items-center justify-center border-2 border-slate-950"
              >
                <Copy size={24} />
              </button>
            </div>
            <div className="mt-6 flex items-start gap-3 p-4 bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200">
               <span className="text-violet-600 font-black text-xs uppercase">Tip:</span>
               <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-wider leading-relaxed">
                  Ri, masukkan link ini sebagai <span className="text-slate-950">"Browser Source"</span> di OBS. <br/>
                  Set ukuran ke <span className="text-violet-600">1920x1080</span> untuk hasil maksimal!
               </p>
            </div>
          </motion.div>

          {/* PARAMS CARD */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#000]"
          >
            <h3 className="font-black italic uppercase text-sm mb-8 pb-4 border-b-4 border-slate-50 flex items-center gap-2">
               <Sparkles size={18} className="text-[#7C3AED]" /> Logic & Timing
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block px-1">Minimal Donation</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-slate-950 transition-colors">Rp</span>
                  <input 
                    type="number" 
                    value={minDonation}
                    onChange={(e) => setMinDonation(e.target.value)}
                    className="w-full bg-slate-50 border-4 border-slate-50 p-5 pl-14 rounded-2xl font-black text-xl text-slate-950 focus:bg-white focus:border-slate-950 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block px-1">Alert Duration</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border-4 border-slate-50 p-5 rounded-2xl font-black text-xl text-slate-950 focus:bg-white focus:border-slate-950 outline-none transition-all"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase text-[10px] italic">Sec</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="sticky top-10">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-[#7C3AED] shadow-[15px_15px_0px_0px_#000] text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
               <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Engine Preview</p>
            </div>
            
            <div className="aspect-[4/3] bg-[#0c0c14] rounded-[2.5rem] border-2 border-white/5 flex items-center justify-center mb-10 relative group overflow-hidden shadow-inner">
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="z-10"
                >
                  <div className="bg-white p-6 border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000] -rotate-3 transition-transform group-hover:rotate-0 duration-500">
                    <p className="font-black italic uppercase text-[10px] text-slate-400 mb-1 text-left">New Support!</p>
                    <p className="text-2xl font-black italic text-slate-950 tracking-tighter leading-none mb-2">
                        Rp {parseInt(minDonation || 0).toLocaleString('id-ID')}
                    </p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-950/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-[#7C3AED]" 
                        />
                    </div>
                  </div>
                </motion.div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            <button className="w-full py-5 bg-white text-slate-950 rounded-[1.8rem] font-black uppercase italic tracking-widest text-[11px] shadow-[6px_6px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none hover:bg-violet-50 transition-all flex items-center justify-center gap-3 border-4 border-slate-950">
              <Eye size={20} strokeWidth={3} /> Launch Test Alert
            </button>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[100]">
          <motion.button 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            onClick={handleSave}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#7C3AED] text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 transition-all group"
          >
            <Save size={26} strokeWidth={3} className="group-hover:rotate-12 transition-transform" /> 
            Save Sync Node
          </motion.button>
      </div>
    </motion.div>
  );
}

export default TipAlertView;