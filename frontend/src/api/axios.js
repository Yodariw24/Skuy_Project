import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG v2.7 🛡️
 * Anti-Illegal Path & Auto-Sanitize Protocol
 * RE-CALIBRATED BY: ARI WIRAYUDA (FINAL STERILE PRODUCTION EDITION)
 */
const api = axios.create({
  baseURL: (() => {
    // 1. Ambil URL mentah dari ENV atau fallback ke Railway
    const rawUrl = import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app';
    
    // 2. Protokol Pembersihan Sultan:
    // Hapus slash di akhir dan tulisan /api (jika ada) agar tidak double prefix
    const cleanBase = rawUrl.trim().replace(/\/$/, "").replace(/\/api$/, "");
    
    const finalURL = `${cleanBase}/api`;
    
    console.log("%c🚀 Sultan Bridge Initialized:", "color: #7C3AED; font-weight: bold;", finalURL);
    return finalURL;
  })(),
  
  withCredentials: true, 
  timeout: 20000, 
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
    // 🛡️ 1. Basmi Double Prefix & Double Slash
    if (config.url) {
      config.url = config.url.trim();

      // Jika user ngetik "/api/user" atau "api/user", bersihkan jadi "/user"
      if (config.url.startsWith('/api')) {
        config.url = config.url.replace(/^\/api/, '');
      } else if (config.url.startsWith('api')) {
        config.url = config.url.replace(/^api/, '');
      }
      
      // Pastikan url dijamin dimulai dengan tepat satu slash "/"
      if (!config.url.startsWith('/')) {
        config.url = `/${config.url}`;
      }

      // Bersihkan jika ada double slash berulang di tengah path akibat salah ketik (e.g., /user//bank)
      config.url = config.url.replace(/\/+/g, '/');
    }

    // 🛡️ 2. Sultan Token Injection
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🛡️ 3. Multipart / Form Data Handling (Auto-Detect Upload Avatar)
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
  (res) => res,
  (error) => {
    const errRes = error.response;
    const errConfig = error.config;

    // 🚨 1. EMERGENCY 401: Sesi Sultan Kadaluarsa / Token Ilegal
    if (errRes && errRes.status === 401) {
      console.error("⛔ Sesi Ilegal/Expired. Melakukan Force Sign-Out...");
      localStorage.clear(); 
      
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'; 
      }
    }

    // 🚨 2. DETEKSI JALUR ILEGAL / PUTUS (404)
    if (errRes && errRes.status === 404) {
      console.group("%c🕵️ Jalur Putus (404)", "color: red; font-weight: bold;");
      console.error(`Method: [${errConfig.method?.toUpperCase()}]`);
      console.error(`Endpoint: ${errConfig.url}`);
      console.error(`Full Request URL: ${errConfig.baseURL}${errConfig.url}`);
      console.warn("Saran Ri: Cek rute di app.js Backend atau hapus '/api' di pemanggilan fungsi Frontend.");
      console.groupEnd();
    }

    return Promise.reject(error);
  }
);

export default api;