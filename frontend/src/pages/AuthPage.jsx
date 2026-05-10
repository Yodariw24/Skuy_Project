import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { 
  Loader2, ShieldCheck, Mail, Lock, User, 
  ArrowLeft, ChevronRight, MessageSquare, Zap, 
  Phone, Sparkles, Rocket 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

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

  const triggerSendOTP = async (userId) => {
    try {
      await api.post('/auth/send-otp', { userId });
      showSultanToast('<b>SECURITY SENT</b> <span>Cek WA & Email!</span>', 'info');
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
            text: "Berhasil daftar! Login sekarang, Ri.",
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
        navigate('/dashboard');
      }
    } catch (err) {
      showSultanToast('<b>INVALID CODE</b> <span>OTP Salah!</span>', 'error');
      setOtp('');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFF] flex overflow-hidden font-sans">
      
      {/* --- LEFT SIDEBAR: FIXED & PROPORSIONAL --- */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-[450px] bg-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r-8 border-slate-950"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><Zap size={400} fill="white" /></div>
        
        {/* Top: Back Home Button */}
        <div className="relative z-10">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white/5 text-white px-5 py-2.5 rounded-2xl border-2 border-white/10 hover:bg-violet-600 transition-all group mb-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Markas</span>
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-[#7C3AED] rounded-2xl flex items-center justify-center font-black text-2xl italic border-2 border-white/20 rotate-3 shadow-xl">S</div>
            <span className="font-black italic text-2xl tracking-tighter uppercase text-white">SKUY<span className="text-[#7C3AED]">.GG</span></span>
          </div>
          
          <h2 className="text-6xl font-black italic uppercase leading-[0.85] tracking-tighter mb-8 text-white">
            JOIN THE <br /> <span className="text-[#7C3AED]">ELITE</span> <br /> SQUAD
          </h2>
          
          <div className="space-y-4">
            {[
              { icon: <MessageSquare size={18}/>, text: 'Dual-Channel Authentication' },
              { icon: <ShieldCheck size={18}/>, text: 'Railway Cloud Sync Node' },
              { icon: <Sparkles size={18}/>, text: 'Neo-Brutalism Interface' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-400 font-black italic text-[10px] uppercase tracking-widest">
                <span className="text-[#7C3AED] p-2 bg-white/5 rounded-xl border border-white/5">{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="relative z-10 pt-10 border-t border-white/10">
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic leading-relaxed">
             © 2026 SKUYY.GG ENGINE • CRAFTED IN KARAWANG
           </p>
        </div>
      </motion.div>

      {/* --- RIGHT SIDE: AUTH FORM (SCROLLABLE) --- */}
      <div className="flex-1 h-screen overflow-y-auto bg-white flex flex-col relative">
        
        {/* Mobile Nav Only */}
        <div className="lg:hidden p-6 flex justify-between items-center border-b-4 border-slate-50">
           <div className="flex items-center gap-2">
              <Zap className="text-violet-600" size={24} />
              <span className="font-black italic uppercase text-xl">SKUY.GG</span>
           </div>
           <Link to="/" className="p-3 bg-slate-100 rounded-xl"><ArrowLeft size={20}/></Link>
        </div>

        <div className="max-w-md w-full mx-auto px-8 py-20 my-auto">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="mb-10 text-left">
                  <h3 className="text-5xl font-black italic uppercase tracking-tighter text-slate-950 leading-none">
                    {isLogin ? 'GATE: LOGIN' : 'NODE: REGISTER'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 italic">Protocol Authorization Required</p>
                </div>

                {isLogin && (
                  <div className="mb-8">
                    <div className="border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#000] active:translate-y-1 transition-all">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" width="100%" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center my-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-4 border-slate-50"></div></div>
                      <span className="relative bg-white px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Manual Access</span>
                    </div>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="grid grid-cols-1 gap-5">
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

                  <button type="submit" disabled={loading} className="w-full bg-[#7C3AED] text-white py-6 rounded-2xl font-black uppercase italic tracking-widest text-base shadow-[0_8px_0_0_#4c1d95] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 mt-4 border-4 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'IGNITION START' : 'DEPLOY NODE'} <Rocket size={22} /></>}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-violet-600 transition-all text-center italic">
                  {isLogin ? "// Create New Sultan Account" : "// Back to Login Portal"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-10">
                <div className="w-20 h-20 bg-violet-50 text-[#7C3AED] rounded-3xl mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[8px_8px_0px_0px_#000] rotate-3">
                  <MessageSquare size={36} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h4 className="text-4xl font-black italic uppercase tracking-tighter">SULTAN VERIFY</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">
                    Security Code sent to your WhatsApp & Email.
                  </p>
                </div>
                
                <input 
                  type="text" maxLength="6" placeholder="000000" autoFocus
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
                  <button onClick={() => triggerSendOTP(tempUserId)} className="text-[10px] font-black uppercase text-[#7C3AED] hover:underline tracking-[0.2em] italic block mx-auto">Resend Security Code</button>
                  <button onClick={() => {setShow2FA(false); setOtp('');}} className="text-[10px] font-black uppercase text-slate-300 hover:text-red-500 tracking-[0.2em] italic block mx-auto">Abort Login</button>
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