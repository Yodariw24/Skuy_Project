import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
// ✅ Pastikan path import ini benar mengarah ke file axios.js lo
import api from '../api/axios' 
import { Loader2, ShieldCheck, Mail, Lock, User } from 'lucide-react'
import Swal from 'sweetalert2'

// Config SweetAlert biar estetikanya nyambung sama desain TipFlow
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

  // --- 1. VERIFIKASI OTP (FINAL GATEWAY) ---
  const handleVerify2FALogin = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) return;
    setLoading(true);

    try {
      // ✅ Menggunakan endpoint /auth/... karena baseURL di axios.js sudah ada /api
      const res = await api.post('/auth/verify-2fa', {
        userId: tempUserId,
        token: otp
      });

      if (res.data.success) {
        // ✅ Simpan token dengan key 'user_token' agar dibaca oleh interceptor
        localStorage.setItem('user_token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        skuyAlert("AKSES DIBERIKAN", "Selamat datang di Cloud System, Sultan!", 'success');
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("KODE SALAH", err.response?.data?.message || "OTP tidak valid.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE LOGIN / REGISTER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login request
        const res = await api.post('/auth/login', {
          email: formData.identifier,
          password: formData.password
        });

        if (res.data.requiresTwoFA) {
          setTempUserId(res.data.userId);
          setShow2FA(true);
          
          // Trigger pengiriman email OTP dari backend
          await api.post('/auth/setup-2fa', { userId: res.data.userId });
          skuyAlert("SECURITY CHECK", "Cek inbox/spam email lo buat ambil kode!", "info");
        } else {
          // Login sukses tanpa 2FA
          localStorage.setItem('user_token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          skuyAlert("BERHASIL", "Sistem Sinkron. Membuka Dashboard...", "success");
          navigate('/dashboard/wallet');
        }
      } else {
        // Register request
        const res = await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || formData.username
        });
        
        if (res.data.success) {
          setIsLogin(true);
          skuyAlert("JOINED SQUAD", "Akun aktif! Silakan login sekarang.", "success");
        }
      }
    } catch (err) {
      skuyAlert("SYSTEM ERROR", err.response?.data?.message || "Gagal menghubungi server Railway, Ri!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4 font-sans text-slate-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] bg-white rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        <div className="bg-violet-600 p-10 text-white text-center border-b-4 border-slate-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-2 left-2 rotate-12"><ShieldCheck size={100}/></div>
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter relative z-10">
            {show2FA ? 'Security' : (isLogin ? 'Login Hub' : 'Join Squad')}
          </h2>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {show2FA ? (
              <motion.form key="2fa" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} onSubmit={handleVerify2FALogin} className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Masukkan 6 Digit Kode OTP</p>
                  <input 
                    type="text" maxLength="6" placeholder="000000" required autoFocus
                    className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.75rem] outline-none focus:bg-white transition-all"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-800 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'OTORISASI AKSES'}
                </button>
                <button type="button" onClick={() => setShow2FA(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-violet-600 transition-colors">
                  Kembali ke Login
                </button>
              </motion.form>
            ) : (
              <motion.form key="auth" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} onSubmit={handleSubmit} className="space-y-5">
                {isLogin ? (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="email" placeholder="Email Address" required 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all"
                      value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    />
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                      <input type="text" placeholder="Username" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-violet-600 outline-none" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                      <input type="email" placeholder="Email" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-violet-600 outline-none" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </>
                )}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                  <input type="password" placeholder="Password" required className="w-full bg-slate-50 border-2 border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'MASUK SISTEM' : 'DAFTAR SEKARANG')}
                </button>

                <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs font-black text-slate-400 uppercase tracking-tighter hover:text-violet-600 transition-colors">
                  {isLogin ? "Belum punya akun? Buka di sini" : "Sudah punya akun? Balik ke Login"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage;