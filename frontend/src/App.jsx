import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import AuthPage from './pages/AuthPage'; 
import DashboardPage from './pages/DashboardPage'; 
import PaymentPage from './pages/PaymentPage';
import WidgetClient from './pages/WidgetClient';
import Explore from './pages/Explore'; // Creators Discovery Hub
import SuperAdminDashboard from './pages/SuperAdminDashboard'; // ✅ IMPORT DASHBOARD OWNER PT BARU
import api from './api/axios';

import 'animate.css';

// --- 1. LOGIC PROTECTED ROUTE (Sultan Guard Security Shield) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token'); 
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

// --- 2. LOGIC EXCLUSIVE ADMIN ROUTE (PT Owner Governance Guard) ---
// ✅ CLEAN PROTECTION: Memvalidasi role akun rill langsung dari localStorage hasil sinkronisasi Cloud
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('user_token');
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // 🛡️ DUAL-SHIELD BYPASS: Jika role database belum sinkron di token, jebol proteksi langsung via email valid lo, Ri!
  if (savedUser.role === 'SUPER_ADMIN' || savedUser.email === 'ariwirayuda24@gmail.com') {
    return children;
  }

  alert("Akses ilegal! Area ini hanya untuk Pemegang Kuasa PT SkuyGG, Ri!");
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SYNC USER: Ambil data Sultan terbaru dari Cloud Railway saat boot-up awal
  const syncUser = useCallback(async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setIsSyncing(false);
      return;
    }

    try {
      const res = await api.get('/user/dashboard-sync');
      if (res.data.success) {
        // ⚡ INJECTION FORCE: Jika server backend belum kirim key role, paksa injeksi role SUPER_ADMIN khusus untuk email lo di sisi client
        let userData = res.data.user;
        if (userData.email === 'ariwirayuda24@gmail.com') {
          userData.role = 'SUPER_ADMIN';
        }

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error("🛡️ Shield Broken: Sesi Gagal Sinkron / Token Ilegal.");
      if (err.response?.status === 401) {
        localStorage.clear();
        // Cek kondisi rute saat ini secara langsung dari instansi lokasi ter-update
        if (!window.location.pathname.includes('/auth')) {
          navigate('/auth');
        }
      }
    } finally {
      setIsSyncing(false);
    }
  }, [navigate]); // ✅ FIXED OPTIMIZATION: Hapus location.pathname dari dependensi agar terbebas dari siklus infinite API loop!

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  // Loading Screen pas booting pangkalan biar gak kedap-kedip
  if (isSyncing && localStorage.getItem('user_token')) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="w-16 h-16 border-8 border-slate-100 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      <div className="w-full min-h-screen font-sans antialiased selection:bg-violet-600 selection:text-white">
        <Routes>
          {/* --- 1. PUBLIC ROUTES --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 
          <Route path="/payment/:donationId" element={<PaymentPage />} />
          
          {/* ✅ JALUR UTAMA EXPLORE CREATORS HUB (Aman dari dynamic hijacking) */}
          <Route path="/explore" element={<Explore />} />

          {/* --- 2. SULTAN OVERLAY PROTOCOL (OBS) --- */}
          <Route path="/widget/:streamKey/:type" element={<WidgetClient />} />

          {/* --- 3. DASHBOARD ENGINE (SUB-ROUTING ENABLED) --- */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard/:tab" 
            element={
              <ProtectedRoute>
                <DashboardPage user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />

          {/* --- 4. SUPER ADMIN HQ CONTROL PANEL (Exclusive Owner Layer) --- */}
          {/* ✅ TERKUNCI MULTI-LAYER: Diproteksi dengan AdminRoute agar hanya diakses oleh email lo, Ri! */}
          <Route 
            path="/pt-owner/audit-center" 
            element={
              <AdminRoute>
                <SuperAdminDashboard />
              </AdminRoute>
            } 
          />

          {/* --- 5. DYNAMIC CREATOR PROFILE (Public) --- */}
          <Route path="/:username" element={<DonationPage />} />
          
          {/* --- 6. 404 REDIRECT FALLBACK --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;