import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG
 * Dibuat Sultan-Proof untuk handle Localhost & Production
 */
const api = axios.create({
  // ✅ Menghindari double slash dan memastikan '/api' nempel dengan benar
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'https://skuyproject-production.up.railway.app/api', 
  
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ TRICK SULTAN: Jika yang dikirim adalah FormData (buat upload foto), 
    // hapus Content-Type manual agar browser yang nentuin boundary-nya secara otomatis.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR RESPONSE
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🛡️ Handle Token Hangus (Sesi Habis)
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Sesi habis, Ri! Otorisasi dicabut.");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'; 
      }
    }

    // 🕵️ Handle 404
    if (error.response && error.response.status === 404) {
      // Log detail rute mana yang nyasar biar gampang tracing-nya
      console.error(`❌ Error 404: Endpoint ${error.config.url} tidak ditemukan di Railway!`);
    }

    return Promise.reject(error);
  }
);

export default api;