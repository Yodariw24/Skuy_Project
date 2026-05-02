import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import HomePage from './pages/HomePage';
import DonationPage from './pages/DonationPage';
import AuthPage from './pages/AuthPage'; 
import DashboardPage from './pages/DashboardPage'; 
import PaymentPage from './pages/PaymentPage';
import WidgetClient from './pages/WidgetClient';
import axios from 'axios'; // Pastikan axios sudah terinstall

import 'animate.css';

// --- 1. LOGIC PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token'); 
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ PERBAIKAN VITAL: Sinkronisasi State User
  useEffect(() => {
    const syncUser = async () => {
      const token = localStorage.getItem('user_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Ambil data terbaru dari backend (menggunakan route dashboard-sync yang kita buat tadi)
          const res = await axios.get(`https://skuyproject-production.up.railway.app/api/user/dashboard-sync?userId=${parsedUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.data.success) {
            // Update state dan storage dengan data terbaru (termasuk ROLE 'creator')
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error("Gagal sinkronisasi user, Ri:", err.message);
          // Kalau token expired, paksa logout
          if (err.response?.status === 401) {
            localStorage.clear();
            navigate('/auth');
          }
        }
      }
    };

    syncUser();
  }, [navigate]);

  return (
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      <div className="w-full min-h-screen font-sans antialiased">
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 
          <Route path="/payment/:donationId" element={<PaymentPage />} />

          {/* 2. WIDGET ROUTE */}
          <Route path="/v4/widget/:type/:key" element={<WidgetClient />} />

          {/* 3. DASHBOARD ROUTES (PROTECTED) */}
          <Route 
            path="/dashboard/:tab" 
            element={
              <ProtectedRoute>
                {/* ✅ Kirim data 'user' terbaru ke DashboardPage */}
                <DashboardPage user={user} setUser={setUser} />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard" 
            element={<Navigate to="/dashboard/wallet" replace />} 
          />
          
          {/* 4. DYNAMIC CREATOR PROFILE */}
          <Route path="/:username" element={<DonationPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;