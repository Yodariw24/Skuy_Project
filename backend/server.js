import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import helmet from 'helmet';
import 'dotenv/config';

// 🛡️ SYNC 1: Timezone & Paths
process.env.TZ = 'Asia/Jakarta'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Sultan Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';

const { Pool } = pkg;
const app = express();

// --- 1. DATABASE CLOUD CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. SECURITY & CORS PROTOCOL ---
app.use(helmet({
  crossOriginResourcePolicy: false, // Biar avatar user tetap bisa tampil di FE
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Jalur ekspres buat lokal & Vercel
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('CORS Protocol Blocked by SkuyGG Shield!'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. MIDDLEWARE INJECTION (DB & SOCKET) ---
// Static folder buat simpen gambar avatar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: allowedOrigins, credentials: true } 
});

// Inject Pool DB & Socket.io ke setiap request
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  req.db = pool;
  req.io = io;
  next();
});

// --- 🛡️ 4. API ROUTES (HIERARKI SULTAN V2.3.0) ---

// A. AUTH - Jalur Dual-OTP (WA & Email Markas Sultan)
app.use('/api/auth', authRoutes); 
app.use('/auth', authRoutes); 

// B. USER - Jalur Sinkronisasi Profil & No WA
app.use('/api/user', userRoutes);
app.use('/user', userRoutes);
app.use('/api/streamers', userRoutes); 

// C. DONATION - Jalur Cuan & Activity Feed
app.use('/api/donations', donationRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    engine: "SkuyGG Sultan Engine", 
    version: "2.3.0", 
    security: "Dual-OTP Redirect Active",
    markas_pusat: "ariwirayuda24@gmail.com"
  });
});

// --- 🕵️ 5. 404 & ERROR HANDLER ---
app.use((req, res) => {
  if (!req.url.startsWith('/uploads/')) {
    console.warn(`❌ Jalur Ilegal: [${req.method}] ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Rute [${req.method}] ${req.url} tidak terdaftar di SkuyGG Engine!`
  });
});

app.use((err, req, res, next) => {
  console.error(`🔥 Engine Crash: ${err.message}`);
  res.status(err.status || 500).json({ 
    success: false, 
    message: "Engine SkuyGG ngadat, Ri! Cek log Railway secepatnya." 
  });
});

// --- 🚀 6. LAUNCH ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`🕒 ZONE: ${process.env.TZ}`);
  console.log(`🛡️ SECURITY: Dual-OTP Filter Enabled`);
  console.log(`📧 MARKAS: ariwirayuda24@gmail.com`);
  console.log('=========================================');
});