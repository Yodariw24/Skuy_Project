import { useState } from 'react';
import axios from 'axios';
import { skuyAlert } from '../utils/alerts';
import { motion } from 'framer-motion';
import { ShieldCheck, QrCode, CheckCircle2, XCircle } from 'lucide-react';

function TwoFASetup({ user }) {
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 1. Ambil QR Code dari Backend
  const handleGenerateQR = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/setup-2fa', { 
        userId: user.id 
      });
      setQrCode(res.data.qrCode);
      skuyAlert("SCAN ME", "Buka Google Authenticator & scan QR ini", "info");
    } catch (err) {
      skuyAlert("GAGAL", "Gagal generate QR Code", "error");
    }
  };

  // 2. Verifikasi untuk Mengaktifkan
  const handleActivate = async () => {
    setIsVerifying(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/verify-2fa', {
        userId: user.id,
        token: otp
      });
      if (res.data.success) {
        skuyAlert("GACOR!", "2FA Berhasil diaktifkan. Akun kamu sekarang sekelas Sultan!", "success");
        setQrCode(null); // Tutup tampilan QR
        // Bisa tambahkan refresh data user di sini
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "Kode yang kamu masukkan tidak valid", "error");
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
          <p className="text-xs text-slate-500">Lindungi saldo donasi kamu dengan 2FA</p>
        </div>
      </div>

      {!qrCode ? (
        <button 
          onClick={handleGenerateQR}
          className="w-full py-4 bg-slate-950 text-white rounded-xl font-black italic uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <QrCode size={18} /> Aktifkan QR Code 2FA
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
          <div className="bg-slate-50 p-4 border-4 border-dashed border-slate-200 rounded-2xl inline-block">
            <img src={qrCode} alt="QR 2FA" className="w-48 h-48" />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase">Masukkan 6 Digit dari HP-mu</p>
            <input 
              type="text" maxLength="6" placeholder="000000"
              className="w-full p-4 text-center text-2xl font-black border-4 border-slate-950 rounded-xl outline-none"
              value={otp} onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setQrCode(null)}
              className="flex-1 py-4 border-4 border-slate-950 rounded-xl font-black uppercase text-sm"
            >
              Batal
            </button>
            <button 
              onClick={handleActivate}
              disabled={isVerifying}
              className="flex-[2] py-4 bg-violet-600 text-white rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              {isVerifying ? 'Verifying...' : 'Konfirmasi & Aktifkan'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default TwoFASetup;