import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG
 * Dibuat Sultan-Proof untuk handle Localhost & Production
 */
const api = axios.create({
  // ✅ FIX: Memastikan baseURL selalu bersih, tanpa double slash di tengah atau akhir
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'https://skuyproject-production.up.railway.app/api', 
  
  withCredentials: true, 
  timeout: 10000, // ✅ Tambahin timeout 10 detik biar gak gampang RTO pas Railway lagi booting
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Nempelkan Token & Handle FormData
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ TRICK SULTAN: Jika kirim foto, biarkan browser set boundary-nya sendiri
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR RESPONSE
 * Handle 401 (Logout) & 404 (Nyasar)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // 🛡️ 1. Handle Sesi Habis
    if (response && response.status === 401) {
      console.warn("⚠️ Otorisasi dicabut atau sesi habis!");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth'; 
      }
    }

    // 🕵️ 2. Handle Rute Nyasar (Biar ketauan typo-nya di mana)
    if (response && response.status === 404) {
      console.error(`❌ API Nyasar: [${config.method.toUpperCase()}] ${config.url}`);
      console.error(`Cek apakah di Backend sudah ada rute tersebut, Ri!`);
    }

    return Promise.reject(error);
  }
);

export default api;