import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios' 
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
import AppearanceView from '../components/dashboard/AppearanceView'
import ActivityFeed from '../components/dashboard/ActivityFeed' 
import EditBankModal from '../components/dashboard/EditBankModal' 
import Swal from 'sweetalert2'

function DashboardPage() {
    const [activeMenu, setActiveMenu] = useState('wallet')
    const [activeSubMenu, setActiveSubMenu] = useState('')
    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [otp, setOtp] = useState('')
    const [loading2FA, setLoading2FA] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isBankModalOpen, setIsBankModalOpen] = useState(false)
    const [bankData, setBankData] = useState({ bank_name: '', account_number: '', account_name: '' })

    const navigate = useNavigate()

    // --- 1. CORE SYNC (Pembersihan Path /api/) ---
    const fetchDashboardData = useCallback(async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (!savedUser?.id) throw new Error("Sesi Berakhir");

            // ✅ FIX: Hapus prefix /api karena sudah ada di baseURL axios.js
            const res = await api.get('/user/dashboard-sync');
            
            if (res.data.success) {
                const userData = res.data.user;
                setUser(userData);
                setBalance(userData.total_saldo || 0);
                
                setBankData({
                    bank_name: userData.bank_name || 'Belum Diatur',
                    account_number: userData.account_number || '-',
                    account_name: userData.account_name || '-'
                });

                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (err) {
            console.error("❌ Sync Error Dashboard:", err.message);
            // Jika error 401 (Auth), lempar ke login
            if (err.response?.status === 401) navigate('/auth');
        } finally {
            setIsInitialLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (!token) {
            navigate('/auth');
        } else {
            fetchDashboardData();
        }
    }, [fetchDashboardData, navigate]);

    // --- 2. LOGIKA DUAL-OTP (Pembersihan Path) ---
    const handleRequestOTP = async () => {
        if (!user?.phone_number) {
            return Swal.fire("WA KOSONG", "Isi nomor WhatsApp dulu di profil, Ri!", "warning");
        }
        
        setLoading2FA(true);
        try {
            // ✅ FIX: Path lurus /auth/setup-2fa
            const res = await api.post('/auth/setup-2fa', { userId: user.id });
            if (res.data.success) {
                Swal.fire("KODE MELUNCUR", "Cek WhatsApp lo & Email ariwirayuda24!", "info");
            }
        } catch (err) {
            Swal.fire("ERROR", "Gagal kontak server keamanan.", "error");
        } finally {
            setLoading2FA(false);
        }
    };

    const handleVerify2FA = async () => {
        if (otp.length < 6) return;
        setLoading2FA(true);
        try {
            // ✅ FIX: Path lurus /auth/verify-2fa
            const res = await api.post('/auth/verify-2fa', { 
                userId: user.id, 
                token: otp 
            });

            if (res.data.success) {
                Swal.fire("GACOR!", "Security Sultan Aktif!", "success").then(() => {
                    window.location.reload();
                });
            }
        } catch (err) {
            Swal.fire("GAGAL", "OTP Salah, Ri!", "error");
            setOtp('');
        } finally {
            setLoading2FA(false);
        }
    };

    const handleDisable2FA = async () => {
        const confirm = await Swal.fire({
            title: 'MATIKAN PROTEKSI?',
            text: 'Akun lo jadi nggak Sultan lagi nanti.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'IYA, CABUT AJA'
        });

        if (confirm.isConfirmed) {
            try {
                await api.post('/auth/disable-2fa', { userId: user.id });
                Swal.fire("OFF", "Keamanan dicabut.", "info").then(() => window.location.reload());
            } catch (err) {
                Swal.fire("ERROR", "Gagal cabut proteksi.", "error");
            }
        }
    };

    // --- 3. MODAL BANK (Pembersihan Path) ---
    const handleSaveBank = async (e) => {
        e.preventDefault();
        try {
            // ✅ FIX: Path lurus /user/bank/:id
            const res = await api.put(`/user/bank/${user.id}`, bankData);
            if (res.data.success) {
                Swal.fire("SINKRON!", "Data bank berhasil disimpan.", "success");
                setIsBankModalOpen(false);
                fetchDashboardData();
            }
        } catch (err) {
            Swal.fire("ERROR", "Gagal update data bank.", "error");
        }
    };

    if (isInitialLoading || !user) {
        return (
            <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-8 border-slate-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="font-black italic uppercase tracking-widest text-slate-900">Syncing Cloud Node...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFF] flex font-sans text-left">
            <Sidebar 
                activeMenu={activeMenu} 
                setActiveMenu={setActiveMenu} 
                activeSubMenu={activeSubMenu}
                setActiveSubMenu={setActiveSubMenu}
                user={user} 
                navigate={navigate} 
            />
            
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {activeMenu === 'wallet' && (
                        <EarningsView 
                            user={user} 
                            balance={balance} 
                            bankData={bankData} 
                            openEditModal={() => setIsBankModalOpen(true)}
                        />
                    )}
                    {activeMenu === 'activity' && <ActivityFeed />}
                    {activeMenu === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
                    {activeMenu === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
                    {activeMenu === 'security' && (
                        <SecurityView 
                            user={user} 
                            onGenerateQR={handleRequestOTP} 
                            onVerify={handleVerify2FA} 
                            onDisable={handleDisable2FA} 
                            otp={otp} 
                            setOtp={setOtp} 
                            loading={loading2FA}
                            isVerifying={otp.length > 0 || loading2FA}
                        />
                    )}
                </div>
            </main>

            <EditBankModal 
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                formData={bankData}
                setFormData={setBankData}
                onSave={handleSaveBank}
            />
        </div>
    )
}

export default DashboardPage;