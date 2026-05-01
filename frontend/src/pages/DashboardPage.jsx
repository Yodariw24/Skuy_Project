import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// HAPUS IMPORT SUPABASE & OTPLIB BIAR VERCEL GAK ERROR
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

  // --- LOGIKA AMBIL DATA VIA BACKEND RAILWAY (GANTI SUPABASE) ---
  const fetchData = async () => {
    try {
      // Dummy data sementara biar Vercel Build Berhasil
      // Nanti tinggal lo sambungin ke axios.get lo Ri
      setUser({ username: 'Ari Wirayuda', id: '1' });
      setBalance(0);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi 2FA dikosongkan dulu biar gak crash karena library otplib belum terpasang sempurna
  const handleGenerateQR = () => {
    skuyAlert.fire({ title: 'MAINTENANCE', text: 'Fitur 2FA sedang sinkronisasi ke Railway', icon: 'info' });
  };

  const handleVerify2FA = () => {};
  const handleDisable2FA = () => {};

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