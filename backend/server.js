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

// --- 2. MIDDLEWARE & SECURITY (ULTIMATE CORS FIX) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-project.vercel.app", 
  "https://skuy-gg.vercel.app"
];

// Otomatis hapus slash di akhir FRONTEND_URL dari environment
const envUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "";
if (envUrl) allowedOrigins.push(envUrl);

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan jika tanpa origin (seperti Postman) atau jika ada di daftar allowed
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.log("CORS Terblokir untuk origin:", origin);
      callback(new Error('Domain diblokir CORS SkuyGG!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// PAKSA respon Preflight (OPTIONS) agar tidak ditimpa header internal Railway
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin?.replace(/\/$/, ""))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(204);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Header Security untuk Google Auth
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

// Inject DB & IO ke Request
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