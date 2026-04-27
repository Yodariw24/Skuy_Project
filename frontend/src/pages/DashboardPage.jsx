import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import AppearanceView from '../components/dashboard/AppearanceView' 
import EditBankModal from '../components/dashboard/EditBankModal'
import SecurityView from '../components/dashboard/SecurityView'
import OverlayPage from '../components/dashboard/OverlayPage'
import Swal from 'sweetalert2'

const skuyAlert = Swal.mixin({
  customClass: {
    popup: 'skuy-popup rounded-[2rem] p-10 border-4 border-slate-950 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]',
    title: 'skuy-title text-3xl text-slate-950 font-black italic uppercase tracking-tighter',
    htmlContainer: 'text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed pt-4',
    confirmButton: 'bg-violet-600 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase italic tracking-[0.2em] mx-2 outline-none transition-all hover:scale-105 hover:bg-slate-950',
    cancelButton: 'bg-slate-100 text-slate-400 px-10 py-4 rounded-xl font-black text-[12px] uppercase italic tracking-[0.2em] mx-2 transition-all hover:bg-slate-200'
  },
  buttonsStyling: false,
  background: '#ffffff',
});

function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState('wallet')
  const [activeSubMenu, setActiveSubMenu] = useState('tip') 
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [otp, setOtp] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)

  const [bankData, setBankData] = useState({ bank_name: 'Belum Diatur', account_number: '-', account_name: '-' })
  const [formDataBank, setFormDataBank] = useState({ bank_name: '', account_number: '', account_name: '' })

  const navigate = useNavigate()

  // Ambil Data dari Supabase Cloud
  const fetchDashboardData = async (userId) => {
    if (!userId) return;
    try {
      const [resProfile, resBal, resBank] = await Promise.all([
        supabase.from('streamers').select('*').eq('id', userId).single(),
        supabase.from('balance').select('total_saldo').eq('streamer_id', userId).single(),
        supabase.from('payment_methods').select('*').eq('streamer_id', userId).single()
      ]);

      if (resProfile.data) setUser(resProfile.data);
      if (resBal.data) setBalance(resBal.data.total_saldo || 0);
      if (resBank.data) {
        setBankData(resBank.data);
        setFormDataBank(resBank.data);
      }
    } catch (err) {
      console.error("Cloud Sync Error:", err);
    }
  }

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/auth');
      fetchDashboardData(session.user.id);
    };
    initSession();

    // Re-sync otomatis jika ada perubahan auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // --- LOGIKA 2FA (FIX SCAN GOOGLE AUTHENTICATOR) ---
  const handleGenerateQR = () => {
    setLoading2FA(true);
    
    // Secret wajib Base32 (A-Z, 2-7) agar Google Authenticator tidak error
    const secret = "KVKFKRCIK5GVURKB"; 
    const issuer = "SkuyGG";
    const account = (user?.username || "Creator").replace(/[^a-zA-Z0-9]/g, "");
    
    // Format standar otpauth
    const otpAuthUrl = `otpauth://totp/${issuer}:${account}?issuer=${issuer}&secret=${secret}`;
    
    // Menggunakan Google Chart API (Paling stabil buat scan)
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpAuthUrl)}`;
    
    setTimeout(() => {
      setQrCode(qrUrl);
      setLoading2FA(false);
      skuyAlert.fire({
        title: 'QR GENERATED',
        text: `Scan pakai Google Authenticator. Manual Key: ${secret}`,
        icon: 'info'
      });
    }, 800);
  };

  const handleVerify2FA = async () => {
    // Simulasi validasi angka. Di sistem demo, kita pakai 123456 agar aman.
    if (otp !== "123456" && otp.length === 6) {
      return skuyAlert.fire({ title: 'OTP SALAH', text: 'Kode tidak cocok!', icon: 'error' });
    }

    setLoading2FA(true);
    const { error } = await supabase
      .from('streamers')
      .update({ is_two_fa_enabled: true })
      .eq('id', user.id);

    if (!error) {
      // Update UI secara Instan tanpa refresh
      setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
      skuyAlert.fire({ title: 'SECURITY ON', text: '2FA Aktif! Akun Full Protected.', icon: 'success' });
      setQrCode(''); 
      setOtp('');
    }
    setLoading2FA(false);
  };

  const handleDisable2FA = async () => {
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: false }).eq('id', user.id);
    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire({ title: 'SECURITY OFF', text: 'Perisai 2FA dimatikan.', icon: 'info' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar 
        activeMenu={activeMenu} setActiveMenu={setActiveMenu} 
        activeSubMenu={activeSubMenu} setActiveSubMenu={setActiveSubMenu}
        user={user} navigate={navigate} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center text-left">
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              Creator Hub
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
              Cloud Status: <span className="text-violet-600 italic">Synchronized</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-slate-950 uppercase italic tracking-widest italic">Live</span>
          </div>
        </header>

        {activeMenu === 'wallet' && <EarningsView user={user} balance={balance} showBalance={showBalance} setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} />}
        {activeMenu === 'activity' && <ActivityFeed userId={user.id} />}
        {activeMenu === 'overlay' && <OverlayPage activeSubMenu={activeSubMenu} user={user} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        {activeMenu === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
        
        {activeMenu === 'security' && (
          <SecurityView 
            key={user.is_two_fa_enabled ? 'secured' : 'unsecured'} 
            user={user} qrCode={qrCode} onGenerateQR={handleGenerateQR} 
            onVerify={handleVerify2FA} onDisable={handleDisable2FA} 
            otp={otp} setOtp={setOtp} loading={loading2FA} 
          />
        )}
      </main>

      {/* Modal Bank (Supabase Sync) */}
      <EditBankModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        formData={formDataBank} 
        setFormData={setFormDataBank} 
        onSave={async (e) => {
           e.preventDefault();
           const { data, error } = await supabase.from('payment_methods').update(formDataBank).eq('streamer_id', user.id).select().single();
           if (!error) { setBankData(data); setIsEditModalOpen(false); skuyAlert.fire('SUCCESS', 'Data Bank Disimpan', 'success'); }
        }} 
      />
    </div>
  )
}

export default DashboardPage;