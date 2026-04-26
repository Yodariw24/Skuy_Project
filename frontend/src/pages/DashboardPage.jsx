import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// --- PERBAIKAN: Gunakan Supabase Client ---
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
    popup: 'skuy-popup rounded-[2rem] p-10',
    title: 'skuy-title text-3xl text-slate-950',
    htmlContainer: 'text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed pt-4',
    confirmButton: 'skuy-confirm-btn bg-violet-600 text-white px-10 py-4 rounded-xl font-black text-[12px] uppercase italic tracking-[0.2em] mx-2 outline-none transition-all',
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

  const [bankData, setBankData] = useState({ 
    bank_name: 'Belum Diatur', account_number: '-', account_name: '-' 
  })
  const [formDataBank, setFormDataBank] = useState({ 
    bank_name: '', account_number: '', account_name: '' 
  })

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

  // --- LOGIKA DASHBOARD (SUPABASE NATIVE) ---
  const fetchDashboardData = async (userId) => {
    try {
      // 1. Ambil Profil & Bank & Saldo secara paralel
      const [resProfile, resBal, resBank] = await Promise.all([
        supabase.from('streamers').select('*').eq('id', userId).single(),
        supabase.from('balance').select('total_saldo').eq('streamer_id', userId).single(),
        supabase.from('payment_methods').select('*').eq('streamer_id', userId).single()
      ]);

      if (resProfile.data) {
        setUser(resProfile.data);
      }
      
      if (resBal.data) {
        setBalance(resBal.data.total_saldo || 0);
      }

      if (resBank.data) {
        setBankData({
          bank_name: resBank.data.bank_name || 'Belum Diatur',
          account_number: resBank.data.account_number || '-',
          account_name: resBank.data.account_name || '-'
        });
        setFormDataBank({
          bank_name: resBank.data.bank_name || '',
          account_number: resBank.data.account_number || '',
          account_name: resBank.data.account_name || ''
        });
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err);
    }
  }

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return navigate('/auth');
      }

      // Jalankan pengambilan data berdasarkan UUID Supabase
      fetchDashboardData(session.user.id);
    };

    initDashboard();
  }, [navigate]);

  // --- LOGIKA UPDATE BANK (SUPABASE NATIVE) ---
  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .update({
          bank_name: formDataBank.bank_name,
          account_number: formDataBank.account_number,
          account_name: formDataBank.account_name,
        })
        .eq('streamer_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBankData(data);
        setIsEditModalOpen(false);
        skuyAlert.fire({
          title: 'DATA DIPERBARUI',
          text: 'Informasi rekening bank berhasil disimpan ke sistem Cloud.',
          icon: 'success',
          confirmButtonText: 'OKE'
        });
      }
    } catch (err) { 
      skuyAlert.fire('KESALAHAN', 'Gagal memperbarui data perbankan.', 'error'); 
    }
  }

  // --- LOGIKA 2FA (SIMULASI UNTUK DEMO) ---
  const handleGenerateQR = () => {
    setLoading2FA(true);
    setTimeout(() => {
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SKUY-SECURITY-ACTIVE');
      setLoading2FA(false);
    }, 1000);
  };

  const handleVerify2FA = () => {
    skuyAlert.fire({ title: 'VERIFIKASI BERHASIL', text: '2FA Aktif.', icon: 'success' });
    setQrCode(''); setOtp('');
  };

  const handleDisable2FA = () => {
    skuyAlert.fire({ title: 'PROTOKOL MATI', text: '2FA Dinonaktifkan.', icon: 'info' });
  };

  if (!user) return null;
  const displayUser = getProcessedUser(user);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        activeSubMenu={activeSubMenu} 
        setActiveSubMenu={setActiveSubMenu}
        user={displayUser} 
        navigate={navigate} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            {user.role === 'streamer' || user.role === 'creator' ? 'Creator Hub' : 'Member Area'}
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            STATUS: <span className="text-violet-600">Authorized Session</span>
          </p>
        </header>

        {activeMenu === 'wallet' && (
          <EarningsView 
            user={displayUser} balance={balance} showBalance={showBalance} 
            setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} 
          />
        )}
        
        {activeMenu === 'activity' && <ActivityFeed userId={user.id} />}
        {activeMenu === 'overlay' && <OverlayPage activeSubMenu={activeSubMenu} user={displayUser} />}
        {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}

        {activeMenu === 'security' && (
          <SecurityView 
            user={displayUser} qrCode={qrCode} onGenerateQR={handleGenerateQR} 
            onVerify={handleVerify2FA} onDisable={handleDisable2FA}
            otp={otp} setOtp={setOtp} loading={loading2FA} 
          />
        )}

        {activeMenu === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
      </main>

      <EditBankModal 
        isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        formData={formDataBank} setFormData={setFormDataBank} onSave={handleSaveBank}
      />
    </div>
  )
}

export default DashboardPage;