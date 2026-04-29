import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Lock, Zap, Loader2, CheckCircle2, AlertCircle, Info, ArrowRight, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function SecurityView({ user, qrCode, manualSecret, onGenerateQR, onVerify, onDisable, otp, setOtp, loading }) {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 font-sans text-left">
      
      {/* --- STATUS BANNER --- */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className={`p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between transition-colors ${isEnabled ? 'bg-emerald-50' : 'bg-white'}`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full animate-pulse ${isEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Sistem Keamanan SkuyGG</p>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-3">
            {isEnabled ? 'Akun Sultan Aktif' : 'Amankan Asetmu'}
          </h2>
        </div>
        <div className={`p-4 rounded-2xl border-2 border-slate-950 ${isEnabled ? 'bg-emerald-400' : 'bg-violet-400'}`}>
          {isEnabled ? <ShieldCheck size={32} /> : <Lock size={32} />}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            
            {/* --- STEP 1: EDUKASI --- */}
            {!qrCode && (
              <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-8 text-center">
                  <div className="bg-violet-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center border-4 border-slate-950">
                    <ShieldAlert size={40} className="text-violet-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tight">Kenapa butuh 2FA?</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Satu lapis password aja nggak cukup buat jagain saldo donasi kamu. 
                      Dengan 2FA, cuma kamu yang punya kunci masuk lewat HP-mu sendiri.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-950">
                      <Zap size={16} className="mb-2 text-amber-500" />
                      <p className="text-[11px] font-bold uppercase">Proteksi Saldo</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Mencegah penarikan dana tanpa izin.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-950">
                      <CheckCircle2 size={16} className="mb-2 text-emerald-500" />
                      <p className="text-[11px] font-bold uppercase">Verifikasi Cepat</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-tight">Cukup scan & masukkan 6 digit kode.</p>
                    </div>
                  </div>

                  <button 
                    onClick={onGenerateQR} 
                    disabled={loading} 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white p-6 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all group"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24}/> : (
                      <>Generate Kode Akses <ArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* --- STEP 2: SCAN & VERIFY --- */}
            {qrCode && (
              <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-8 text-center">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black italic uppercase">Langkah Terakhir!</h3>
                    <p className="text-sm text-slate-500 font-medium">Buka Google Authenticator di HP-mu, lalu scan kode ini.</p>
                  </div>

                  <div className="relative inline-block group">
                    <div className="absolute -inset-2 bg-violet-400 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white p-6 rounded-[2.5rem] border-4 border-slate-950 shadow-xl inline-block">
                      <QRCodeSVG value={qrCode} size={200} level="H" includeMargin={true} />
                    </div>
                  </div>

                  <div className="bg-amber-50 p-6 rounded-3xl border-2 border-dashed border-amber-300 max-w-sm mx-auto">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <Info size={14} className="text-amber-600" />
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Gagal Scan? Masukkan Manual</p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                       <code className="text-xl font-black text-slate-950 tracking-[0.2em]">{manualSecret}</code>
                    </div>
                  </div>

                  <div className="max-w-xs mx-auto space-y-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">6 Digit Authenticator</p>
                      <input 
                        type="text" maxLength="6" placeholder="000000"
                        className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.4em] outline-none focus:bg-white focus:ring-4 ring-violet-100 transition-all placeholder:opacity-20"
                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    
                    <button 
                      onClick={onVerify} 
                      disabled={otp.length < 6 || loading} 
                      className="w-full bg-slate-950 hover:bg-slate-800 text-white py-6 rounded-2xl font-black uppercase italic shadow-[0_6px_0_0_#334155] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:grayscale"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Verifikasi & Kunci Akun'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* --- STATUS: AKTIF --- */
          <motion.div key="active" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <div className="bg-white border-4 border-emerald-500 p-12 rounded-[3.5rem] text-center shadow-[10px_10px_0px_0px_#10b981] relative overflow-hidden">
               {/* Ornamen Background */}
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <ShieldCheck size={200} />
               </div>

               <div className="relative z-10 space-y-6">
                <div className="bg-emerald-100 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border-4 border-emerald-500 rotate-3">
                  <CheckCircle2 className="text-emerald-500" size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Perlindungan Maksimal</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    Sistem 2FA aktif. Saldo donasi dan aset streaming kamu sekarang aman di bawah protokol SkuyGG.
                  </p>
                </div>
                
                <div className="pt-6">
                  <button 
                    onClick={onDisable} 
                    className="group flex items-center gap-2 mx-auto text-[10px] font-black uppercase text-slate-300 hover:text-rose-500 transition-all"
                  >
                    <AlertCircle size={14} className="group-hover:rotate-12 transition-transform" /> 
                    Nonaktifkan Protokol Keamanan
                  </button>
                </div>
               </div>
            </div>
            
            <div className="text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                 Terlindungi dengan SkuyShield v2.0 <Heart size={10} className="fill-rose-500 text-rose-500" />
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SecurityView;