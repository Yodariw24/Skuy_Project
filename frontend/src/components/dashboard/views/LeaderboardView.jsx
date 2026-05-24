import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Crown, Copy, Save, Filter, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios'; 

function LeaderboardView({ user }) {
  // Ambil URL domain dinamis pangkalan
  const currentUrl = window.location.origin;
  const overlayUrl = `${currentUrl}/widget/${user?.username || user?.id}/leaderboard`;
  
  const [period, setPeriod] = useState('all_time');
  const [maxDisplay, setMaxDisplay] = useState(5);
  const [sultans, setSultans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  // 📡 PROTOKOL PIPELINE: Sedot data donatur tertinggi langsung dari PostgreSQL Railway
  const fetchLiveLeaderboard = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/donations/leaderboard-rank?period=${period}&limit=${maxDisplay}`);
      if (res.data.success) {
        setSultans(res.data.sultans || []);
      }
    } catch (err) {
      console.warn("⚠️ Mode Sandbox: Gagal kontak server, mengaktifkan data simulasi.");
      setSultans([
        { name: 'Sultan_Ari', amount: 5000000 },
        { name: 'Rifan_Gacor', amount: 2500000 },
        { name: 'Donatur_Setia', amount: 1000000 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [period, maxDisplay, user]);

  // Pemicu re-fetch otomatis setiap kali filter dropdown or tombol periode diklik
  useEffect(() => {
    fetchLiveLeaderboard();
  }, [fetchLiveLeaderboard]);

  const showSultanToast = (title) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'border-4 border-slate-950 bg-white rounded-2xl shadow-[4px_4px_0px_0px_#7C3AED]',
        title: 'font-sans font-black uppercase text-slate-950 text-[10px] tracking-widest'
      }
    });
    Toast.fire({ icon: 'success', title });
  };

  // 🚀 TRIGGER DEPLOY PROTOCOL: Sinkronisasi dan kirim sinyal update ke OBS Source via WebSockets
  const handleSyncLeaderboard = async () => {
    setDeploying(true);
    try {
      // Kirim payload modifikasi filter ke tabel widget_settings lo biar OBS-nya ikut berubah real-time
      const res = await api.post('/user/widgets/update', {
        userId: user.id,
        widgetType: 'leaderboard',
        config: { period, limit: maxDisplay }
      });

      if (res.data.success) {
        showSultanToast('<b>RANKING DEPLOYED</b> <span>Hall of fame updated!</span>');
      }
    } catch (err) {
      showSultanToast('<b>DEPLOY FAILED</b> <span>Gagal sinkronisasi OBS.</span>', 'error');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-10 text-left pb-32 selection:bg-violet-600 selection:text-white">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 px-1">
        <div className="p-3 bg-amber-400 text-slate-950 border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] rounded-2xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* --- LEFT: SETTINGS CONFIGURATION --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* URL CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-xs mb-6 flex items-center gap-2">
              <Crown size={18} className="text-amber-500" /> Leaderboard Link
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
                  showSultanToast('<b>LINK COPIED</b> <span>Klasemen siap tempel!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-amber-400 hover:text-slate-950 transition-all shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none border-2 border-slate-950 cursor-pointer"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* FILTER CONFIG CARD */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-xs mb-8 flex items-center gap-2 border-b-4 border-slate-50 pb-4">
               <Filter size={18} className="text-amber-500" /> Filter Protocol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block">Ranking Period</label>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                  {['daily', 'monthly', 'all_time'].map((p) => (
                    <button 
                      type="button"
                      key={p}
                      disabled={loading}
                      onClick={() => setPeriod(p)}
                      className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase transition-all cursor-pointer border-0 ${period === p ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 bg-transparent'}`}
                    >
                      {p.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] block">Sultan Display Limit</label>
                <div className="relative group">
                  <select 
                    value={maxDisplay}
                    disabled={loading}
                    onChange={(e) => setMaxDisplay(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border-4 border-slate-100 p-4 rounded-2xl font-black text-slate-950 focus:border-slate-950 outline-none transition-all appearance-none italic cursor-pointer relative z-0 text-xs tracking-wider"
                  >
                    <option value="3">TOP 3 SULTANS</option>
                    <option value="5">TOP 5 SULTANS</option>
                    <option value="10">TOP 10 SULTANS</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                    <ChevronDown size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: LIVE OBS PREVIEW --- */}
        <div className="lg:col-span-5 lg:sticky lg:top-10">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-amber-400 shadow-[15px_15px_0px_0px_#000] text-center min-h-[350px] flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-8 italic">OBS Mockup Preview</p>
              
              <div className="space-y-4 mb-8">
                 {loading ? (
                   <div className="py-14 flex flex-col items-center justify-center gap-3 text-slate-500">
                     <Loader2 className="animate-spin text-amber-400" size={28} />
                     <p className="text-[8px] font-black uppercase tracking-widest italic">Recalculating Ranks...</p>
                   </div>
                 ) : sultans.length > 0 ? (
                   sultans.map((sultan, index) => (
                     <div key={index} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border-2 border-white/5 hover:border-amber-400/50 transition-all group">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-xs shrink-0 ${index === 0 ? 'bg-amber-400 text-slate-950 rotate-3 border border-slate-950' : 'bg-white/10 text-white'}`}>
                           {index === 0 ? <Crown size={14} /> : index + 1}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                           <p className="text-xs font-black text-white uppercase italic tracking-tight truncate px-0.5">{sultan.name}</p>
                           <p className="text-[9px] font-bold text-amber-400/70 uppercase font-mono tracking-tight mt-0.5">Total: Rp {Number(sultan.amount).toLocaleString('id-ID')}</p>
                        </div>
                        <Sparkles size={12} className={`text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all ${index === 0 ? 'opacity-100 animate-pulse' : ''}`} />
                     </div>
                   ))
                 ) : (
                   <div className="py-14 text-center text-[9px] font-black uppercase text-slate-600 italic tracking-widest">Papan klasemen belum terisi, Ri.</div>
                 )}
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 pointer-events-none">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                  Showing current {period.replace('_', ' ')} real logs
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-10 right-10 z-[100]">
          <button 
            type="button"
            onClick={handleSyncLeaderboard}
            disabled={loading || deploying}
            className="bg-amber-400 text-slate-950 px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 active:shadow-none transition-all cursor-pointer disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:shadow-none"
          >
            {deploying ? <Loader2 className="animate-spin" size={26} /> : <Save size={26} strokeWidth={3} />} 
            Sync Hall of Fame
          </button>
      </div>
    </div>
  );
}

export default LeaderboardView;