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

// --- 2. CORS CONFIGURATION (FIXED FOR VERCEL PREVIEW) ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan jika: 
    // 1. Tidak ada origin (server-to-server)
    // 2. Origin ada di whitelist
    // 3. Origin berasal dari domain vercel.app (untuk handle URL preview lo)
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.includes(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Blocked!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle Preflight semua rute

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. SOCKET.IO SETUP ---
const server = http.createServer(app);
const io = new Server(server, { 
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Inject Context Middleware
app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 4. API ROUTES (PRIORITY ORDER) ---

// A. Auth - Handle login & 2FA
app.use('/api/auth', authRoutes);

// B. Wallet - Pastikan /history di atas agar tidak 404
app.use('/api/wallet/history', streamerRoutes); 
app.use('/api/wallet', streamerRoutes); 

// C. User & Profile
app.use('/api/user', streamerRoutes); 
app.use('/api/streamers', streamerRoutes); 

// D. Donations
app.use('/api/donations', donationRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: "online", 
    project: "SkuyGG Engine",
    message: "CORS and Routes Fixed!"
  });
});

// --- 5. ERROR HANDLING ---
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// --- 6. SERVER START ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 SKUYY.GG RUNNING ON PORT ${PORT}`);
  console.log('-----------------------------------------');
});