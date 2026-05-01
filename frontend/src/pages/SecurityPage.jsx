import React, { useState } from 'react';
// ✅ GANTI: Gunakan instance api sentral agar sinkron dengan Railway
import api from '../api/axios'; 
import SecurityView from '../components/dashboard/SecurityView'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

const SecurityPage = () => {
  // ✅ User tetap diambil dari context, tapi API_URL sudah diurus di axios.js
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');

  // --- 1. GENERATE SETUP 2FA (SINKRON RAILWAY) ---
  const handleGenerateOTP = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ✅ Cukup panggil endpoint, instance api sudah tahu baseURL-nya
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setQrCodeData(res.data.qrCode);
        setOtpSent(true);
        Swal.fire({
          icon: 'success',
          title: 'QR CODE SIAP',
          text: 'Scan pakai Google Authenticator kamu, Ri!',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        });
      }
    } catch (err) {
      console.error("Setup 2FA Error:", err);
      Swal.fire('ERROR', 'Gagal inisialisasi protokol keamanan.', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI KODE OTP ---
  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        setUser(res.data.user); 
        Swal.fire({
          icon: 'success',
          title: '2FA AKTIF',
          text: 'Akun kamu sekarang jauh lebih aman!',
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        }).then(() => {
          // Sinkronisasi status terbaru tanpa reload total jika memungkinkan
          // Tapi reload aman untuk memastikan state global terupdate
          window.location.reload(); 
        });
      }
    } catch (err) { 
      Swal.fire('GAGAL', 'Kode OTP salah atau expired. Coba lagi!', 'error');
    } finally { 
      setLoading(false); 
    }
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
        />
      </div>
    </div>
  );
};

export default SecurityPage;