import React from 'react';
import { 
  ShieldCheck, Loader2, Zap, 
  ShieldAlert, Shield, Mail, MessageSquare, Send, X
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';

const SecurityView = ({ 
  user, 
  onGenerateQR, // Mapping ke handleRequestOTP
  onVerify, 
  onDisable, 
  onCancel, // Fungsi untuk balik ke state awal
  otp, 
  setOtp, 
  loading,
  isVerifying 
}) => {
  const isEnabled = user?.is_two_fa_enabled;

  return (
    <div className="max-w-2xl mx-auto space-y-10 p-6 font-sans text-left pb-20 relative">
      
      {/* --- HEADER SECTION --- */}
      <div className="space-y-2 px-2">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="text-[#7C3AED]" size={18} />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Security Infrastructure</p>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
          DUAL-OTP <span className="text-[#7C3AED]">PROTOCOL</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium italic">
          Verifikasi ganda via WhatsApp dan Email. Akun lo jadi anti-bobol, Ri!
        </p>
      </div>

      {/* --- BANNER STATUS --- */}
      <motion.div 
        key={isEnabled ? 'secured' : 'unsecured'}
        initial={{ opacity: 0, y: -10 }}
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
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">
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
            key={isVerifying ? 'otp-input' : 'request-otp'} 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white p-10 rounded-[3.5rem] border-4 border-slate-950 shadow-[15px_15px_0px_0px_#7C3AED] relative overflow-hidden"
          >
            {!isVerifying ? (
              /* --- STATE 1: INITIALIZE --- */
              <div className="space-y-8 text-center flex flex-col items-center">
                <div className="relative p-7 bg-violet-50 rounded-[2.5rem] text-[#7C3AED] border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]">
                    <MessageSquare size={45} strokeWidth={2.5} />
                    <Zap className="absolute -top-2 -right-2 text-[#FF1493]" size={24} fill="currentColor" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-950">Initialize Security</h3>
                  <p className="text-slate-500 font-bold text-[11px] uppercase leading-relaxed max-w-sm mx-auto italic tracking-wider">
                    Klik tombol di bawah buat kirim kode aktivasi ke <span className="text-[#7C3AED]">WhatsApp</span> & <span className="text-[#7C3AED]">Email</span>. <br/> Akun aman sekelas Sultan, Ri!
                  </p>
                </div>
                <button 
                  onClick={onGenerateQR}
                  disabled={loading} 
                  className="group bg-[#7C3AED] text-white px-12 py-6 rounded-3xl font-black uppercase italic tracking-widest text-sm flex items-center gap-4 border-4 border-slate-950 shadow-[8px_8px_0px_0px_#000] active:translate-y-2 active:shadow-none transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24}/> : <>Kirim Kode Aktivasi <Send size={20}/></>}
                </button>
              </div>
            ) : (
              /* --- STATE 2: VERIFY OTP --- */
              <div className="space-y-8 flex flex-col items-center relative">
                {/* Back Button Sultan */}
                <button 
                  onClick={onCancel} 
                  className="absolute -top-4 -right-4 p-2 bg-slate-100 rounded-full hover:bg-rose-100 hover:text-rose-500 transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>

                <div className="text-center space-y-2">
                   <div className="flex justify-center gap-4 text-[#7C3AED] mb-2">
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><Mail size={24} /></motion.div>
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}><MessageSquare size={24} /></motion.div>
                   </div>
                   <h3 className="text-xl font-black italic uppercase text-slate-950 tracking-tighter">Verify Identity Node</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase italic">Input 6-digit kode dari WA/Email ariwirayuda24</p>
                </div>

                <div className="max-w-xs mx-auto space-y-6 w-full text-center">
                    <input 
                      type="text" 
                      maxLength="6" 
                      placeholder="000000" 
                      autoFocus
                      className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-[2rem] text-center text-5xl font-black tracking-[0.4em] outline-none focus:bg-white focus:shadow-[6px_6px_0px_0px_#7C3AED] transition-all placeholder:text-slate-200"
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                    <button 
                      onClick={onVerify}
                      disabled={otp.length < 6 || loading} 
                      className="w-full bg-slate-950 text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-[8px_8px_0px_0px_#7C3AED] active:translate-y-2 active:shadow-none transition-all flex justify-center items-center gap-3 border-4 border-slate-950"
                    >
                      {loading ? <Loader2 className="animate-spin" size={24} /> : <>Verify & Activate <ShieldCheck size={20}/></>}
                    </button>
                    <button onClick={onGenerateQR} className="text-[10px] font-black uppercase text-[#7C3AED] hover:underline italic tracking-widest">Belum terima? Kirim ulang</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* --- STATE 3: SECURED --- */
          <motion.div 
            key="secure-active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-4 border-emerald-500 p-14 rounded-[4rem] text-center shadow-[15px_15px_0px_0px_#10b981] relative overflow-hidden"
          >
              <div className="w-28 h-28 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-xl border-4 border-white rotate-3">
                  <ShieldCheck size={64} strokeWidth={2.5} />
              </div>
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">STATUS: SECURED</h3>
              <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] italic leading-relaxed max-w-xs mx-auto">
                  Dual-Channel Aktif. Akun lo resmi aman di bawah perlindungan Sultan via WhatsApp & Email.
              </p>
              <button 
                onClick={onDisable}
                className="group mt-12 flex items-center gap-2 text-[10px] font-black uppercase text-slate-300 hover:text-rose-500 transition-all mx-auto"
              >
                <ShieldAlert size={14} /> Copot Protokol Keamanan
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SecurityView;