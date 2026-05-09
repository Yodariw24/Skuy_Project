import { Moon, Settings, Sparkles, ShieldCheck, MessageSquare, Zap, Globe } from 'lucide-react'
import ProfileSettings from './ProfileSettings'
import { motion } from 'framer-motion'

export default function SettingsView({ user, setUser }) {
  // ✅ PENCEGAHAN BLANK SCREEN (Sultan Guard)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-2xl rotate-45" />
          <div className="absolute top-0 w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-2xl animate-spin rotate-45" />
        </div>
      </div>
    );
  }

  const isSecured = user?.is_two_fa_enabled;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-24 px-4 font-sans text-left"
    >
      {/* --- HEADER SULTAN --- */}
      <div className="mb-12 px-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-[4px_4px_0px_0px_#7C3AED]">
                <Settings size={22} strokeWidth={3} />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">System <span className="text-violet-600">Settings</span></h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-[0.3em] ml-1">
              Identity Node & Infrastructure Configuration
            </p>
          </div>

          {/* Security Status Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isSecured ? 'bg-emerald-50' : 'bg-amber-50'}`}
          >
            {isSecured ? <ShieldCheck className="text-emerald-600" size={18} /> : <MessageSquare className="text-amber-600" size={18} />}
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Security Level</span>
              <span className={`text-[10px] font-black uppercase italic tracking-widest ${isSecured ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSecured ? 'SECURED SULTAN' : 'STANDARD SESSION'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: PROFILE ENGINE */}
        <div className="lg:col-span-8">
          <ProfileSettings user={user} setUser={setUser} />
        </div>

        {/* RIGHT COLUMN: SYSTEM NODES */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          
          {/* Dashboard UI Configuration */}
          <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#F1F5F9] relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                <Sparkles size={120} />
            </div>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 italic">Interface Protocol</h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between p-6 bg-slate-50 border-4 border-slate-100 rounded-[2rem] transition-all opacity-60 grayscale cursor-not-allowed">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-sm text-slate-400 text-left">
                    <Moon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase text-slate-700 tracking-tight leading-none mb-1">Night Mode</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Encrypted</p>
                  </div>
                </div>
                
                <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute top-[3px] left-[4px] bg-white rounded-full h-4 w-4 transition-all"></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-violet-50 border-2 border-dashed border-violet-200">
                <p className="text-[9px] text-violet-600 font-black italic uppercase text-center leading-relaxed tracking-[0.2em]">
                  *System Alert: <br/> Advanced styling in development
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure Node Info */}
          <div className="p-10 bg-slate-950 rounded-[3.5rem] text-white shadow-[12px_12px_0px_0px_#7C3AED] relative overflow-hidden border-4 border-slate-950">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-600 blur-[80px] opacity-30 animate-pulse" />
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Globe size={16} className="text-violet-400" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Infrastructure Node</p>
                </div>

                <div className="space-y-6">
                   <div className="text-left">
                      <p className="text-[8px] uppercase font-black text-slate-500 mb-2 tracking-widest italic">Sultan Unique ID</p>
                      <p className="text-[11px] font-mono text-violet-400 break-all bg-white/5 p-4 rounded-2xl border-2 border-white/5 select-all hover:border-violet-500/30 transition-all">
                        {user?.id || 'UNIDENTIFIED'}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      {/* WA Status Node */}
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border-2 border-white/5">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={14} className="text-slate-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase italic ${user?.phone_number ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {user?.phone_number ? 'LINKED' : 'DISCONNECTED'}
                        </span>
                      </div>

                      {/* 2FA Status Node */}
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border-2 border-white/5">
                        <div className="flex items-center gap-3 text-left">
                          <Zap size={14} className={isSecured ? "text-violet-400" : "text-slate-500"} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-left">2FA Security</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase italic ${isSecured ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isSecured ? 'PROTOCOL ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 px-1 pt-4">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em] italic">Railway Cloud Sync Stable</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}