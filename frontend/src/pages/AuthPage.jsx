import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
// --- PERBAIKAN: Gunakan supabase langsung, bukan api axios ---
import { supabase } from '../supabaseClient' 
import { skuyAlert } from '../utils/alerts'
import { 
  User, Mail, Lock, ArrowRight, 
  Sparkles, ShieldCheck, Eye, EyeOff, Zap 
} from 'lucide-react'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', full_name: ''
  });

  const navigate = useNavigate();

  // --- LOGIKA GOOGLE LOGIN (SUPABASE NATIVE) ---
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      });

      if (error) throw error;

      if (data.session) {
        localStorage.setItem('user_token', data.session.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        const name = data.user.user_metadata?.full_name?.split(' ')[0] || "User";
        await skuyAlert("AKSES AKTIF", `Selamat datang, ${name}!`, 'success');
        navigate('/dashboard/wallet');
      }
    } catch (err) {
      skuyAlert("GAGAL", "Autentikasi Google ditolak.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA REGISTER & LOGIN (SUPABASE NATIVE) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // --- PROSES LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.session) {
          localStorage.setItem('user_token', data.session.access_token);
          localStorage.setItem('user_data', JSON.stringify(data.user));
          
          const name = data.user.user_metadata?.full_name?.split(' ')[0] || "User";
          await skuyAlert("AKSES AKTIF", `Selamat datang, ${name}!`, 'success');
          navigate('/dashboard/wallet');
        }
      } else {
        // --- PROSES REGISTER ---
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            // Data ini penting agar SQL Trigger kita bisa ngisi tabel streamers otomatis
            data: { 
              username: formData.username, 
              full_name: formData.full_name 
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          setIsLogin(true);
          skuyAlert("BERHASIL", "Akun terdaftar. Silakan login.", "success");
        }
      }
    } catch (err) {
      skuyAlert("GAGAL", err.message || "Cek kembali data Anda.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ... (Sisa JSX di bawah tetap sama persis, saya hanya merapikan onClick dan onSubmit)
  return (
    <div className="min-h-screen bg-[#F8FAFF] text-slate-900 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-100/60 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-50/40 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_80px_-20px_rgba(109,40,217,0.15)] overflow-hidden"
      >
        <div className="bg-violet-600 p-10 text-white relative overflow-hidden text-center">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 border border-white/20 shadow-xl rotate-3">
              {show2FA ? <ShieldCheck className="text-white" size={26} /> : <Sparkles className="text-white" size={26} />}
            </div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {show2FA ? 'SECURITY' : (isLogin ? 'WELCOME' : 'JOIN US')}
            </h2>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <AnimatePresence mode="wait">
              <motion.form 
                key="auth-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onSubmit={handleSubmit} className="space-y-5"
              >
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        type="text" placeholder="Ari Wirayuda" required 
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold text-sm"
                        value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-600 font-black">@</span>
                    <input 
                      type="text" placeholder="username" required 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white p-4 pl-10 rounded-2xl outline-none font-bold text-sm"
                      value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" placeholder="example@mail.com" required 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold text-sm"
                      value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} placeholder="••••••••" required 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-violet-200 focus:bg-white p-4 pl-12 pr-12 rounded-2xl outline-none font-bold text-sm"
                      value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button 
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-violet-600 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-violet-200 active:scale-95 transition-all text-[11px] uppercase italic tracking-[0.2em] flex items-center justify-center gap-3"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={16} />
                </button>

                <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase mb-5 italic tracking-widest">Social Auth</p>
                  <div className="w-full flex justify-center scale-90">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => skuyAlert("GAGAL", "Google auth bermasalah.", "error")}
                      shape="pill" theme="filled_blue" width="300"
                    />
                  </div>
                </div>
              </motion.form>
          </AnimatePresence>
          
          <div className="mt-8 text-center">
            <button 
              type="button" onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-400 font-bold italic"
            >
              {isLogin ? "Need an account?" : "Already a member?"} 
              <span className="text-violet-600 font-black uppercase tracking-widest ml-2 border-b-2 border-violet-100 pb-0.5">
                {isLogin ? 'Register' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage;