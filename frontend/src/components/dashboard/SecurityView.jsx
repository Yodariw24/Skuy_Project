import React from 'react';
import { ShieldCheck, Lock, Loader2, CheckCircle2, Zap, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityView = ({ user, otpSent, onGenerateQR, onVerify, onDisable, otp, setOtp, loading, qrCode }) => {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 font-sans text-left">
      {/* Banner Status */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-slate-950 p-8 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between"
      >
        <div className="space-y-1">
          <h2 className="text-2xl font-black italic uppercase text-slate-950 flex items-center gap-3">
            {isEnabled ? <ShieldCheck className="text-emerald-500" size={32} /> : <Lock className="text-violet-600" size={32} />}
            {isEnabled ? 'Full Protected' : 'Security Setup'}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Agent: @{user?.username || 'unknown'}</p>
        </div>
        {isEnabled && (
          <div className="hidden md:block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border-2 border-emerald-100 text-[10px] font-black uppercase italic tracking-widest">
            Active
          </div>
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center"
          >
            {!otpSent ? (
              <div className="space-y-6 text-center flex flex-col items-center">
                <div className="p-5 bg-violet-50 rounded-3xl mb-2 text-violet-600 border-2 border-violet-100 shadow-inner">
                  <QrCode size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-900 font-black text-lg uppercase italic tracking-tighter">Aktifkan 2FA Authenticator</p>
                  <p className="text-slate-400 font-bold text-[11px] uppercase leading-relaxed max-w-xs mx-auto">
                    Gunakan Google Authenticator untuk mengunci akses akun sultan lo secara permanen.
                  </p>
                </div>
                <button 
                  onClick={onGenerateQR} // ✅ Memanggil fungsi handleGenerateOTP
                  disabled={loading} 
                  className="bg-violet-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3 shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 transition-all hover:bg-violet-700 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : 'Generate QR Code'} <Zap size={18}/>
                </button>
              </div>
            ) : (
              <div className="space-y-8 flex flex-col items-center">
                <div className="bg-amber-50 p-6 rounded-3xl border-2 border-dashed border-amber-300 w-full text-center">
                  <p className="text-xs font-black text-amber-600 uppercase italic mb-1">Step 1: Scan QR Code</p>
                  <p className="text-[10px] text-amber-500 font-bold leading-tight uppercase">
                    Buka Google Authenticator di HP, lalu scan gambar di bawah ini.
                  </p>
                </div>

                {qrCode && (
                  <div className="p-4 bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0_0_#000]">
                    <img src={qrCode} alt="Scan QR" className="w-48 h-48" />
                  </div>
                )}

                <div className="max-w-xs mx-auto space-y-4 w-full">
                  <p className="text-xs font-black text-slate-900 uppercase italic">Step 2: Masukkan 6 Digit Kode</p>
                  <input 
                    type="text" maxLength="6" placeholder="000000"
                    className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.4em] outline-none focus:bg-white focus:ring-8 focus:ring-violet-50 transition-all"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <button 
                    onClick={onVerify} // ✅ Memanggil handleVerifyOTP
                    disabled={otp.length < 6 || loading} 
                    className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic shadow-[0_6px_0_0_#1e293b] active:translate-y-1 transition-all hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verifikasi & Aktifkan'}
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
            className="bg-white border-4 border-emerald-500 p-12 rounded-[3.5rem] text-center shadow-[10px_10px_0px_0px_#10b981]"
          >
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border-2 border-emerald-100">
                <CheckCircle2 size={64} />
              </div>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">Status: Secure</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic leading-relaxed">
                Aset Sultan aman terkendali.
              </p>
              
              <div className="mt-10 pt-8 border-t border-slate-50">
                <button 
                  onClick={onDisable} // ✅ Memanggil handleDisable2FA
                  className="text-[10px] font-black uppercase text-slate-300 hover:text-red-500 transition-colors tracking-[0.2em]"
                >
                  Disable Security Protocol
                </button>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityView;