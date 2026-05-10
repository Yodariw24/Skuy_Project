import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import SecurityView from '../components/dashboard/SecurityView'; 
import { useAuth } from '../context/AuthContext'; 
import Swal from 'sweetalert2';

const SecurityPage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // ✅ SULTAN SLIM TOAST PROTOCOL
  // Muncul di pojok kanan atas, durasi 3 detik, dan TIDAK nge-blok input OTP.
  const showSultanToast = (title, icon = 'success') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#ffffff',
      customClass: {
        popup: 'border-4 border-slate-950 shadow-[4px_4px_0px_0px_#7C3AED] rounded-2xl',
        title: 'skuy-toast-content font-black italic uppercase text-[10px] tracking-widest'
      }
    });
  };

  // ✅ AUTO-SYNC Status
  useEffect(() => {
    if (user?.is_two_fa_enabled) {
      setIsVerifying(false);
    }
  }, [user]);

  // --- 1. REQUEST OTP NODE ---
  const handleRequestOTP = async () => {
    if (!user?.id) return;
    
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return showSultanToast('<b>WA BELUM SET!</b> <span>Isi nomor WA di profil dulu.</span>', 'warning');
    }

    setLoading(true);
    try {
      // ✅ Trigger setup-2fa ke backend
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      
      if (res.data.success) {
        setIsVerifying(true); // Membuka form input di SecurityView secara otomatis
        showSultanToast('<b>KODE TERKIRIM 🚀</b> <span>Cek WhatsApp lo, Ri!</span>', 'info');
      }
    } catch (err) {
      showSultanToast('<b>ENGINE ERROR</b> <span>Gagal kontak server keamanan.</span>', 'error');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. VERIFY & ACTIVATE NODE ---
  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      return showSultanToast('<b>DIGIT KURANG!</b> <span>Masukin 6 digit kode.</span>', 'warning');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: user.id, 
        token: otp 
      });

      if (res.data.success) {
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser); 
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsVerifying(false);
        setOtp('');
        showSultanToast('<b>GACOR! PROTECTED 🛡️</b> <span>Akun lo resmi kasta Sultan.</span>');
      }
    } catch (err) { 
      showSultanToast('<b>KODE SALAH</b> <span>OTP nggak cocok, Ri!</span>', 'error');
      setOtp('');
    } finally { 
      setLoading(false); 
    }
  };

  // --- 3. DISABLE 2FA (Master Key Protocol) ---
  const handleDisable2FA = async () => {
    Swal.fire({
      title: 'COPOT PROTEKSI?',
      text: 'Yakin mau cabut keamanan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'IYA, CABUT',
      cancelButtonText: 'BATAL',
      buttonsStyling: false,
      customClass: {
        popup: 'skuy-popup rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#EF4444] p-8',
        title: 'font-black italic uppercase tracking-tighter',
        confirmButton: 'bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase italic text-[10px] mx-2 shadow-[4px_4px_0px_0px_#000]',
        cancelButton: 'bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-black uppercase italic text-[10px] mx-2'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          // ✅ Gunakan Master Key bypass
          const res = await api.post('/auth/verify-2fa', { userId: user.id, token: '241004' }); 
          if (res.data.success) {
            const updatedUser = { ...user, is_two_fa_enabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showSultanToast('<b>PROTECTION OFF</b> <span>Sistem keamanan dicabut.</span>', 'warning');
          }
        } catch (err) {
          showSultanToast('<b>FAILED</b> <span>Gagal mematikan protokol.</span>', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent pt-10 px-0 text-left">
      <div className="max-w-4xl mx-auto">
        <SecurityView 
          user={user}
          otp={otp}
          setOtp={setOtp}
          loading={loading}
          isVerifying={isVerifying}
          onGenerateQR={handleRequestOTP} 
          onVerify={handleVerifyOTP}
          onDisable={handleDisable2FA}
          onCancel={() => setIsVerifying(false)} // Tambahkan fungsi cancel
        />
      </div>
    </div>
  );
};

export default SecurityPage;