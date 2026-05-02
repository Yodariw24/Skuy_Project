import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios' 
import { Loader2, ShieldCheck, Mail, Lock, User, Sparkles } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'; // ✅ Import Google Login
import { jwtDecode } from 'jwt-decode'; // ✅ Import Decoder
import Swal from 'sweetalert2'

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

  const [formData, setFormData] = useState({
    identifier: '', 
    password: '', 
    email: '', 
    full_name: '',
    username: ''
  });

  const navigate = useNavigate();

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

      if (res.data.success) {
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        skuyAlert("GOOGLE CONNECTED", "Login Sultan berhasil via Google!", "success");
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("GOOGLE ERROR", "Gagal sinkron akun Google, Ri!", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFIKASI OTP ---
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
      skuyAlert("KODE SALAH", "OTP tidak valid atau expired.", "error");
    } finally { setLoading(false); }
  };

  // --- 3. LOGIN / REGISTER MANUAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { email: formData.identifier, password: formData.password });
        if (res.data.requiresTwoFA) {
          setTempUserId(res.data.userId);
          setShow2FA(true);
          await api.post('/auth/setup-2fa', { userId: res.data.userId });
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
          skuyAlert("JOINED SQUAD", "Akun aktif! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("SYSTEM ERROR", err.response?.data?.message || "Error Server Railway!", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F9] flex items-center justify-center p-6 font-sans">
      {/* Efek Background Dekoratif */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-200 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-[3.5rem] border-4 border-slate-950 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-violet-600 p-12 text-white border-b-4 border-slate-950 relative">
          <motion.div 
            animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-6 right-8 opacity-20"
          >
            <Sparkles size={80} />
          </motion.div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            {show2FA ? 'Security' : (isLogin ? 'Welcome Back' : 'Get Started')}
          </h2>
          <p className="text-violet-200 text-xs font-bold uppercase tracking-widest italic">
            {show2FA ? 'Verifikasi Identitas Sultan' : (isLogin ? 'Masuk ke Skuy Cloud Hub' : 'Gabung Squad Kreator Gacor')}
          </p>
        </div>

        <div className="p-10 space-y-8">
          <AnimatePresence mode="wait">
            {show2FA ? (
              <motion.form key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerify2FALogin} className="space-y-6">
                <div className="text-center">
                  <input 
                    type="text" maxLength="6" placeholder="000000" required autoFocus
                    className="w-full bg-slate-50 border-4 border-slate-950 p-6 rounded-3xl text-center text-5xl font-black tracking-[0.5em] outline-none focus:bg-white transition-all shadow-inner"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Otorisasi Akses</>}
                </button>
              </motion.form>
            ) : (
              <motion.div key="auth-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* TOMBOL GOOGLE LOGIN (UX Mantap) */}
                {isLogin && (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-center w-full border-4 border-slate-950 rounded-3xl overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                      <GoogleLogin 
                        onSuccess={handleGoogleSuccess} 
                        onError={() => skuyAlert("FAILED", "Google Auth Gagal", "error")}
                        width="100%"
                        theme="filled_black"
                        shape="square"
                        text="continue_with"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-[2px] flex-1 bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atau Pakai Email</span>
                      <div className="h-[2px] flex-1 bg-slate-200" />
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-3 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20}/>
                    <input type="email" placeholder="Email Sultan" required className="w-full bg-slate-50 border-3 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20}/>
                    <input type="password" placeholder="Password Rahasia" required className="w-full bg-slate-50 border-3 border-slate-100 p-5 pl-14 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  
                  <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-6 rounded-3xl font-black uppercase italic tracking-widest shadow-[0_10px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 mt-4 hover:bg-violet-500">
                    {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk Sekarang' : 'Daftar Squad')}
                  </button>
                </form>

                <p className="text-center">
                  <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-black text-slate-400 uppercase tracking-tighter hover:text-violet-600 transition-colors">
                    {isLogin ? "Belum punya akun? Join Squad di sini" : "Udah punya akun? Balik ke Login"}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthPage;