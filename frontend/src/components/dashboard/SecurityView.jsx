import React from 'react';
import { 
  ShieldCheck, Lock, Loader2, CheckCircle2, Zap, 
  ShieldAlert, Fingerprint, Shield, QrCode, Scan, Smartphone
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const SecurityView = ({ 
  user, 
  qrCodeUrl, // ✅ Sekarang pakai QR Code URL dari backend
  onGenerateQR, 
  onVerify, 
  onDisable, 
  otp, 
  setOtp, 
  loading 
}) => {
  const isEnabled = user?.is_two_fa_enabled === true;

  return (
    <div className="max-w-2xl mx-auto space-y-10 p-6 font-sans text-left pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="space-y-2 px-2">
        <div className="flex items-center gap-2 mb-1">
          <QrCode className="text-[#7C3AED]" size={18} />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Security Infrastructure</p>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
          QR-AUTH <span className="text-[#7C3AED]">PROTOCOL</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium italic">
          Gunakan aplikasi Authenticator (Google/Authy) untuk keamanan Sultan tanpa batas.
        </p>
      </div>

      {/* --- BANNER STATUS --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden border-4 border-slate-950 p-8 rounded-[3rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-all duration-500 ${
          isEnabled ? 'bg-emerald-50 border-emerald-500 shadow-emerald-500/20' : 'bg-white'
        }`}
      >
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isEnabled ? 'text-emerald-600' : 'text-amber-500'}`}>
                {isEnabled ? 'System Fully Encrypted' : 'Standard Protection'}
            </p>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-3">
            {isEnabled ? 'Protected' : 'Unsecured'}
          </h2>
        </div>

        <div className={`p-5 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform duration-500 ${
          isEnabled ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-300'
        }`}>
            {isEnabled ? <ShieldCheck size={28} strokeWidth={3} /> : <Shield size={28} strokeWidth={3} />}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white p-10 rounded-[3.5rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_#7C3AED] relative overflow-hidden"
          >
            {!qrCodeUrl ? (
              <div className="space-y-8 text-center flex flex-col items-center">
                <div className="relative p-7 bg-violet-50 rounded-[2.5rem] text-[#7C3AED] border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]">
                    <Scan size={45} strokeWidth={2.5} />
                    <Zap className="absolute -top-2 -right-2 text-[#FF1493]" size={24} fill="currentColor" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">Initialize TOTP QR</h3>
                  <p className="text-slate-500 font-bold text-[11px] uppercase leading-relaxed max-w-sm mx-auto italic">
                    Ganti WhatsApp yang limit dengan sistem QR Code gratis selamanya.
                    <br/><span className="text-slate-950 not-italic font-black text-xs uppercase mt-2 block">Cepat, Unlimited, & Professional.</span>
                  </p>
                </div>

                <button 
                  onClick={onGenerateQR}
                  disabled={loading} 
                  className="group bg-[#7C3AED] text-white px-12 py-6 rounded-3xl font-black uppercase italic tracking-widest text-sm flex items-center gap-4 border-4 border-slate-950 shadow-[0_8px_0_0_#4c1d95] hover:translate-y-1 active:translate-y-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24}/> : <>Generate Secret Key <Zap size={20}/></>}
                </button>
              </div>
            ) : (
              <div className="space-y-8 flex flex-col items-center">
                <div className="text-center space-y-2">
                   <h3 className="text-xl font-black italic uppercase text-slate-950 tracking-tighter">Scan Secret Node</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase italic">Gunakan Google Authenticator / Authy</p>
                </div>

                {/* --- TEMPAT QR CODE HASIL GENERATE --- */}
                <div className="p-4 bg-white border-4 border-slate-950 rounded-[2.5rem] shadow-[10px_10px_0_0_#FF1493] relative">
                   <img src={qrCodeUrl} alt="QR Protocol" className="w-52 h-52 rounded-xl" />
                   <div className="absolute -bottom-4 -right-4 bg-[#7C3AED] text-white p-2 rounded-xl border-2 border-slate-950">
                      <Fingerprint size={20} />
                   </div>
                </div>

                <div className="max-w-xs mx-auto space-y-6 w-full">
                  <div className="text-center">
                    <input 
                      type="text" 
                      maxLength="6" 
                      placeholder="••••••"
                      autoFocus
                      className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-[2rem] text-center text-5xl font-black tracking-[0.4em] outline-none focus:bg-white focus:ring-4 focus:ring-[#7C3AED]/10 transition-all"
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button 
                    onClick={onVerify}
                    disabled={otp.length < 6 || loading} 
                    className="w-full bg-slate-950 text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 transition-all flex justify-center items-center gap-3 border-4 border-white/10"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <>Verify & Activate <ShieldCheck size={20}/></>}
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
              <div className="relative">
                <div className="w-28 h-28 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-white rotate-3">
                    <ShieldCheck size={64} strokeWidth={2.5} />
                </div>
                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">STATUS: SECURED</h3>
                <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed max-w-xs mx-auto">
                  Protokol QR-TOTP Aktif. Akun lo aman dari limit WA dan pembajakan.
                </p>
              </div>
              
              <div className="mt-14 pt-8 border-t-2 border-dashed border-slate-100 flex flex-col items-center">
                <button 
                  onClick={onDisable}
                  className="group flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 hover:text-rose-500 transition-all tracking-[0.3em]"
                >
                  <ShieldAlert size={14} className="group-hover:animate-bounce" />
                  Copot Protokol Keamanan
                </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityView;