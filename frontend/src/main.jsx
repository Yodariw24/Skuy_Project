import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import './index.css';

/**
 * --- HELPER: SCROLL TO TOP PROTOCOL ---
 * Memastikan setiap kali penonton / donatur bergeser rute halaman, 
 * viewport scroll otomatis dikembalikan murni ke koordinat puncak (0,0)
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Kebal dari lag transisi, paksa ke atas secepat kilat
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// --- RENDER BOOTSTRAP GATEWAY ---
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Inject protokol scroll tepat di dalam konteks jaringan router */}
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);