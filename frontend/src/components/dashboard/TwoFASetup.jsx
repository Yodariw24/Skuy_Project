import { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, MessageSquare, Mail, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

// Custom Alert Sultan
const skuyAlert = (title, text, icon) => {
  Swal.fire({
    title: title.toUpperCase(),
    text: text,
    icon: icon,
    customClass: {
      popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]',
      title: 'font-black italic tracking-tighter text-slate-950',
      confirmButton: 'bg-slate-950 text-white px-8 py-3 rounded-xl font-black uppercase italic'
    },
    buttonsStyling: false
  });
};

function TwoFASetup({ user }) {
  const [step, setStep] = useState(user?.is_two_fa_enabled ? 'enabled' : 'idle');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingOTP, setLoadingOTP] = useState(false);

  const sultanId = user?.id || user?.user_id;

  // 1. Kirim OTP ke Email & WA buat Aktivasi
  const handleRequestOTP = async () => {
    if (!sultanId) return skuyAlert("DATA KOSONG", "ID Sultan tidak terbaca!", "error");

    setLoadingOTP(true);
    try {
      // Panggil rute /send-otp yang baru kita buat di backend
      const res = await api.post('/auth/send-otp', { userId: sultanId });
      
      if (res.data.success) {
        setStep('verifying');
        skuyAlert("OTP SENT", "Cek WhatsApp & Email lo sekarang, Ri!", "info");
      }
    } catch (err) {
      skuyAlert("GAGAL", "Gagal mengirim kode verifikasi.", "error");
    } finally {
      setLoadingOTP(false);
    }
  };

  // 2. Verifikasi Kode buat Aktifin Permanen
  const handleActivate = async () => {
    if (otp.length < 6) return skuyAlert("KODE KURANG", "Masukkan 6 digit angka", "warning");
    
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/verify-2fa', {
        userId: sultanId,
        token: otp.trim()
      });
      
      if (res.data.success) {
        skuyAlert("GACOR!", "2FA Berhasil aktif lewat Email & WA!", "success");
        
        // Update Local Storage
        const updatedUser = { ...user, is_two_fa_enabled: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setStep('enabled');
        setOtp('');
        
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    } catch (err) {
      skuyAlert("VERIFIKASI GAGAL", "Kode OTP Salah atau sudah expired!", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_#7C3AED] text-left relative overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-slate-950 p-3 rounded-xl text-white shadow-[4px_4px_0px_0px_#7C3AED]">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-black italic text-xl uppercase leading-none text-slate-950">Security Protocol</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Dual-Channel Verification</p>
        </div>
      </div>

      {/* --- STATE 1: SUDAH AKTIF --- */}
      {step === 'enabled' && (
        <div className="flex flex-col items-center py-4 space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-4 border-green-600">
            <CheckCircle2 size={32} />
          </div>
          <div className="text-center">
            <p className="font-black italic uppercase text-slate-950">Status: PROTECTED</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Akun lo sudah aman lewat jalur Email & WhatsApp.</p>
          </div>
        </div>
      )}

      {/* --- STATE 2: BELUM AKTIF (IDLE) --- */}
      {step === 'idle' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              Dapatkan perlindungan ekstra sekelas Sultan. Setiap kali login, SkuyGG akan mengirimkan kode unik ke <span className="text-violet-600">Email</span> dan <span className="text-green-600">WhatsApp</span> lo.
            </p>
          </div>
          <button 
            onClick={handleRequestOTP}
            disabled={loadingOTP}
            className="w-full py-5 bg-slate-950 text-white rounded-2xl font-black italic uppercase hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[4px_4px_0px_0px_#7C3AED]"
          >
            {loadingOTP ? <Loader2 className="animate-spin" /> : 'Aktifkan Jalur Dual-OTP'}
          </button>
        </div>
      )}

      {/* --- STATE 3: VERIFIKASI --- */}
      {step === 'verifying' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-center gap-4 text-slate-400">
            <Mail size={24} className="animate-bounce" />
            <MessageSquare size={24} className="animate-bounce delay-100" />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Masukkan 6 Digit Kode</p>
            <input 
              type="text" 
              maxLength="6" 
              placeholder="••••••"
              autoFocus
              className="w-full p-4 text-center text-5xl font-black border-4 border-slate-950 rounded-2xl outline-none focus:bg-violet-50 transition-all placeholder:text-slate-100"
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => { setStep('idle'); setOtp(''); }}
              className="flex-1 py-4 border-4 border-slate-950 rounded-xl font-black uppercase text-xs hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button 
              onClick={handleActivate}
              disabled={isVerifying || otp.length < 6}
              className="flex-[2] py-4 bg-slate-950 text-white rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isVerifying ? <Loader2 className="animate-spin" /> : 'Confirm & Activate'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TwoFASetup;