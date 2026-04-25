import { useState } from 'react'
import { 
  ShieldCheck, Smartphone, Key, AlertTriangle, 
  CheckCircle2, Zap, Loader2, Lock, Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// TAMBAHKAN onDisable di sini
function SecurityView({ user, qrCode, onGenerateQR, onVerify, onDisable, otp, setOtp, loading }) {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      
      {/* --- 1. WELCOME CARD: Sapaan yang Ramah --- */}
      <div className="relative overflow-hidden bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
        <div className={`absolute top-0 right-0 w-40 h-40 blur-[80px] opacity-20 ${isEnabled ? 'bg-emerald-400' : 'bg-violet-400'}`} />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-3">
              {isEnabled ? (
                <ShieldCheck className="text-emerald-500" size={32} />
              ) : (
                <Lock className="text-violet-600" size={32} />
              )}
              {isEnabled ? 'Akun Sudah Aman!' : 'Keamanan Akun'}
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Slebew! Mari jaga identitas <span className="text-violet-600">@{user?.username}</span> tetap aman.
            </p>
          </div>
          <div className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest italic ${isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500 animate-pulse'}`}>
            {isEnabled ? 'Full Protected' : 'Low Defense'}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* INVITATION CARD */}
            <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-xl shadow-violet-100">
              <Heart className="absolute right-[-10px] top-[-10px] text-white/10 rotate-12" size={140} />
              <div className="relative z-10">
                <h3 className="text-xl font-black italic uppercase mb-2">Yuk, Pasang Kunci Ganda!</h3>
                <p className="text-violet-100 text-xs font-bold leading-relaxed opacity-90">
                  Password saja terkadang bisa ditebak. Dengan 2FA, cuma kamu yang punya akses masuk lewat kode rahasia di HP-mu. Saldo dan data Squad kamu jadi jauh lebih aman!
                </p>
              </div>
            </div>

            {/* ACTION CENTER */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/30 text-center relative">
              {!qrCode ? (
                <div className="py-6 space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black italic uppercase text-slate-950">Mulai Amankan Akun</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Klik tombol di bawah untuk buat QR Code unikmu
                    </p>
                  </div>

                  <motion.button 
                    onClick={onGenerateQR}
                    disabled={loading}
                    whileHover={{ scale: 1.05, background: "#6d28d9", boxShadow: "0px 15px 30px rgba(109, 40, 217, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group bg-violet-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase italic tracking-[0.2em] overflow-hidden transition-all"
                  >
                    <motion.div 
                      initial={{ x: "-100%" }} animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <>Buka Kunci Rahasia <Zap size={14} className="fill-white" /></>}
                    </span>
                  </motion.button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black italic uppercase text-slate-400 tracking-[0.3em]">Scan QR Pakai Aplikasi Authenticator</h4>
                    <div className="relative inline-block group">
                      <div className="absolute -inset-4 bg-violet-500 rounded-[3.5rem] blur-2xl opacity-10" />
                      <div className="relative p-5 bg-white border-2 border-slate-950 rounded-[2.8rem] shadow-2xl">
                        {qrCode ? (
                          <img src={qrCode} alt="Security QR" className="w-48 h-48 rounded-2xl" />
                        ) : (
                          <div className="w-48 h-48 flex flex-col items-center justify-center bg-slate-50 rounded-2xl gap-3">
                            <Loader2 className="animate-spin text-violet-600" />
                            <p className="text-[8px] font-black text-slate-400">Menyiapkan QR...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-w-xs mx-auto space-y-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Masukkan 6 Angka Dari HP-mu</label>
                      <input 
                        type="text" maxLength="6" placeholder="000 000"
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-violet-600 focus:bg-white p-5 rounded-2xl outline-none font-black text-3xl text-center tracking-[0.3em] transition-all"
                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <motion.button 
                      onClick={onVerify} 
                      disabled={loading || otp.length < 6}
                      whileHover={{ scale: 1.02, background: "#6d28d9" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase italic tracking-[0.2em] shadow-xl shadow-violet-100 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : 'Aktifkan Perisai Sekarang'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* --- SECURED STATE --- */
          <motion.div 
            key="secured"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-100 p-12 rounded-[3.5rem] text-center shadow-xl shadow-slate-100/50 relative overflow-hidden"
          >
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100">
              <CheckCircle2 size={48} />
            </div>
            
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2 text-slate-900">Mantap! Akun Aman</h3>
            <p className="text-slate-400 text-xs font-bold max-w-sm mx-auto leading-relaxed uppercase tracking-widest">
              Identitas <span className="text-violet-600 font-black">@{user?.username}</span> sudah terlindungi ganda. Kamu bisa streaming dengan tenang!
            </p>
            
            <div className="mt-10 pt-10 border-t border-slate-50">
              {/* HUBUNGKAN ONCLICK KE ONDISABLE */}
              <button 
                onClick={onDisable}
                className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 hover:text-rose-500 transition-colors"
              >
                Matikan Fitur Keamanan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER TIPS */}
      <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex gap-4 items-center">
        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm shrink-0">
          <AlertTriangle className="text-amber-500" size={18} />
        </div>
        <p className="text-[9px] font-bold text-amber-800 uppercase tracking-widest leading-relaxed">
          <span className="text-slate-900">Tips:</span> Kodenya gak masuk? Coba cek apakah pengaturan jam di HP kamu sudah disetel ke "Otomatis" ya.
        </p>
      </div>
    </div>
  );
}

export default SecurityView;