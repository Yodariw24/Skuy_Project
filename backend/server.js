import express from 'express';
import cors from 'cors';
import http from 'http'; 
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io'; 
import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import donationRoutes from './routes/donationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. CONFIG DATABASE (PostgreSQL Railway) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DATABASE CONNECTION ERROR:', err.stack);
  }
  console.log('✅ KONEKSI KE POSTGRESQL RAILWAY BERHASIL!');
  release();
});

// --- 2. MIDDLEWARE & SECURITY (FIXED CORS) ---
// Membersihkan trailing slash dari environment variable secara otomatis
const rawUrl = process.env.FRONTEND_URL || "";
const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-project.vercel.app", 
  "https://skuy-gg.vercel.app", 
  cleanUrl
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Jika origin tidak ada (seperti request server-to-server) atau ada di daftar, izinkan
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Domain diblokir CORS oleh SkuyGG Engine!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Pasang CORS Middleware
app.use(cors(corsOptions));
// WAJIB: Handle preflight untuk semua rute
app.options('*', cors(corsOptions)); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// --- 3. SOCKET.IO SETUP ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  const streamerId = socket.handshake.query.streamerId;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Widget Connected: Streamer ${streamerId}`);
  }
});

app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 4. ROUTES ---
app.get('/', (req, res) => {
  res.json({ 
    status: "online", 
    message: "SkuyGG Engine v4.0 is Gacor! 🚀",
    database: "Connected"
  });
});

app.use('/api/auth', authRoutes); 
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);

// --- 5. ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: 'Ada masalah di server Railway, Ri!' 
  });
});

// --- 6. LISTEN SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
});