import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { supabase } from '../supabaseClient' 
import { skuyAlert } from '../utils/alerts'
import { authenticator } from 'otplib' // Pastikan sudah npm install otplib
import { 
  User, Mail, Lock, ArrowRight, 
  Sparkles, ShieldCheck, Eye, EyeOff, Zap, Loader2 
} from 'lucide-react'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- STATE 2FA ---
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempUser, setTempUser] = useState(null);

  const [formData, setFormData] = useState({
    identifier: '', // Bisa Email atau Username
    email: '', 
    password: '', 
    full_name: '',
    username: ''
  });

  const navigate = useNavigate();

  // --- LOGIKA VERIFIKASI 2FA SAAT LOGIN ---
  const handleVerify2FALogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ambil secret dari tempUser yang kita simpan saat login step 1
      const secret = tempUser.two_fa_secret;
      authenticator.options = { window: 1 };
      const isValid = authenticator.check(otp, secret);

      if (isValid) {
        skuyAlert("AKSES DIBERIKAN", "Selamat datang kembali!", 'success');
        navigate('/dashboard/wallet');
      } else {
        skuyAlert("KODE SALAH", "OTP tidak valid atau kadaluarsa.", "error");
      }
    } catch (err) {
      skuyAlert("ERROR", "Gagal memverifikasi kode.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        let finalEmail = formData.identifier;

        // 1. CEK: Jika input bukan email, cari email berdasarkan username di DB
        if (!formData.identifier.includes('@')) {
          const { data: userData, error: userError } = await supabase
            .from('streamers')
            .select('email')
            .eq('username', formData.identifier)
            .single();

          if (userError || !userData) throw new Error('Username tidak ditemukan!');
          finalEmail = userData.email;
        }

        // 2. PROSES LOGIN AUTH
        const { data, error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // 3. CEK STATUS 2FA DI TABEL STREAMERS
          const { data: profile } = await supabase
            .from('streamers')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile?.is_two_fa_enabled) {
            setTempUser(profile);
            setShow2FA(true); // Tampilkan input OTP
          } else {
            skuyAlert("BERHASIL", "Membuka Dashboard...", "success");
            navigate('/dashboard/wallet');
          }
        }
      } else {
        // --- PROSES REGISTER ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { username: formData.username, full_name: formData.full_name }
          }
        });

        if (error) throw error;
        if (data.user) {
          setIsLogin(true);
          skuyAlert("SUKSES", "Akun dibuat! Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("GAGAL", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[450px] bg-white rounded-[3rem] border-4 border-slate-950 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        <div className="bg-violet-600 p-10 text-white text-center border-b-4 border-slate-950">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            {show2FA ? 'Security' : (isLogin ? 'Login' : 'Join')}
          </h2>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {show2FA ? (
              <motion.form key="2fa" onSubmit={handleVerify2FALogin} className="space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Input 6-Digit OTP</p>
                  <input 
                    type="text" maxLength="6" placeholder="000000" required
                    className="w-full bg-slate-50 border-4 border-slate-950 p-5 rounded-2xl text-center text-4xl font-black tracking-widest"
                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest">
                  {loading ? 'Checking...' : 'Unlock Account'}
                </button>
              </motion.form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {isLogin ? (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
                    <input 
                      type="text" placeholder="Ari atau ari@mail.com" required 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold"
                      value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                    />
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" placeholder="Username" required 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold"
                      value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                    />
                    <input 
                      type="email" placeholder="Email" required 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold"
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </>
                )}

                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} placeholder="Password" required 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold"
                    value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full bg-violet-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest shadow-xl shadow-violet-100">
                  {loading ? 'Processing...' : (isLogin ? 'Enter' : 'Register')}
                </button>

                <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-xs font-bold text-slate-400">
                  {isLogin ? "Bikin akun baru?" : "Sudah punya akun?"}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage;