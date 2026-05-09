import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import pkg from 'pg';
import 'dotenv/config';

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

// --- 3. MIDDLEWARE STACK (URUTAN WAJIB!) ---

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

// ✅ FIX 1: JSON Parser HARUS di atas semua rute API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless'); 
  // ✅ FIX 2: Inject DB ke req sebelum masuk ke rute
  req.db = pool;
  next();
});

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

// --- 5. API ROUTES (Hierarchy Fix) ---

// Path Utama Ri!
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/streamers', userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    project: "SkuyGG Engine",
    version: "2.1.4-Ultra-Fix"
  });
});

// --- 6. 404 HANDLER ---
app.use((req, res) => {
  // Log ini buat kita mantau di Railway rute apa yang dipanggil
  console.warn(`🕵️ Sultan nyasar ke: [${req.method}] ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Rute [${req.method}] ${req.url} Gak Ada di Backend Railway, Ri!`
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
  console.log('-----------------------------------------');
});