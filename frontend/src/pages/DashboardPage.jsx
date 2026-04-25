import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

// --- HELPER STYLE POP-UP SUPER GACOR (BRUTALIST STYLE) ---
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
      skuyAlert.fire({
        title: 'SISTEM ERROR',
        text: 'Gagal memproses kunci enkripsi keamanan.',
        icon: 'error',
        confirmButtonText: 'KEMBALI'
      });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    setLoading2FA(true);
    try {
      const res = await api.post('/auth/verify-2fa', { userId: user.id, token: otp });
      if (res.data.success) {
        skuyAlert.fire({
          title: 'VERIFIKASI BERHASIL',
          text: 'Autentikasi dua langkah (2FA) telah aktif untuk akun Anda.',
          icon: 'success',
          confirmButtonText: 'LANJUTKAN'
        });
        const updatedUser = { ...user, is_two_fa_enabled: true };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setQrCode(''); setOtp('');
      }
    } catch (err) {
      skuyAlert.fire({
        title: 'KODE TIDAK VALID',
        text: 'Kode verifikasi salah atau sudah kedaluwarsa.',
        icon: 'error',
        confirmButtonText: 'COBA LAGI'
      });
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    const result = await skuyAlert.fire({
      title: 'NONAKTIFKAN 2FA?',
      text: 'Tindakan ini akan menurunkan level keamanan akun Anda secara signifikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YA, NONAKTIFKAN',
      cancelButtonText: 'BATALKAN',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      setLoading2FA(true);
      try {
        const res = await api.post('/auth/disable-2fa', { userId: user.id });
        if (res.data.success) {
          skuyAlert.fire({
            title: 'PROTOKOL MATI',
            text: 'Keamanan dua langkah telah dinonaktifkan dari sistem.',
            icon: 'info',
            confirmButtonText: 'MENGERTI'
          });
          const updatedUser = { ...user, is_two_fa_enabled: false };
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setQrCode('');
        }
      } catch (err) {
        skuyAlert.fire('GAGAL', 'Terjadi kesalahan pada server.', 'error');
      } finally {
        setLoading2FA(false);
      }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user_data');
    if (!savedUser) return navigate('/auth');
    const userData = JSON.parse(savedUser);
    setUser(userData);
    if (userData.role !== 'creator') setActiveMenu('profile');
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
        skuyAlert.fire({
          title: 'DATA DIPERBARUI',
          text: 'Informasi rekening bank berhasil disimpan ke sistem.',
          icon: 'success',
          confirmButtonText: 'OKE'
        });
      }
    } catch (err) { 
      skuyAlert.fire('KESALAHAN', 'Gagal memperbarui data perbankan.', 'error'); 
    }
  }

  if (!user) return null;
  const displayUser = getProcessedUser(user);

  return (
    <div className="min-h-screen bg-[#F8FAFF] flex font-sans selection:bg-violet-100">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} user={displayUser} navigate={navigate} />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
            {user.role === 'creator' ? 'Creator Hub' : 'Member Area'}
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            LOGGED IN AS: <span className="text-violet-600">{user.role}</span>
          </p>
        </header>

        {activeMenu === 'wallet' && (
          user.role === 'creator' ? (
            <EarningsView 
              user={displayUser} balance={balance} showBalance={showBalance} 
              setShowBalance={setShowBalance} bankData={bankData} openEditModal={() => setIsEditModalOpen(true)} 
            />
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200">
              <h2 className="text-xl font-bold italic mb-2 text-slate-800 uppercase">Daftar Akun Kreator</h2>
              <button className="bg-violet-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase italic">DAFTAR SEKARANG</button>
            </div>
          )
        )}
        
        {activeMenu === 'activity' && <ActivityFeed userId={user.id} />}
        {activeMenu === 'overlay' && <OverlayPage user={displayUser} />}
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