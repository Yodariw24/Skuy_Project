import { Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import HomePage from './pages/HomePage'
import DonationPage from './pages/DonationPage'
import AuthPage from './pages/AuthPage' 
import DashboardPage from './pages/DashboardPage' 
import PaymentPage from './pages/PaymentPage'
import WidgetClient from './pages/WidgetClient'

import 'animate.css';

// --- PERBAIKAN 1: Logic Protected Route ---
const ProtectedRoute = ({ children }) => {
  // Pastikan key-nya sama dengan yang kamu simpan saat login di AuthPage.jsx
  // Biasanya Supabase menyimpan session di localStorage dengan format tertentu
  const token = localStorage.getItem('user_token'); 
  
  if (!token) {
    // Kalau tidak ada token, lempar ke login
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    // Pastikan Client ID Google ini sudah didaftarkan juga URL Vercel-nya di Google Console
    <GoogleOAuthProvider clientId="195922640796-u1uucrttadnkjshpvn009lredf9bqoro.apps.googleusercontent.com">
      
      {/* PERBAIKAN 2: 
          Tambahkan min-h-screen kembali tapi tanpa overflow hidden 
          agar background warna tidak terpotong saat konten sedikit.
      */}
      <div className="w-full min-h-screen font-sans antialiased">
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
          
          {/* PERBAIKAN 3: Rute dinamis 
              Hati-hati rute ini (/:username) bisa "memakan" rute lain.
              Pastikan rute ini ditaruh paling bawah.
          */}
          <Route path="/:username" element={<DonationPage />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  )
}

export default App;