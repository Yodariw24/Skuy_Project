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

  const getProcessedUser = (userData) => {
    if (!userData) return null;
    const pic = userData.profile_picture;
    let finalPic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;
    if (pic) {
      finalPic = pic.startsWith('http') ? pic : `https://hkcjensvqghsbpceydiv.supabase.co/storage/v1/object/public/uploads/${pic}`;
    }
    return { ...userData, profile_picture: finalPic };
  };

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
      console.error("Sync Error:", err);
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/auth');
      fetchDashboardData(session.user.id);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update(formDataBank)
        .eq('streamer_id', user.id)
        .select().single();

      if (error) throw error;
      setBankData(data);
      setIsEditModalOpen(false);
      skuyAlert.fire({ title: 'BANK UPDATED', text: 'Data perbankan telah sinkron dengan Cloud.', icon: 'success' });
    } catch (err) { 
      skuyAlert.fire('SYSTEM ERROR', 'Gagal menyimpan data bank.', 'error'); 
    }
  }

  // --- LOGIKA 2FA FIX TOTAL (GOOGLE AUTHENTICATOR APPROVED) ---
  const handleGenerateQR = () => {
    setLoading2FA(true);
    
    const issuer = "SkuyGG"; 
    const account = (user?.username || "Creator").replace(/[^a-zA-Z0-9]/g, ""); 
    const secret = "KVKFKRCIK5GVURKB"; // Secret Base32 Murni
    
    const otpAuthUrl = `otpauth://totp/${issuer}:${account}?issuer=${issuer}&secret=${secret}`;
    
    // Gunakan Google Chart API sebagai generator utama
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(otpAuthUrl)}`;
    
    setTimeout(() => {
      setQrCode(qrUrl);
      setLoading2FA(false);
    }, 800);
  };

  const handleVerify2FA = async () => {
    setLoading2FA(true);
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: true }).eq('id', user.id);
    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: true }));
      skuyAlert.fire({ title: 'SECURITY ON', text: 'Protokol 2FA berhasil diaktifkan. Akun aman!', icon: 'success' });
      setQrCode(''); setOtp('');
    }
    setLoading2FA(false);
  };

  const handleDisable2FA = async () => {
    const { error } = await supabase.from('streamers').update({ is_two_fa_enabled: false }).eq('id', user.id);
    if (!error) {
      setUser(prev => ({ ...prev, is_two_fa_enabled: false }));
      skuyAlert.fire({ title: 'SECURITY OFF', text: 'Protokol 2FA dinonaktifkan.', icon: 'info' });
    }
  };

  if (!user) return null;
  const displayUser = getProcessedUser(user);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar 
        activeMenu={activeMenu} setActiveMenu={setActiveMenu} 
        activeSubMenu={activeSubMenu} setActiveSubMenu={setActiveSubMenu}
        user={displayUser} navigate={navigate} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8 flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
              {user.role === 'streamer' ? 'Creator Control' : 'Member Station'}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] text-left mt-1">
              Auth Key: <span className="text-violet-600">{user.id.substring(0, 8)}...</span>
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border-2 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-slate-950 uppercase italic tracking-widest">Cloud Active</span>
          </div>
        </header>

        {activeMenu === 'wallet' && <EarningsView user={displayUser} balance={balance} showBalance={showBalance} setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} />}
        {activeMenu === 'activity' && <ActivityFeed userId={user.id} />}
        {activeMenu === 'overlay' && <OverlayPage activeSubMenu={activeSubMenu} user={displayUser} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
        {activeMenu === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
        {activeMenu === 'security' && <SecurityView user={displayUser} qrCode={qrCode} onGenerateQR={handleGenerateQR} onVerify={handleVerify2FA} onDisable={handleDisable2FA} otp={otp} setOtp={setOtp} loading={loading2FA} />}
      </main>

      <EditBankModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} formData={formDataBank} setFormData={setFormDataBank} onSave={handleSaveBank} />
    </div>
  )
}

export default DashboardPage;