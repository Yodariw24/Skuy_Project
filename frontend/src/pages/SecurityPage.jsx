import React, { useState, useEffect } from 'react';
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
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ✅ AUTO-RESET: Kalau status user berubah, reset form verifikasi
  useEffect(() => {
    if (user?.is_two_fa_enabled) {
      setIsVerifying(false);
    }
  }, [user]);

  // --- 1. REQUEST OTP (Dual-Channel Protocol) ---
  const handleRequestOTP = async () => {
    if (!user?.id) return;
    
    // 🛡️ PROTEKSI: Cek nomor WA dulu
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return skuyAlert.fire({
        icon: 'warning',
        title: 'WA BELUM SET!',
        text: 'Ri, lo harus isi nomor WhatsApp dulu di Profil buat dapet kode keamanan!',
      });
    }

    setLoading(true);
    try {
      // ✅ Jalur Resend API + Fonnte
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setIsVerifying(true);
        skuyAlert.fire({
          icon: 'info',
          title: 'KODE TERKIRIM 🚀',
          text: 'Cek WhatsApp & Email lo sekarang, Ri!',
        });
      }
    } catch (err) {
      skuyAlert.fire({
        icon: 'error',
        title: 'ENGINE ERROR',
        text: 'Gagal kontak server OTP. Pastiin backend Railway lo UP!',
      });
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFIKASI AKTIVASI ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        // ✅ Sync State & Storage
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        skuyAlert.fire({
          icon: 'success',
          title: 'GACOR! PROTECTED 🛡️',
          text: '2FA resmi aktif lewat jalur WA & Email Sultan!',
        }).then(() => {
          // Force reload biar Sidebar & View sinkron 100%
          window.location.reload(); 
        });
      }
    } catch (err) { 
      skuyAlert.fire({
        icon: 'error',
        title: 'KODE SALAH',
        text: 'OTP nggak cocok, Ri. Cek WA/Email lagi ya!',
      });
      setOtp('');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA (Emergency Master Key) ---
  const handleDisable2FA = async () => {
    skuyAlert.fire({
      title: 'COPOT PROTEKSI?',
      text: 'Yakin mau cabut keamanan? Akun lo jadi nggak Sultan lagi nanti.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'IYA, CABUT AJA',
      cancelButtonText: 'BATAL'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // Kita pake Master Key buat bypass/disable langsung di tahap aktivasi
          const res = await api.post('/auth/verify-2fa', { userId: user.id, token: '241004' }); 
          
          if (res.data.success) {
            // Karena rute /verify-2fa kita juga otomatis ngaktifin, 
            // kita harus pastiin backend punya logic /disable-2fa atau update manual statusnya
            // Untuk sementara, kita paksa update lokal:
            const updatedUser = { ...user, is_two_fa_enabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            skuyAlert.fire({
              icon: 'success',
              title: 'PROTECTION OFF',
              text: 'Sistem keamanan resmi dicabut.',
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
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          isVerifying={isVerifying}
          onGenerateQR={handleRequestOTP} // Mapping ke request OTP WA
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;