import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Membuka akses lokal agar widget OBS bisa nembak langsung
    cors: true,      // Mengizinkan OBS Browser Source mengambil data overlay tanpa blokir
    port: 5173,
  },
  clearScreen: false, // 🛡️ DETEKTIF DARURAT: Mencegah Vite menghapus baris log eror pasca-kompilasi gantung
  build: {
    sourcemap: true,   // 🚀 PAKSA ROLLUP: Melacak silsilah file dan baris yang rusak secara transparan di Vercel
    minify: false,     // Matikan pengecilan kode sebentar agar nama fungsi aslinya gak berubah jadi huruf acak
  }
})