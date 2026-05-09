import React, { useState } from 'react';
import { Video, Youtube, Settings, ShieldAlert, Copy, Play, Save, Trash2, Clock, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

function MediaShareView({ user }) {
  const overlayUrl = `https://skuy-gg.vercel.app/widget/${user?.username}/mediashare`;
  
  const [minDonation, setMinDonation] = useState(5000);
  const [pricePerSec, setPricePerSec] = useState(100);
  const [isModerationActive, setIsModerationActive] = useState(true);

  const showSultanToast = (title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: { popup: 'skuy-slim-toast', title: 'skuy-toast-content' }
    });
    Toast.fire({ icon: 'success', title });
  };

  return (
    <div className="space-y-10 text-left pb-32 animate__animated animate__fadeIn">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500 text-white skuy-border skuy-shadow rounded-2xl">
          <Youtube size={32} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Media Node
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-2 italic tracking-tight">
            "Biarkan audiens lo memutar video favorit mereka secara live di stream."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT: SETTINGS (2/3) --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Widget URL Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-sm mb-6 flex items-center gap-2 text-red-500">
              <Play size={18} fill="currentColor" /> Browser Source URL
            </h3>
            <div className="flex gap-4">
              <input 
                readOnly 
                value={overlayUrl}
                className="flex-1 bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl font-mono text-[11px] font-black text-slate-400 outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(overlayUrl);
                  showSultanToast('<b>LINK COPIED</b> <span>Siap pasang di OBS!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-red-500 transition-all skuy-shadow hover:shadow-none active:translate-y-1 border-2 border-slate-950"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* Pricing Config Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-sm mb-8 flex items-center gap-2">
               <Settings size={18} className="text-slate-950" /> Economics Logic
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Min. Donation</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                    <input 
                      type="number" 
                      value={minDonation}
                      onChange={(e) => setMinDonation(e.target.value)}
                      className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Price Per Second</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                    <input 
                      type="number" 
                      value={pricePerSec}
                      onChange={(e) => setPricePerSec(e.target.value)}
                      className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Moderation Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black italic uppercase text-sm flex items-center gap-2 text-amber-500">
                <ShieldAlert size={18} /> Moderation Shield
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isModerationActive} onChange={() => setIsModerationActive(!isModerationActive)} className="sr-only peer" />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000]"></div>
              </label>
            </div>
            <p className="text-xs font-bold text-slate-500 italic mb-4">"Otomatis tahan video untuk review manual sebelum muncul di stream."</p>
          </div>
        </div>

        {/* --- RIGHT: PREVIEW & STATUS --- */}
        <div className="space-y-8 sticky top-10">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-red-500 shadow-[15px_15px_0px_0px_#000] text-center">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-8 italic">Media Preview</p>
            
            <div className="aspect-video bg-black rounded-[2rem] border-2 border-white/10 flex items-center justify-center mb-8 relative group overflow-hidden">
                <Youtube size={60} className="text-red-600 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="text-left">
                      <div className="w-24 h-2 bg-white/10 rounded-full mb-1"></div>
                      <div className="w-16 h-2 bg-white/10 rounded-full"></div>
                   </div>
                   <Clock size={16} className="text-white/20" />
                </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/5">
                 <span className="text-[9px] font-black text-slate-500 uppercase">Est. Duration</span>
                 <span className="text-[9px] font-black text-white italic">{(minDonation/pricePerSec).toFixed(0)} Seconds</span>
              </div>
            </div>
          </div>

          <button className="w-full py-6 bg-white border-4 border-slate-950 rounded-[2rem] font-black uppercase italic tracking-widest text-xs shadow-[8px_8px_0px_0px_#EF4444] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3">
            <Trash2 size={18} /> Purge Queue
          </button>
        </div>
      </div>

      {/* --- FLOATING SAVE --- */}
      <div className="fixed bottom-10 right-10 z-[100] animate__animated animate__slideInUp">
          <button 
            onClick={() => showSultanToast('<b>MEDIA SYNCED</b> <span>Config tersimpan!</span>')}
            className="bg-red-500 text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 transition-all"
          >
            <Save size={26} strokeWidth={3} /> 
            Deploy Config
          </button>
      </div>
    </div>
  );
}

export default MediaShareView;