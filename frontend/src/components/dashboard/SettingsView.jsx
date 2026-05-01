import { Moon, Settings, Sparkles } from 'lucide-react'
import ProfileSettings from './ProfileSettings'
import { motion } from 'framer-motion'

export default function SettingsView({ user, setUser }) {
  // ✅ PENCEGAHAN BLANK SCREEN: Jika user sedang fetch, kasih loading state tipis
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // Animasi masuk tetap halus agar terlihat premium
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-20 px-2 font-sans text-left"
    >
      {/* --- HEADER --- */}
      <div className="mb-10 px-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
            <Settings size={18} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">System Settings</h1>
        </div>
        <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-[0.2em] ml-1">
          Konfigurasi identitas publik dan preferensi ekosistem Skuy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: CORE PROFILE FORM (Koneksi ke Backend Railway via ProfileSettings) */}
        <div className="lg:col-span-8">
          {/* ✅ Pastikan ProfileSettings di dalamnya sudah pakai instance api kita */}
          <ProfileSettings user={user} setUser={setUser} />
        </div>

        {/* KOLOM KANAN: APP PREFERENCES */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            {/* Visual Accent */}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Sparkles size={80} />
            </div>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1 italic">Dashboard UI</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-5 bg-slate-50/80 border border-slate-100 rounded-[1.8rem] transition-all hover:bg-white hover:border-violet-100">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                    <Moon size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-tight">Night Protocol</span>
                </div>
                
                {/* Toggle Button (Experimental) */}
                <label className="relative inline-flex items-center cursor-not-allowed opacity-50">
                  <input type="checkbox" disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-violet-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>

              {/* Status Info */}
              <div className="p-4 rounded-2xl bg-violet-50/50 border border-dashed border-violet-100">
                <p className="text-[9px] text-violet-600 font-black italic uppercase text-center leading-relaxed tracking-widest">
                  *Experimental Feature: <br/> Dark theme is being encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Sesi Info Kartu Kecil - Railway Connection Info */}
          <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-600 blur-3xl opacity-40" />
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">Railway Session</p>
             <div className="text-[10px] font-bold italic text-white leading-relaxed">
               Active User ID: <br/>
               <span className="text-violet-400 break-all font-mono opacity-80 select-all">
                {user?.id || 'NO_SESSION'}
               </span>
               <div className="mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[8px] text-emerald-500 uppercase tracking-widest">Sync Stable</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}