const mysql2 = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cuentas_negocio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
};

const pool = mysql2.createPool(dbConfig);

async function initDatabase() {
  const conn = await pool.getConnection();
  try {
    // Crear base de datos si no existe
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'cuentas_negocio'}\``);
    await conn.query(`USE \`${process.env.DB_NAME || 'cuentas_negocio'}\``);

    // Tabla de clientes
    await conn.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Migraciones para clientes
    const [columns] = await conn.query('SHOW COLUMNS FROM clientes');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('notas')) {
      await conn.query('ALTER TABLE clientes ADD COLUMN notas TEXT AFTER nombre');
      console.log('✅ Columna "notas" añadida a clientes');
    }
    
    if (columnNames.includes('telefono')) {
      await conn.query('ALTER TABLE clientes DROP COLUMN telefono');
      console.log('🗑️ Columna "telefono" eliminada de clientes');
    }

    // Tabla de deudas/cargos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS deudas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        monto DECIMAL(12, 2) NOT NULL,
        pagado TINYINT(1) DEFAULT 0,
        fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);

    // Tabla de abonos
    await conn.query(`
      CREATE TABLE IF NOT EXISTS abonos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NOT NULL,
        monto DECIMAL(12, 2) NOT NULL,
        fecha_registro DATE NOT NULL DEFAULT (CURRENT_DATE),
        notas TEXT,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Base de datos inicializada correctamente');
  } finally {
    conn.release();
  }
}

module.exports = { pool, initDatabase };
