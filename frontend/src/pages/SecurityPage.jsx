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

  // --- 1. REQUEST OTP KE EMAIL ---
  const handleRequestEmailOTP = async () => {
    if (!user) return;
    setLoading(true);
    
    // Verifikasi di console untuk memastikan rute /setup-2fa terpanggil
    console.log(`🚀 Mengirim kode OTP ke: ${user.email}`);

    try {
      // Backend sekarang akan mengirim email, bukan gambar QR
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setOtpSent(true); // Memunculkan input 6 digit di SecurityView
        Swal.fire({
          icon: 'success',
          title: 'KODE TERKIRIM',
          text: `Cek inbox Gmail lo (${user.email}). Kodenya udah meluncur! 🚀`,
          confirmButtonColor: '#000',
          customClass: {
            popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'
          }
        });
      }
    } catch (err) {
      console.error("Email OTP Error:", err);
      Swal.fire('ERROR', 'Gagal kirim email. Pastiin EMAIL_USER di Railway udah bener!', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI KODE DARI EMAIL ---
  const handleVerifyOTP = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        // Update user state lokal agar tombol "Disable" muncul
        setUser({ ...user, is_two_fa_enabled: true }); 
        
        Swal.fire({
          icon: 'success',
          title: '2FA AKTIF',
          text: 'Akun sultan lo sekarang aman banget! 🛡️',
        }).then(() => {
          window.location.reload(); 
        });
      }
    } catch (err) { 
      Swal.fire('GAGAL', 'Kode OTP salah atau udah kadaluwarsa!', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA ---
  const handleDisable2FA = async () => {
    Swal.fire({
      title: 'MATIKAN KEAMANAN?',
      text: 'Akun lo bakal lebih berisiko tanpa 2FA, Ri!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Matikan',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.post('/auth/disable-2fa', { userId: user.id });
          if (res.data.success) {
            Swal.fire('NONAKTIF', '2FA Berhasil dimatikan.', 'success').then(() => {
              window.location.reload();
            });
          }
        } catch (err) {
          Swal.fire('ERROR', 'Gagal mematikan protokol keamanan.', 'error');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] pt-24 px-6 text-left">
      <div className="max-w-4xl mx-auto">
        {/* qrCode dikirim kosong ('') karena kita sudah tidak pakai QR lagi */}
        <SecurityView 
          user={user}
          otpSent={otpSent}
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          qrCode={''} 
          onGenerateQR={handleRequestEmailOTP}
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;