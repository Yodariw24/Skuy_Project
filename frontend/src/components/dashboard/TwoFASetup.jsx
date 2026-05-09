import { useState } from 'react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, MessageSquare, Mail, CheckCircle2, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

function TwoFASetup({ user, setActiveMenu }) {
  const [step, setStep] = useState(user?.is_two_fa_enabled ? 'enabled' : 'idle');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingOTP, setLoadingOTP] = useState(false);

  const sultanId = user?.id || user?.user_id;

  // --- 🛡️ SULTAN SLIM TOAST PROTOCOL ---
  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: 'skuy-slim-toast',
        title: 'skuy-toast-content'
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  };

  const handleRequestOTP = async () => {
    if (!sultanId) return;

    // Proteksi Nomor WhatsApp
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return Swal.fire({
        title: "WHATSAPP KOSONG!",
        text: "Ri, isi nomor WhatsApp lo di menu Profil dulu buat nerima kode keamanan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ISI SEKARANG",
        cancelButtonText: "NANTI AJA",
        customClass: {
          popup: 'skuy-border skuy-shadow rounded-[2rem]',
          confirmButton: 'bg-slate-950 text-white px-8 py-3 rounded-xl font-black uppercase italic mr-2',
          cancelButton: 'bg-slate-100 text-slate-400 px-8 py-3 rounded-xl font-black uppercase italic'
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.isConfirmed && setActiveMenu) {
          setActiveMenu('profile');
        }
      });
    }

    setLoadingOTP(true);
    try {
      // ✅ PANGGILAN SULTAN: Tanpa double /api karena sudah di-handle axios.js
      const res = await api.post('/auth/setup-2fa', { userId: sultanId });
      
      if (res.data.success) {
        setStep('verifying'); // Langsung buka kolom input
        showSultanToast('<b>PROTOCOL SENT</b> <span>Cek WA & Email ariwirayuda24!</span>');
      }
    } catch (err) {
      showSultanToast('<b>ENGINE ERROR</b> <span>Gagal kontak server OTP.</span>', 'error');
    } finally {
      setLoadingOTP(false);
    }
  };

  const handleActivate = async () => {
    if (otp.length < 6) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/verify-2fa', {
        userId: sultanId,
        token: otp.trim()
      });
      if (res.data.success) {
        showSultanToast('<b>SECURED!</b> <span>2FA Berhasil Aktif.</span>');
        
        const updatedUser = { ...user, is_two_fa_enabled: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setStep('enabled');
        setOtp('');
        // Kasih jeda biar user liat notif sukses dulu
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    } catch (err) {
      showSultanToast('<b>VERIFIKASI GAGAL</b> <span>Kode OTP Salah!</span>', 'error');
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-left relative overflow-hidden transition-all hover:shadow-[16px_16px_0px_0px_#7C3AED]">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12"><ShieldCheck size={120} /></div>

      <div className="flex items-center gap-4 mb-10 relative z-10">
        <div className={`p-4 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] ${step === 'enabled' ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white'}`}>
          {step === 'enabled' ? <CheckCircle2 size={24} strokeWidth={3} /> : <ShieldCheck size={24} strokeWidth={3} />}
        </div>
        <div>
          <h3 className="font-black italic text-2xl uppercase leading-none text-slate-950">Vault Access</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.3em]">Dual-Channel Auth v2.4</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'enabled' && (
          <motion.div key="enabled" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 space-y-6 relative z-10">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center border-4 border-emerald-500 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.2)]">
              <ShieldCheck size={48} strokeWidth={2.5} />
            </motion.div>
            <div className="text-center space-y-2">
              <p className="font-black italic uppercase text-slate-950 text-2xl tracking-tighter">STATUS: PROTECTED</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed italic">
                  Railway Cloud Sync Active <br/>
                  <span className="text-emerald-500 underline decoration-2">WhatsApp & Email Secured</span>
              </p>
            </div>
          </motion.div>
        )}

        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 relative z-10">
            <div className="bg-slate-50 p-6 rounded-[2rem] border-4 border-slate-100 shadow-inner">
              <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-violet-600" fill="currentColor" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Instruction</p>
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed italic text-left">
                "Aktifkan Dual-OTP biar tiap login SkuyGG kirim kode rahasia ke <span className="text-violet-600">Email markas</span> dan <span className="text-emerald-600">WA lo</span>."
              </p>
            </div>
            
            <button 
              onClick={handleRequestOTP}
              disabled={loadingOTP}
              className="w-full py-6 bg-[#7C3AED] text-white rounded-[2rem] font-black italic uppercase tracking-widest hover:translate-y-[-2px] transition-all active:translate-y-1 shadow-[0_8px_0_0_#4c1d95] border-4 border-slate-950 flex items-center justify-center gap-3 group"
            >
              {loadingOTP ? <Loader2 className="animate-spin" /> : <>ACTIVATE PROTOCOL <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
            </button>
          </motion.div>
        )}

        {step === 'verifying' && (
          <motion.div key="verifying" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 relative z-10">
            <div className="flex justify-center gap-8 text-[#7C3AED]">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="p-4 bg-violet-50 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000]"><Mail size={32} /></motion.div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000]"><MessageSquare size={32} /></motion.div>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none mb-4">Enter 6-Digit Auth Node</p>
              <input 
                type="text" maxLength="6" placeholder="••••••" autoFocus
                className="w-full p-6 text-center text-5xl font-black border-4 border-slate-950 rounded-[2rem] outline-none focus:bg-violet-50 transition-all placeholder:text-slate-100 shadow-inner tracking-[0.2em]"
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-[9px] font-bold text-slate-400 italic mt-4">Kode dikirim ke: {user?.phone_number} & ariwirayuda24</p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setStep('idle'); setOtp(''); }} className="flex-1 py-5 border-4 border-slate-950 rounded-2xl font-black uppercase text-[11px] hover:bg-slate-50 transition-all shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none">Batal</button>
              <button onClick={handleActivate} disabled={isVerifying || otp.length < 6} className="flex-[2] py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] shadow-[6px_6px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:shadow-none disabled:border-slate-300">
                {isVerifying ? <Loader2 className="animate-spin" /> : 'CONFIRM NODE'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TwoFASetup;