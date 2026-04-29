import { useState } from 'react';
import axios from 'axios';
import { skuyAlert } from '../utils/alerts';
import { motion } from 'framer-motion';
import { ShieldCheck, QrCode, Loader2 } from 'lucide-react';

// KONFIGURASI API URL (Otomatis pakai Railway kalau sudah deploy)
const API_URL = import.meta.env.VITE_API_URL || 'https://skuy-project-production.up.railway.app';

function TwoFASetup({ user }) {
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);

  // 1. Ambil QR Code dari Backend Railway
  const handleGenerateQR = async () => {
    setLoadingQR(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/setup-2fa`, { 
        userId: user.id 
      });
      
      if (res.data.success) {
        setQrCode(res.data.qrCode);
        skuyAlert("SCAN ME", "Buka Google Authenticator & scan QR ini", "info");
      }
    } catch (err) {
      console.error("QR Error:", err);
      skuyAlert("GAGAL", err.response?.data?.message || "Gagal konek ke server Railway", "error");
    } finally {
      setLoadingQR(false);
    }
  };

  // 2. Verifikasi untuk Mengaktifkan
  const handleActivate = async () => {
    if (otp.length < 6) return skuyAlert("KODE KURANG", "Masukkan 6 digit angka", "warning");
    
    setIsVerifying(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-2fa`, {
        userId: user.id,
        token: otp
      });
      
      if (res.data.success) {
        skuyAlert("GACOR!", "2FA Berhasil aktif! Akun sekelas Sultan aman.", "success");
        setQrCode(null);
        setOtp('');
        // Refresh halaman agar status 2FA terupdate
        window.location.reload(); 
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "OTP tidak valid, coba cek lagi di HP", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-violet-600 p-3 rounded-xl text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="font-black italic text-lg uppercase">Keamanan Akun</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Multi-Factor Authentication (2FA)</p>
        </div>
      </div>

      {!qrCode ? (
        <button 
          onClick={handleGenerateQR}
          disabled={loadingQR}
          className="w-full py-4 bg-slate-950 text-white rounded-xl font-black italic uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          {loadingQR ? <Loader2 className="animate-spin" /> : <><QrCode size={18} /> Aktifkan 2FA Sekarang</>}
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
          <div className="bg-white p-4 border-4 border-slate-950 rounded-2xl inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img src={qrCode} alt="QR 2FA" className="w-48 h-48" />
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify Authenticator Code</p>
            <input 
              type="text" maxLength="6" placeholder="000000"
              className="w-full p-4 text-center text-4xl font-black border-4 border-slate-950 rounded-xl outline-none focus:bg-violet-50 transition-all"
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setQrCode(null)}
              className="flex-1 py-4 border-4 border-slate-950 rounded-xl font-black uppercase text-xs hover:bg-slate-100"
            >
              Batal
            </button>
            <button 
              onClick={handleActivate}
              disabled={isVerifying}
              className="flex-[2] py-4 bg-violet-600 text-white rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isVerifying ? <Loader2 className="animate-spin" /> : 'Confirm Activation'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TwoFASetup;