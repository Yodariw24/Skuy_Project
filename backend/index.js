const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); 
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. CONFIG DATABASE (PostgreSQL Railway) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Cek koneksi ke database saat server nyala
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DATABASE ERROR:', err.stack);
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

// Header tambahan untuk keamanan & Google Auth
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

// Inject database & io ke setiap request (Biar gampang dipanggil di controller)
app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 4. ROUTES ---
app.get('/', (req, res) => {
  res.json({ 
    status: "online", 
    message: "SkuyGG Engine is Running! 🚀",
    database: "Connected" 
  });
});

app.use('/api/auth', authRoutes);

// --- 5. ERROR HANDLING (Global) ---
// Biar kalau ada error kodingan, server nggak langsung mati total
app.use((err, req, res, next) => {
  console.error('🔥 SERVER ERROR:', err.stack);
  res.status(500).json({ error: 'Ada masalah di server, Ri!' });
});

// --- 6. LISTEN SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
});