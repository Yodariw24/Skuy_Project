import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, Settings, ShieldAlert, Copy, Play, Save, Trash2, Clock, Loader2, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/axios'; 

function MediaShareView({ user }) {
  const currentUrl = window.location.origin;
  const overlayUrl = `${currentUrl}/widget/${user?.username || user?.id}/mediashare`;
  
  const [minDonation, setMinDonation] = useState(5000);
  const [pricePerSec, setPricePerSec] = useState(100);
  const [isModerationActive, setIsModerationActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);

  // 📡 PROTOKOL PIPELINE: Ambil konfigurasi Media Share ter-update dari PostgreSQL Railway
  const fetchMediaShareConfig = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get('/api/donations/mediashare/config');
      if (res.data.success && res.data.data) {
        setMinDonation(res.data.data.min_donation);
        setPricePerSec(res.data.data.price_per_second);
        setIsModerationActive(res.data.data.is_moderation_active);
      }
    } catch (err) {
      console.warn("⚠️ Mode Sandbox: Gagal sinkronisasi cloud, mengaktifkan pangkalan lokal.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMediaShareConfig();
  }, [fetchMediaShareConfig]);

  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: 'border-4 border-slate-950 bg-white rounded-2xl shadow-[4px_4px_0px_0px_#EF4444]',
        title: 'font-sans font-black uppercase text-slate-950 text-[10px] tracking-widest'
      }
    });
    Toast.fire({ icon, title });
  };

  // 🚀 TRIGGER DEPLOY PROTOCOL: Simpan konfigurasi ke DB dan tembak update instan ke OBS via Socket
  const handleDeployConfig = async () => {
    if (Number(pricePerSec) <= 0) {
      return showSultanToast('<b>TARIF INVALID</b> <span>Harga per detik gak boleh 0, Ri!</span>', 'error');
    }

    setDeploying(true);
    try {
      const res = await api.put('/api/donations/mediashare/config', {
        min_donation: minDonation,
        price_per_second: pricePerSec,
        is_moderation_active: isModerationActive
      });

      if (res.data.success) {
        showSultanToast('<b>MEDIA SYNCED</b> <span>Config aktif di OBS lo!</span>');
      }
    } catch (err) {
      showSultanToast('<b>DEPLOY FAILED</b> <span>Gagal kontak server Railway.</span>', 'error');
    } finally {
      setDeploying(false);
    }
  };

  // 🗑️ PURGE QUEUE ACTION: Mengosongkan antrean video donatur jika terjadi hal darurat
  const handlePurgeQueue = async () => {
    const confirm = await Swal.fire({
      title: 'KOSONGKAN ANTREAN?',
      text: "Semua antrean video dari donatur Sultan bakalan dihapus permanen, Ri!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, PURGE ALL',
      cancelButtonText: 'BATAL',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] border-4 border-slate-950 bg-white shadow-[8px_8px_0px_0px_#000] p-6',
        title: 'font-black italic uppercase tracking-tight text-slate-950',
        confirmButton: 'bg-red-500 text-white text-[10px] font-black px-6 py-3 rounded-xl mx-2 uppercase italic border-2 border-slate-950 shadow-[3px_3px_0px_0px_#EF4444]',
        cancelButton: 'bg-slate-100 text-slate-400 text-[10px] font-black px-6 py-3 rounded-xl mx-2 uppercase italic'
      }
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.delete('/api/donations/mediashare/purge');
      if (res.data.success) {
        showSultanToast('<b>QUEUE PURGED</b> <span>Antrean steril total!</span>');
      }
    } catch (err) {
      showSultanToast('<b>PURGE FAILED</b> <span>Gagal mengosongkan antrean.</span>', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic animate-pulse">Sinkronisasi Jaringan Media Node Cloud...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left pb-32 selection:bg-red-100 selection:text-red-600 font-sans">
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 px-1">
        <div className="p-3 bg-red-500 text-white border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] rounded-2xl">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* --- LEFT: SETTINGS --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Widget URL Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-xs mb-6 flex items-center gap-2 text-red-500">
              <Play size={18} fill="currentColor" /> Browser Source URL
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
                  showSultanToast('<b>LINK COPIED</b> <span>Siap pasang di OBS!</span>');
                }}
                className="p-5 bg-slate-950 text-white rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_#000] border-2 border-slate-950 cursor-pointer"
              >
                <Copy size={24} />
              </button>
            </div>
          </div>

          {/* Pricing Config Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <h3 className="font-black italic uppercase text-xs mb-8 flex items-center gap-2 border-b-4 border-slate-50 pb-4">
               <Settings size={18} className="text-slate-950" /> Economics Logic
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Min. Donation</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                    <input 
                      type="number" 
                      disabled={deploying}
                      value={minDonation}
                      onChange={(e) => setMinDonation(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">Price Per Second</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">Rp</span>
                    <input 
                      type="number" 
                      disabled={deploying}
                      value={pricePerSec}
                      onChange={(e) => setPricePerSec(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border-4 border-slate-100 p-5 pl-14 rounded-2xl font-black text-lg focus:bg-white focus:border-slate-950 outline-none transition-all"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Moderation Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#000]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black italic uppercase text-xs flex items-center gap-2 text-amber-500">
                <ShieldAlert size={18} /> Moderation Shield
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" disabled={deploying} checked={isModerationActive} onChange={() => setIsModerationActive(!isModerationActive)} className="sr-only peer" />
                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 border-2 border-slate-950 shadow-[2px_2px_0px_0px_#000]"></div>
              </label>
            </div>
            <p className="text-xs font-bold text-slate-400 italic">"Otomatis tahan video untuk review manual di dashboard sebelum meluncur live di screen."</p>
          </div>
        </div>

        {/* --- RIGHT: PREVIEW & STATUS --- */}
        <div className="lg:col-span-5 lg:sticky lg:top-10 space-y-8">
          <div className="bg-slate-950 p-8 rounded-[3.5rem] border-4 border-red-500 shadow-[15px_15px_0px_0px_#000] text-center">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-8 italic">OBS Monitor Preview</p>
            
            <div className="aspect-video bg-black rounded-[2rem] border-2 border-white/10 flex items-center justify-center mb-8 relative group overflow-hidden pointer-events-none">
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
              <div className="flex justify-between p-4 bg-white/5 rounded-2xl border-2 border-white/5 items-center">
                 <span className="text-[9px] font-black text-slate-500 uppercase">Est. Base Duration</span>
                 <span className="text-xs font-black text-white italic font-mono">
                   {Number(pricePerSec) > 0 ? (minDonation / pricePerSec).toFixed(0) : 0} Detik
                 </span>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={handlePurgeQueue}
            className="w-full py-6 bg-white border-4 border-slate-950 rounded-[2rem] font-black uppercase italic tracking-widest text-xs shadow-[8px_8px_0px_0px_#EF4444] hover:translate-y-[-2px] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 border-slate-950 cursor-pointer"
          >
            <Trash2 size={18} /> Purge Video Queue
          </button>
        </div>
      </div>

      {/* --- FLOATING SAVE BAR --- */}
      <div className="fixed bottom-10 right-10 z-[100]">
          <button 
            type="button"
            onClick={handleDeployConfig}
            disabled={loading || deploying}
            className="bg-red-500 text-white px-12 py-7 rounded-[2.5rem] font-black italic uppercase tracking-[0.2em] text-sm shadow-[12px_12px_0px_0px_#000] border-4 border-slate-950 flex items-center gap-4 hover:translate-y-[-6px] active:translate-y-2 active:shadow-none transition-all cursor-pointer disabled:bg-slate-200 disabled:border-slate-300 disabled:text-slate-400 disabled:shadow-none"
          >
            {deploying ? <Loader2 className="animate-spin" size={26} /> : <Save size={26} strokeWidth={3} />} 
            Deploy Config
          </button>
      </div>
    </div>
  );
}