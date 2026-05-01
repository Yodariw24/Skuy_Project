import axios from 'axios';

// Membuat instance axios dengan konfigurasi pusat
const api = axios.create({
  // Menentukan baseURL secara dinamis (Vercel vs Localhost)
  baseURL: import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api` 
    : 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * INTERCEPTOR REQUEST
 * Berfungsi untuk menempelkan token JWT secara otomatis 
 * di setiap request yang membutuhkan otorisasi.
 */
api.interceptors.request.use(
  (config) => {
    // Mengambil token dengan key 'user_token' sesuai standar TipFlow
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
 * INTERCEPTOR RESPONSE (Tambahan biar Sultan!)
 * Membantu menangani error 401 (Unauthorized) secara global
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika token kadaluarsa atau tidak valid, paksa logout
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;