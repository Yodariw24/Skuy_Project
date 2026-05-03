import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, MessageSquare, Zap } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const skuyAlert = (title, text, icon) => {
  Swal.fire({
    title: title.toUpperCase(),
    text: text,
    icon: icon,
    customClass: {
      popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
      title: 'font-black italic tracking-tighter',
      confirmButton: 'bg-violet-600 text-white px-8 py-3 rounded-xl font-black uppercase italic'
    },
    buttonsStyling: false
  });
};

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [formData, setFormData] = useState({ identifier: '', password: '', email: '', full_name: '', username: '' });
  
  const navigate = useNavigate();

  // ✅ Auto-submit saat OTP mencapai 6 digit
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify2FALogin();
    }
  }, [otp]);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await api.post('/auth/google', {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub
      });

      if (res.data.requiresTwoFA) {
        setTempUserId(res.data.userId);
        setShow2FA(true);
        skuyAlert("SECURITY", "Protokol aktif! Masukkan kode dari WhatsApp lo.", "info");
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal sinkronisasi Google Cloud.", "error");
    } finally { setLoading(false); }
  };

  const handleVerify2FALogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: tempUserId, token: otp });
      if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "Kode verifikasi tidak valid.", "error");
      setOtp(''); // Reset input jika salah
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { 
          email: formData.identifier, 
          password: formData.password 
        });
        
        if (res.data.requiresTwoFA) {
          setTempUserId(res.data.userId);
          setShow2FA(true);
        } else {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/dashboard/wallet');
        }
      } else {
        const res = await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || formData.username
        });
        if (res.data.success) {
          setIsLogin(true);
          skuyAlert("SUCCESS", "Squad terdaftar! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ERROR", err.response?.data?.message || "Server Error", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 font-sans relative overflow-hidden text-left">
      {/* Background Ornaments tetap sama */}
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border-[3px] border-slate-950 shadow-[24px_24px_0px_0px_rgba(15,15,15,1)] z-10 overflow-hidden">
        
        {/* LEFT SIDE (Branding) */}
        <div className="bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <h2 className="text-5xl font-black italic uppercase leading-[1.1] tracking-tighter mb-6">
              Digital <br /> <span className="text-violet-500">Shield</span> Activated
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                <ShieldCheck size={18} className="text-emerald-500" /> WhatsApp 2FA Ready
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">© 2026 Skuy.GG Studio • Karawang Pride</p>
        </div>

        {/* RIGHT SIDE (Form) */}
        <div className="p-10 md:p-14 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Login/Register Form lo di sini tetap sama */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* ... Input Fields ... */}
                  <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-6">
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Enter Portal' : 'Join Squad')}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.form key="2fa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleVerify2FALogin} className="space-y-8 py-4">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-4 border-emerald-200">
                    <MessageSquare size={40} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">WhatsApp OTP Protocol</p>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mt-1">Verifikasi Identitas</h4>
                  </div>
                  <input 
                    type="text" maxLength="6" placeholder="••••••" required autoFocus
                    className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-3xl text-center text-5xl font-black tracking-[0.4em] outline-none shadow-inner focus:bg-white transition-all"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest border-4 border-slate-950 shadow-[0_8px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <>Unlock Access <Zap size={18}/></>}
                </button>
                <button type="button" onClick={() => setShow2FA(false)} className="w-full text-[10px] font-black uppercase text-slate-300 hover:text-slate-950 transition-all">Ganti Metode Login</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthPage;