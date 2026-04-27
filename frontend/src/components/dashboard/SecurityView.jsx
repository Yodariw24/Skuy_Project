import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Lock, Zap, Loader2, CheckCircle2, AlertTriangle, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function SecurityView({ user, qrCode, onGenerateQR, onVerify, onDisable, otp, setOtp, loading }) {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4 font-sans text-left">
      <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between">
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
          <div className="space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center">
              {!qrCode ? (
                <button onClick={onGenerateQR} disabled={loading} className="bg-violet-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-3 mx-auto">
                   {loading ? <Loader2 className="animate-spin" size={20}/> : 'Generate Security QR'} <Zap size={18}/>
                </button>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white p-4 rounded-3xl border-2 border-slate-950 inline-block shadow-xl">
                    <QRCodeSVG value={qrCode} size={200} level="H" includeMargin={true} />
                  </div>
                  <div className="max-w-xs mx-auto space-y-4">
                    <input 
                      type="text" maxLength="6" placeholder="000000"
                      className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-3xl font-black tracking-widest"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    <button onClick={onVerify} disabled={otp.length < 6 || loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic">
                      Verify & Activate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white border-4 border-emerald-500 p-12 rounded-[3.5rem] text-center">
             <CheckCircle2 className="text-emerald-500 mx-auto mb-4" size={64} />
             <h3 className="text-2xl font-black italic uppercase">Security Active</h3>
             <button onClick={onDisable} className="mt-8 text-[10px] font-black uppercase text-slate-300 hover:text-rose-500">Disable 2FA</button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default SecurityView;