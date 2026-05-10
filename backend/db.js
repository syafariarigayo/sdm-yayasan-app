const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test koneksi saat startup
(async () => {
  try {
    const conn = await db.getConnection();
    console.log('✅ Koneksi ke database berhasil!');
    conn.release();
  } catch (err) {
    console.error('❌ Koneksi ke database gagal:', err.message);
  }
})();

module.exports = db;
