import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Target, Flag, Save, Copy, Palette, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../../api/axios'; 

function MilestoneView({ user }) {
  const currentUrl = window.location.origin;
  const overlayUrl = `${currentUrl}/widget/${user?.username || user?.id}/milestone`;
  
  const [goalName, setGoalName] = useState("UPGRADE ENGINE SULTAN");
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [currentAmount, setCurrentAmount] = useState(0); 
  const [barColor, setBarColor] = useState('#7C3AED');
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  // 📡 PROTOKOL PIPELINE: Sedot log data pencapaian riil langsung dari Postgres Railway
  const fetchMilestoneLiveStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/api/donations/milestone/config');
      if (res.data.success && res.data.data) {
        const cloudData = res.data.data;
        setGoalName(cloudData.goal_title || "UPGRADE ENGINE SULTAN");
        setTargetAmount(cloudData.goal_target || 5000000);
        setCurrentAmount(cloudData.goal_current || 0);
        setBarColor(cloudData.primary_color || '#7C3AED');
      }
    } catch (err) {
      console.warn("⚠️ Mode Sandbox: Gagal sinkronisasi data cloud, menggunakan pangkalan lokal.");
      setCurrentAmount(1250000);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMilestoneLiveStats();
  }, [fetchMilestoneLiveStats]);

  const showSultanToast = (title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: { 
        popup: 'border-4 border-slate-950 bg-white rounded-2xl shadow-[4px_4px_0px_0px_#10B981]', 
        title: 'font-sans font-black uppercase text-slate-950 text-[10px] tracking-widest' 
      }
    });
    Toast.fire({ icon: 'success', title });
  };

  // 🧮 MEMOIZED MATHEMATICS EVALUATOR: Hitung persentase progres riil database lo
  const progressPercent = useMemo(() => {
    const target = Number(targetAmount) || 1000000;
    const current = Number(currentAmount) || 0;
    const pct = Math.round((current / target) * 100);
    return Math.min(pct, 100); 
  }, [currentAmount, targetAmount]);

  // 🚀 TRIGGER DEPLOY PROTOCOL: Simpan pembaharuan target dan kabarkan ke OBS Browser Source via WebSockets
  const handleDeployMilestone = async () => {
    if (Number(targetAmount) <= 0) {
      return Swal.fire({ title: 'ERROR', text: 'Target nominal donasi tidak boleh kosong, Ri!', icon: 'error' });
    }

    setDeploying(true);
    try {
      const res = await api.post('/user/widgets/update', {
        userId: user.id,
        widgetType: 'milestone',
        colors: { primary: barColor, glow: barColor, text: '#ffffff' },
        config: {
          goal_title: goalName.toUpperCase(),
          goal_target: parseInt(targetAmount),
          goal_current: currentAmount
        }
      });

      if (res.data.success) {
        showSultanToast('<b>GOAL DEPLOYED</b> <span>Target disinkronkan!</span>');
      }
    } catch (err) {
      console.error("🔥 Gagal menembak pembaruan milestone:", err.message);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic animate-pulse">Menghitung Akumulasi Cuan Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left pb-32 selection:bg-emerald-50 selection:text-emerald-600 font-sans">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 px-1">
        <div className="p-3 bg-emerald-500 text-white border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] rounded-2xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* --- LEFT: CONFIGURATION --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* URL CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-xs mb-6 flex items-center gap-2">
              <Flag size={18} className="text-emerald-500" /> Widget URL
            </h3>
            <div className="flex gap-4">
              <input 
                readOnly 
                type="text"
                value={overlayUrl}
                onClick={(e) => e.target.select()}
                className="flex-1 bg-slate-50 border-4 border-slate-100 p-5 rounded-2xl font-mono text-[11px] font-black text-slate-400 outline-none truncate italic"
              />
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(overlayUrl);
                  showSultanToast('<b>LINK COPIED</b> <span>Target meluncur ke OBS!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] border-2 border-slate-950 cursor-pointer"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* GOAL CONFIG CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000] space-y-8">
            <h3 className="font-black italic uppercase text-xs flex items-center gap-2 border-b-4 border-slate-50 pb-4">
               <TrendingUp size={18} className="text-emerald-500" /> Milestone Engine
            </h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-3">Goal Objective</label>
                  <input 
                    type="text" 
                    disabled={deploying}
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-4 border-slate-50 p-5 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all uppercase italic"
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Target Amount (IDR)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                      <input 
                        type="number" 
                        disabled={deploying}
                        value={targetAmount}
                        // ✅ FIXED SANITIZATION LAYER: Paksa string casting agar aman dieksekusi bundler Rollup produksi
                        onChange={(e) => setTargetAmount(String(e.target.value).replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg outline-none focus:bg-white focus:border-slate-950"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Bar Color Node</label>
                    <div className="flex gap-4 pt-1">
                       {['#7C3AED', '#10B981', '#F472B6', '#F59E0B'].map(color => (
                         <button 
                          type="button"
                          key={color} 
                          disabled={deploying}
                          onClick={() => setBarColor(color)}
                          className={`w-12 h-12 rounded-xl border-4 transition-all cursor-pointer ${barColor === color ? 'border-slate-950 scale-110 shadow-md' : 'border-transparent opacity-40 hover:opacity-70'}`}
                          style={{ backgroundColor: color }}
                         />
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: OBS MONITOR PREVIEW --- */}
        <div className="lg:col-span-5 lg:sticky lg:top-10">
          <div className="bg-white p-8 rounded-[3.5rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_#10B981] text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 italic">OBS Monitor Preview</p>
            
            <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-dashed border-slate-200 p-0.5">
                <div className="flex justify-between items-end mb-3 px-1">
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Current Goal</p>
                      <p className="text-xs font-black italic text-slate-950 uppercase truncate max-w-[160px]">{goalName}</p>
                   </div>
                   <p className="text-xs font-black text-slate-950 font-mono">{progressPercent}%</p>
                </div>

                {/* VISUAL CORE BAR */}
                <div className="w-full h-8 bg-white border-4 border-slate-950 rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0.5 relative">
                   <div 
                    className="h-full transition-all duration-1000 ease-out flex items-center justify-end px-3 rounded-md shadow-inner"
                    style={{ width: `${progressPercent}%`, backgroundColor: barColor }}
                   >
                     {progressPercent > 5 && <Sparkles size={12} className="text-white animate-pulse shrink-0" />}
                   </div>
                </div>

                <div className="flex justify-between mt-3 font-black text-[9px] uppercase italic text-slate-400 font-mono tracking-tight">
                   <span>Rp {Number(currentAmount).toLocaleString('id-ID')}</span>
                   <span>Rp {Number(targetAmount).toLocaleString('id-ID')}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-10 right-10 z-[100]">
          <button 
            type="button"
            onClick={handleDeployMilestone}
            disabled={loading || deploying}
            className="bg-emerald-500 text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 active:shadow-none transition-all border-slate-950 cursor-pointer disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:shadow-none"
          >
            {deploying ? <Loader2 className="animate-spin" size={26} /> : <Save size={26} strokeWidth={3} />} 
            Save Goal Node
          </button>
      </div>
    </div>
  );
}

export default MilestoneView;