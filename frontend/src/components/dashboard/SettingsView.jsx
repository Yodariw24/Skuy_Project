import { Moon, Settings, Sparkles, ShieldCheck, MessageSquare, Zap, Globe, Landmark, CheckCircle2 } from 'lucide-react'
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
  // Logic deteksi data bank agar sinkron ke UI
  const hasBankData = user?.bank_name && user?.bank_account_number;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-24 px-4 font-sans text-left"
    >
      {/* --- HEADER SECTION --- */}
      <div className="mb-12 px-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-[4px_4px_0px_0px_#7C3AED]">
                <Settings size={22} strokeWidth={3} />
              </div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none text-left">
                System <span className="text-violet-600">Settings</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-[0.3em] ml-1 text-left">
              Identity Node & Infrastructure Configuration
            </p>
          </div>

          {/* Security Status Badge */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isSecured ? 'bg-emerald-50' : 'bg-amber-50'}`}
          >
            <div className={`p-2 rounded-xl ${isSecured ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
              {isSecured ? <ShieldCheck size={20} strokeWidth={3} /> : <MessageSquare size={20} strokeWidth={3} />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vault Status</span>
              <span className={`text-[11px] font-black uppercase italic tracking-widest ${isSecured ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isSecured ? 'Protocol Secured' : 'Action Required'}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT: PROFILE ENGINE */}
        <div className="lg:col-span-8">
          <ProfileSettings user={user} setUser={setUser} />
        </div>

        {/* RIGHT: SYSTEM NODES */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          
          {/* PAYOUT CONFIG STATUS (Monitor Data Bank Ri!) */}
          <div className="bg-white p-10 rounded-[3.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_#F1F5F9] relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-8">
              <Landmark size={18} className="text-violet-600" />
              <h3 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic text-left">Payout Node</h3>
            </div>
            
            <div className={`p-6 rounded-[2rem] border-4 transition-all duration-500 ${hasBankData ? 'bg-emerald-50 border-emerald-500/20' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
              {hasBankData ? (
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest">Linked & Ready</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-950 uppercase italic tracking-tight leading-none">{user.bank_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 font-mono tracking-wider">{user.bank_account_number}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none truncate">{user.bank_account_name}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 py-2">
                  <div className="w-10 h-10 bg-slate-200 rounded-2xl mx-auto flex items-center justify-center text-slate-400">
                    <Landmark size={20} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-widest leading-relaxed">
                    Account Missing <br/> <span className="text-[8px] opacity-60">Setup in Profile</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Infrastructure Node Info */}
          <div className="p-10 bg-slate-950 rounded-[3.5rem] text-white shadow-[12px_12px_0px_0px_#7C3AED] relative overflow-hidden border-4 border-slate-950 text-left">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-600 blur-[80px] opacity-30 animate-pulse" />
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <Globe size={16} className="text-violet-400" />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 text-left">Infrastructure Node</p>
                </div>

                <div className="space-y-6 text-left">
                   <div>
                      <p className="text-[8px] uppercase font-black text-slate-500 mb-2 tracking-widest italic text-left">Sultan Unique ID</p>
                      <p className="text-[11px] font-mono text-violet-400 break-all bg-white/5 p-4 rounded-2xl border-2 border-white/5 select-all hover:border-violet-500/30 transition-all text-left">
                        {user?.id || 'UNIDENTIFIED'}
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border-2 border-white/5 transition-colors hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={14} className="text-slate-500" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-left">WhatsApp</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase italic ${user?.phone_number ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {user?.phone_number ? 'LINKED' : 'OFFLINE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border-2 border-white/5 transition-colors hover:bg-white/10">
                        <div className="flex items-center gap-3">
                          <Zap size={14} className={isSecured ? "text-violet-400" : "text-slate-500"} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-left">2FA Security</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase italic ${isSecured ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isSecured ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 px-1 pt-4 border-t border-white/5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-[0.3em] italic">Railway Sync Stable</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}