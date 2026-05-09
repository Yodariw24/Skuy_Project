import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG
 * Dibuat Sultan-Proof untuk handle Localhost & Production
 */
const api = axios.create({
  // ✅ FIX: URL Railway udah disesuaikan 100% sama screenshot lo (TANPA STRIP!)
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'https://skuyproject-production.up.railway.app/api', // 👈 PERHATIKAN BARIS INI RI
  
  // WAJIB ADA buat ngirim cookie/session lintas domain (Vercel <-> Railway)
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Nempelkan token JWT otomatis dari localStorage ke setiap request
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
 * Penjaga gerbang kalau token Sultan kadaluwarsa atau server mati
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🛡️ Handle Token Hangus (Sesi Habis)
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Sesi habis, Ri! Otorisasi dicabut, balik ke login dulu.");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      // Tendang balik ke halaman auth biar nggak stuck
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'; 
      }
    }

    // 🕵️ Handle 404 (Salah Jalur / Endpoint Gak Ada)
    if (error.response && error.response.status === 404) {
      console.error(`❌ Error 404 di URL: ${error.config.url} | Cek routes backend lo!`);
    }

    return Promise.reject(error);
  }
);

export default api;