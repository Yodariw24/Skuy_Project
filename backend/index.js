const express = require('express');
const cors = require('cors');
const http = require('http'); 
const path = require('path');
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); 
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); // Nanti kita buat ini
const walletRoutes = require('./routes/walletRoutes'); // Nanti kita buat ini

const app = express();

// --- 1. CONFIG DATABASE (PostgreSQL Railway) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
});

// Cek koneksi ke database
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DATABASE CONNECTION ERROR:', err.stack);
  }
  console.log('✅ KONEKSI KE POSTGRESQL RAILWAY BERHASIL!');
  release();
});

// --- 2. MIDDLEWARE & SECURITY ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-gg.vercel.app", 
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Akses file statis (Foto Profil)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Header tambahan untuk Google Auth & Security
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// --- 3. SOCKET.IO SETUP ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

// Logika Real-time Engine
io.on('connection', (socket) => {
  const streamerId = socket.handshake.query.streamerId;
  if (streamerId) {
    socket.join(`streamer_${streamerId}`);
    console.log(`📡 Widget Connected: Streamer ${streamerId}`);
  }

  socket.on('disconnect', () => {
    console.log('🔌 Socket Disconnected');
  });
});

// Inject database & io ke setiap request
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
    database: "Connected",
    timestamp: new Date()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/wallet', walletRoutes);

// --- 5. ERROR HANDLING (Global) ---
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.stack);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Ada masalah di server Railway, Ri!' 
  });
});

// --- 6. LISTEN SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
  console.log(`🌍 Health Check: http://localhost:${PORT}/`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM signal received. Closing server...');
  server.close(() => {
    console.log('Http server closed.');
    pool.end(() => {
      console.log('Database pool has ended.');
      process.exit(0);
    });
  });
});