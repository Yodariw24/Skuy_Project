const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  // MODE 1: Jika ada DATABASE_URL (untuk Render/Cloud)
  connectionString: process.env.DATABASE_URL,
  
  // MODE 2: Jika tidak ada DATABASE_URL, dia otomatis pakai variabel ini (untuk Lokal)
  user: process.env.DB_USER || 'postgres', 
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'skuy_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,

  // SSL hanya aktif jika sedang di Cloud (Render)
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Cek Koneksi
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Gagal konek ke Postgres:', err.stack);
  }
  console.log('Koneksi ke PostgreSQL Skuy_DB Berhasil! ✅');
  release();
});

module.exports = pool;