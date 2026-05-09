import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import 'dotenv/config';

// 🛡️ FIX NOMOR 1: Paksa server menggunakan waktu Jakarta (WIB) agar sinkron sama HP
process.env.TZ = 'Asia/Jakarta'; 

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. DATABASE CONFIGURATION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. DYNAMIC CORS PROTOCOL ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.error(`🚫 CORS Blocked: ${origin}`);
      callback(new Error('CORS Policy Blocked by SkuyGG Engine!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// --- 3. MIDDLEWARE STACK ---
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  // ✅ FIX COOP: Settingan paling aman buat Google Auth
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); 
  
  // ✅ Inject DB ke req
  req.db = pool;
  next();
});

// Akses Folder Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, { 
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- 5. API ROUTES (Clean Hierarchy) ---

// Path Utama
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);

// ✅ FIX RUTE KHUSUS (Pindah ke userRoutes semua biar konsisten)
app.use('/api/wallet', userRoutes); 
app.use('/api/streamers', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    project: "SkuyGG Engine",
    version: "2.1.6-Sultan-Time-Sync"
  });
});

// --- 6. 404 HANDLER ---
app.use((req, res) => {
  // ✅ Filter biar log uploads gak menuhin console kalau link Google nyasar
  if (!req.url.startsWith('/uploads/http')) {
    console.warn(`🕵️ Sultan nyasar ke: [${req.method}] ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Rute [${req.method}] ${req.url} Gak Ada, Ri!`
  });
});

// --- 7. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(`🔥 Engine Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// --- 8. SERVER START ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`🕒 CURRENT TIMEZONE: ${process.env.TZ}`);
  console.log('-----------------------------------------');
});