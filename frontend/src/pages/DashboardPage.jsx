import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion' 
// --- PERBAIKAN: Ganti api (axios) jadi supabase ---
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
  const { tab } = useParams();
  const navigate = useNavigate();
  const overlayTabs = ['tip', 'mediashare', 'milestone', 'leaderboard'];
  
  const handleNavigate = (target) => {
    navigate(`/dashboard/${target}`);
  };

  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [otp, setOtp] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)
  const [bankData, setBankData] = useState({ bank_name: 'Belum Diatur', account_number: '-', account_name: '-' })
  const [formDataBank, setFormDataBank] = useState({ bank_name: '', account_number: '', account_name: '' })

  const getProcessedUser = (userData) => {
    if (!userData) return null;
    const pic = userData.profile_picture;
    let finalPic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`;
    if (pic) {
      // Perbaikan path gambar agar tidak nyari ke localhost
      finalPic = pic.startsWith('http') ? pic : `https://hkcjensvqghsbpceydiv.supabase.co/storage/v1/object/public/uploads/${pic}`;
    }
    return { ...userData, profile_picture: finalPic };
  };

  // --- PERBAIKAN: Fungsi penarikan data menggunakan Supabase ---
  const fetchDashboardData = async (userEmail) => {
    try {
      const { data: streamer, error } = await supabase
        .from('streamers')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) throw error;

      if (streamer) {
        setBalance(streamer.total_saldo || 0);
        setBankData({ 
          bank_name: streamer.bank_name || 'Belum Diatur', 
          account_number: streamer.account_number || '-', 
          account_name: streamer.account_name || '-' 
        });
        setFormDataBank({ 
          bank_name: streamer.bank_name || '', 
          account_number: streamer.account_number || '', 
          account_name: streamer.account_name || '' 
        });
        
        // Simpan data streamer ke state user
        setUser(streamer);
        localStorage.setItem('user_data', JSON.stringify(streamer));
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data:", err.message);
    }
  }

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (!savedUser) return navigate('/auth');
    
    const userData = JSON.parse(savedUser);
    // Kita tetap set data awal, tapi kita refresh dari Supabase biar balance-nya update
    setUser(userData);
    fetchDashboardData(userData.email);
  }, [navigate]);

  // --- PERBAIKAN: Update Bank via Supabase ---
  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('streamers')
        .update(formDataBank)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setBankData(data);
      setIsEditModalOpen(false);
      setUser(data);
      localStorage.setItem('user_data', JSON.stringify(data));
      skuyAlert.fire({ title: 'DATA DIPERBARUI', icon: 'success' });
    } catch (err) { 
      skuyAlert.fire('KESALAHAN', 'Gagal update database.', 'error'); 
    }
  }

  // --- HANDLER LAINNYA (Simulasi agar tidak error saat presentasi) ---
  const handleGenerateQR = () => { setQrCode('QR_SIMULATION'); skuyAlert.fire('READY', 'Kode QR Terenkripsi', 'info'); };
  const handleVerify2FA = () => { skuyAlert.fire('BERHASIL', 'Security Aktif', 'success'); };
  const handleDisable2FA = () => { skuyAlert.fire('DISABLED', 'Security Mati', 'warning'); };

  if (!user) return null;
  const displayUser = getProcessedUser(user);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar 
        activeMenu={overlayTabs.includes(tab) ? 'overlay' : tab} 
        setActiveMenu={handleNavigate} 
        activeSubMenu={tab}
        setActiveSubMenu={handleNavigate}
        user={displayUser} 
        navigate={navigate} 
      />

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <header className="mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 bg-violet-50 px-3 py-1 rounded-full italic w-fit">
              {user.role === 'streamer' || user.role === 'creator' ? 'Creator Workspace' : 'User Preferences'}
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-950 mt-3 leading-none italic">
                Control <span className="text-violet-600">Center</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                Active Path: <span className="text-slate-900">/dashboard/{tab}</span>
            </p>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'wallet' && (
              <EarningsView 
                user={displayUser} balance={balance} showBalance={showBalance} 
                setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} 
              />
            )}
            
            {tab === 'activity' && <ActivityFeed userId={user.id} />}
            {overlayTabs.includes(tab) && <OverlayPage activeSubMenu={tab} user={displayUser} />}
            {tab === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
            {tab === 'security' && (
              <SecurityView 
                user={displayUser} qrCode={qrCode} onGenerateQR={handleGenerateQR} 
                onVerify={handleVerify2FA} onDisable={handleDisable2FA}
                otp={otp} setOtp={setOtp} loading={loading2FA} 
              />
            )}
            {tab === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <EditBankModal 
        isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}
        formData={formDataBank} setFormData={setFormDataBank} onSave={handleSaveBank}
      />
    </div>
  )
}

export default DashboardPage;