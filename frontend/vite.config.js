// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Membuka akses lokal
    cors: true,      // Mengizinkan OBS mengambil data
    port: 5173,
  }
})