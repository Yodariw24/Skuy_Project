import React, { useState } from 'react';
import axios from 'axios';
import SecurityView from '../components/dashboard/SecurityView'; // Sesuaikan path-nya ke folder dashboard
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

const SecurityPage = () => {
  const { user, setUser, API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [qrCodeData, setQrCodeData] = useState(''); // State buat nyimpen URL QR Code dari backend

  // --- GENERATE SETUP 2FA (RAILWAY BACKEND) ---
  const handleGenerateOTP = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Endpoint ini bakal nge-generate secret & QR code di backend lo
      const res = await axios.post(`${API_URL}/api/auth/setup-2fa`, { userId: user.id });
      
      if (res.data.success) {
        setQrCodeData(res.data.qrCode); // Simpan QR code dari backend
        setOtpSent(true);
        Swal.fire({
          icon: 'success',
          title: 'QR CODE SIAP',
          text: 'Scan pakai Google Authenticator kamu, Ri!',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error("Setup 2FA Error:", err);
      Swal.fire('ERROR', 'Gagal inisialisasi protokol keamanan.', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- VERIFIKASI KODE OTP ---
  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-2fa`, { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        setUser(res.data.user); // Update context user dengan status is_two_fa_enabled: true
        Swal.fire({
          icon: 'success',
          title: '2FA AKTIF',
          text: 'Akun kamu sekarang jauh lebih aman!',
        }).then(() => {
          // Ganti reload total dengan update state jika memungkinkan, 
          // tapi reload aman buat pastiin semua komponen baca status terbaru.
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
    <div className="min-h-screen bg-[#F8FAFF] pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <SecurityView 
          user={user}
          otpSent={otpSent}
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          qrCode={qrCodeData} // Kirim data QR Code ke view
          onGenerateQR={handleGenerateOTP}
          onVerify={handleVerifyOTP}
        />
      </div>
    </div>
  );
};

export default SecurityPage;