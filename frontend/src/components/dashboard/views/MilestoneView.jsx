import React, { useState } from 'react';
import { Target, Flag, Save, Copy, Palette, Sparkles, TrendingUp, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';

function MilestoneView({ user }) {
  const overlayUrl = `https://skuy-gg.vercel.app/widget/${user?.username}/milestone`;
  
  const [goalName, setGoalName] = useState("UPGRADE ENGINE SULTAN");
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [currentAmount, setCurrentAmount] = useState(1250000);
  const [barColor, setBarColor] = useState('#7C3AED');

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

  const progressPercent = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

  return (
    <div className="space-y-10 text-left pb-32 animate__animated animate__fadeIn">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500 text-white skuy-border skuy-shadow rounded-2xl">
          <Target size={32} strokeWidth={3} />
        </div>
        <div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
            Goal Tracker
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-2 italic">
            "Transparansi adalah kunci loyalitas audiens lo, Ri."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT: CONFIGURATION --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* URL CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-sm mb-6 flex items-center gap-2">
              <Flag size={18} className="text-emerald-500" /> Widget URL
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
                  showSultanToast('<b>LINK COPIED</b> <span>Target meluncur ke OBS!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-emerald-500 transition-all skuy-shadow hover:shadow-none active:translate-y-1 border-2 border-slate-950"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* GOAL CONFIG CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000] space-y-8">
            <h3 className="font-black italic uppercase text-sm flex items-center gap-2 border-b-4 border-slate-50 pb-4">
               <TrendingUp size={18} className="text-emerald-500" /> Milestone Engine
            </h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Goal Objective</label>
                  <input 
                    type="text" 
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-4 border-slate-50 p-5 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all uppercase italic"
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Target Amount</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                      <input 
                        type="number" 
                        value={targetAmount}
                        onChange={(e) => setTargetAmount(e.target.value)}
                        className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Bar Color Node</label>
                    <div className="flex gap-4">
                       {['#7C3AED', '#10B981', '#F472B6', '#F59E0B'].map(color => (
                         <button 
                          key={color} 
                          onClick={() => setBarColor(color)}
                          className={`w-12 h-12 rounded-xl border-4 transition-all ${barColor === color ? 'border-slate-950 scale-110' : 'border-transparent opacity-50'}`}
                          style={{ backgroundColor: color }}
                         />
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW --- */}
        <div className="sticky top-10">
          <div className="bg-white p-8 rounded-[3.5rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_#10B981] text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 italic">Bar Preview</p>
            
            <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-dashed border-slate-200 mb-8">
                <div className="flex justify-between items-end mb-3">
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Current Goal</p>
                      <p className="text-xs font-black italic text-slate-950 uppercase">{goalName}</p>
                   </div>
                   <p className="text-xs font-black text-slate-950">{progressPercent}%</p>
                </div>

                {/* THE BAR */}
                <div className="w-full h-8 bg-white border-4 border-slate-950 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                   <div 
                    className="h-full transition-all duration-1000 ease-out flex items-center justify-end px-4"
                    style={{ width: `${progressPercent}%`, backgroundColor: barColor }}
                   >
                     <Sparkles size={12} className="text-white animate-pulse" />
                   </div>
                </div>

                <div className="flex justify-between mt-3 font-black text-[9px] uppercase italic text-slate-400">
                   <span>Rp {parseInt(currentAmount).toLocaleString()}</span>
                   <span>Rp {parseInt(targetAmount).toLocaleString()}</span>
                </div>
            </div>

            <button 
              onClick={() => setCurrentAmount(prev => Math.min(prev + 50000, targetAmount))}
              className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] shadow-[4px_4px_0px_0px_#10B981] active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={16} /> Simulate Donation
            </button>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE --- */}
      <div className="fixed bottom-10 right-10 z-[100] animate__animated animate__slideInUp">
          <button 
            onClick={() => showSultanToast('<b>GOAL DEPLOYED</b> <span>Target disinkronkan!</span>')}
            className="bg-emerald-500 text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 transition-all"
          >
            <Save size={26} strokeWidth={3} /> 
            Save Goal Node
          </button>
      </div>
    </div>
  );
}

export default MilestoneView;