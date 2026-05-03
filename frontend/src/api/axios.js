import axios from 'axios';

/**
 * KONFIGURASI AXIOS TIPFLOW
 * Dibuat fleksibel untuk handle Localhost & Production (Railway)
 */
const api = axios.create({
  // Menentukan baseURL secara dinamis
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'http://localhost:8080/api', 
  
  // WAJIB: Agar cookie/header otorisasi bisa lewat antar domain (Vercel <-> Railway)
  withCredentials: true, 
  
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Menempelkan token JWT secara otomatis dari localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR RESPONSE
 * Menangani error 401 (Unauthorized) agar user otomatis login ulang jika token mati
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika server kirim 401, artinya token lo udah hangus
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Sesi habis, mengarahkan ke login...");
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      
      // Mencegah redirect loop jika sudah di halaman login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;