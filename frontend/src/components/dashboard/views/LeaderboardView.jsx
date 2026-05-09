import React, { useState } from 'react';
import { Trophy, Crown, Copy, Save, Filter, Users, Sparkles, Medal } from 'lucide-react';
import Swal from 'sweetalert2';

function LeaderboardView({ user }) {
  const overlayUrl = `https://skuy-gg.vercel.app/widget/${user?.username}/leaderboard`;
  
  const [period, setPeriod] = useState('all_time');
  const [maxDisplay, setMaxDisplay] = useState(5);

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

  // --- MOCK DATA BUAT PREVIEW ---
  const mockSultans = [
    { name: 'Sultan_Ari', amount: 5000000 },
    { name: 'Rifan_Gacor', amount: 2500000 },
    { name: 'Donatur_Setia', amount: 1000000 },
  ];

  return (
    <div className="space-y-10 text-left pb-32 animate__animated animate__fadeIn">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-400 text-slate-950 skuy-border skuy-shadow rounded-2xl">
          <Trophy size={32} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Hall of Fame
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-2 italic">
            "Hargai para Sultan yang berdiri di garis terdepan dukungan."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT: SETTINGS --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* URL CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-sm mb-6 flex items-center gap-2">
              <Crown size={18} className="text-amber-500" /> Leaderboard Link
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
                  showSultanToast('<b>LINK COPIED</b> <span>Klasemen siap tempel!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-amber-400 hover:text-slate-950 transition-all skuy-shadow hover:shadow-none active:translate-y-1 border-2 border-slate-950"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* FILTER CONFIG CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-sm mb-8 flex items-center gap-2 border-b-4 border-slate-50 pb-4">
               <Filter size={18} className="text-amber-500" /> Filter Protocol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block">Ranking Period</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                  {['daily', 'monthly', 'all_time'].map((p) => (
                    <button 
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase transition-all ${period === p ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {p.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] block">Sultan Display Limit</label>
                <select 
                  value={maxDisplay}
                  onChange={(e) => setMaxDisplay(e.target.value)}
                  className="w-full bg-slate-50 border-4 border-slate-50 p-4 rounded-2xl font-black text-slate-950 focus:border-slate-950 outline-none transition-all appearance-none italic"
                >
                  <option value="3">TOP 3 SULTANS</option>
                  <option value="5">TOP 5 SULTANS</option>
                  <option value="10">TOP 10 SULTANS</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="sticky top-10">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-amber-400 shadow-[15px_15px_0px_0px_#000] text-center">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-10 italic">OBS Preview</p>
            
            <div className="space-y-4 mb-10">
               {mockSultans.map((sultan, index) => (
                 <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border-2 border-white/5 hover:border-amber-400/50 transition-all group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-xs ${index === 0 ? 'bg-amber-400 text-slate-950 rotate-3' : 'bg-white/10 text-white'}`}>
                       {index === 0 ? <Crown size={14} /> : index + 1}
                    </div>
                    <div className="flex-1 text-left">
                       <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">{sultan.name}</p>
                       <p className="text-[8px] font-bold text-amber-400/60 uppercase">Donated Rp {sultan.amount.toLocaleString()}</p>
                    </div>
                    <Sparkles size={12} className={`text-amber-400 opacity-0 group-hover:opacity-100 transition-all ${index === 0 ? 'opacity-100' : ''}`} />
                 </div>
               ))}
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                  Showing {period.replace('_', ' ')} ranking
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE --- */}
      <div className="fixed bottom-10 right-10 z-[100] animate__animated animate__slideInUp">
          <button 
            onClick={() => showSultanToast('<b>RANKING DEPLOYED</b> <span>Hall of fame updated!</span>')}
            className="bg-amber-400 text-slate-950 px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 transition-all"
          >
            <Save size={26} strokeWidth={3} /> 
            Sync Hall of Fame
          </button>
      </div>
    </div>
  );
}

export default LeaderboardView;