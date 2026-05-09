import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. CORS CONFIG ---
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
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); 
  req.db = pool;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use((req, res, next) => { req.io = io; next(); });

// --- 🛡️ 4. API ROUTES (HIERARKI SULTAN) ---

// A. AUTH (Paling Utama)
app.use('/auth', authRoutes);      
app.use('/api/auth', authRoutes);  

// B. RUTE SPESIFIK (HARUS DI ATAS /api/user)
// Biar gak dikira sebagai ID user
app.use('/api/streamers', userRoutes); 
app.use('/api/wallet', userRoutes);

// C. RUTE UMUM
app.use('/user', userRoutes);
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: "online", project: "SkuyGG Engine", version: "2.1.9" });
});

// --- 🕵️ 5. 404 HANDLER (WAJIB PALING BAWAH!) ---
app.use((req, res) => {
  if (!req.url.startsWith('/uploads/')) {
    console.warn(`❌ Nyasar Ri: [${req.method}] ${req.url}`);
  }
  res.status(404).json({
    success: false,
    message: `Rute [${req.method}] ${req.url} Gak Ada di Backend!`
  });
});

// --- 6. ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(`🔥 Engine Error: ${err.message}`);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`🕒 TIMEZONE: ${process.env.TZ}`);
  console.log('-----------------------------------------');
});