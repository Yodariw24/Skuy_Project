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
import streamerRoutes from './routes/userRoutes.js'; 
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

pool.on('error', (err) => {
  console.error('🔥 PostgreSQL Pool Error:', err.message);
});

// --- 2. CORS CONFIGURATION (SINKRON PORT 8080 & 5173) ---
const allowedOrigins = [
  "http://localhost:5173",          // Port Frontend (Vite)
  "http://localhost:8080",          // Port Backend lo
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

if (process.env.FRONTEND_URL) {
  const cleanEnvUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
  if (!allowedOrigins.includes(cleanEnvUrl)) {
    allowedOrigins.push(cleanEnvUrl);
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS Blocked for: ${origin}`);
      callback(new Error('Domain tidak diizinkan oleh kebijakan CORS SkuyGG!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware Global
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware Static untuk file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Custom Middleware untuk Inject Database & Socket.io
const injectContext = (req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
};

// --- 3. SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  const { streamerId } = socket.handshake.query;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Widget Connected: Streamer ID ${streamerId}`);
  }
  
  socket.on('disconnect', () => {
    console.log('🔌 Socket Disconnected');
  });
});

// --- 4. API ROUTES ---
app.use(injectContext); 

// Rute Utama
app.use('/api/auth', authRoutes);
app.use('/api/streamers', streamerRoutes); 
app.use('/api/donations', donationRoutes);

// Fix Route Dashboard
app.use('/api/user', streamerRoutes); 
app.use('/api/wallet', streamerRoutes); 

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    project: "TipFlow Engine",
    db_status: "Connected"
  });
});

// --- 5. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`🔥 [SERVER ERROR ${statusCode}]:`, err.message);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Kesalahan internal server Railway.',
    error_code: statusCode
  });
});

// --- 6. SERVER START (PORT 8080) ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 TIPFLOW ENGINE IS RUNNING ON PORT ${PORT}`);
  console.log('-----------------------------------------');
});