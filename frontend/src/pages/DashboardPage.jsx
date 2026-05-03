import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios' 
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
import AppearanceView from '../components/dashboard/AppearanceView'
import Swal from 'sweetalert2'

const skuyAlert = Swal.mixin({
  customClass: {
    popup: 'skuy-popup rounded-[2rem] p-10 border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
    title: 'skuy-title text-3xl text-slate-950 font-black italic uppercase tracking-tighter',
    confirmButton: 'bg-violet-600 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-950',
  },
  buttonsStyling: false,
});

function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState('wallet')
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading2FA, setLoading2FA] = useState(false)
  const [bankData, setBankData] = useState({ bank_name: 'Belum Diatur', account_number: '-', account_name: '-' })
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser?.id) throw new Error("Session Expired");

      // ✅ Sync data Sultan dari tabel Users & Streamers sekaligus
      const res = await api.get(`/user/dashboard-sync?userId=${savedUser.id}`);
      
      if (res.data && res.data.user) {
        const userData = res.data.user;
        setUser(userData);
        setBalance(userData.total_saldo || 0);
        // Simpan versi terbaru ke localStorage agar sinkron dengan Sidebar/Navbar
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error("❌ Sync Error:", err.message);
      navigate('/auth');
    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      navigate('/auth');
    } else {
      fetchData();
    }
  }, [navigate]);

  // --- LOGIKA 2FA WHATSAPP (SINKRON DENGAN FONNTE) ---
  const handleGenerateWA = async () => {
    setLoading2FA(true);
    try {
      // ✅ Menembak setup-2fa yang sekarang menyimpan OTP ke tabel users
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      if (res.data.success) {
        setOtpSent(true);
        skuyAlert.fire({ 
          title: 'OTP MELUNCUR 📱', 
          text: 'Cek WhatsApp lo, Ri! Kode protokol sudah dikirim. 🚀', 
          icon: 'success' 
        });
      }
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal kirim WA. Cek WA_TOKEN Railway!', 'error');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otp) return;
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: user.id, token: otp });
      if (res.data.success) {
        // ✅ Update state lokal agar UI langsung berubah jadi "GACOR/SECURE"
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        skuyAlert.fire({ title: 'SUCCESS', text: 'Perisai WA Aktif! 🛡️', icon: 'success' })
          .then(() => {
            window.location.reload(); // Re-sync total
          });
      }
    } catch (err) {
      skuyAlert.fire({ title: 'FAILED', text: 'Kode salah atau expired!', icon: 'error' });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await api.post('/auth/disable-2fa', { userId: user.id });
      if (res.data.success) {
        const updatedUser = { ...user, is_two_fa_enabled: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        skuyAlert.fire('OFF', 'Protokol keamanan dimatikan.', 'info').then(() => {
          window.location.reload();
        });
      }
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal mematikan protokol', 'error');
    }
  };

  if (isInitialLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black italic uppercase tracking-tighter text-slate-900">Sinkronisasi Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans text-left">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} navigate={navigate} />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Skuy Cloud Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
              Node: <span className="text-emerald-500">Railway-DB-Cluster</span>
            </p>
          </div>
        </header>

        {/* --- DYNAMIC VIEW --- */}
        {activeMenu === 'wallet' && <EarningsView user={user} balance={balance} bankData={bankData} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        {activeMenu === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
        {activeMenu === 'security' && (
          <SecurityView 
            user={user} 
            otpSent={otpSent}
            onGenerateQR={handleGenerateWA} 
            onVerify={handleVerify2FA} 
            onDisable={handleDisable2FA} 
            otp={otp} 
            setOtp={setOtp} 
            loading={loading2FA} 
          />
        )}
      </main>
    </div>
  )
}
export default DashboardPage;