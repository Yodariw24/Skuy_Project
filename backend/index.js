const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
const { Pool } = require('pg'); 
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://skuy-gg.vercel.app", // Masukkan link Vercel-mu di sini
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Header untuk Google Auth
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

app.use((req, res, next) => {
  req.db = pool;
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ status: "online", engine: "SkuyGG Gacor! 🚀" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ENGINE NYALA DI PORT ${PORT}`);
});