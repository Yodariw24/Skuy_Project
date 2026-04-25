import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Alamat backend kamu
  headers: {
    'Content-Type': 'application/json'
  }
});

// Otomatis kirim token kalau user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;