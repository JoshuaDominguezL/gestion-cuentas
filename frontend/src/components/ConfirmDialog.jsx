import React from 'react';
import { Modal, Btn } from './UI.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || '¿Confirmar acción?'} width={380}>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        {message || '¿Estás seguro de que deseas continuar?'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Btn>
        <Btn variant="danger" onClick={onConfirm} loading={loading}>Eliminar</Btn>
      </div>
    </Modal>
  );
}
