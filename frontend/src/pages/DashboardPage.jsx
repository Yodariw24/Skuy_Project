import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios' 
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
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
  const [qrCodeData, setQrCodeData] = useState('') 
  const [otp, setOtp] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)
  const [bankData, setBankData] = useState({ bank_name: 'Belum Diatur', account_number: '-', account_name: '-' })
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      // ✅ Ambil data user dari localStorage dulu buat dapetin ID
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (!savedUser?.id) throw new Error("ID Hilang");

      // ✅ Manggil endpoint yang sudah kita perbaiki di userRoutes.js
      const res = await api.get(`/user/dashboard-sync?userId=${savedUser.id}`);
      
      if (res.data && res.data.user) {
        // ✅ SINKRONISASI: Pakai res.data.user (bukan .profile) sesuai backend
        const userData = res.data.user;
        setUser(userData);
        setBalance(userData.total_saldo || 0);
        
        // Simpan ulang ke localStorage biar data 'role' terupdate
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log("✅ Sync Success! Role:", userData.role);
      }
    } catch (err) {
      console.error("❌ Sync Error:", err.message);
      // Fallback Data biar nggak white screen
      const fallback = JSON.parse(localStorage.getItem('user')) || { id: '1', username: 'guest', role: 'member' };
      setUser(fallback);
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

  // --- LOGIKA 2FA ---
  const handleGenerateQR = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/2fa/generate');
      if (res.data.qrCode) {
        setQrCodeData(res.data.qrCode);
        skuyAlert.fire({ title: 'QR SIAP', text: 'Scan pakai Google Authenticator!', icon: 'info' });
      }
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal generate security protocol', 'error');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/2fa/verify', { token: otp, userId: user.id });
      if (res.data.success) {
        setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
        skuyAlert.fire({ title: 'SUCCESS', text: '2FA Aktif di Railway Cloud!', icon: 'success' });
        setQrCodeData(''); setOtp('');
      }
    } catch (err) {
      skuyAlert.fire({ title: 'FAILED', text: 'OTP salah atau expired!', icon: 'error' });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await api.post('/auth/2fa/disable');
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire('OFF', 'Keamanan dimatikan.', 'info');
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
        <header className="mb-8 flex justify-between items-center text-left border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Skuy Cloud Hub</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
              Status: <span className="text-emerald-500">Connected to Railway DB</span>
            </p>
          </div>
        </header>

        {activeMenu === 'wallet' && <EarningsView user={user} balance={balance} bankData={bankData} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        
        {activeMenu === 'security' && (
          <SecurityView 
            key={user.is_two_fa_enabled ? 'secured' : 'unsecured'} 
            user={user} 
            qrCode={qrCodeData} 
            onGenerateQR={handleGenerateQR} 
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