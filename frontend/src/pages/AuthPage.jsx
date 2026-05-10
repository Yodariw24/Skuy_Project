import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { 
  Loader2, Mail, Lock, User, ArrowLeft, 
  ChevronRight, Zap, Phone, Rocket, Check, 
  ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State buat mata PW
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    username: '',
    phone_number: '' 
  });
  
  const navigate = useNavigate();

  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: { 
        popup: 'border-4 border-slate-950 bg-white rounded-2xl shadow-[6px_6px_0px_0px_#000]', 
        title: 'font-sans font-black uppercase text-slate-950 text-[10px] tracking-widest' 
      }
    });
    Toast.fire({ icon, title });
  };

  useEffect(() => {
    if (otp.length === 6) handleVerify2FALogin();
  }, [otp]);

  const triggerSendOTP = async (userId) => {
    try {
      await api.post('/auth/send-otp', { userId });
      showSultanToast('SECURITY KODE TERKIRIM!', 'info');
    } catch (err) {
      showSultanToast('GAGAL KIRIM OTP!', 'error');
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
      showSultanToast('GOOGLE AUTH FAILED!', 'error');
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
          showSultanToast('AKUN BERHASIL DIDEPLOY!', 'success');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Engine Error";
      showSultanToast(msg.toUpperCase(), 'error');
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
      showSultanToast('OTP SALAH!', 'error');
      setOtp('');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full bg-[#F4F7FF] flex items-center justify-center font-sans overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-[1050px] h-[640px] bg-white border-4 border-slate-950 rounded-[3rem] shadow-[20px_20px_0px_0px_#000] z-10 flex overflow-hidden mx-4">
        
        {/* --- LEFT SIDE: THE VIBE --- */}
        <div className="hidden lg:flex w-[45%] bg-violet-600 p-12 flex-col justify-between relative border-r-4 border-slate-950">
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-all mb-16 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Markas</span>
            </Link>
            <div className="flex items-center gap-3 mb-10 text-left">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000] border-2 border-slate-950 text-violet-600">
                <Zap size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-black italic tracking-tighter text-white uppercase">SKUY<span className="opacity-50">.GG</span></span>
            </div>
            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-10 text-left">
              The Next <br /> Level <br /> Engine.
            </h2>
            <div className="space-y-5 text-left">
              {['Dual-Channel OTP', 'End-to-End Encrypted', 'Sultan Dashboard v3.2'].map((feat, i) => (
                <div key={i} className="flex items-center gap-4 text-white text-[10px] font-black uppercase tracking-widest">
                  <div className="w-6 h-6 rounded-lg bg-slate-950 text-white flex items-center justify-center border-2 border-white/10 shadow-lg"><Check size={14} strokeWidth={4} /></div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] text-left">CRAFTED IN KARAWANG • 2026</p>
        </div>

        {/* --- RIGHT SIDE: THE FORM --- */}
        <main className="flex-1 p-12 flex flex-col justify-center bg-white relative overflow-y-auto">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="auth" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-[360px] mx-auto w-full">
                <div className="mb-8 text-left">
                  <h3 className="text-4xl font-black text-slate-950 italic uppercase tracking-tighter leading-none">
                    {isLogin ? 'IGNITION START' : 'DEPLOY NODE'}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic">
                    {isLogin ? 'Authorized Access Only' : 'Register New Creator Node'}
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors z-10" size={18}/>
                        <input type="text" placeholder="Username Sultan" required className="w-full bg-white border-4 border-slate-950 p-5 pl-12 rounded-2xl font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic" onChange={(e) => setFormData({...formData, username: e.target.value})} />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors z-10" size={18}/>
                        <input type="text" placeholder="WhatsApp (08...)" required className="w-full bg-white border-4 border-slate-950 p-5 pl-12 rounded-2xl font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic" onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                      </div>
                    </div>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors z-10" size={18}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-white border-4 border-slate-950 p-5 pl-12 rounded-2xl font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors z-10" size={18}/>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Secure Password" required 
                      className="w-full bg-white border-4 border-slate-950 p-5 pl-12 pr-14 rounded-2xl font-bold text-sm outline-none focus:shadow-[6px_6px_0px_0px_#7C3AED] transition-all placeholder:text-slate-300 italic" 
                      value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    {/* BUTTON MATA SULTAN */}
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 transition-colors z-20"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <button className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase italic tracking-widest text-base shadow-[0_8px_0_0_#4c1d95] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3 border-4 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'IGNITION START' : 'DEPLOY ENGINE')}
                    <Rocket size={18} />
                  </button>
                </form>

                {isLogin && (
                  <div className="mt-6 flex flex-col items-center">
                    <div className="relative w-full flex items-center justify-center mb-6">
                      <div className="w-full border-t-4 border-slate-100"></div>
                      <span className="absolute bg-white px-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic">Or Auth Protocol</span>
                    </div>
                    <div className="inline-block border-4 border-slate-950 rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#000] hover:scale-105 transition-transform active:translate-y-1">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="outline" shape="square" width="280px" />
                    </div>
                  </div>
                )}

                <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                  {isLogin ? "Access Denied?" : "Ready to launch?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-violet-600 underline underline-offset-8 decoration-4 hover:text-slate-950 transition-colors">
                    {isLogin ? 'Create Node' : 'Login Portal'}
                  </button>
                </p>
              </motion.div>
            ) : (
              /* --- 2FA STATE --- */
              <motion.div key="2fa" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-[340px] mx-auto w-full text-center space-y-10">
                <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-3xl mx-auto flex items-center justify-center border-4 border-slate-950 shadow-[8px_8px_0px_0px_#000] rotate-3">
                  <ShieldCheck size={40} strokeWidth={3} />
                </div>
                <div className="text-center">
                  <h4 className="text-3xl font-black italic uppercase text-slate-950 tracking-tighter">SULTAN VERIFY</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic mt-3">Input 6-digit OTP dari WhatsApp lo</p>
                </div>
                <input 
                  type="text" maxLength="6" placeholder="000000" autoFocus
                  className="w-full bg-white border-4 border-slate-950 p-6 rounded-[2rem] text-center text-6xl font-black tracking-[0.2em] text-slate-950 outline-none focus:shadow-[10px_10px_0px_0px_#7C3AED] transition-all"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <div className="space-y-4 text-center">
                  <button onClick={handleVerify2FALogin} disabled={loading} className="w-full bg-slate-950 text-white py-6 rounded-2xl font-black uppercase italic shadow-[6px_6px_0px_0px_#7C3AED] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 border-4 border-slate-950">
                    {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE ACCESS'}
                  </button>
                  <button onClick={() => triggerSendOTP(tempUserId)} className="text-[9px] font-black uppercase text-violet-600 hover:underline tracking-widest transition-colors italic mx-auto">Resend Security Protocol</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;