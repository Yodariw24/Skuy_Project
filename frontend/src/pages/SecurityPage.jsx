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

  // ✅ AUTO-RESET: Kalau status user berubah (misal lo logout/login akun lain), reset form
  useEffect(() => {
    if (user?.is_two_fa_enabled) {
      setIsVerifying(false);
    }
  }, [user]);

  // --- 1. REQUEST OTP (WhatsApp + Email Sultan Protocol) ---
  const handleRequestOTP = async () => {
    if (!user?.id) return;
    
    // 🛡️ PROTEKSI: Nomor WA wajib ada di database
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return skuyAlert.fire({
        icon: 'warning',
        title: 'WA BELUM SET!',
        text: 'Ri, lo harus isi nomor WhatsApp dulu di Profil buat dapet kode keamanan!',
      });
    }

    setLoading(true);
    try {
      // ✅ Panggil backend (authRoutes.js) buat trigger OTP
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setIsVerifying(true);
        skuyAlert.fire({
          icon: 'info',
          title: 'KODE TERKIRIM 🚀',
          text: 'Cek WhatsApp lo atau Email Sultan (ariwirayuda24), Ri!',
        });
      }
    } catch (err) {
      skuyAlert.fire({
        icon: 'error',
        title: 'ENGINE ERROR',
        text: 'Gagal kontak server keamanan. Pastiin backend lo udah running!',
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
        // ✅ Sinkronisasi State Global & Storage
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        skuyAlert.fire({
          icon: 'success',
          title: 'GACOR! PROTECTED 🛡️',
          text: '2FA resmi aktif. Akun lo sekarang setangguh benteng!',
        }).then(() => {
          // Force reload untuk memastikan Sidebar & UI Dashboard dapet status terbaru
          window.location.reload(); 
        });
      }
    } catch (err) { 
      skuyAlert.fire({
        icon: 'error',
        title: 'KODE SALAH',
        text: 'OTP nggak cocok atau expired, Ri!',
      });
      setOtp('');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA (Master Key & Emergency) ---
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
          // Menggunakan Master Key lo buat bypass penghapusan
          const res = await api.post('/auth/verify-2fa', { userId: user.id, token: '241004' }); 
          
          if (res.data.success) {
            // Update status lokal
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
          onGenerateQR={handleRequestOTP} // Link ke tombol aktivasi
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
        />
      </div>
    </div>
  );
};

export default SecurityPage;