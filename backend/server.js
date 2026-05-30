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
// ✅ FIX BUSTING COOP: Mengkalibrasi ulang tameng Helmet agar meloloskan window popups Google OAuth
// Langkah ini melenyapkan eror "would block the window.postMessage call" di konsol browser lo, Ri!
app.use(helmet({
  crossOriginResourcePolicy: false, // Biar file uploads tampil lancar di overlay Vercel
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } // ✅ Pintu gerbang Google Sign-In dibuka aman
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

// Helper Checker Dinamis biar reusable untuk Express & Socket.io
const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = origin.replace(/\/$/, "");
  return allowedOrigins.includes(cleanOrigin) || cleanOrigin.endsWith(".vercel.app");
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
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

// ✅ FIXED DYNAMIC CORS SOCKET.IO CONFIG: 
const io = new Server(server, { 
  cors: { 
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS Socket Blocked by SkuyGG Shield!'));
      }
    },
    credentials: true 
  },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  const streamerId = socket.handshake.query.streamerId;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Node OBS Linked: Streamer ID ${streamerId}`);
    
    socket.on('disconnect', () => {
      console.log(`🔌 Node OBS Unlinked: Streamer ID ${streamerId}`);
    });
  }
});

// Inject DB, IO Instance, & Global Security Header
app.use((req, res, next) => {
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
 */
apiRouter.use('/', userRoutes); 
apiRouter.use('/user', userRoutes);

// ⚡ DOUBLE GATEWAY EDGE: Backend menerima jalur dengan /api maupun kosongan
app.use('/api', apiRouter); 
app.use('/', apiRouter);    

// ⚡ HEALTH CHECK SERVER JALUR NON-API
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    engine: "SkuyGG Sultan Engine", 
    version: "3.0.5", 
    security: "Multi-Prefix Path Synchronized",
    markas: "ariwirayuda24@gmail.com"
  });
});

// --- 🕵️ 5. 404 & ERROR HANDLING PIPELINE ---

app.use('/api', (req, res) => {
  res.status(200).json({
    success: false,
    message: "Sinyal Sultan terdeteksi polosan di node /api. Silakan cek pemanggilan parameter ID/Username di Frontend lo, Ri!",
    donations: [],
    history: []
  });
});

// Catch-All Sisa Jalur yang Memang Tidak Terdaftar
app.use((req, res) => {
  if (req.url !== '/favicon.ico' && !req.url.startsWith('/uploads/')) {
    console.warn(`⚠️ Jalur Tidak Terdaftar: [${req.method}] ${req.url}`);
  }

  res.status(404).json({
    success: false,
    message: `Node [${req.url}] tidak ditemukan di SkuyGG Engine!`
  });
});

// Global Crash Recovery Layer
app.use((err, req, res, next) => {
  console.error(`🔥 Engine Crash: ${err.message}`);
  res.status(err.status || 500).json({ 
    success: false, 
    message: "Engine SkuyGG ngadat! Cek log Railway secepatnya." 
  });
});

// --- 🚀 6. LAUNCH ENGINE ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`🕒 ZONE: ${process.env.TZ}`);
  console.log(`🛡️ SECURITY: Prefix /api Multi-Sync Active`);
  console.log(`📧 MARKAS: ariwirayuda24@gmail.com`);
  console.log('=========================================');
});