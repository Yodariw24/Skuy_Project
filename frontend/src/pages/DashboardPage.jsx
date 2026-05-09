import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios' 
import Sidebar from '../components/dashboard/Sidebar'
import EarningsView from '../components/dashboard/EarningsView'
import ProfileSettings from '../components/dashboard/ProfileSettings' 
import SecurityView from '../components/dashboard/SecurityView'
import AppearanceView from '../components/dashboard/AppearanceView'
import ActivityFeed from '../components/dashboard/ActivityFeed' 
import EditBankModal from '../components/dashboard/EditBankModal' 

// ✅ IMPORT VIEWS BARU (Siapkan file-file ini nanti)
import TipAlertView from '../components/dashboard/views/TipAlertView'
import MediaShareView from '../components/dashboard/views/MediaShareView'
import MilestoneView from '../components/dashboard/views/MilestoneView'
import LeaderboardView from '../components/dashboard/views/LeaderboardView'

import Swal from 'sweetalert2'

function DashboardPage() {
    // ✅ SYNC LOGIC: Nangkep parameter :tab dari URL
    const { tab = 'wallet' } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [otp, setOtp] = useState('')
    const [loading2FA, setLoading2FA] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isBankModalOpen, setIsBankModalOpen] = useState(false)
    const [bankData, setBankData] = useState({ bank_name: '', account_number: '', account_name: '' })

    const fetchDashboardData = useCallback(async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (!savedUser?.id) throw new Error("Sesi Berakhir");

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

    // --- 2. LOGIKA DUAL-OTP ---
    const handleRequestOTP = async () => {
        if (!user?.phone_number) {
            return Swal.fire("WA KOSONG", "Isi nomor WhatsApp dulu di profil, Ri!", "warning");
        }
        setLoading2FA(true);
        try {
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

    // --- 3. MODAL BANK ---
    const handleSaveBank = async (e) => {
        e.preventDefault();
        try {
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
                    <p className="font-black italic uppercase tracking-widest text-slate-900">Syncing Sultan Cloud...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFF] flex font-sans text-left">
            {/* Sidebar sekarang mandiri, gak butuh props menu lagi */}
            <Sidebar user={user} />
            
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* ✅ DYNAMIC CONTENT HUB (Sultan UX) */}
                    {tab === 'wallet' && (
                        <EarningsView 
                            user={user} 
                            balance={balance} 
                            bankData={bankData} 
                            openEditModal={() => setIsBankModalOpen(true)}
                        />
                    )}
                    
                    {tab === 'activity' && <ActivityFeed />}
                    {tab === 'profile' && <ProfileSettings user={user} setUser={setUser} />}
                    {tab === 'appearance' && <AppearanceView user={user} setUser={setUser} />}
                    
                    {tab === 'security' && (
                        <SecurityView 
                            user={user} 
                            onGenerateQR={handleRequestOTP} 
                            otp={otp} 
                            setOtp={setOtp} 
                            loading={loading2FA}
                        />
                    )}

                    {/* --- OVERLAY SETUP PAGES --- */}
                    {tab === 'tip' && <TipAlertView user={user} />}
                    {tab === 'mediashare' && <MediaShareView user={user} />}
                    {tab === 'milestone' && <MilestoneView user={user} />}
                    {tab === 'leaderboard' && <LeaderboardView user={user} />}

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