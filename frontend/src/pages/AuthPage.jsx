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

  // --- 1. HANDLE GOOGLE AUTH (SINKRON DENGAN 2FA) ---
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

      // ✅ FIX: Cek apakah Google Account ini butuh 2FA WA
      if (res.data.requiresTwoFA) {
        setTempUserId(res.data.userId);
        setShow2FA(true);
        skuyAlert("SECURITY", "Input kode yang mendarat di WA lo, Ri!", "info");
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal koneksi Google Cloud.", "error");
    } finally { setLoading(false); }
  };

  // --- 2. VERIFIKASI 2FA WA (LOGIN) ---
  const handleVerify2FALogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // ✅ FIX: Mengirim token yang dikirim via WhatsApp
      const res = await api.post('/auth/verify-2fa', { userId: tempUserId, token: otp });
      if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        skuyAlert("SUCCESS", "Akses Sultan Diterima! 🛡️", "success");
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "Kode WA OTP salah atau sudah expired.", "error");
    } finally { setLoading(false); }
  };

  // --- 3. LOGIN / REGISTER MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false); // Biarkan fungsi async yang handle
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: formData.identifier, password: formData.password });
        
        if (res.data.requiresTwoFA) {
          setTempUserId(res.data.userId);
          setShow2FA(true);
          skuyAlert("VERIFIKASI", "Cek WhatsApp lo buat kode 6 digit!", "info");
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
          skuyAlert("JOINED", "Akun aktif! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ERROR", err.response?.data?.message || "Server Error", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 font-sans relative overflow-hidden text-left">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-200/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border-[3px] border-slate-950 shadow-[24px_24px_0px_0px_rgba(15,15,15,1)] z-10 overflow-hidden">
        
        {/* LEFT SIDE */}
        <div className="bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[80px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg">S</div>
              <span className="font-black italic text-2xl tracking-tighter uppercase">SKUY<span className="text-violet-500">.GG</span></span>
            </div>
            <h2 className="text-5xl font-black italic uppercase leading-[1.1] tracking-tighter mb-6">
              Empowering <br /> <span className="text-violet-500">Digital</span> Creators
            </h2>
            <div className="space-y-4">
              {['Instant Payout via QRIS', 'Zero Hidden Fees', 'WhatsApp 2FA Security'].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                  <CheckCircle2 size={18} className="text-violet-500" /> {text}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">© 2026 Skuy.GG Studio • Karawang Pride</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-10 md:p-14 flex flex-col justify-center bg-white">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10 text-center md:text-left">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">
                    {isLogin ? 'Access Portal' : 'Create Squad'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Secure Authentication System</p>
                </div>

                {isLogin && (
                  <div className="mb-8">
                    <div className="border-[3px] border-slate-950 rounded-2xl overflow-hidden hover:shadow-[6px_6px_0_0_rgba(109,40,217,1)] transition-all">
                      <GoogleLogin onSuccess={handleGoogleSuccess} theme="filled_black" width="100%" shape="square" />
                    </div>
                    <div className="relative flex items-center justify-center mt-8">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
                      <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Or Manual Access</span>
                    </div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18}/>
                    <input type="email" placeholder="Email Address" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18}/>
                    <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-6">
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login Now' : 'Register')} <ChevronRight size={18} />
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-[11px] font-black text-slate-400 uppercase tracking-tighter hover:text-violet-600 transition-all">
                    {isLogin ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="2fa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleVerify2FALogin} className="space-y-8 py-4">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-4 border-emerald-200">
                    <MessageSquare size={40} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">WhatsApp OTP Verification</p>
                    <h4 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 mt-1">Cek WA Lo, Ri!</h4>
                  </div>
                  <input 
                    type="text" maxLength="6" placeholder="••••••" required autoFocus
                    className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-3xl text-center text-5xl font-black tracking-[0.4em] outline-none shadow-inner focus:bg-white transition-all"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Masukkan 6 digit kode dari sistem Skuy.GG</p>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest border-4 border-slate-950 shadow-[0_8px_0_0_#065f46] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <>Authorize Identity <Zap size={18}/></>}
                </button>
                <button type="button" onClick={() => setShow2FA(false)} className="w-full text-[10px] font-black uppercase text-slate-300 hover:text-slate-900 transition-all">Batal Verifikasi</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthPage;