const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET todos los clientes con total de deuda
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.nombre,
        c.notas,
        c.creado_en,
        COALESCE(SUM(CASE WHEN d.pagado = 0 THEN d.monto ELSE 0 END), 0) AS total_pendiente,
        COALESCE(SUM(d.monto), 0) AS total_historico,
        COUNT(CASE WHEN d.pagado = 0 THEN 1 END) AS items_pendientes
      FROM clientes c
      LEFT JOIN deudas d ON c.id = d.cliente_id
      GROUP BY c.id
      ORDER BY total_pendiente DESC, c.nombre ASC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET un cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST crear cliente
router.post('/', async (req, res) => {
  const { nombre, notas } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ ok: false, error: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, notas) VALUES (?, ?)',
      [nombre.trim(), notas || null]
    );
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [result.insertId]);
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT actualizar cliente
router.put('/:id', async (req, res) => {
  const { nombre, notas } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ ok: false, error: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, notas = ? WHERE id = ?',
      [nombre.trim(), notas || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });
    res.json({ ok: true, message: 'Cliente eliminado' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
