const express = require('express');
const cors = require('cors');
const path = require('path'); 
const pool = require('./config/db'); 
require('dotenv').config();

const streamerRoutes = require('./routes/streamerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. PORT DINAMIS UNTUK RENDER ---
const PORT = process.env.PORT || 10000; 

// --- 2. MIDDLEWARE CORS PROFESIONAL ---
// Izinkan akses dari link Vercel kamu nanti
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json()); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- PENGGUNAAN ROUTE ---
app.use('/api/streamers', streamerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);

app.get('/', async (req, res) => {
    res.json({ message: "API Skuy Running Gacor di Cloud! 🚀" });
});

// --- 3. BINDING HOST UNTUK CLOUD ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server nyala di port ${PORT}`);
});