import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG v2.5 🛡️
 * Anti-Illegal Path & Auto-Sanitize Protocol
 */
const api = axios.create({
  baseURL: (() => {
    // 1. Ambil URL mentah dari ENV atau fallback ke Railway
    const rawUrl = import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app';
    
    // 2. Protokol Pembersihan Sultan:
    // Hapus slash di akhir, hapus /api di akhir (biar konsisten)
    const cleanBase = rawUrl.replace(/\/$/, "").replace(/\/api$/, "");
    
    const finalURL = `${cleanBase}/api`;
    
    console.log("%c🚀 Sultan Bridge Initialized:", "color: #7C3AED; font-weight: bold;", finalURL);
    return finalURL;
  })(),
  
  withCredentials: true, 
  timeout: 20000, // Gue naikin dikit biar gak gampang timeout pas network bapuk
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Security Shield: Token Injection & URL Sanitize
 */
api.interceptors.request.use(
  (config) => {
    // 🛡️ 1. Basmi Double Prefix Secara Paksa sebelum Request terkirim
    // Kalau lo nggak sengaja ngetik api.get('/api/user'), ini bakal benerin jadi api.get('/user')
    if (config.url.startsWith('/api')) {
      config.url = config.url.replace('/api', '');
    }

    // 🛡️ 2. Sultan Token Injection
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🛡️ 3. Multipart / Form Data Handling
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR RESPONSE
 * Emergency Protocol: Auto-Logout & Clean Logging
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // 🚨 1. EMERGENCY 401: Sesi Sultan Kadaluarsa / Token Ilegal
    if (response && response.status === 401) {
      console.error("⛔ Sesi Ilegal/Expired. Melakukan Force Sign-Out...");
      localStorage.clear(); // Bersihin semua biar gak sisa sampah session
      
      // Jangan redirect kalau emang lagi di halaman auth
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'; 
      }
    }

    // 🚨 2. DETEKSI JALUR ILEGAL (404)
    if (response && response.status === 404) {
      console.group("🕵️ Jalur Putus (404)");
      console.error(`Method: [${config.method.toUpperCase()}]`);
      console.error(`Full URL: ${config.baseURL}${config.url}`);
      console.warn("Saran Ri: Cek rute di Backend (Express) atau hapus '/api' di pemanggilan fungsi.");
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

export default api;