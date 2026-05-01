import { Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import AuthPage from './pages/AuthPage' 
import DashboardPage from './pages/DashboardPage' 
import PaymentPage from './pages/PaymentPage'
import WidgetClient from './pages/WidgetClient'

import 'animate.css';

// --- PERBAIKAN: Logic Protected Route (Railway Sync) ---
const ProtectedRoute = ({ children }) => {
  // Kita sesuaikan dengan key 'token' yang kita pakai di AuthPage.jsx
  const token = localStorage.getItem('token'); 
  
  if (!token) {
    // Kalo user coba akses dashboard tanpa token, tendang ke /auth
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      
      {/* Container utama tanpa overflow hidden agar scrolling tetap smooth */}
      <div className="w-full min-h-screen font-sans antialiased">
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 
          <Route path="/payment/:donationId" element={<PaymentPage />} />

          {/* 2. WIDGET ROUTE (Untuk OBS/Streaming) */}
          <Route path="/v4/widget/:type/:key" element={<WidgetClient />} />

          {/* 3. DASHBOARD ROUTES (PROTECTED) */}
          <Route 
            path="/dashboard/:tab" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/dashboard" 
            element={<Navigate to="/dashboard/wallet" replace />} 
          />
          
          {/* 4. DYNAMIC CREATOR PROFILE (Ditaruh paling bawah agar tidak bentrok) */}
          <Route path="/:username" element={<DonationPage />} />
          
          {/* Fallback kalau user nyasar */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App;