const express = require('express');
const cors = require('cors');
const path = require('path'); 
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

const streamerRoutes = require('./routes/streamerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. SETUP SERVER HTTP & SOCKET.IO ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Port disesuaikan ke 3000 agar sesuai dengan terminal kamu
const PORT = process.env.PORT || 3000; 

// --- 2. MIDDLEWARE ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 3. SOCKET.IO PROTOCOL ---
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

// --- 4. EXPOSE IO (Global Middleware) ---
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --- 5. ROUTE SIMULASI ALERT (UNTUK TEST DI OBS) ---
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

// --- 6. ROUTES UTAMA ---
app.use('/api/streamers', streamerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Skuy Engine Running Gacor! 🚀" });
});

// --- 7. START SERVER ---
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Engine nyala di port ${PORT} | Mode: Real-time Protocol Active`);
});