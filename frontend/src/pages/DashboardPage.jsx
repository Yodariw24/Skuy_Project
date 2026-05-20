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

// ✅ INTEGRASI FITUR BARU: Hub Analisis Performa Kelas Dunia!
import AnalyticsView from '../components/dashboard/AnalyticsView'

// 📡 IMPORT ALERT & SUB-VIEWS (MURNI OPERASIONAL STREAM)
import DonationAlert from '../components/dashboard/DonationAlert'
import TipAlertView from '../components/dashboard/views/TipAlertView'
import MediaShareView from '../components/dashboard/views/MediaShareView'
import MilestoneView from '../components/dashboard/views/MilestoneView'
import LeaderboardView from '../components/dashboard/views/LeaderboardView'

import Swal from 'sweetalert2'

function DashboardPage() {
    const { tab = 'wallet' } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null)
    const [balance, setBalance] = useState(0)
    const [otp, setOtp] = useState('')
    const [loading2FA, setLoading2FA] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [isBankModalOpen, setIsBankModalOpen] = useState(false)
    
    const [bankData, setBankData] = useState({ 
        bank_name: '', 
        bank_account_number: '', 
        bank_account_name: '' 
    })

    // 📡 1. ENGINE UTAMA SINKRONISASI DATA PROFIL
    const fetchDashboardData = useCallback(async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user'));
            if (!savedUser?.id) throw new Error("Sesi Berakhir");

            const res = await api.get('/user/dashboard-sync');
            
            if (res.data.success) {
                // 🛡️ LOCK MERGE SYSTEM: Amankan streamer_id dari ancaman data kosong
                const userData = {
                    ...savedUser,
                    ...res.data.user,
                    id: res.data.user.id || savedUser.id,
                    streamer_id: res.data.user.streamer_id || savedUser.streamer_id || res.data.user.id || savedUser.id
                };

                setUser(userData);
                
                setBankData({
                    bank_name: userData.bank_name || '',
                    bank_account_number: userData.bank_account_number || userData.account_number || '',
                    bank_account_name: userData.bank_account_name || userData.account_name || ''
                });

                localStorage.setItem('user', JSON.stringify(userData));
            }
        } catch (err) {
            console.error("❌ Sync Error Dashboard:", err.message);
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/auth');
            }
        } finally {
            setIsInitialLoading(false);
        }
    }, [navigate]);

    // 💰 2. ENGINE KHUSUS RE-FETCH SALDO LIVE
    const fetchLiveBalance = useCallback(async () => {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const targetId = user?.streamer_id || savedUser?.streamer_id || user?.id || savedUser?.id;
        
        if (!targetId) return;

        try {
            const balanceRes = await api.get(`/api/donations/balance/${targetId}`);
            if (balanceRes.data && balanceRes.data.success) {
                setBalance(balanceRes.data.total_saldo);
            }
        } catch (err) {
            console.warn("⚠️ Gagal pancing saldo murni database:", err.message);
        }
    }, [user]);

    // 🔄 RE-ACTIVE CALLER: Jalankan sinkronisasi profil saat pertama kali masuk
    useEffect(() => {
        const token = localStorage.getItem('user_token');
        if (!token) {
            navigate('/auth');
        } else {
            fetchDashboardData();
        }
    }, [fetchDashboardData, navigate]);

    // 🔄 TAB MONITOR TRIGGER: Paksa ambil saldo terbaru setiap kali user berada/pindah ke tab 'wallet'
    useEffect(() => {
        if (user?.id) {
            fetchLiveBalance();
        }
    }, [tab, user?.id, fetchLiveBalance]);


    // --- LOGIKA DUAL-OTP ---
    const handleRequestOTP = async () => {
        if (!user?.phone_number) {
            return Swal.fire({
                title: "WA KOSONG",
                text: "Isi nomor WhatsApp dulu di profil, Ri!",
                icon: "warning",
                confirmButtonColor: "#7C3AED"
            });
        }
        letting2FA = true; // Sesuai kodingan asli pembawa state lo
        setLoading2FA(true);
        try {
            const res = await api.post('/auth/setup-2fa', { userId: user.id });
            if (res.data.success) {
                Swal.fire("KODE MELUNCUR", "Cek WhatsApp lo & Email!", "info");
            }
        } catch (err) {
            Swal.fire("ERROR", "Gagal kontak server keamanan.", "error");
        } finally {
            setLoading2FA(false);
        }
    };

    // --- MODAL BANK ---
    const handleSaveBank = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/user/bank/${user.id}`, bankData);
            if (res.data.success) {
                Swal.fire({
                    title: "SINKRON!",
                    text: "Data bank berhasil disimpan.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
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
        <div className="min-h-screen bg-[#F8FAFF] flex font-sans text-left relative overflow-hidden">
            
            {/* 🔥 REAL-TIME ALERT PROTOCOL */}
            <DonationAlert streamerId={user?.streamer_id || user?.id} />
            
            <Sidebar user={user} />
            
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* ✅ DYNAMIC CONTENT HUB */}
                    {tab === 'wallet' && (
                        <EarningsView 
                            user={user} 
                            balance={balance} 
                            bankData={bankData} 
                            openEditModal={() => setIsBankModalOpen(true)}
                        />
                    )}
                    
                    {/* ✅ RENDERING MENU BARU: ANALISIS PERFORMA SULTAN */}
                    {tab === 'analytics' && <AnalyticsView user={user} />}
                    
                    {tab === 'activity' && <ActivityFeed user={user} />}
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

                    {/* --- SETUP VIEWS --- */}
                    {tab === 'tip' && <TipAlertView user={user} />}
                    {tab === 'mediashare' && <MediaShareView user={user} />}
                    {tab === 'milestone' && <MilestoneView user={user} />}
                    {tab === 'leaderboard' && <LeaderboardView user={user} />}

                </div>
            </main>

            {/* MODAL BANK SULTAN */}
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