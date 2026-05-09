import axios from 'axios';

/**
 * KONFIGURASI AXIOS SKUY.GG v2.4 🛡️
 * Anti-Illegal Path Protocol
 */
const api = axios.create({
  // ✅ FIX FINAL: Hard-clean URL untuk basmi /api/api/
  baseURL: (() => {
    const rawUrl = import.meta.env.VITE_API_URL || 'https://skuyproject-production.up.railway.app';
    
    // Protokol Pembersihan:
    // 1. Buang slash di ujung (/)
    // 2. Buang tulisan /api di ujung (biar bersih total)
    const base = rawUrl.replace(/\/$/, "").replace(/\/api$/, "");
    
    console.log("🚀 Sultan Bridge Connected to:", `${base}/api`);
    return `${base}/api`;
  })(),
  
  withCredentials: true, 
  timeout: 15000,
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
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth'; 
      }
    }

    // 🕵️ 2. PROTOKOL 404: Basmi Double Prefix
    if (response && response.status === 404) {
      console.error(`❌ Jalur Putus: [${config.method.toUpperCase()}] ${config.url}`);
      if (config.url.includes('/api/api')) {
        console.warn("🚨 DETEKSI DOUBLE API! Ri, jangan tulis /api lagi di pemanggilan fungsi!");
      }
    }

    return Promise.reject(error);
  }
);

export default api;