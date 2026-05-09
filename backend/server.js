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
  crossOriginResourcePolicy: false, // Penting: Biar gambar dari uploads bisa tampil di Vercel
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan jika origin terdaftar atau merupakan subdomain vercel
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*", credentials: true } // OBS kadang rewel, kita buka buat signal socket
});

// Logic Socket Connection (Optional Log)
io.on('connection', (socket) => {
  const streamerId = socket.handshake.query.streamerId;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Node OBS Linked: Streamer ID ${streamerId}`);
  }
});

// Inject DB & IO ke Object Request
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  req.db = pool;
  req.io = io;
  next();
});

// --- 🛡️ 4. API ROUTES (HIERARKI SULTAN V2.3.0) ---

// Jalur Utama: Auth, User, & Donation
app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);

// Fallback legacy routes (opsional jika frontend lama belum update)
app.use('/auth', authRoutes); 
app.use('/user', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    engine: "SkuyGG Sultan Engine", 
    version: "2.3.0", 
    security: "Dual-OTP Redirect Active",
    markas: "ariwirayuda24@gmail.com"
  });
});

// --- 🕵️ 5. 404 & ERROR HANDLER ---
app.use((req, res) => {
  if (!req.url.startsWith('/uploads/')) {
    console.warn(`❌ Jalur Ilegal: [${req.method}] ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Node [${req.url}] tidak ditemukan di SkuyGG Engine!`
  });
});

app.use((err, req, res, next) => {
  console.error(`🔥 Engine Crash: ${err.message}`);
  res.status(err.status || 500).json({ 
    success: false, 
    message: "Engine SkuyGG ngadat! Cek log Railway secepatnya." 
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