import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios'; 
import { 
  Loader2, Mail, Lock, User, ArrowLeft, 
  ChevronRight, Zap, Phone, Rocket, Check, ShieldCheck, Sparkles
} from 'lucide-react';
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

  // ✅ SULTAN SLIM TOAST
  const showSultanToast = (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      customClass: { 
        popup: 'border-2 border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl rounded-2xl shadow-2xl', 
        title: 'font-sans font-bold text-white text-xs' 
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
      showSultanToast('SECURITY KODE TERKIRIM KE WA!', 'info');
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
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center font-sans overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-full h-full bg-[radial-gradient(circle_at_center,#1e1b4b_0%,transparent_50%)] opacity-40" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150" />
      </div>

      <div className="w-full max-w-[1000px] h-[600px] bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_-30px_rgba(124,58,237,0.4)] z-10 flex overflow-hidden">
        
        {/* --- LEFT SIDE: Visual Branding --- */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-violet-600 to-indigo-700 p-12 flex-col justify-between relative">
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
            </Link>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl">
                <Zap size={22} className="text-violet-600 fill-current" />
              </div>
              <span className="text-xl font-black italic tracking-tighter text-white uppercase">SKUY<span className="opacity-50">.GG</span></span>
            </div>
            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-[0.9] mb-8">
              Empowering <br /> Digital <span className="text-white/40">Sultans.</span>
            </h2>
            <div className="space-y-4">
              {['Dual-Channel OTP Security', 'Military-Grade Encryption', 'Sultan Dashboard v3.2'].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center border border-white/10"><Check size={12} strokeWidth={4} /></div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">© 2026 SKUYY.GG ENGINE</p>
        </div>

        {/* --- RIGHT SIDE: Form Node --- */}
        <main className="flex-1 p-12 flex flex-col justify-center bg-[#0c0c0c] relative">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-[340px] mx-auto w-full">
                <div className="mb-10">
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                    {isLogin ? 'IGNITION START' : 'DEPLOY NODE'}
                  </h3>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest italic">Authorization Required</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={16}/>
                        <input type="text" placeholder="USERNAME" required className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-white text-xs font-bold outline-none focus:border-violet-500/50 transition-all placeholder:text-white/10 italic" onChange={(e) => setFormData({...formData, username: e.target.value})} />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={16}/>
                        <input type="text" placeholder="WHATSAPP (08...)" required className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-white text-xs font-bold outline-none focus:border-violet-500/50 transition-all placeholder:text-white/10 italic" onChange={(e) => setFormData({...formData, phone_number: e.target.value})} />
                      </div>
                    </>
                  )}
                  
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={16}/>
                    <input type="email" placeholder="EMAIL NODE" required className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-white text-xs font-bold outline-none focus:border-violet-500/50 transition-all placeholder:text-white/10 italic" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-500 transition-colors" size={16}/>
                    <input type="password" placeholder="SECURE PASSWORD" required className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 rounded-xl text-white text-xs font-bold outline-none focus:border-violet-500/50 transition-all placeholder:text-white/10 italic" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase italic tracking-widest text-xs hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-white/5">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? 'VALIDATE SESSION' : 'ACTIVATE ENGINE')}
                    <Rocket size={16} />
                  </button>
                </form>

                {isLogin && (
                  <div className="mt-8 flex flex-col items-center">
                    <div className="relative w-full flex items-center justify-center mb-6">
                      <div className="w-full border-t border-white/5"></div>
                      <span className="absolute bg-[#0c0c0c] px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">Or Auth Protocol</span>
                    </div>
                    <div className="inline-block p-[1px] bg-gradient-to-r from-violet-500/50 to-fuchsia-500/50 rounded-xl overflow-hidden hover:scale-105 transition-transform">
                      <div className="bg-[#0c0c0c] rounded-[11px] px-1 py-1">
                        <GoogleLogin onSuccess={handleGoogleSuccess} theme="dark" shape="pill" width="260px" />
                      </div>
                    </div>
                  </div>
                )}

                <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-white/30 italic">
                  {isLogin ? "Access Denied?" : "Ready to launch?"}{" "}
                  <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:text-violet-400 transition-colors underline underline-offset-4 decoration-violet-500">
                    {isLogin ? 'Create Node' : 'Login Portal'}
                  </button>
                </p>
              </motion.div>
            ) : (
              /* --- 2FA STATE --- */
              <motion.div key="2fa" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-[340px] mx-auto w-full text-center space-y-10">
                <div className="w-20 h-20 bg-violet-600/20 text-violet-500 rounded-3xl mx-auto flex items-center justify-center border border-violet-500/30 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
                  <ShieldCheck size={40} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-3xl font-black italic uppercase text-white tracking-tighter">SULTAN VERIFY</h4>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] italic mt-2">Cek WhatsApp lo sekarang, Ri!</p>
                </div>
                
                <input 
                  type="text" maxLength="6" placeholder="000000" autoFocus
                  className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-2xl text-center text-5xl font-black tracking-[0.3em] text-white outline-none focus:border-violet-500/50 transition-all placeholder:text-white/5"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />

                <div className="space-y-4">
                  <button onClick={handleVerify2FALogin} disabled={loading} className="w-full bg-white text-black py-5 rounded-xl font-black uppercase italic tracking-widest text-xs hover:bg-violet-500 hover:text-white transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE ACCESS'}
                  </button>
                  <button onClick={() => triggerSendOTP(tempUserId)} className="text-[9px] font-black uppercase text-white/20 hover:text-white tracking-widest transition-colors italic">Resend Security Protocol</button>
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