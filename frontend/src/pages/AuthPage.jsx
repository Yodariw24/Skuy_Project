import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { skuyAlert } from '../utils/alerts'
import { supabase } from '../supabaseClient' 
import { 
  User, Lock, ArrowRight, Sparkles, ShieldCheck, Fingerprint, Zap
} from 'lucide-react'

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let targetEmail = formData.identifier;

      // LOGIKA: JIKA INPUT ADALAH USERNAME (TIDAK ADA @), CARI EMAILNYA DI TABEL STREAMERS
      if (!formData.identifier.includes('@')) {
        const { data: streamer, error: dbError } = await supabase
          .from('streamers')
          .select('email')
          .eq('username', formData.identifier)
          .single();
        
        if (dbError || !streamer) throw new Error("ID System tidak ditemukan di pangkalan data.");
        targetEmail = streamer.email;
      }

      // PROSES OTENTIKASI KE SUPABASE AUTH
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: formData.password,
      });

      if (error) throw error;

      // Simulasi Protokol 2FA untuk Presentasi
      if (targetEmail.includes('admin') || formData.identifier === 'ari_wirayuda') {
        setShow2FA(true);
        await skuyAlert("SECURITY CHECK", "Otoritas tingkat tinggi terdeteksi. Enkripsi OTP diperlukan.", "info");
      } else {
        localStorage.setItem('user_token', data.session.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        await skuyAlert("ACCESS GRANTED", "Kredensial disetujui. Memasuki ekosistem Skuy.", "success");
        navigate('/dashboard');
      }
    } catch (err) {
      skuyAlert("ACCESS DENIED", err.message || "Kegagalan otentikasi sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-900/20 blur-[120px] rounded-full animate-pulse" />
      
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[420px] bg-[#121214] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="bg-violet-600 p-10 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <Fingerprint className="mx-auto mb-4 relative z-10" size={42} />
          <h2 className="text-3xl font-black italic tracking-tighter relative z-10">
            {show2FA ? 'SECURITY CORE' : (isLogin ? 'CORE LOGIN' : 'RECRUITMENT')}
          </h2>
        </div>

        <div className="p-10 space-y-6">
          <AnimatePresence mode="wait">
            {!show2FA ? (
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Identity Identifier</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input type="text" placeholder="Username / Email" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-violet-500/50 transition-all font-bold text-sm" value={formData.identifier} onChange={(e) => setFormData({...formData, identifier: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Access Cipher</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-violet-500/50 transition-all font-bold text-sm" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-violet-900/20">
                  {loading ? 'Verifying...' : 'Initialize Session'} <Zap size={16} />
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <ShieldCheck className="mx-auto text-violet-400" size={48} />
                <p className="text-xs text-slate-400 font-bold leading-relaxed">Sistem mendeteksi akses administratif. Masukkan 6-digit enkripsi OTP.</p>
                <input type="text" maxLength="6" placeholder="000000" className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center text-3xl font-black tracking-[0.5em] outline-none" />
                <button onClick={() => navigate('/dashboard')} className="w-full bg-white text-black font-black py-4 rounded-xl text-[11px] uppercase">Authorize Access</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default AuthPage;