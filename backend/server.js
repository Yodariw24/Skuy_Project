import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import 'dotenv/config';

// 🛡️ FIX 1: Sinkronisasi Waktu Jakarta
process.env.TZ = 'Asia/Jakarta'; 

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- 2. CORS (Tetap Sama) ---
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
      callback(new Error('CORS Policy Blocked!'));
    }
  },
  credentials: true
};

// --- 3. MIDDLEWARE ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); 
  req.db = pool;
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
app.use((req, res, next) => { req.io = io; next(); });

// --- 5. API ROUTES (FIXED FOR FRONTEND) ---

/** * ✅ SOLUSI 404: 
 * Kalau Frontend manggil /auth/google, maka di sini JANGAN pake /api/auth.
 * Kita daftarin dua-duanya biar aman (double layer).
 */
app.use('/auth', authRoutes);      // Buat yang manggil langsung /auth/google
app.use('/api/auth', authRoutes);  // Buat yang manggil pake /api/auth/google

app.use('/user', userRoutes);
app.use('/api/user', userRoutes);

app.use('/donations', donationRoutes);
app.use('/api/donations', donationRoutes);

// Fix rute Wallet & Streamers
app.use('/wallet', userRoutes);
app.use('/api/wallet', userRoutes);
app.use('/streamers', userRoutes);
app.use('/api/streamers', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: "online", project: "SkuyGG Engine", version: "2.1.7" });
});

// --- 6. 404 & ERROR HANDLER (Tetap Sama) ---
app.use((req, res) => {
  if (!req.url.startsWith('/uploads/http')) {
    console.warn(`🕵️ Sultan nyasar ke: [${req.method}] ${req.url}`);
  }
  res.status(404).json({ success: false, message: `Rute [${req.method}] ${req.url} Gak Ada, Ri!` });
});

app.use((err, req, res, next) => {
  console.error(`🔥 Engine Error: ${err.message}`);
  res.status(err.status || 500).json({ success: false, message: err.message });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SKUYY.GG RUNNING ON PORT ${PORT}`);
});