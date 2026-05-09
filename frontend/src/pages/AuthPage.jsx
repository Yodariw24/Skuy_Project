import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, MessageSquare, Zap, QrCode } from 'lucide-react';
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
      confirmButton: 'bg-[#7C3AED] text-white px-8 py-3 rounded-xl font-black uppercase italic'
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

  // ✅ AUTO-SUBMIT OTP: Kalo udah 6 digit langsung verifikasi otomatis
  useEffect(() => {
    if (otp.length === 6) handleVerify2FALogin();
  }, [otp]);

  // --- 1. HANDLE GOOGLE AUTH ---
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
        skuyAlert("SECURITY", "Input kode dari aplikasi Authenticator lo, Ri!", "info");
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal sinkronisasi Google Cloud.", "error");
    } finally { setLoading(false); }
  };

  // --- 2. VERIFIKASI TOTP (QR AUTHENTICATOR) ---
  const handleVerify2FALogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // ✅ Mengirim token 6 digit dari Google Auth / Authy
      const res = await api.post('/auth/verify-2fa', { userId: tempUserId, token: otp });
      if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        skuyAlert("SUCCESS", "Akses Sultan Diterima! 🛡️", "success");
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "OTP salah atau sudah expired. Cek HP lo!", "error");
      setOtp('');
    } finally { setLoading(false); }
  };

  // --- 3. LOGIN / REGISTER MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, formData);
      
      if (isLogin && res.data.requiresTwoFA) {
        setTempUserId(res.data.userId);
        setShow2FA(true);
        skuyAlert("SECURITY", "Masukkan 6 digit kode dari Authenticator lo.", "info");
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
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 font-sans text-left relative overflow-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-200/40 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] border-[4px] border-slate-950 shadow-[20px_20px_0px_0px_#000] z-10 overflow-hidden">
        
        {/* LEFT SIDE: BRANDING */}
        <div className="bg-[#0F0F1A] p-16 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-lg shadow-[#7C3AED]/20">S</div>
              <span className="font-black italic text-3xl tracking-tighter uppercase">SKUY<span className="text-[#FF1493]">.GG</span></span>
            </div>
            
            <h2 className="text-6xl font-black italic uppercase leading-[1] tracking-tighter mb-10">
              EMPOWERING <br /> <span className="text-[#7C3AED]">DIGITAL</span> <br /> <span className="text-[#FF1493]">CREATORS</span>
            </h2>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck size={20}/>, text: 'QR-Auth Protocol Active' },
                { icon: <CheckCircle2 size={20}/>, text: 'Unlimited Sultan Access' },
                { icon: <Zap size={20}/>, text: 'Zero Latency Verification' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-300 font-bold italic text-base">
                  <span className="text-[#7C3AED]">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 italic mt-10">© 2026 SKUY.GG STUDIO • KARAWANG PRIDE</p>
        </div>

        {/* RIGHT SIDE: AUTH FORM / QR VIEW */}
        <div className="p-12 md:p-20 flex flex-col justify-center bg-white min-h-[600px]">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-12">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">ACCESS PORTAL</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] italic text-[#FF1493]">Secure QR-Auth System</p>
                </div>

                {isLogin && (
                  <>
                    <div className="mb-10 border-4 border-slate-950 rounded-2xl overflow-hidden hover:translate-y-[-2px] transition-all shadow-[0_4px_0_0_#000]">
                      <GoogleLogin onSuccess={handleGoogleSuccess} width="100%" theme="filled_black" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center mb-10">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                      <span className="relative bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">OR MANUAL ACCESS</span>
                    </div>
                  </>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-[#7C3AED] outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-6 rounded-[2rem] font-black uppercase italic tracking-widest text-lg shadow-[0_8px_0_0_#4c1d95] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 mt-10">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'LOGIN NOW' : 'REGISTER'} <ChevronRight size={24} /></>}
                  </button>
                </form>

                <div className="mt-12 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-[#FF1493] transition-all">
                    {isLogin ? "DON'T HAVE AN ACCOUNT? SIGN UP" : "ALREADY A MEMBER? SIGN IN"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
                <div className="w-24 h-24 bg-pink-50 text-[#FF1493] rounded-[2.5rem] mx-auto flex items-center justify-center border-4 border-[#FF1493] shadow-[8px_8px_0_0_#000]">
                  <QrCode size={48} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">QR-AUTH PROTOCOL</p>
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mt-2">ACCESS VERIFICATION</h4>
                </div>
                <input 
                  type="text" maxLength="6" placeholder="••••••" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-8 rounded-[2.5rem] text-center text-6xl font-black tracking-[0.4em] outline-none shadow-inner focus:bg-white transition-all"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Buka Authenticator lo dan input kodenya</p>
                <button 
                  onClick={handleVerify2FALogin} disabled={loading}
                  className="w-full bg-[#FF1493] text-white py-7 rounded-[2.5rem] font-black uppercase italic shadow-[0_10px_0_0_#9d174d] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <>AUTHORIZE IDENTITY <Zap size={22}/></>}
                </button>
                <button onClick={() => setShow2FA(false)} className="text-[11px] font-black uppercase text-slate-300 hover:text-slate-950 transition-all tracking-widest">BATAL VERIFIKASI</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;