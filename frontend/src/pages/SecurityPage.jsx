import React, { useState } from 'react';
import api from '../api/axios'; 
import SecurityView from '../components/dashboard/SecurityView'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

// Custom Alert Sultan Skuy.GG
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
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // ✅ State untuk menampung gambar QR
  const [otp, setOtp] = useState('');

  // --- 1. GENERATE QR CODE (PENGGANTI WA OTP) ---
  const handleGenerateQR = async () => {
    if (!user) return;
    setLoading(true);
    
    console.log(`🚀 Menginisialisasi Protokol QR Authenticator...`);

    try {
      // Nembak backend yang sudah pakai otplib & qrcode
      const res = await api.post('/auth/setup-2fa');
      
      if (res.data.success) {
        setQrCodeUrl(res.data.qrCode); // Simpan gambar QR Base64
        skuyAlert.fire({
          icon: 'info',
          title: 'PROTOCOL READY 🛡️',
          text: 'Scan QR Code di layar pakai Google Authenticator atau Authy lo, Ri!',
        });
      }
    } catch (err) {
      console.error("QR Setup Error:", err);
      skuyAlert.fire({
        icon: 'error',
        title: 'ERROR SISTEM',
        text: 'Gagal generate QR Code. Pastikan server Railway lo aman, Ri!',
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI KODE DARI APP AUTHENTICATOR ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    try {
      // Backend sekarang verifikasi pake authenticator.check()
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        // Update user state lokal & localStorage agar sinkron total
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('user_token', res.data.token);
        
        skuyAlert.fire({
          icon: 'success',
          title: 'GACOR TOTAL! 🛡️',
          text: 'Protokol QR-Code Aktif. Akun lo sekarang setara benteng besi!',
        }).then(() => {
          window.location.reload(); // Refresh untuk re-sync sidebar & navbar
        });
      }
    } catch (err) { 
      skuyAlert.fire({
        icon: 'error',
        title: 'KODE SALAH',
        text: 'OTP dari app lo nggak cocok atau udah expired! Cek lagi HP lo.',
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA ---
  const handleDisable2FA = async () => {
    skuyAlert.fire({
      title: 'COPOT PROTEKSI?',
      text: 'Yakin mau cabut protokol keamanan QR? Akun lo jadi rentan lho, Ri!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'IYA, CABUT AJA',
      cancelButtonText: 'BATAL'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const res = await api.post('/auth/disable-2fa');
          if (res.data.success) {
            const updatedUser = { ...user, is_two_fa_enabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            skuyAlert.fire({
              icon: 'success',
              title: 'PROTECTION OFF',
              text: 'Sistem keamanan diturunkan ke standar.',
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
        <SecurityView 
          user={user}
          qrCodeUrl={qrCodeUrl} // ✅ Kirim URL gambar QR ke SecurityView
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          onGenerateQR={handleGenerateQR} // Sekarang fungsinya generate QR
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;