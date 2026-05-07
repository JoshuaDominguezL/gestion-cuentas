import React, { useState, useEffect } from 'react';
import { Modal, Btn, Input, Textarea, Alert, todayISO } from './UI.jsx';
import { abonosAPI } from '../api.js';

export default function AbonoForm({ open, onClose, clienteId, clienteNombre, onSaved }) {
  const [form, setForm] = useState({ monto: '', fecha_registro: todayISO(), notas: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ monto: '', fecha_registro: todayISO(), notas: '' });
      setErrors({});
      setApiError('');
    }
  }, [open]);

  function validate() {
    const e = {};
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
      const data = await abonosAPI.create({ ...form, cliente_id: clienteId });
      onSaved(data.data);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Nuevo abono — ${clienteNombre}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {apiError && <Alert msg={apiError} onClose={() => setApiError('')} />}

        <Input label="MONTO ($) *" type="number" min="0" step="100" placeholder="0"
          value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
          error={errors.monto} />

        <Input label="FECHA DEL ABONO *" type="date"
          value={form.fecha_registro} onChange={e => setForm(f => ({ ...f, fecha_registro: e.target.value }))}
          error={errors.fecha_registro} />

        <Textarea label="NOTAS / COMENTARIO" placeholder="Opcional..."
          value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={handleSubmit} loading={loading} color="var(--green)">+ Registrar abono</Btn>
        </div>
      </div>
    </Modal>
  );
}
