import { ShieldCheck, Lock, Zap, Loader2, CheckCircle2, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function SecurityView({ user, otpSent, onGenerateQR, onVerify, onDisable, otp, setOtp, loading }) {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6 font-sans text-left">
      <div className="bg-white border-4 border-slate-950 p-8 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950 flex items-center gap-3">
            {isEnabled ? <ShieldCheck className="text-emerald-500" size={32} /> : <Lock className="text-violet-600" size={32} />}
            {isEnabled ? 'Full Protected' : 'Security Setup'}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">User: @{user?.username}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isEnabled ? (
          <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center">
            {!otpSent ? (
              <div className="space-y-6">
                <p className="text-slate-500 font-bold text-sm uppercase">Aktifkan 2FA via Email untuk mengamankan saldo kamu.</p>
                <button onClick={onGenerateQR} disabled={loading} className="bg-violet-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3 mx-auto shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 transition-all">
                   {loading ? <Loader2 className="animate-spin" size={20}/> : 'Kirim Kode OTP'} <Mail size={18}/>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-amber-50 p-6 rounded-3xl border-2 border-dashed border-amber-300">
                  <p className="text-xs font-black text-amber-600 uppercase">Cek Email Kamu!</p>
                  <p className="text-[10px] text-amber-500 font-bold">Masukkan 6 digit kode dari email di bawah.</p>
                </div>

                <div className="max-w-xs mx-auto space-y-4">
                  <input 
                    type="text" maxLength="6" placeholder="000000"
                    className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.5em] outline-none"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <button onClick={onVerify} disabled={otp.length < 6 || loading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic shadow-[0_6px_0_0_#1e293b] active:translate-y-1 transition-all">
                    {loading ? 'Verifying...' : 'Verify & Activate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border-4 border-emerald-500 p-12 rounded-[3.5rem] text-center shadow-[10px_10px_0px_0px_#10b981]">
              <CheckCircle2 className="text-emerald-500 mx-auto mb-4" size={64} />
              <h3 className="text-2xl font-black italic uppercase">Security Active</h3>
              <button onClick={onDisable} className="mt-8 text-[10px] font-black uppercase text-slate-300">Disable Security</button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default SecurityView;