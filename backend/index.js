const express = require('express');
const cors = require('cors');
const path = require('path'); 
const http = require('http'); 
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); 
require('dotenv').config();

// --- IMPORT ROUTES ---
const streamerRoutes = require('./routes/streamerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. SETUP DATABASE (SUPABASE) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Gagal konek ke Supabase:', err.message);
  } else {
    console.log('✅ JEMBATAN DATABASE AMAN: Backend & Supabase Terhubung!');
    release();
  }
});

// --- 2. MULTI-ORIGIN CORS (Agar Vercel & Local bisa akses) ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-gg.vercel.app", // GANTI dengan domain Vercel asli kamu
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
};

// --- 3. SETUP SERVER HTTP & SOCKET.IO ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: corsOptions
});

const PORT = process.env.PORT || 3000; 

// --- 4. MIDDLEWARE ---
app.use(cors(corsOptions));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. GLOBAL INJECTION ---
app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 6. SOCKET.IO PROTOCOL ---
io.on('connection', (socket) => {
    console.log('📡 Device Linked:', socket.id);

    socket.on('join-protocol', (streamKey) => {
        socket.join(streamKey);
        console.log(`🔑 Secure room joined: ${streamKey}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Device Unlinked');
    });
});

// --- 7. ROUTES ---
app.use('/api/streamers', streamerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

// Route Test Alert untuk OBS
app.post('/api/test-alert/:streamKey', (req, res) => {
    const { streamKey } = req.params;
    const { type, sender, amount, message } = req.body; 

    const testPayload = {
        sender: sender || "Donatur Misterius",
        amount: amount || 100000,
        message: message || "Simulasi alert SKUY.GG Berhasil! 🔥",
        type: type || 'tip'
    };

    io.to(streamKey).emit('new-alert', testPayload);
    res.json({ success: true, message: `Alert dikirim ke room ${streamKey}` });
});

app.get('/', (req, res) => {
    res.json({ 
      status: "online",
      engine: "Skuy Engine Running Gacor! 🚀",
      timestamp: new Date().toISOString()
    });
});

// --- 8. START SERVER ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
});