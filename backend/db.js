const mysql2 = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gestion_cuentas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
};

const pool = mysql2.createPool(dbConfig);

async function initDatabase() {
  try {
    // Verificacion de que funcione
    const conn = await pool.getConnection();
    console.log('Conexión a la base de datos establecida');
    conn.release();
  } catch (err) {
    console.error('No se pudo conectar a la base de datos:', err.message);
    throw err;
  }
}

module.exports = { pool, initDatabase };
