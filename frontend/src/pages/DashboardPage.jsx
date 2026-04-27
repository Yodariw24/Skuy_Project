import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
import EditBankModal from '../components/dashboard/EditBankModal'
import Swal from 'sweetalert2'

// --- ENGINE KEAMANAN PROFESIONAL ---
import { Buffer } from 'buffer'
import { authenticator } from 'otplib'

if (typeof window !== 'undefined') { window.Buffer = Buffer; }

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

  // --- AMBIL DATA FULL SUPABASE (TIDAK ADA LOCALHOST) ---
  const fetchData = async (userId) => {
    try {
      const [resProfile, resBal, resBank] = await Promise.all([
        supabase.from('streamers').select('*').eq('id', userId).single(),
        supabase.from('balance').select('total_saldo').eq('streamer_id', userId).single(),
        supabase.from('payment_methods').select('*').eq('streamer_id', userId).single()
      ]);
      
      if (resProfile.data) setUser(resProfile.data);
      if (resBal.data) setBalance(resBal.data.total_saldo || 0);
      if (resBank.data) setBankData(resBank.data);
    } catch (err) {
      console.error("Sync Error:", err);
    }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/auth');
      fetchData(session.user.id);
    };
    init();
  }, [navigate]);

  const handleGenerateQR = async () => {
    setLoading2FA(true);
    try {
      let secret = user.two_fa_secret;
      
      if (!secret) {
        secret = authenticator.generateSecret();
        // Simpan ke Supabase Cloud
        await supabase.from('streamers').update({ two_fa_secret: secret }).eq('id', user.id);
        setUser(prev => ({ ...prev, two_fa_secret: secret }));
      }

      const issuer = "SkuyGG";
      const account = user.username.replace(/\s/g, "");
      const otpAuthUrl = authenticator.keyuri(account, issuer, secret);
      
      setQrCodeData(otpAuthUrl);
      skuyAlert.fire({ title: 'QR SIAP', text: 'Scan pakai Google Authenticator!', icon: 'info' });
    } catch (err) {
      skuyAlert.fire('ERROR', 'Gagal update database', 'error');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!user.two_fa_secret) return;

    authenticator.options = { window: 1 };
    const isValid = authenticator.check(otp, user.two_fa_secret);

    if (isValid) {
      setLoading2FA(true);
      const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: true }).eq('id', user.id);
      if (!error) {
        setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
        skuyAlert.fire({ title: 'SUCCESS', text: '2FA Aktif di Cloud!', icon: 'success' });
        setQrCodeData(''); setOtp('');
      }
      setLoading2FA(false);
    } else {
      skuyAlert.fire({ title: 'FAILED', text: 'OTP salah atau sudah expired!', icon: 'error' });
    }
  };

  const handleDisable2FA = async () => {
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: false }).eq('id', user.id);
    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire('OFF', 'Keamanan dimatikan.', 'info');
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
              Status: <span className="text-emerald-500">Connected to Supabase</span>
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