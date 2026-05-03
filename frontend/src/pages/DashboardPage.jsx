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

  // --- 1. SYNC DATA CORE ---
  const fetchData = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser?.id) throw new Error("Session Expired");

      const res = await api.get(`/user/dashboard-sync?userId=${savedUser.id}`);
      
      if (res.data && res.data.user) {
        const userData = res.data.user;
        setUser(userData);
        setBalance(userData.total_saldo || 0);
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

  // --- 2. LOGIKA 2FA WHATSAPP ---
  const handleGenerateWA = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/setup-2fa', { userId: user.id });
      if (res.data.success) {
        setOtpSent(true);
        skuyAlert.fire({ 
          title: 'OTP TERKIRIM 📱', 
          text: 'Protokol enkripsi dikirim ke WhatsApp lo, Ri. Cek sekarang!', 
          icon: 'info' 
        });
      }
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal kirim WA. Pastikan server Railway aktif!', 'error');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!otp || otp.length < 6) return;
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: user.id, token: otp });
      if (res.data.success) {
        // ✅ STEP 1: Update State Lokal & LocalStorage secara instan
        const updatedUser = { ...user, is_two_fa_enabled: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setOtpSent(false); // Reset view input
        setOtp('');

        // ✅ STEP 2: Notifikasi Sukses
        skuyAlert.fire({ 
          title: 'SECURED! 🛡️', 
          text: 'Akun Sultan resmi terproteksi. Login berikutnya wajib pakai WA!', 
          icon: 'success' 
        }).then(() => {
            // Optional: Reload hanya jika perlu sinkronisasi ulang tema/role berat
            window.location.reload(); 
        });
      }
    } catch (err) {
      skuyAlert.fire({ title: 'FAILED', text: 'Kode verifikasi salah atau kadaluwarsa!', icon: 'error' });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    const confirm = await skuyAlert.fire({
        title: 'NONAKTIFKAN?',
        text: 'Akun lo bakal jadi rentan kalo protokol keamanan dicabut, Ri!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'IYA, COPOT AJA',
        cancelButtonText: 'BATAL'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post('/auth/disable-2fa', { userId: user.id });
      if (res.data.success) {
        const updatedUser = { ...user, is_two_fa_enabled: false };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        skuyAlert.fire('STATUS: OPEN', 'Protokol keamanan dicabut.', 'info').then(() => {
          window.location.reload();
        });
      }
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal mematikan protokol keamanan.', 'error');
    }
  };

  if (isInitialLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black italic uppercase tracking-tighter text-slate-900">Synchronizing Sultan Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans text-left">
      {/* Sidebar otomatis baca status user.is_two_fa_enabled dari state */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} navigate={navigate} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Skuy Cloud Hub</h1>
            <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${user?.is_two_fa_enabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                   Status: <span className={user?.is_two_fa_enabled ? 'text-emerald-500' : 'text-amber-500'}>
                        {user?.is_two_fa_enabled ? 'Double Encrypted' : 'Standard Protection'}
                   </span>
                </p>
            </div>
          </div>
        </header>

        {/* --- DYNAMIC VIEW --- */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        </div>
      </main>
    </div>
  )
}
export default DashboardPage;