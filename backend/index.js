const express = require('express');
const cors = require('cors');
const path = require('path'); 
const http = require('http'); 
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); 
require('dotenv').config();

const streamerRoutes = require('./routes/streamerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. SETUP DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) console.error('❌ Database Error:', err.message);
  else {
    console.log('✅ JEMBATAN DATABASE AMAN!');
    release();
  }
});

// --- 2. CORS & SECURITY HEADERS ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-gg.vercel.app", // Pastikan ini sama dengan domain Vercel-mu
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// FIX UNTUK ERROR Cross-Origin-Opener-Policy (COOP)
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

// --- 3. MIDDLEWARE ---
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inject DB & IO ke Request
const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 4. SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('📡 Device Linked:', socket.id);
    socket.on('join-protocol', (streamKey) => {
        socket.join(streamKey);
        console.log(`🔑 Secure room joined: ${streamKey}`);
    });
    socket.on('disconnect', () => console.log('❌ Device Unlinked'));
});

// --- 5. ROUTES ---
app.use('/api/streamers', streamerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ status: "online", engine: "Skuy Engine Running Gacor! 🚀" });
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
});