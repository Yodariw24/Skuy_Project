import { Moon, Settings, Sparkles, ShieldCheck, MessageSquare } from 'lucide-react'
import ProfileSettings from './ProfileSettings'
import { motion } from 'framer-motion'

export default function SettingsView({ user, setUser }) {
  // ✅ PENCEGAHAN BLANK SCREEN
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Cek status keamanan buat nampilin badge di setting
  const isSecured = user?.is_two_fa_enabled;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-20 px-2 font-sans text-left"
    >
      {/* --- HEADER --- */}
      <div className="mb-10 px-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg">
                <Settings size={18} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">System Settings</h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-[0.2em] ml-1">
              Konfigurasi identitas publik dan preferensi ekosistem Skuy
            </p>
          </div>

          {/* Badge Status Keamanan di Header */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border-2 ${isSecured ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600' : 'bg-amber-50 border-amber-500/20 text-amber-600'}`}>
            {isSecured ? <ShieldCheck size={14} /> : <MessageSquare size={14} />}
            <span className="text-[9px] font-black uppercase tracking-widest italic">
              {isSecured ? 'Secured Sultan' : 'Standard Session'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: CORE PROFILE FORM */}
        <div className="lg:col-span-8">
          <ProfileSettings user={user} setUser={setUser} />
        </div>

        {/* KOLOM KANAN: APP PREFERENCES */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          
          {/* Dashboard UI Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Sparkles size={80} />
            </div>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 px-1 italic">Dashboard UI</h3>
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between p-5 bg-slate-50/80 border border-slate-100 rounded-[1.8rem] transition-all hover:bg-white hover:border-violet-100 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-slate-400">
                    <Moon size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-tight">Night Protocol</span>
                </div>
                
                <div className="w-11 h-6 bg-slate-200 rounded-full relative opacity-50">
                  <div className="absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-all"></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-violet-50/50 border border-dashed border-violet-100">
                <p className="text-[9px] text-violet-600 font-black italic uppercase text-center leading-relaxed tracking-widest">
                  *Experimental Feature: <br/> Dark theme is being encrypted
                </p>
              </div>
            </div>
          </div>

          {/* Railway Session Card */}
          <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-4 border-slate-900">
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-violet-600 blur-3xl opacity-40" />
             <div className="relative z-10">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-3">System Node Info</p>
                <div className="space-y-4">
                   <div>
                      <p className="text-[7px] uppercase font-black text-slate-500 mb-1">Session ID</p>
                      <p className="text-[10px] font-mono text-violet-400 break-all bg-white/5 p-2 rounded-lg border border-white/5 select-all">
                        {user?.id || 'NO_SESSION'}
                      </p>
                   </div>
                   
                   <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSecured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest">2FA Status</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase italic ${isSecured ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {isSecured ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                   </div>

                   <div className="flex items-center gap-2 px-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.2em]">Railway Sync Stable</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}