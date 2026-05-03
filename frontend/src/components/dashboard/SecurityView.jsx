import React from 'react';
import { ShieldCheck, Lock, Loader2, CheckCircle2, Zap, MessageSquare, ShieldAlert, Fingerprint } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const SecurityView = ({ 
  user, 
  otpSent, 
  onGenerateQR, 
  onVerify, 
  onDisable, 
  otp, 
  setOtp, 
  loading 
}) => {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-10 p-6 font-sans text-left pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="space-y-2 px-2">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
          Security <span className="text-violet-600">Protocol</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] italic">Lapis pelindung aset digital sultan skuy</p>
      </div>

      {/* --- BANNER STATUS --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden border-4 border-slate-950 p-8 rounded-[3rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-colors duration-500 ${isEnabled ? 'bg-emerald-50/50' : 'bg-white'}`}
      >
        <div className="absolute -right-4 -top-4 opacity-[0.03] text-slate-950">
            <ShieldCheck size={180} strokeWidth={1} />
        </div>

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-2 w-2 rounded-full animate-ping ${isEnabled ? 'bg-emerald-500' : 'bg-violet-600'}`} />
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isEnabled ? 'text-emerald-600' : 'text-violet-600'}`}>
                {isEnabled ? 'System Encrypted' : 'Security Setup Required'}
            </p>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-3">
            {isEnabled ? 'Protected' : 'Authentication'}
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
            Current Node: @{user?.username || 'unknown'}
          </p>
        </div>

        <div className={`p-5 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
            {isEnabled ? <ShieldCheck size={28} strokeWidth={3} /> : <Lock size={28} strokeWidth={3} />}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white p-10 rounded-[3.5rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-emerald-500 to-amber-500" />

            {!otpSent ? (
              <div className="space-y-8 text-center flex flex-col items-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-30 rounded-full" />
                    <div className="relative p-7 bg-emerald-50 rounded-[2.5rem] text-emerald-600 border-4 border-slate-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <Smartphone size={45} strokeWidth={2.5} />
                    </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">
                    Aktifkan 2FA WhatsApp
                  </h3>
                  <p className="text-slate-500 font-bold text-xs uppercase leading-relaxed max-w-sm mx-auto italic">
                    Kunci akses saldo lo dengan protokol WhatsApp. <br/>
                    <span className="text-slate-900 not-italic">Simple, Cepet, & Gacor Keamanannya!</span>
                  </p>
                </div>

                <button 
                  onClick={onGenerateQR}
                  disabled={loading} 
                  className="group relative bg-emerald-500 text-white px-12 py-6 rounded-3xl font-black uppercase italic tracking-widest text-sm flex items-center gap-4 border-4 border-slate-950 shadow-[0_8px_0_0_#000] hover:shadow-[0_4px_0_0_#000] hover:translate-y-1 active:translate-y-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24}/>
                  ) : (
                    <>Kirim Kode Protokol <Zap size={22} className="group-hover:fill-current transition-all" /></>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 flex flex-col items-center">
                <div className="bg-amber-50 p-6 rounded-3xl border-4 border-slate-950 w-full shadow-[6px_6px_0px_0px_#f59e0b] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <MessageSquare size={40} />
                  </div>
                  <p className="text-xs font-black text-amber-600 uppercase italic mb-1 flex items-center gap-2">
                    <Fingerprint size={16} /> Step 1: Verification Data
                  </p>
                  <p className="text-[11px] text-slate-600 font-bold leading-tight uppercase text-left">
                    Sistem sudah mengirim 6 digit kode ke WhatsApp lo. Cek chat dari SkuyGG System!
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-6 w-full">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-900 uppercase italic mb-4">Step 2: Input OTP Code</p>
                    <input 
                      type="text" 
                      maxLength="6" 
                      placeholder="••••••"
                      className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-[2rem] text-center text-5xl font-black tracking-[0.3em] outline-none focus:bg-white focus:shadow-inner transition-all placeholder:text-slate-200"
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button 
                    onClick={onVerify}
                    disabled={otp.length < 6 || loading} 
                    className="w-full bg-slate-950 text-white py-6 rounded-[2rem] font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#1e293b] active:translate-y-1 transition-all hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed flex justify-center items-center gap-3 border-4 border-white/10"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <>Initialize Shield <ShieldCheck size={20}/></>}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="secure"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-emerald-500 p-14 rounded-[4rem] text-center shadow-[15px_15px_0px_0px_#10b981] relative overflow-hidden"
          >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02]">
                <Zap size={200} />
              </div>

              <div className="relative">
                <div className="w-28 h-28 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100 border-4 border-white rotate-3">
                    <CheckCircle2 size={64} strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">STATUS: GACOR</h3>
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed">
                  Encryption Layer Active. Aset lo aman Ri!
                </p>
              </div>
              
              <div className="mt-14 pt-8 border-t-2 border-dashed border-slate-100 flex flex-col items-center">
                <button 
                  onClick={onDisable}
                  disabled={loading}
                  className="group flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 hover:text-red-500 transition-all tracking-[0.3em] disabled:opacity-50"
                >
                  <ShieldAlert size={14} className="group-hover:animate-bounce" />
                  {loading ? 'Processing Protocol...' : 'Disable Security Layer'}
                </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Penambahan icon yang ketinggalan
const Smartphone = ({ size, ...props }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      {...props}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
      <path d="M12 18h.01"/>
    </svg>
);

export default SecurityView;