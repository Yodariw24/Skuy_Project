import React, { useState } from 'react';
import api from '../api/axios'; 
import SecurityView from '../components/dashboard/SecurityView'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

// Custom Alert Sultan Skuy.GG (Neo-Brutalism Style)
const skuyAlert = Swal.mixin({
  customClass: {
    popup: 'skuy-popup rounded-[2rem] p-10 border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]',
    title: 'skuy-title text-3xl text-slate-950 font-black italic uppercase tracking-tighter',
    confirmButton: 'bg-[#7C3AED] text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-950',
    cancelButton: 'bg-slate-100 text-slate-500 px-10 py-4 rounded-xl font-black text-[11px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-200',
  },
  buttonsStyling: false,
});

const SecurityPage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(''); 
  const [otp, setOtp] = useState('');

  // --- 1. GENERATE QR CODE (Sultan Protocol) ---
  const handleGenerateQR = async () => {
    if (!user?.id) return;
    setLoading(true);
    
    console.log(`🚀 Inisialisasi QR Code untuk User ID: ${user.id}`);

    try {
      // ✅ FIX: Kirim userId di body agar backend (authRoutes.js) bisa baca req.body.userId
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setQrCodeUrl(res.data.qrCode); // Gambar QR Base64 dari backend
        skuyAlert.fire({
          icon: 'info',
          title: 'PROTOCOL READY 🛡️',
          text: 'Scan QR Code di layar pakai Google Authenticator lo, Ri!',
        });
      }
    } catch (err) {
      console.error("QR Setup Error:", err.response?.data || err.message);
      skuyAlert.fire({
        icon: 'error',
        title: 'ERROR SISTEM',
        text: 'Gagal generate QR Code. Cek apakah rute /setup-2fa sudah di-export di backend!',
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI KODE QR ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        // ✅ Update State & Storage
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (res.data.token) localStorage.setItem('user_token', res.data.token);
        
        skuyAlert.fire({
          icon: 'success',
          title: 'GACOR TOTAL! 🛡️',
          text: 'Akun Sultan resmi terenkripsi QR-TOTP!',
        }).then(() => {
          window.location.reload(); 
        });
      }
    } catch (err) { 
      skuyAlert.fire({
        icon: 'error',
        title: 'KODE SALAH',
        text: 'OTP nggak cocok, Ri. Cek lagi di HP lo!',
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA ---
  const handleDisable2FA = async () => {
    skuyAlert.fire({
      title: 'COPOT PROTEKSI?',
      text: 'Yakin mau cabut keamanan QR? Akun lo jadi Standard lagi nanti.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'IYA, CABUT AJA',
      cancelButtonText: 'BATAL'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // ✅ Sesuai rute /disable-2fa di backend lo
          const res = await api.post('/auth/disable-2fa', { userId: user.id });
          if (res.data.success) {
            const updatedUser = { ...user, is_two_fa_enabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            skuyAlert.fire({
              icon: 'success',
              title: 'PROTECTION OFF',
              text: 'Sistem keamanan dicabut.',
            }).then(() => {
              window.location.reload();
            });
          }
        } catch (err) {
          skuyAlert.fire('ERROR', 'Gagal mematikan protokol keamanan.', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] pt-24 px-6 text-left">
      <div className="max-w-4xl mx-auto">
        {/* ✅ Pastikan prop onGenerateQR dikirim ke SecurityView agar tidak Error "is not a function" */}
        <SecurityView 
          user={user}
          qrCodeUrl={qrCodeUrl} 
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          onGenerateQR={handleGenerateQR} 
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;