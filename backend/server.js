import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import helmet from 'helmet';
import 'dotenv/config';

// --- 🛡️ SYNC 1: Timezone & Paths ---
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
  crossOriginResourcePolicy: false, // Penting: Biar file uploads tampil di frontend/Vercel
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan akses tanpa origin (misal mobile) atau dari domain Vercel lo
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

// --- 3. STATIC FILES & SOCKET.IO ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*", credentials: true } 
});

io.on('connection', (socket) => {
  const streamerId = socket.handshake.query.streamerId;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Node OBS Linked: Streamer ID ${streamerId}`);
  }
});

// Inject DB & IO & Security Header
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  req.db = pool;
  req.io = io;
  next();
});

// --- 🛡️ 4. API ROUTES (ULTIMATE PREFIX SYNC) ---

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes); 
apiRouter.use('/donations', donationRoutes);

/**
 * ✅ SOLUSI MULTI-PATH SULTAN:
 * Kita pasang userRoutes di dua tempat sekaligus:
 * 1. Di root ('/') supaya /api/wallet/history/:id nembak kesini (Fix Error 404 lo).
 * 2. Di '/user' supaya rute /api/user/update-profile lo gak patah.
 */
apiRouter.use('/', userRoutes); 
apiRouter.use('/user', userRoutes);

// Daftarkan semua rute di bawah prefix /api
app.use('/api', apiRouter);

// Jalur Non-API (Cek Health Server)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    engine: "SkuyGG Sultan Engine", 
    version: "3.0.5", 
    security: "Multi-Prefix Path Synchronized",
    markas: "ariwirayuda24@gmail.com"
  });
});

// --- 🕵️ 5. 404 & ERROR HANDLER ---
app.use((req, res) => {
  if (req.url !== '/favicon.ico' && !req.url.startsWith('/uploads/')) {
    console.warn(`⚠️ Jalur Tidak Terdaftar: [${req.method}] ${req.url}`);
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
  console.log(`🛡️ SECURITY: Prefix /api Multi-Sync Active`);
  console.log(`📧 MARKAS: ariwirayuda24@gmail.com`);
  console.log('=========================================');
});