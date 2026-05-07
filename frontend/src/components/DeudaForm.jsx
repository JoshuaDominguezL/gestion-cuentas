import React, { useState, useEffect } from 'react';
import { Modal, Btn, Input, Alert, todayISO } from './UI.jsx';
import { deudasAPI } from '../api.js';

export default function DeudaForm({ open, onClose, clienteId, clienteNombre, deuda, onSaved }) {
  const [form, setForm] = useState({ descripcion: '', monto: '', fecha_registro: todayISO(), pagado: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      if (deuda) {
        setForm({
          descripcion: deuda.descripcion,
          monto: deuda.monto,
          fecha_registro: deuda.fecha_registro?.slice(0, 10) || todayISO(),
          pagado: !!deuda.pagado,
        });
      } else {
        setForm({ descripcion: '', monto: '', fecha_registro: todayISO(), pagado: false });
      }
      setErrors({});
      setApiError('');
    }
  }, [open, deuda]);

  function validate() {
    const e = {};
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es requerida';
    if (!form.monto || isNaN(form.monto) || Number(form.monto) <= 0) e.monto = 'Ingresa un monto válido mayor a 0';
    if (!form.fecha_registro) e.fecha_registro = 'La fecha es requerida';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      let data;
      if (deuda) {
        data = await deudasAPI.update(deuda.id, form);
      } else {
        data = await deudasAPI.create({ ...form, cliente_id: clienteId });
      }
      onSaved(data.data);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={deuda ? 'Editar cargo' : `Agregar cargo — ${clienteNombre}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {apiError && <Alert msg={apiError} onClose={() => setApiError('')} />}

        <Input label="DESCRIPCIÓN *" placeholder="Ej: Mercancía fiao, servicio, préstamo..."
          value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          error={errors.descripcion} />

        <Input label="MONTO ($) *" type="number" min="0" step="100" placeholder="0"
          value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
          error={errors.monto} />

        <Input label="FECHA DEL REGISTRO *" type="date"
          value={form.fecha_registro} onChange={e => setForm(f => ({ ...f, fecha_registro: e.target.value }))}
          error={errors.fecha_registro} />

        {deuda && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)' }}>
            <input type="checkbox" checked={form.pagado} onChange={e => setForm(f => ({ ...f, pagado: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--green)', cursor: 'pointer' }} />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Marcar como <strong style={{ color: 'var(--green)' }}>pagado</strong></span>
          </label>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={handleSubmit} loading={loading}>{deuda ? 'Guardar cambios' : '+ Agregar cargo'}</Btn>
        </div>
      </div>
    </Modal>
  );
}
