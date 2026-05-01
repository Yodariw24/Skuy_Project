import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  // MODE 1: Untuk Cloud (Railway/Render)
  connectionString: process.env.DATABASE_URL,
  
  // MODE 2: Untuk Lokal
  user: process.env.DB_USER || 'postgres', 
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'skuy_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,

  // SSL aktif jika di Cloud
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

export default pool; // PAKAI INI, BUKAN module.exports