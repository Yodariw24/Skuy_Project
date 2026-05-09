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

// --- 🛡️ 4. API ROUTES (SYNCED WITH FRONTEND) ---

// ✅ SOLUSI SULTAN: Gunakan Router khusus untuk prefix /api
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes); 
apiRouter.use('/user', userRoutes);
apiRouter.use('/donations', donationRoutes);

// Pasang rute utama ke /api
app.use('/api', apiRouter);

// Jalur Non-API (Cek Health Server)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    engine: "SkuyGG Sultan Engine", 
    version: "3.0.1", 
    security: "Prefix Sync Active",
    markas: "ariwirayuda24@gmail.com"
  });
});

// --- 🕵️ 5. 404 & ERROR HANDLER ---
// Penanganan rute yang benar-benar tidak ada
app.use((req, res) => {
  // Hanya log peringatan jika bukan favicon atau rute uploads
  if (req.url !== '/favicon.ico' && !req.url.startsWith('/uploads/')) {
    console.warn(`⚠️ Jalur Tidak Terdaftar: [${req.method}] ${req.url}`);
  }

  res.status(404).json({
    success: false,
    message: `Node [${req.url}] tidak ditemukan di SkuyGG Engine!`
  });
});

// Penanganan Internal Server Error
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
  console.log(`🛡️ SECURITY: Prefix /api Sync Enabled`);
  console.log(`📧 MARKAS: ariwirayuda24@gmail.com`);
  console.log('=========================================');
});