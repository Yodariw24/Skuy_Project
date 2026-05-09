import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, MessageSquare, Zap, Phone } from 'lucide-react';
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
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    username: '',
    phone_number: '' 
  });
  
  const navigate = useNavigate();

  // ✅ AUTO-SUBMIT: 6 Digit langsung gass
  useEffect(() => {
    if (otp.length === 6) handleVerify2FALogin();
  }, [otp]);

  // 🔥 TRIGGER SEND OTP
  const triggerSendOTP = async (userId) => {
    try {
      await api.post('/auth/send-otp', { userId });
      // Bahasa alert disesuaikan: Menginfokan kode masuk ke Email Sultan & WA
      skuyAlert("SECURITY", "Kode OTP dikirim via WA & Email Sultan (ariwirayuda24)!", "info");
    } catch (err) {
      skuyAlert("ERROR", "Gagal kontak server keamanan.", "error");
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
        await triggerSendOTP(res.data.userId);
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Google Auth Gagal Sinkron.", "error");
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      const cleanData = {
        ...formData,
        phone_number: formData.phone_number ? formData.phone_number.replace(/\D/g, '') : ''
      };

      const res = await api.post(endpoint, cleanData);
      
      if (isLogin && res.data.requiresTwoFA) {
        setTempUserId(res.data.userId);
        setShow2FA(true);
        await triggerSendOTP(res.data.userId);
      } else if (res.data.success) {
        if (isLogin) {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/dashboard/wallet');
        } else {
          setIsLogin(true);
          skuyAlert("SUCCESS", "Squad aktif! Login sekarang dan aktifkan 2FA di profil.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ACCESS DENIED", err.response?.data?.message || "Engine Error", "error");
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
      skuyAlert("KODE SALAH", "Cek lagi WA lo atau Email ariwirayuda24!", "error");
      setOtp('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] bg-violet-300 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-fuchsia-300 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] border-[4px] border-slate-950 shadow-[16px_16px_0px_0px_#000] z-10 overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="bg-[#0F0F1A] p-12 text-white flex flex-col justify-between hidden lg:flex relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={200} /></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 bg-[#7C3AED] rounded-xl flex items-center justify-center font-black text-xl italic border-2 border-white/10 shadow-lg">S</div>
              <span className="font-black italic text-2xl tracking-tighter uppercase">SKUY<span className="text-[#7C3AED]">.GG</span></span>
            </div>
            
            <h2 className="text-6xl font-black italic uppercase leading-[0.9] tracking-tighter mb-8">
              SULTAN <br /> <span className="text-[#7C3AED]">SECURITY</span> <br /> V3 READY
            </h2>
            
            <div className="space-y-4">
              {[
                { icon: <MessageSquare size={18}/>, text: 'Dual-Channel (WA + Email Sultan)' },
                { icon: <ShieldCheck size={18}/>, text: 'Neo-Brutalism Engine' },
                { icon: <Zap size={18}/>, text: 'Fast-Sync Railway' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                  <span className="text-[#7C3AED]">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">© 2026 SKUY.GG • REDIRECT PROTOCOL ACTIVE</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950">{isLogin ? 'ACCESS PORTAL' : 'CREATE ACCOUNT'}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Authorized by ariwirayuda24</p>
                </div>

                {isLogin && (
                  <>
                    <div className="border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] transition-all">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                      <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">MANUAL LOGIN</span>
                    </div>
                  </>
                )}

                <form className="space-y-3" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={16}/>
                        <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 outline-none transition-all text-sm" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={16}/>
                        <input type="text" placeholder="WA Number (Contoh: 0812...)" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 outline-none transition-all text-sm" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/\D/g, '')})} />
                      </div>
                    </>
                  )}
                  <div className="relative group text-left">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={16}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 outline-none transition-all text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={16}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-slate-950 outline-none transition-all text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-4 rounded-xl font-black uppercase italic tracking-widest text-sm shadow-[0_5px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-4 border-2 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'VALIDATE SESSION' : 'ACTIVATE SQUAD'} <ChevronRight size={18} /></>}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950 transition-all text-center">
                  {isLogin ? "NEW CREATOR? JOIN HERE" : "ALREADY A MEMBER? LOGIN"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                <div className="w-16 h-16 bg-violet-50 text-[#7C3AED] rounded-2xl mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[4px_4px_0px_0px_#000]">
                  <MessageSquare size={30} />
                </div>
                <div className="space-y-1 text-center">
                  <h4 className="text-2xl font-black italic uppercase tracking-tighter">SULTAN VERIFY</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Cek kode di WA lo atau di Email ariwirayuda24!</p>
                </div>
                <input 
                  type="text" maxLength="6" placeholder="••••••" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-5xl font-black tracking-[0.2em] outline-none focus:bg-white transition-all placeholder:text-slate-100"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  onClick={handleVerify2FALogin} disabled={loading}
                  className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic shadow-[0_5px_0_0_#475569] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE SULTAN'}
                </button>
                <div className="flex flex-col gap-3">
                  <button onClick={() => triggerSendOTP(tempUserId)} className="text-[9px] font-black uppercase text-[#7C3AED] hover:underline tracking-widest">KIRIM ULANG KODE</button>
                  <button onClick={() => {setShow2FA(false); setOtp('');}} className="text-[9px] font-black uppercase text-slate-300 hover:text-red-500 tracking-widest">BATALKAN</button>
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