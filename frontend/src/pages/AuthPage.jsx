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
      popup: 'rounded-[2rem] border-4 border-slate-950 shadow-[10px_10px_0px_0px_#7C3AED]',
      title: 'font-black italic tracking-tighter text-slate-950',
      confirmButton: 'bg-slate-950 text-white px-8 py-3 rounded-xl font-black uppercase italic'
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
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  
  const navigate = useNavigate();

  // ✅ AUTO-SUBMIT: Begitu 6 digit langsung verifikasi otomatis
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify2FALogin();
    }
  }, [otp]);

  // 🔥 TRIGGER SEND OTP: Memanggil backend untuk kirim kode ke Email & WA
  const triggerSendOTP = async (userId) => {
    try {
      await api.post('/auth/send-otp', { userId });
      skuyAlert("SECURITY", "Kode OTP meluncur ke Email & WhatsApp lo, Ri!", "info");
    } catch (err) {
      console.error("Gagal kirim OTP:", err);
      skuyAlert("ERROR", "Gagal kontak kurir OTP (Email/WA).", "error");
    }
  };

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
        // 🚀 Langsung kirim OTP begitu butuh 2FA
        await triggerSendOTP(res.data.userId);
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal sinkronisasi Google Auth.", "error");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      if (isLogin && res.data.requiresTwoFA) {
        setTempUserId(res.data.userId);
        setShow2FA(true);
        // 🚀 Memicu pengiriman Dual-OTP
        await triggerSendOTP(res.data.userId);
      } else if (res.data.success) {
        if (isLogin) {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/dashboard/wallet');
        } else {
          setIsLogin(true);
          skuyAlert("SUCCESS", "Squad aktif! Silakan login, Ri.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ERROR", err.response?.data?.message || "Engine Error", "error");
    } finally { setLoading(false); }
  };

  const handleVerify2FALogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-2fa', { 
        userId: tempUserId, 
        token: otp 
      });
      
      if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "OTP salah atau expired. Cek Email/WA lagi ya!", "error");
      setOtp('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-violet-100/50 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border-[4px] border-slate-950 shadow-[16px_16px_0px_0px_#000] z-10 overflow-hidden">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="bg-[#0F0F1A] p-16 text-white flex flex-col justify-between hidden md:flex">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-[#7C3AED] rounded-xl flex items-center justify-center font-black text-xl italic border-2 border-white/10 shadow-lg shadow-[#7C3AED]/20">S</div>
              <span className="font-black italic text-2xl tracking-tighter uppercase">SKUY<span className="text-[#7C3AED]">.GG</span></span>
            </div>
            
            <h2 className="text-6xl font-black italic uppercase leading-[0.95] tracking-tighter mb-10 text-white">
              ULTIMATE <br /> <span className="text-[#7C3AED]">SECURITY</span> <br /> PROTOCOL
            </h2>
            
            <div className="space-y-5">
              {[
                { icon: <MessageSquare size={18}/>, text: 'Dual-Channel OTP (Email & WA)' },
                { icon: <ShieldCheck size={18}/>, text: 'Encrypted User Vault' },
                { icon: <Zap size={18}/>, text: 'Real-time Verification' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                  <span className="text-[#7C3AED]">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic text-left">© 2026 SKUY.GG STUDIO • KARAWANG PRIDE</p>
        </div>

        {/* RIGHT SIDE: AUTH FORM */}
        <div className="p-12 md:p-20 flex flex-col justify-center bg-white relative">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="mb-10 text-left">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">ACCESS PORTAL</h3>
                  <div className="w-14 h-2 bg-[#7C3AED] mt-2 rounded-full shadow-[2px_2px_0px_0px_#000]" />
                </div>

                {isLogin && (
                  <div className="mb-8">
                    <div className="border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] transition-transform">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center my-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                      <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">SECURE GATEWAY</span>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 focus:bg-white outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  )}
                  <div className="relative group text-left">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 focus:bg-white outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 focus:bg-white outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-base shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-6 border-2 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'VALIDATE SESSION' : 'JOIN THE SQUAD'} <ChevronRight size={20} /></>}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-colors border-b-2 border-transparent hover:border-slate-950">
                    {isLogin ? "DON'T HAVE AN ACCOUNT? REGISTER" : "ALREADY A MEMBER? LOGIN"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                <div className="w-20 h-20 bg-violet-50 text-[#7C3AED] rounded-[1.5rem] mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[6px_6px_0px_0px_#000]">
                  <MessageSquare size={40} />
                </div>
                <div className="space-y-2 text-center">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">DUAL-OTP VERIFY</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Cek kode yang masuk ke Email & WhatsApp lo, Ri!</p>
                </div>
                <input 
                  type="text" maxLength="6" placeholder="••••••" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-2xl text-center text-6xl font-black tracking-[0.3em] outline-none shadow-inner focus:bg-white transition-all placeholder:text-slate-100"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  onClick={handleVerify2FALogin} disabled={loading}
                  className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase italic shadow-[0_6px_0_0_#475569] active:translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-white/10"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE ACCESS'}
                </button>
                <div className="flex flex-col gap-4">
                  <button onClick={() => triggerSendOTP(tempUserId)} className="text-[10px] font-black uppercase text-[#7C3AED] hover:underline tracking-widest italic">BELUM TERIMA KODE? KIRIM ULANG</button>
                  <button onClick={() => {setShow2FA(false); setOtp('');}} className="text-[10px] font-black uppercase text-slate-300 hover:text-red-500 transition-all tracking-widest italic">CANCEL AUTHENTICATION</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;