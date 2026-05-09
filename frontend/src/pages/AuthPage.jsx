import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, QrCode, Zap } from 'lucide-react';
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

  // ✅ AUTO-SUBMIT: Kalo udah 6 digit langsung verifikasi
  useEffect(() => {
    if (otp.length === 6) handleVerify2FALogin();
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
        skuyAlert("SECURITY", "Input kode dari Google Authenticator lo, Ri!", "info");
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal sinkronisasi Google Auth.", "error");
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
      skuyAlert("KODE SALAH", "OTP salah atau expired.", "error");
      setOtp('');
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
      } else if (res.data.success) {
        if (isLogin) {
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/dashboard/wallet');
        } else {
          setIsLogin(true);
          skuyAlert("SUCCESS", "Squad aktif! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ERROR", err.response?.data?.message || "Server Error", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-6 font-sans text-left relative overflow-hidden">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-violet-100 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border-[4px] border-slate-950 shadow-[16px_16px_0px_0px_#000] z-10 overflow-hidden">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="bg-[#0F0F1A] p-16 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 bg-[#7C3AED] rounded-xl flex items-center justify-center font-black text-xl italic border-2 border-white/20">S</div>
              <span className="font-black italic text-2xl tracking-tighter uppercase">SKUY<span className="text-[#7C3AED]">.GG</span></span>
            </div>
            
            <h2 className="text-6xl font-black italic uppercase leading-[0.95] tracking-tighter mb-10">
              EMPOWERING <br /> <span className="text-[#7C3AED]">DIGITAL</span> <br /> CREATORS
            </h2>
            
            <div className="space-y-5">
              {[
                { icon: <ShieldCheck size={18}/>, text: 'QR-Auth Encrypted' },
                { icon: <CheckCircle2 size={18}/>, text: 'Instant Payout System' },
                { icon: <Zap size={18}/>, text: 'Zero Hidden Fees' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                  <span className="text-[#7C3AED]">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">© 2026 SKUY.GG • BUILT FOR SULTANS</p>
        </div>

        {/* RIGHT SIDE: AUTH FORM */}
        <div className="p-12 md:p-20 flex flex-col justify-center bg-white relative">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-10">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950">ACCESS PORTAL</h3>
                  <div className="w-12 h-1.5 bg-[#7C3AED] mt-2 rounded-full" />
                </div>

                {isLogin && (
                  <div className="mb-8">
                    <div className="border-4 border-slate-950 rounded-2xl overflow-hidden hover:translate-y-[-2px] transition-all shadow-[4px_4px_0px_0px_#000]">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" shape="square" width="100%" />
                    </div>
                    <div className="relative flex items-center justify-center my-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                      <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">OR MANUAL LOGIN</span>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                    <input type="email" placeholder="Email" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-14 rounded-xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-base shadow-[0_6px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-6">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'AUTHORIZE' : 'REGISTER'} <ChevronRight size={20} /></>}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#7C3AED] transition-colors">
                  {isLogin ? "Need Account? Register Here" : "Have Account? Login Now"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                <div className="w-20 h-20 bg-slate-50 text-[#7C3AED] rounded-3xl mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[6px_6px_0px_0px_#7C3AED]">
                  <QrCode size={40} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">VERIFY ACCESS</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Input 6-digit dari App Authenticator lo</p>
                </div>
                <input 
                  type="text" maxLength="6" placeholder="000000" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-2xl text-center text-5xl font-black tracking-[0.3em] outline-none shadow-inner focus:bg-white transition-all"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  onClick={handleVerify2FALogin} disabled={loading}
                  className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase italic shadow-[0_6px_0_0_#334155] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'VALIDATE IDENTITY'}
                </button>
                <button onClick={() => setShow2FA(false)} className="text-[10px] font-black uppercase text-slate-300 hover:text-slate-900 transition-all tracking-widest">CANCEL PROTOCOL</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;