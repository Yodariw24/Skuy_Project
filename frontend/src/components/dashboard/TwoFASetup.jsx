import { useState } from 'react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, MessageSquare, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';

// Custom Alert Sultan biar style-nya konsisten
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

  // 1. Memicu Pengiriman OTP ke Email & WA buat Aktivasi
  const handleRequestOTP = async () => {
    if (!sultanId) return skuyAlert("DATA KOSONG", "ID Sultan tidak terbaca, silakan login ulang!", "error");

    // 🛡️ PROTEKSI SULTAN: Cek apakah nomor HP sudah di-input di profil
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return Swal.fire({
        title: "WHATSAPP BELUM ADA",
        text: "Ri, lo harus isi nomor WhatsApp dulu di menu Profil buat dapet kode OTP via WA!",
        icon: "warning",
        confirmButtonText: "OKE, GUE ISI DULU",
        customClass: {
          confirmButton: 'bg-slate-950 text-white px-8 py-3 rounded-xl font-black uppercase italic'
        }
      });
    }

    setLoadingOTP(true);
    try {
      // ✅ Menggunakan rute setup-2fa sesuai perbaikan backend Langkah 3
      const res = await api.post('/auth/setup-2fa', { userId: sultanId });
      
      if (res.data.success) {
        setStep('verifying');
        skuyAlert("OTP MELUNCUR", "Cek WhatsApp & Email lo sekarang, Ri!", "info");
      }
    } catch (err) {
      console.error("Setup Error:", err);
      skuyAlert("GAGAL", "Gagal kontak server OTP (Nodemailer/Fonnte).", "error");
    } finally {
      setLoadingOTP(false);
    }
  };

  // 2. Verifikasi Kode OTP untuk Aktivasi Permanen
  const handleActivate = async () => {
    if (otp.length < 6) return skuyAlert("KODE KURANG", "Masukkan 6 digit angka, Ri!", "warning");
    
    setIsVerifying(true);
    try {
      const res = await api.post('/auth/verify-2fa', {
        userId: sultanId,
        token: otp.trim()
      });
      
      if (res.data.success) {
        skuyAlert("GACOR!", "2FA Berhasil aktif! Akun lo sekarang setangguh benteng.", "success");
        
        // Update Local Storage biar UI Navbar dll ikut berubah
        const updatedUser = { ...user, is_two_fa_enabled: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setStep('enabled');
        setOtp('');
        
        // Reload tipis buat sinkronisasi state aplikasi
        setTimeout(() => { window.location.reload(); }, 1500);
      }
    } catch (err) {
      skuyAlert("VERIFIKASI GAGAL", "Kode OTP Salah atau sudah expired, Ri!", "error");
      setOtp('');
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
          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-[0.2em]">Dual-Channel Verification</p>
        </div>
      </div>

      {/* --- STATE 1: SUDAH PROTECTED --- */}
      {step === 'enabled' && (
        <div className="flex flex-col items-center py-6 space-y-4">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-4 border-green-600 shadow-[4px_4px_0px_0px_#16a34a]"
          >
            <CheckCircle2 size={40} />
          </motion.div>
          <div className="text-center">
            <p className="font-black italic uppercase text-slate-950 text-lg">Status: PROTECTED</p>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Akun lo aman terkendali</p>
          </div>
        </div>
      )}

      {/* --- STATE 2: IDLE (BELUM AKTIF) --- */}
      {step === 'idle' && (
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border-4 border-slate-950 shadow-inner">
            <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
              "Aktifkan Dual-OTP biar tiap lo login, SkuyGG kirim kode rahasia ke <span className="text-violet-600 underline">Email</span> dan <span className="text-green-600 underline">WhatsApp</span> lo. Gak ada yang bisa maling akun lo, Ri!"
            </p>
          </div>
          
          {!user?.phone_number && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 text-[9px] font-black uppercase">
              <AlertTriangle size={14} /> Nomor WA belum diset di profil!
            </div>
          )}

          <button 
            onClick={handleRequestOTP}
            disabled={loadingOTP}
            className="w-full py-5 bg-[#7C3AED] text-white rounded-2xl font-black italic uppercase tracking-widest hover:translate-y-[-2px] transition-all active:translate-y-1 shadow-[0_6px_0_0_#4c1d95] border-2 border-slate-950 flex items-center justify-center gap-2"
          >
            {loadingOTP ? <Loader2 className="animate-spin" /> : 'AKTIFKAN DUAL-OTP'}
          </button>
        </div>
      )}

      {/* --- STATE 3: VERIFIKASI OTP --- */}
      {step === 'verifying' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-center gap-6 text-slate-400">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><Mail size={28} /></motion.div>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}><MessageSquare size={28} /></motion.div>
          </div>

          <div className="space-y-3 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Masukkan 6 Digit Kode Aktivasi</p>
            <input 
              type="text" 
              maxLength="6" 
              placeholder="••••••"
              autoFocus
              className="w-full p-5 text-center text-5xl font-black border-4 border-slate-950 rounded-2xl outline-none focus:bg-violet-50 transition-all placeholder:text-slate-100 shadow-inner"
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { setStep('idle'); setOtp(''); }}
              className="flex-1 py-4 border-4 border-slate-950 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none"
            >
              Batal
            </button>
            <button 
              onClick={handleActivate}
              disabled={isVerifying || otp.length < 6}
              className="flex-[2] py-4 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:border-slate-400"
            >
              {isVerifying ? <Loader2 className="animate-spin" /> : 'KONFIRMASI AKTIVASI'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TwoFASetup;