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

// --- 2. SECURITY HEADERS (FIX UNTUK GOOGLE AUTH & POPUPS) ---
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// --- 3. CORS CONFIGURATION (DYNAMIC UNTUK VERCEL) ---
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://skuy-project.vercel.app",
  "https://skuy-gg.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan jika: Tanpa origin (mobile), ada di whitelist, atau domain vercel.app
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, "")) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Blocked!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle Preflight untuk semua rute

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. SOCKET.IO SETUP ---
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

// --- 5. API ROUTES (PRIORITY ORDER) ---

// A. Auth - Handle login, Google Auth, & 2FA Setup
app.use('/api/auth', authRoutes);

// B. Wallet - History ditaruh di atas agar tidak tertabrak rute parameter
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
    message: "CORS, Security Headers, and Routes Fixed!"
  });
});

// --- 6. ERROR HANDLING ---
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`🔥 Error: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// --- 7. SERVER START ---
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log('-----------------------------------------');
  console.log(`🚀 SKUYY.GG ENGINE RUNNING ON PORT ${PORT}`);
  console.log(`📡 URL: http://0.0.0.0:${PORT}`);
  console.log('-----------------------------------------');
});