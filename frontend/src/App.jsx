import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import AuthPage from './pages/AuthPage'; 
import DashboardPage from './pages/DashboardPage'; 
import PaymentPage from './pages/PaymentPage';
import WidgetClient from './pages/WidgetClient';
import api from './api/axios';

import 'animate.css';

// --- 1. LOGIC PROTECTED ROUTE (Sultan Guard) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token'); 
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SYNC USER: Ambil data Sultan terbaru dari Cloud Railway
  const syncUser = useCallback(async () => {
    const token = localStorage.getItem('user_token');
    if (!token) {
      setIsSyncing(false);
      return;
    }

    try {
      const res = await api.get('/user/dashboard-sync');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("🛡️ Shield Broken: Sesi Gagal Sinkron.");
      if (err.response?.status === 401) {
        localStorage.clear();
        if (!location.pathname.includes('/auth')) navigate('/auth');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    syncUser();
  }, [syncUser]);

  // Loading Screen pas booting biar gak flicker
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

          {/* --- 2. SULTAN OVERLAY PROTOCOL (OBS) --- */}
          <Route path="/widget/:streamKey/:type" element={<WidgetClient />} />

          {/* --- 3. DASHBOARD ENGINE (SUB-ROUTING ENABLED) --- */}
          {/* Jalur Utama Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />
          
          {/* ✅ FIX POINT 1: Jalur Sub-Tab (Tip Alert, Milestone, dll) */}
          {/* Parameter :tab akan dikirim ke DashboardPage */}
          <Route 
            path="/dashboard/:tab" 
            element={
              <ProtectedRoute>
                <DashboardPage user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />

          {/* --- 4. DYNAMIC CREATOR PROFILE (Public) --- */}
          <Route path="/:username" element={<DonationPage />} />
          
          {/* --- 5. 404 REDIRECT --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;