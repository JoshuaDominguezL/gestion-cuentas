import React, { useState, useEffect } from 'react';
import { Modal, Btn, Input, Textarea, Alert } from './UI.jsx';
import { clientesAPI } from '../api.js';

export default function ClienteForm({ open, onClose, cliente, onSaved }) {
  const [form, setForm] = useState({ nombre: '', notas: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(cliente ? { nombre: cliente.nombre, notas: cliente.notas || '' } : { nombre: '', notas: '' });
      setErrors({});
      setApiError('');
    }
  }, [open, cliente]);

  function validate() {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      const data = await (cliente ? clientesAPI.update(cliente.id, form) : clientesAPI.create(form));
      onSaved(data.data);
      onClose();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={cliente ? 'Editar cliente' : 'Nuevo cliente'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {apiError && <Alert msg={apiError} onClose={() => setApiError('')} />}
        <Input label="NOMBRE *" placeholder="Ej: Juan Pérez" value={form.nombre}
          onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} error={errors.nombre} />
        <Textarea label="NOTAS" placeholder="Información adicional..." value={form.notas}
          onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn onClick={handleSubmit} loading={loading}>{cliente ? 'Guardar cambios' : '+ Agregar cliente'}</Btn>
        </div>
      </div>
    </Modal>
  );
}
