import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { Loader2, ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, MessageSquare, Zap, Phone, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

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

  // --- HELPER: SULTAN SLIM TOAST ---
  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: { popup: 'skuy-slim-toast', title: 'skuy-toast-content' }
    });
    Toast.fire({ icon, title });
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify2FALogin();
  }, [otp]);

  // 🔥 TRIGGER SEND OTP (Path Fixed)
  const triggerSendOTP = async (userId) => {
    try {
      await api.post('/auth/send-otp', { userId });
      showSultanToast('<b>SECURITY SENT</b> <span>Cek WA & Email ariwirayuda24!</span>', 'info');
    } catch (err) {
      showSultanToast('<b>FAILED</b> <span>Gagal kirim OTP.</span>', 'error');
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
        navigate('/dashboard');
      }
    } catch (err) {
      showSultanToast('<b>AUTH ERROR</b> <span>Google Sync Gagal.</span>', 'error');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ FIX: Gunakan path bersih tanpa /api/ di depan (Axios handle it)
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
          navigate('/dashboard');
        } else {
          setIsLogin(true);
          Swal.fire({
            title: "SQUAD ACTIVE!",
            text: "Berhasil daftar! Login sekarang dan amankan akun lo, Ri.",
            icon: "success",
            customClass: { popup: 'skuy-border skuy-shadow rounded-[2rem]' }
          });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Engine Error";
      showSultanToast(`<b>ACCESS DENIED</b> <span>${msg}</span>`, 'error');
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
        showSultanToast('<b>AUTHORIZED</b> <span>Welcome back, Sultan!</span>');
        navigate('/dashboard');
      }
    } catch (err) {
      showSultanToast('<b>INVALID CODE</b> <span>OTP Salah!</span>', 'error');
      setOtp('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-200 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-fuchsia-200 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] border-4 border-slate-950 shadow-[20px_20px_0px_0px_#000] z-10 overflow-hidden">
        
        {/* LEFT SIDE: SULTAN BRANDING */}
        <div className="bg-slate-950 p-12 text-white flex flex-col justify-between hidden lg:flex relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Zap size={300} fill="white" /></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center font-black text-2xl italic border-2 border-white/20 shadow-lg rotate-3">S</div>
              <span className="font-black italic text-2xl tracking-tighter uppercase">SKUY<span className="text-[#7C3AED]">.GG</span></span>
            </div>
            
            <h2 className="text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mb-10">
              SULTAN <br /> <span className="text-[#7C3AED]">PROTECTION</span> <br /> v2.4 ACTIVE
            </h2>
            
            <div className="space-y-5">
              {[
                { icon: <MessageSquare size={20}/>, text: 'Dual-Channel Authentication' },
                { icon: <ShieldCheck size={20}/>, text: 'Railway Cloud Sync Engine' },
                { icon: <Sparkles size={20}/>, text: 'Neo-Brutalism Interface' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400 font-black italic text-xs uppercase tracking-widest">
                  <span className="text-[#7C3AED] p-2 bg-white/5 rounded-xl">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/10">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-relaxed">
                © 2026 SKUYY.GG ENGINE <br/> 
                <span className="text-[#7C3AED]">ariwirayuda24 REDIRECT HUB</span>
             </p>
          </div>
        </div>

        {/* RIGHT SIDE: AUTH ENGINE */}
        <div className="p-10 md:p-16 flex flex-col justify-center bg-white relative">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-left">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
                    {isLogin ? 'GATE: LOGIN' : 'NODE: REGISTER'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3 italic">Authorized Access Only</p>
                </div>

                {isLogin && (
                  <div className="mb-8">
                    <div className="border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] active:translate-y-1 active:shadow-none transition-all">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" width="100%" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center my-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-4 border-slate-50"></div></div>
                      <span className="relative bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Manual Node</span>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                        <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-4 border-slate-50 p-5 pl-14 rounded-2xl font-black focus:bg-white focus:border-slate-950 outline-none transition-all text-sm italic" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                        <input type="text" placeholder="WA (0812...)" required className="w-full bg-slate-50 border-4 border-slate-50 p-5 pl-14 rounded-2xl font-black focus:bg-white focus:border-slate-950 outline-none transition-all text-sm italic" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                      </div>
                    </div>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border-4 border-slate-50 p-5 pl-14 rounded-2xl font-black focus:bg-white focus:border-slate-950 outline-none transition-all text-sm italic" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#7C3AED]" size={18}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-4 border-slate-50 p-5 pl-14 rounded-2xl font-black focus:bg-white focus:border-slate-950 outline-none transition-all text-sm italic" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-6 rounded-2xl font-black uppercase italic tracking-widest text-base shadow-[0_8px_0_0_#4c1d95] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 mt-6 border-4 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'VALIDATE SESSION' : 'ACTIVATE ACCOUNT'} <ChevronRight size={22} /></>}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-violet-600 transition-all text-center italic">
                  {isLogin ? "// Create New Creator Node" : "// Back to Login Portal"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8">
                <div className="w-20 h-20 bg-violet-50 text-[#7C3AED] rounded-3xl mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[8px_8px_0px_0px_#000] rotate-3">
                  <MessageSquare size={36} strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter">SULTAN VERIFY</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">
                    Kode dikirim ke WA lo & Email Sultan <br/> ariwirayuda24@gmail.com
                  </p>
                </div>
                
                <input 
                  type="text" maxLength="6" placeholder="••••••" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-[2rem] text-center text-6xl font-black tracking-[0.2em] outline-none focus:bg-white focus:shadow-inner transition-all placeholder:text-slate-100"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />

                <div className="space-y-4">
                  <button 
                    onClick={handleVerify2FALogin} disabled={loading}
                    className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase italic shadow-[0_8px_0_0_#475569] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 border-2 border-white/10"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE ACCESS'}
                  </button>
                  <div className="flex flex-col gap-4 pt-4">
                    <button onClick={() => triggerSendOTP(tempUserId)} className="text-[10px] font-black uppercase text-[#7C3AED] hover:underline tracking-[0.2em] italic">Resend Security Code</button>
                    <button onClick={() => {setShow2FA(false); setOtp('');}} className="text-[10px] font-black uppercase text-slate-300 hover:text-red-500 tracking-[0.2em] italic">Abort Login</button>
                  </div>
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