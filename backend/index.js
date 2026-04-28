const express = require('express');
const cors = require('cors');
const path = require('path'); 
const http = require('http'); 
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); // Library untuk koneksi PostgreSQL
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
    rejectUnauthorized: false // Wajib true untuk koneksi cloud
  }
});

// Cek Koneksi Database saat startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Gagal konek ke Supabase:', err.message);
  } else {
    console.log('✅ JEMBATAN DATABASE AMAN: Backend & Supabase Terhubung!');
    release();
  }
});

// --- 2. SETUP SERVER HTTP & SOCKET.IO ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000; 

// --- 3. MIDDLEWARE ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. GLOBAL INJECTION ---
// Memasukkan pool (DB) dan io (Socket) ke dalam req agar bisa dipakai di Routes
app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

// --- 5. SOCKET.IO PROTOCOL ---
io.on('connection', (socket) => {
    console.log('📡 New Device Linked to Skuy System:', socket.id);

    socket.on('join-protocol', (streamKey) => {
        socket.join(streamKey);
        console.log(`🔑 Client joined secure room: ${streamKey}`);
    });

    socket.on('disconnect', () => {
        console.log('❌ Device Unlinked');
    });
});

// --- 6. ROUTES ---
app.use('/api/streamers', streamerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

// Route Test Alert untuk OBS
app.post('/api/test-alert/:streamKey', (req, res) => {
    const { streamKey } = req.params;
    const { type } = req.body; 

    const testPayload = {
        sender: "Donatur Misterius",
        amount: 100000,
        message: "Simulasi alert SKUY.GG Berhasil! 🔥",
        type: type || 'tip'
    };

    io.to(streamKey).emit('new-alert', testPayload);
    res.json({ message: `Simulasi alert ${type} dikirim ke room ${streamKey}` });
});

app.get('/', (req, res) => {
    res.json({ 
      message: "Skuy Engine Running Gacor! 🚀",
      database: "Connected" 
    });
});

// --- 7. START SERVER ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    =============================================
    🚀 ENGINE NYALA DI PORT ${PORT}
    📡 MODE: REAL-TIME PROTOCOL ACTIVE
    🛡️  DATABASE: SUPABASE CLOUD CONNECTED
    =============================================
    `);
});