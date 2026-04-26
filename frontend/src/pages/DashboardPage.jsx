import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion' 
import api from '../api/axios'
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
      finalPic = pic.startsWith('http') ? pic : `http://localhost:3000/uploads/${pic}`;
    }
    return { ...userData, profile_picture: finalPic };
  };

  const handleGenerateQR = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/setup-2fa', { userId: user.id }); 
      if (res.data.success) setQrCode(res.data.qrCode);
    } catch (err) {
      skuyAlert.fire({ title: 'SISTEM ERROR', text: 'Gagal memproses kunci enkripsi.', icon: 'error' });
    } finally { setLoading2FA(false); }
  };

  const handleVerify2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: user.id, token: otp });
      if (res.data.success) {
        skuyAlert.fire({ title: 'VERIFIKASI BERHASIL', icon: 'success' });
        const updatedUser = { ...user, is_two_fa_enabled: true };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setQrCode(''); setOtp('');
      }
    } catch (err) {
      skuyAlert.fire({ title: 'KODE TIDAK VALID', icon: 'error' });
    } finally { setLoading2FA(false); }
  };

  const handleDisable2FA = async () => {
    const result = await skuyAlert.fire({ title: 'NONAKTIFKAN 2FA?', icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      setLoading2FA(true);
      try {
        const res = await api.post('/auth/disable-2fa', { userId: user.id });
        if (res.data.success) {
          skuyAlert.fire({ title: 'PROTOKOL MATI', icon: 'info' });
          const updatedUser = { ...user, is_two_fa_enabled: false };
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (err) { skuyAlert.fire('GAGAL', 'Error server', 'error'); } 
      finally { setLoading2FA(false); }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (!savedUser) return navigate('/auth');
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    if (userData.bank_name) {
      setBankData({ bank_name: userData.bank_name, account_number: userData.account_number, account_name: userData.account_name });
      setFormDataBank({ bank_name: userData.bank_name, account_number: userData.account_number, account_name: userData.account_name });
    }
    fetchDashboardData(userData.id);
  }, [navigate]);

  const fetchDashboardData = async (userId) => {
    try {
      const resBal = await api.get(`/auth/${userId}/balance`);
      setBalance(resBal.data.total_saldo || 0);
    } catch (err) { console.error(err); }
  }

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/streamers/bank/${user.id}`, formDataBank);
      if (res.data.success) {
        setBankData(res.data.data);
        setIsEditModalOpen(false);
        const updatedUser = { ...user, ...res.data.data };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        skuyAlert.fire({ title: 'DATA DIPERBARUI', icon: 'success' });
      }
    } catch (err) { skuyAlert.fire('KESALAHAN', 'Gagal update bank', 'error'); }
  }

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
        {/* HEADER: Dibuat statis agar tidak meloncat saat navigasi */}
        <header className="mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 bg-violet-50 px-3 py-1 rounded-full italic w-fit">
              {user.role === 'creator' ? 'Creator Workspace' : 'User Preferences'}
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-950 mt-3 leading-none italic">
                Control <span className="text-violet-600">Center</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">
                Active Path: <span className="text-slate-900">/dashboard/{tab}</span>
            </p>
          </div>
        </header>

        {/* --- WRAPPER ANIMASI: MURNI FADE (OPACITY) BIAR GAK GERAK ATAS BAWAH --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === 'wallet' && (
              user.role === 'creator' ? (
                <EarningsView 
                  user={displayUser} balance={balance} showBalance={showBalance} 
                  setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} 
                />
              ) : (
                <div className="bg-white p-12 rounded-[3rem] text-center border-2 border-dashed border-slate-200 shadow-sm">
                  <h2 className="text-xl font-black italic mb-4 text-slate-900 uppercase">Ayo Mulai Karir Kreatormu!</h2>
                  <button className="bg-violet-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase italic tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-100">
                    DAFTAR SEKARANG
                  </button>
                </div>
              )
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