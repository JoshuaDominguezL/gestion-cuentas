const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET abonos de un cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.nombre AS cliente_nombre
       FROM abonos a
       JOIN clientes c ON c.id = a.cliente_id
       WHERE a.cliente_id = ?
       ORDER BY a.fecha_registro DESC, a.creado_en DESC`,
      [req.params.clienteId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET todos los abonos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, c.nombre AS cliente_nombre
      FROM abonos a
      JOIN clientes c ON c.id = a.cliente_id
      ORDER BY a.fecha_registro DESC, a.creado_en DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST crear abono
router.post('/', async (req, res) => {
  const { cliente_id, monto, fecha_registro } = req.body;
  if (!cliente_id) return res.status(400).json({ ok: false, error: 'El cliente es requerido' });
  if (!monto || isNaN(monto) || Number(monto) <= 0)
    return res.status(400).json({ ok: false, error: 'El monto debe ser mayor a 0' });

  try {
    const fecha = fecha_registro || new Date().toISOString().slice(0, 10);
    const [result] = await pool.query(
      'INSERT INTO abonos (cliente_id, monto, fecha_registro) VALUES (?, ?, ?)',
      [cliente_id, Number(monto), fecha]
    );
    const [rows] = await pool.query(
      `SELECT a.*, c.nombre AS cliente_nombre FROM abonos a JOIN clientes c ON c.id = a.cliente_id WHERE a.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE eliminar abono
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM abonos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Abono no encontrado' });
    res.json({ ok: true, message: 'Abono eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
