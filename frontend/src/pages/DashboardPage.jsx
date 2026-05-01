import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios' // GANTI: Pakai axios buat koneksi ke Railway
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

  const navigate = useNavigate()

  // --- AMBIL DATA VIA BACKEND RAILWAY ---
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      // GANTI: URL ini nanti sesuai domain backend Railway lo
      const res = await axios.get('https://backend-lo.railway.app/api/user/dashboard-sync', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data) {
        setUser(res.data.profile);
        setBalance(res.data.balance || 0);
        setBankData(res.data.bank || { bank_name: 'Belum Diatur', account_number: '-', account_name: '-' });
      }
    } catch (err) {
      console.warn("Backend belum siap, pake data dummy dulu Ri.");
      // DATA DUMMY BIAR VERCEL GAK KOSONG PAS BUILD
      setUser({ id: '1', username: 'ariwirayuda', full_name: 'Ari Wirayuda', is_two_fa_enabled: false });
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/auth');
    fetchData();
  }, [navigate]);

  // --- LOGIKA 2FA SEKARANG KIRIM KE BACKEND ---
  const handleGenerateQR = async () => {
    setLoading2FA(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://backend-lo.railway.app/api/auth/2fa/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
      const token = localStorage.getItem('token');
      const res = await axios.post('https://backend-lo.railway.app/api/auth/2fa/verify', { token: otp }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      const token = localStorage.getItem('token');
      await axios.post('https://backend-lo.railway.app/api/auth/2fa/disable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire('OFF', 'Keamanan dimatikan.', 'info');
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal mematikan protokol', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans">
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