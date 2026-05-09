import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG v2.3
 * Dibuat Sultan-Proof untuk koneksi Vercel <-> Railway
 */
const api = axios.create({
  // ✅ SMART LOGIC: Deteksi apakah VITE_API_URL sudah mengandung /api atau belum
  baseURL: (() => {
    const rawUrl = import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app';
    const cleanUrl = rawUrl.replace(/\/$/, ""); // Buang slash di akhir
    return cleanUrl.includes('/api') ? cleanUrl : `${cleanUrl}/api`;
  })(),
  
  withCredentials: true, 
  timeout: 15000, // ✅ Naik ke 15 detik, kasih napas buat cold-start Railway
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Security Shield: Nempelkan Token & Handle Multipart
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ TRICK SULTAN: Handle upload foto agar browser set boundary secara otomatis
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * INTERCEPTOR RESPONSE
 * Emergency Protocol: Handle Auto-Logout & Logging
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // 🛡️ 1. PROTOKOL 401: Sesi Sultan Berakhir
    if (response && response.status === 401) {
      console.warn("⚠️ Access Denied: Sesi expired atau Token Ilegal!");
      
      // Bersihkan markas lokal
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      // Tendang ke pintu masuk jika bukan di halaman auth
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'; 
      }
    }

    // 🕵️ 2. PROTOKOL 404: Node Tidak Ditemukan
    if (response && response.status === 404) {
      console.error(`❌ Jalur Putus: [${config.method.toUpperCase()}] ${config.url}`);
      console.info(`Ri, cek lagi rute di backend/server.js, pastikan sudah di-mount!`);
    }

    // ⚡ 3. PROTOKOL TIMEOUT
    if (error.code === 'ECONNABORTED') {
      console.error("🚀 Railway Node RTO: Server kelamaan bales, Ri!");
    }

    return Promise.reject(error);
  }
);

export default api;