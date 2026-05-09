import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG
 * Dibuat Sultan-Proof untuk handle Localhost & Production
 */
const api = axios.create({
  // ✅ FIX LOGIC: Pastiin baseURL bersih dan mengarah ke endpoint Railway lo
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'https://skuy-project-backend-production.up.railway.app/api', 
  
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Nempelkan token JWT otomatis dari localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR RESPONSE
 * Handle error 401 dan 404 agar log-nya lebih informatif buat Sultan
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🛡️ Handle Token Hangus
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Sesi habis, Ri! Balik ke login dulu.");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'; // ✅ Sesuaikan dengan rute lo '/auth'
      }
    }

    // 🕵️ Handle 404 (Biar lo tau kalau endpoint-nya emang gak ada)
    if (error.response && error.response.status === 404) {
      console.error("❌ Error 404: Endpoint gak ketemu. Cek routes di backend!");
    }

    return Promise.reject(error);
  }
);

export default api;