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
  
  // ✅ FIX: Inisialisasi state field manual biar gak tabrakan
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    full_name: '', 
    username: '' 
  });
  
  const navigate = useNavigate();

  // ✅ AUTO-SUBMIT OTP: Kalo udah 6 digit langsung verifikasi, gak pake nunggu diklik
  useEffect(() => {
    if (otp.length === 6 && tempUserId) {
      handleVerify2FALogin();
    }
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
        skuyAlert("SECURITY", "Protokol WA-OTP Aktif! Cek HP lo, Ri.", "info");
      } else if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal koneksi Google Cloud.", "error");
    } finally { setLoading(false); }
  };

  // --- 2. VERIFIKASI 2FA WA ---
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
        skuyAlert("SUCCESS", "Akses Sultan Diterima!", "success");
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", "OTP salah atau expired. Coba lagi!", "error");
      setOtp('');
    } finally { setLoading(false); }
  };

  // --- 3. LOGIN / REGISTER MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // ✅ FIX: Pake field 'email' yang bener sesuai state
        const res = await api.post('/auth/login', { 
          email: formData.email, 
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
        const res = await api.post('/auth/register', formData);
        if (res.data.success) {
          setIsLogin(true);
          skuyAlert("JOINED", "Akun aktif! Silakan login, Ri.", "success");
        }
      }
    } catch (err) {
      skuyAlert("ERROR", err.response?.data?.message || "Server Error", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] flex items-center justify-center p-6 font-sans relative overflow-hidden text-left">
      <div className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-white rounded-[2.5rem] border-[3px] border-slate-950 shadow-[24px_24px_0px_0px_rgba(15,15,15,1)] z-10 overflow-hidden">
        
        {/* LEFT SIDE (Statik) */}
        <div className="bg-slate-950 p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="relative z-10">
            <h2 className="text-5xl font-black italic uppercase leading-[1.1] tracking-tighter mb-6">
              Digital <br /> <span className="text-violet-500">Shield</span> Activated
            </h2>
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-slate-400 font-bold italic text-sm">
                 <ShieldCheck size={18} className="text-violet-500" /> WhatsApp 2FA Ready
               </div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">© 2026 Skuy.GG • Karawang Pride</p>
        </div>

        {/* RIGHT SIDE (Form & OTP) */}
        <div className="p-10 md:p-14 flex flex-col justify-center bg-white min-h-[550px]">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                   <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-950 mb-2">
                     {isLogin ? 'Access Portal' : 'Create Squad'}
                   </h3>
                </div>

                {isLogin && (
                  <div className="mb-6">
                    <div className="border-[3px] border-slate-950 rounded-2xl overflow-hidden shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px] transition-all">
                      <GoogleLogin onSuccess={handleGoogleSuccess} width="100%" />
                    </div>
                    <div className="text-center my-6 font-black text-[10px] text-slate-300 tracking-[0.3em] uppercase italic">Or Manual Login</div>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <input 
                      type="text" placeholder="Username" required 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none focus:border-violet-600 transition-all" 
                      value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    />
                  )}
                  <input 
                    type="email" placeholder="Email Address" required 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none focus:border-violet-600 transition-all" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                  <input 
                    type="password" placeholder="Password" required 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-xl font-bold outline-none focus:border-violet-600 transition-all" 
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  />

                  <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Enter Portal' : 'Join Squad')}
                  </button>
                </form>

                <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-[11px] font-black text-slate-400 uppercase hover:text-violet-600 transition-all">
                  {isLogin ? "Need an account? Register" : "Have an account? Login"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="2fa" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-4 border-emerald-200 shadow-[6px_6px_0_0_#10b981]">
                  <MessageSquare size={40} />
                </div>
                <h4 className="text-2xl font-black italic uppercase tracking-tighter">Cek WA Lo, Ri!</h4>
                <input 
                  type="text" maxLength="6" placeholder="••••••" autoFocus
                  className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-3xl text-center text-5xl font-black tracking-[0.4em] outline-none"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  onClick={handleVerify2FALogin} disabled={loading}
                  className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-black uppercase shadow-[0_8px_0_0_#065f46] active:translate-y-1 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'Authorize Identity'}
                </button>
                <button onClick={() => setShow2FA(false)} className="text-[10px] font-black uppercase text-slate-300">Batal Verifikasi</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;