import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import helmet from 'helmet'; // 🛡️ Keamanan Tambahan
import 'dotenv/config';

// 🛡️ FIX 1: Sinkronisasi Waktu
process.env.TZ = 'Asia/Jakarta'; 

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. DATABASE CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. SECURITY & CORS ---
app.use(helmet({
  crossOriginResourcePolicy: false, // Biar gambar di /uploads tetep bisa diakses frontend
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Blocked!'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. MIDDLEWARE STACK ---
app.use((req, res, next) => {
  // Header khusus buat Google Auth & Popup
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  req.db = pool; // Inject pool ke setiap request
  next();
});

// Static folder untuk avatar/gambar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: allowedOrigins, credentials: true } 
});

// Inject Socket.io ke request
app.use((req, res, next) => { 
  req.io = io; 
  next(); 
});

// --- 🛡️ 4. API ROUTES (HIERARKI SULTAN) ---

// A. AUTH (Pusat Keamanan: Resend API & Fonnte)
app.use('/api/auth', authRoutes); 
app.use('/auth', authRoutes); // Fallback buat rute lama

// B. RUTE SPESIFIK (Mencegah salah baca ID User)
app.use('/api/streamers', userRoutes); 
app.use('/api/wallet', userRoutes);

// C. RUTE UMUM
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    project: "SkuyGG Engine", 
    version: "2.2.0", // Update versi Sultan
    engine: "Resend-API Ready" 
  });
});

// --- 🕵️ 5. 404 HANDLER (ANTI NYASAR) ---
app.use((req, res) => {
  if (!req.url.startsWith('/uploads/')) {
    console.warn(`❌ Nyasar Ri: [${req.method}] ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Rute [${req.method}] ${req.url} Gak Ada di SkuyGG Engine!`
  });
});

// --- 6. ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(`🔥 Engine Error: ${err.message}`);
  res.status(err.status || 500).json({ 
    success: false, 
    message: "Terjadi gangguan pada engine SkuyGG!" 
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`🕒 TIMEZONE: ${process.env.TZ}`);
  console.log(`🛡️ SECURITY: Helmet Enabled`);
  console.log('-----------------------------------------');
});