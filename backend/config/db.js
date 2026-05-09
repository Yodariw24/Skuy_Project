import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

// 🛡️ Logic Cerdas: Pilih jalur cloud atau lokal secara otomatis
const isProduction = process.env.DATABASE_URL;

const pool = new Pool(
  isProduction 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'skuy_db',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        ssl: false
      }
);

// 🚀 Monitoring Koneksi (Mode Sultan)
pool.on('connect', () => {
  console.log('-----------------------------------------');
  console.log(`📡 DB_STATUS: NODE CONNECTED TO ${isProduction ? 'RAILWAY CLOUD' : 'LOCAL ENGINE'}`);
  console.log('-----------------------------------------');
});

pool.on('error', (err) => {
  console.error('🔥 CRITICAL_DB_ERROR:', err.message);
  process.exit(-1);
});

export default pool;