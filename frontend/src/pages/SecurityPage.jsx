import React, { useState } from 'react';
import api from '../api/axios'; 
import SecurityView from '../components/dashboard/SecurityView'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

const SecurityPage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');

  // --- 1. GENERATE SETUP 2FA ---
  const handleGenerateOTP = async () => {
    if (!user) return;
    setLoading(true);
    
    // Log ini wajib ada di console F12 buat buktiin kodingan baru jalan
    console.log("🚀 Mengetok pintu baru: /api/auth/setup-2fa");

    try {
      // ✅ SINKRON: Menggunakan endpoint /auth/setup-2fa sesuai backend
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setQrCodeData(res.data.qrCode);
        setOtpSent(true);
        Swal.fire({
          icon: 'success',
          title: 'QR CODE READY',
          text: 'Scan pake Google Authenticator lo sekarang, Ri!',
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        });
      }
    } catch (err) {
      console.error("Setup Error:", err);
      Swal.fire('ERROR', 'Gagal generate security protocol. Cek log Railway!', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI KODE OTP ---
  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      // ✅ SINKRON: Menggunakan endpoint /auth/verify-2fa
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        setUser(res.data.user); 
        Swal.fire({
          icon: 'success',
          title: '2FA AKTIF',
          text: 'Akun sultan lo sekarang makin aman! 🛡️',
        }).then(() => {
          window.location.reload(); 
        });
      }
    } catch (err) { 
      Swal.fire('GAGAL', 'Kode OTP salah atau kadaluwarsa!', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA ---
  const handleDisable2FA = async () => {
    Swal.fire({
      title: 'MATIKAN 2FA?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Matikan',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.post('/auth/disable-2fa');
          if (res.data.success) window.location.reload();
        } catch (err) {
          Swal.fire('ERROR', 'Gagal mematikan protokol keamanan.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pt-24 px-6 text-left">
      <div className="max-w-4xl mx-auto">
        <SecurityView 
          user={user}
          otpSent={otpSent}
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          qrCode={qrCodeData}
          onGenerateQR={handleGenerateOTP}
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;