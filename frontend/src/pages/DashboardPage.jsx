import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
import EditBankModal from '../components/dashboard/EditBankModal'
import Swal from 'sweetalert2'

// --- ENGINE VALIDASI & QR REAL ---
import { Buffer } from 'buffer'
import { authenticator } from 'otplib'

// Inisialisasi Buffer agar otplib lancar di browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const skuyAlert = Swal.mixin({
  customClass: {
    popup: 'skuy-popup rounded-[2rem] p-10 border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
    title: 'skuy-title text-3xl text-slate-950 font-black italic uppercase tracking-tighter',
    confirmButton: 'bg-violet-600 text-white px-10 py-4 rounded-xl font-black text-[11px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-950',
    cancelButton: 'bg-slate-100 text-slate-400 px-10 py-4 rounded-xl font-black text-[11px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-200'
  },
  buttonsStyling: false,
  background: '#ffffff',
});

function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState('wallet')
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [qrCodeData, setQrCodeData] = useState('') // Data mentah untuk QR
  const [otp, setOtp] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)
  const [bankData, setBankData] = useState({ bank_name: 'Belum Diatur', account_number: '-', account_name: '-' })
  const [formDataBank, setFormDataBank] = useState({ bank_name: '', account_number: '', account_name: '' })

  const navigate = useNavigate()
  
  // KUNCI RAHASIA TETAP (Base32)
  const SECRET_KEY = "KVKFKRCIK5GVURKB"; 

  const fetchData = async (userId) => {
    if (!userId) return;
    try {
      const [resProfile, resBal, resBank] = await Promise.all([
        supabase.from('streamers').select('*').eq('id', userId).single(),
        supabase.from('balance').select('total_saldo').eq('streamer_id', userId).single(),
        supabase.from('payment_methods').select('*').eq('streamer_id', userId).single()
      ]);
      if (resProfile.data) setUser(resProfile.data);
      if (resBal.data) setBalance(resBal.data.total_saldo || 0);
      if (resBank.data) { setBankData(resBank.data); setFormDataBank(resBank.data); }
    } catch (err) { console.error("Cloud Error:", err); }
  }

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/auth');
      fetchData(session.user.id);
    };
    init();
  }, [navigate]);

  // --- GENERATE DATA QR (PASTI BISA SCAN) ---
  const handleGenerateQR = () => {
    setLoading2FA(true);
    const issuer = "SkuyGG";
    const account = (user?.username || "Creator").replace(/[^a-zA-Z0-9]/g, "");
    
    // Membuat URI standar Google Authenticator
    const otpAuthUrl = authenticator.keyuri(account, issuer, SECRET_KEY);
    
    setTimeout(() => {
      setQrCodeData(otpAuthUrl); // Kirim teks mentah ke SecurityView
      setLoading2FA(false);
      skuyAlert.fire({ title: 'QR SIAP', text: 'Scan di Google Authenticator sekarang!', icon: 'info' });
    }, 600);
  };

  // --- VERIFIKASI DENGAN TOLERANSI WAKTU ---
  const handleVerify2FA = async () => {
    // Memberikan toleransi waktu +/- 30-60 detik (window: 1)
    authenticator.options = { window: 1 };
    
    const isValid = authenticator.check(otp, SECRET_KEY);

    if (!isValid) {
      return skuyAlert.fire({
        title: 'KODE SALAH',
        text: 'OTP tidak cocok atau sudah expired. Cek HP lagi!',
        icon: 'error'
      });
    }

    setLoading2FA(true);
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: true }).eq('id', user.id);

    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
      skuyAlert.fire({ title: 'SECURED', text: '2FA Berhasil Diaktifkan!', icon: 'success' });
      setQrCodeData(''); setOtp('');
    }
    setLoading2FA(false);
  };

  const handleDisable2FA = async () => {
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: false }).eq('id', user.id);
    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire('OFF', 'Keamanan dinonaktifkan.', 'info');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={user} navigate={navigate} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center text-left">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">Creator Dashboard</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 italic">
              User ID: {user.id.substring(0,8)}
            </p>
          </div>
        </header>

        {activeMenu === 'wallet' && <EarningsView user={user} balance={balance} showBalance={showBalance} setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        
        {activeMenu === 'security' && (
          <SecurityView 
            key={user.is_two_fa_enabled ? 'active' : 'inactive'} 
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

      <EditBankModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        formData={formDataBank} 
        setFormData={setFormDataBank} 
        onSave={async (e) => {
           e.preventDefault();
           const { data, error } = await supabase.from('payment_methods').update(formDataBank).eq('streamer_id', user.id).select().single();
           if (!error) { setBankData(data); setIsEditModalOpen(false); skuyAlert.fire('Saved!', '', 'success'); }
        }} 
      />
    </div>
  )
}

export default DashboardPage;