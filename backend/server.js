require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db');

const clientesRouter = require('./routes/clientes');
const deudasRouter = require('./routes/deudas');
const abonosRouter = require('./routes/abonos');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/clientes', clientesRouter);
app.use('/api/deudas', deudasRouter);
app.use('/api/abonos', abonosRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Servidor funcionando', timestamp: new Date() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' });
});

// Error global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, error: 'Error interno del servidor' });
});

// Iniciar servidor
async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar:', err.message);
    process.exit(1);
  }
}

start();
