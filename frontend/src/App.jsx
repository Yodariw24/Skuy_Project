import { Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import AuthPage from './pages/AuthPage' 
import DashboardPage from './pages/DashboardPage' 
import PaymentPage from './pages/PaymentPage'
import WidgetClient from './pages/WidgetClient'

import 'animate.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('user_token');
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      {/* DIBERSIHKAN: 
          - Hapus bg-white agar warna asli Landing Page tidak tertutup
          - Hapus min-h-screen dan text-left yang bikin scroll terkunci
      */}
      <div className="w-full font-sans antialiased">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} /> 

          <Route path="/payment/:donationId" element={<PaymentPage />} />

          {/* --- WIDGET ROUTE (PUBLIC) --- */}
          <Route path="/v4/widget/:type/:key" element={<WidgetClient />} />

          {/* --- DASHBOARD ROUTING --- */}
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
          
          {/* Rute dinamis untuk halaman donasi streamer */}
          <Route path="/:username" element={<DonationPage />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App;