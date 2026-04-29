import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { skuyAlert } from '../utils/alerts'
import { Loader2, ShieldCheck } from 'lucide-react'

// Konfigurasi API URL (Otomatis deteksi Railway atau Localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  // --- 1. VERIFIKASI 2FA LEWAT BACKEND ---
  const handleVerify2FALogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-2fa`, {
        userId: tempUserId,
        token: otp
      });

      if (res.data.success) {
        // Simpan data login ke storage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        
        skuyAlert("AKSES DIBERIKAN", "Selamat datang kembali di SkuyGG!", 'success');
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
        // Login Step 1
        const res = await axios.post(`${API_URL}/api/auth/login`, {
          identifier: formData.identifier,
          password: formData.password
        });

        if (res.data.requires2FA) {
          setTempUserId(res.data.userId);
          setShow2FA(true);
          skuyAlert("SECURITY CHECK", "Masukkan kode OTP kamu", "info");
        } else {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.data));
          skuyAlert("BERHASIL", "Membuka Dashboard...", "success");
          navigate('/dashboard/wallet');
        }
      } else {
        // Register (Diseragamkan ke Backend Railway)
        const res = await axios.post(`${API_URL}/api/auth/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        if (res.data.success) {
          setIsLogin(true);
          skuyAlert("SUKSES", "Akun dibuat! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("GAGAL", err.response?.data?.message || "Cek kembali data kamu", "error");
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
            {show2FA ? 'Security' : (isLogin ? 'Login' : 'Join')}
          </h2>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {show2FA ? (
              <motion.form 
                key="2fa" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                onSubmit={handleVerify2FALogin} className="space-y-6"
              >
                <div className="text-center space-y-4">
                  <div className="bg-violet-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-violet-600 border-2 border-violet-200">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Input OTP</p>
                    <input 
                      type="text" maxLength="6" placeholder="000000" required autoFocus
                      className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-[0.75rem] outline-none focus:bg-white transition-all"
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest hover:bg-slate-800 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : 'UNSEAL ACCOUNT'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="auth" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                onSubmit={handleSubmit} className="space-y-5"
              >
                {isLogin ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account ID</label>
                    <input 
                      type="text" placeholder="Username or Email" required 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all"
                      value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    />
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" placeholder="Username" required 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all"
                      value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                      type="email" placeholder="Email" required 
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all"
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input 
                    type="password" placeholder="••••••••" required 
                    className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold focus:border-violet-600 outline-none transition-all"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-[0_8px_0_0_#4c1d95] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Enter System' : 'Create Account')}
                </button>

                <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs font-black text-slate-400 uppercase tracking-tighter hover:text-violet-600 transition-all">
                  {isLogin ? "Need a new identity? Sign Up" : "Already verified? Log In"}
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