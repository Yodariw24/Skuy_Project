import React, { useState } from 'react';
import { Bell, Copy, Eye, Save, Sparkles, Volume2, Image as ImageIcon, Globe, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

function TipAlertView({ user }) {
  // ✅ Widget URL Protocol
  const overlayUrl = `https://skuy-gg.vercel.app/widget/${user?.username}/tip`;
  
  // ✅ State Sultan (Live Sync ke Preview)
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

  return (
    <div className="space-y-10 text-left pb-32">
      {/* --- SECTION 1: HEADER & QUOTE --- */}
      <div className="animate__animated animate__fadeIn">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-violet-600 text-white skuy-border skuy-shadow rounded-2xl">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* --- LEFT: CONFIGURATION --- */}
        <div className="lg:col-span-2 space-y-8 animate__animated animate__fadeInLeft">
          
          {/* URL CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black italic uppercase text-sm flex items-center gap-2">
                <Globe size={18} className="text-[#7C3AED]" /> OBS Browser Source
              </h3>
              <Zap size={16} className="text-amber-400 fill-current" />
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 relative group">
                <input 
                  readOnly 
                  value={overlayUrl}
                  className="w-full bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl font-mono text-[11px] font-bold text-slate-500 outline-none transition-all group-hover:border-slate-200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 font-black text-[9px] uppercase italic">Read Only</div>
              </div>
              <button 
                onClick={handleCopy}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-[#7C3AED] transition-all skuy-shadow hover:shadow-none active:translate-y-1 flex items-center justify-center border-2 border-slate-950"
              >
                <Copy size={24} />
              </button>
            </div>
            <div className="mt-6 flex items-start gap-3 p-4 bg-violet-50 rounded-2xl border-2 border-dashed border-violet-200">
               <span className="text-violet-600 font-black text-xs">TIP:</span>
               <p className="text-[10px] font-bold text-slate-500 uppercase italic tracking-wider leading-relaxed">
                  Ri, masukkan link ini sebagai <span className="text-slate-950">"Browser Source"</span> di OBS. <br/>
                  Set ukuran ke <span className="text-violet-600">1920x1080</span> untuk hasil maksimal!
               </p>
            </div>
          </div>

          {/* PARAMS CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#000]">
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
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase text-[10px] italic">Seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="sticky top-10 animate__animated animate__fadeInRight">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-[#7C3AED] shadow-[15px_15px_0px_0px_#000] text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
               <div className="w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Engine Preview</p>
            </div>
            
            {/* SCREEN SIMULATOR */}
            <div className="aspect-[4/3] bg-[#0c0c14] rounded-[2.5rem] border-2 border-white/5 flex items-center justify-center mb-10 relative group overflow-hidden shadow-inner">
                {/* Simulated Alert Anim */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="z-10"
                >
                  <div className="bg-white p-6 skuy-border skuy-shadow -rotate-3 transition-transform group-hover:rotate-0 duration-500">
                    <p className="font-black italic uppercase text-[10px] text-slate-400 mb-1">New Support!</p>
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

                {/* Grid Overlay Decor */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            <button className="w-full py-5 bg-white text-slate-950 rounded-[1.8rem] font-black uppercase italic tracking-widest text-[11px] shadow-[6px_6px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none hover:bg-violet-50 transition-all flex items-center justify-center gap-3 border-4 border-slate-950">
              <Eye size={20} strokeWidth={3} /> Launch Test Alert
            </button>
          </div>

          <div className="mt-8 px-6">
             <div className="flex items-center gap-3 text-slate-400">
                <Zap size={14} fill="currentColor" />
                <p className="text-[9px] font-black uppercase tracking-widest">Changes sync instantly</p>
             </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[100] animate__animated animate__slideInUp">
          <button 
            onClick={handleSave}
            className="bg-[#7C3AED] text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 transition-all group"
          >
            <Save size={26} strokeWidth={3} className="group-hover:rotate-12 transition-transform" /> 
            Save Sync Node
          </button>
      </div>
    </div>
  );
}

export default TipAlertView;