const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET deudas de un cliente
router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.*, c.nombre AS cliente_nombre
       FROM deudas d
       JOIN clientes c ON c.id = d.cliente_id
       WHERE d.cliente_id = ?
       ORDER BY d.fecha_registro DESC, d.creado_en DESC`,
      [req.params.clienteId]
    );
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET todas las deudas (para resumen global)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.*, c.nombre AS cliente_nombre
      FROM deudas d
      JOIN clientes c ON c.id = d.cliente_id
      ORDER BY d.fecha_registro DESC, d.creado_en DESC
    `);
    res.json({ ok: true, data: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// POST crear deuda
router.post('/', async (req, res) => {
  const { cliente_id, descripcion, monto, fecha_registro } = req.body;
  if (!cliente_id) return res.status(400).json({ ok: false, error: 'El cliente es requerido' });
  if (!descripcion?.trim()) return res.status(400).json({ ok: false, error: 'La descripción es requerida' });
  if (!monto || isNaN(monto) || Number(monto) <= 0)
    return res.status(400).json({ ok: false, error: 'El monto debe ser mayor a 0' });

  try {
    const fecha = fecha_registro || new Date().toISOString().slice(0, 10);
    const [result] = await pool.query(
      'INSERT INTO deudas (cliente_id, descripcion, monto, fecha_registro) VALUES (?, ?, ?, ?)',
      [cliente_id, descripcion.trim(), Number(monto), fecha]
    );
    const [rows] = await pool.query(
      `SELECT d.*, c.nombre AS cliente_nombre FROM deudas d JOIN clientes c ON c.id = d.cliente_id WHERE d.id = ?`,
      [result.insertId]
    );
    res.status(201).json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT actualizar deuda
router.put('/:id', async (req, res) => {
  const { descripcion, monto, pagado, fecha_registro } = req.body;
  if (!descripcion?.trim()) return res.status(400).json({ ok: false, error: 'La descripción es requerida' });
  if (!monto || isNaN(monto) || Number(monto) <= 0)
    return res.status(400).json({ ok: false, error: 'El monto debe ser mayor a 0' });

  try {
    const [result] = await pool.query(
      'UPDATE deudas SET descripcion = ?, monto = ?, pagado = ?, fecha_registro = ? WHERE id = ?',
      [descripcion.trim(), Number(monto), pagado ? 1 : 0, fecha_registro, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Deuda no encontrada' });
    const [rows] = await pool.query(
      `SELECT d.*, c.nombre AS cliente_nombre FROM deudas d JOIN clientes c ON c.id = d.cliente_id WHERE d.id = ?`,
      [req.params.id]
    );
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// PATCH marcar como pagado/no pagado
router.patch('/:id/pago', async (req, res) => {
  const { pagado } = req.body;
  try {
    const [result] = await pool.query('UPDATE deudas SET pagado = ? WHERE id = ?', [pagado ? 1 : 0, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Deuda no encontrada' });
    const [rows] = await pool.query(
      `SELECT d.*, c.nombre AS cliente_nombre FROM deudas d JOIN clientes c ON c.id = d.cliente_id WHERE d.id = ?`,
      [req.params.id]
    );
    res.json({ ok: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE eliminar deuda
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM deudas WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'Deuda no encontrada' });
    res.json({ ok: true, message: 'Deuda eliminada' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
