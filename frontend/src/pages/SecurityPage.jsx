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
    try {
      // Pastikan endpoint ini sesuai dengan backend/index.js lo
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setQrCodeData(res.data.qrCode);
        setOtpSent(true);
        Swal.fire({
          icon: 'success',
          title: 'QR CODE READY',
          text: 'Scan pakai Google Authenticator lo, Ri!',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        });
      }
    } catch (err) {
      console.error("Setup 2FA Error:", err);
      Swal.fire('ERROR', 'Gagal generate security protocol. Cek koneksi backend!', 'error');
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
          text: 'Akun sultan lo sekarang full protected!',
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        }).then(() => {
          window.location.reload(); 
        });
      }
    } catch (err) { 
      Swal.fire('GAGAL', 'Kode OTP salah atau expired. Cek jam di HP lo!', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA (Fixing "a is not a function") ---
  const handleDisable2FA = async () => {
    Swal.fire({
      title: 'MATIKAN 2FA?',
      text: "Keamanan akun lo bakal turun, yakin Ri?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Matikan',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.post('/auth/disable-2fa');
          if (res.data.success) {
            window.location.reload();
          }
        } catch (err) {
          Swal.fire('ERROR', 'Gagal mematikan protokol.', 'error');
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
          onDisable={handleDisable2FA} // ✅ Sekarang fungsi ini sudah ada
        />
      </div>
    </div>
  );
};

export default SecurityPage;