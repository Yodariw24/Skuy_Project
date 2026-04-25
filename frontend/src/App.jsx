import { Routes, Route, Navigate } from 'react-router-dom'
// IMPORT PROVIDER GOOGLE
import { GoogleOAuthProvider } from '@react-oauth/google'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import AuthPage from './pages/AuthPage' 
import DashboardPage from './pages/DashboardPage' 
import PaymentPage from './pages/PaymentPage'

// --- PENTING: IMPORT ANIMASI DISINI AGAR POPUP SKUY GACOR ---
import 'animate.css';

// Komponen Pembatas (Hanya yang login bisa lewat)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token');
  if (!token) {
    // Jika tidak ada token, tendang ke halaman login
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    // BUNGKUS SEMUA DISINI BIAR GOOGLE LOGIN JALAN
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      <div className="min-h-screen bg-white">
        <Routes>
          {/* 1. Route Statis */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 

          {/* 2. Route yang butuh ID Spesifik */}
          <Route path="/payment/:donationId" element={<PaymentPage />} />

          {/* 3. Route Dashboard (Diproteksi) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* 4. Route Dinamis (Username Kreator) */}
          <Route path="/:username" element={<DonationPage />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App;