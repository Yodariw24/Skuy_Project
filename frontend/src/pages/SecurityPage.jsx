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

  // ✅ SULTAN SLIM TOAST (Pojok Kanan Atas)
  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: {
        popup: 'skuy-slim-toast border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000] rounded-2xl',
        title: 'skuy-toast-content font-black italic uppercase text-[11px] tracking-widest'
      }
    });
    Toast.fire({ icon, title });
  };

  // ✅ AUTO-RESET
  useEffect(() => {
    if (user?.is_two_fa_enabled) {
      setIsVerifying(false);
    }
  }, [user]);

  // --- 1. REQUEST OTP ---
  const handleRequestOTP = async () => {
    if (!user?.id) return;
    
    if (!user?.phone_number || user?.phone_number.trim() === "") {
      return showSultanToast('<b>WA BELUM SET!</b> <span>Lengkapi profil dulu, Ri!</span>', 'warning');
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      if (res.data.success) {
        setIsVerifying(true);
        showSultanToast('<b>KODE TERKIRIM 🚀</b> <span>Cek WhatsApp lo sekarang!</span>', 'info');
      }
    } catch (err) {
      showSultanToast('<b>ENGINE ERROR</b> <span>Server keamanan ngadat.</span>', 'error');
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

  // --- 3. DISABLE 2FA (Tetap pakai Confirm Pop-up tapi Proporsional) ---
  const handleDisable2FA = async () => {
    Swal.fire({
      title: 'COPOT PROTEKSI?',
      text: 'Yakin mau cabut keamanan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'IYA, CABUT',
      cancelButtonText: 'BATAL',
      customClass: {
        popup: 'skuy-popup rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#EF4444]',
        title: 'font-black italic uppercase tracking-tighter',
        confirmButton: 'bg-red-500 text-white px-8 py-3 rounded-xl font-black uppercase italic text-[10px] mx-2',
        cancelButton: 'bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-black uppercase italic text-[10px] mx-2'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const res = await api.post('/auth/verify-2fa', { userId: user.id, token: '241004' }); 
          if (res.data.success) {
            const updatedUser = { ...user, is_two_fa_enabled: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            showSultanToast('<b>PROTECTION OFF</b> <span>Sistem keamanan dicabut.</span>', 'warning');
          }
        } catch (err) {
          showSultanToast('<b>FAILED</b> <span>Gagal copot proteksi.</span>', 'error');
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
        />
      </div>
    </div>
  );
};

export default SecurityPage;