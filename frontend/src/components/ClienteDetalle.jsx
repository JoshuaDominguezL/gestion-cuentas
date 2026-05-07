import React, { useState, useEffect, useCallback } from 'react';
import { deudasAPI, abonosAPI } from '../api.js';
import { Btn, Badge, Spinner, Empty, Alert, formatCurrency, formatDate } from './UI.jsx';
import DeudaForm from './DeudaForm.jsx';
import AbonoForm from './AbonoForm.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function ClienteDetalle({ cliente, onBack, onClienteUpdated }) {
  const [deudas, setDeudas] = useState([]);
  const [abonos, setAbonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [abonoFormOpen, setAbonoFormOpen] = useState(false);
  const [editDeuda, setEditDeuda] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmDelAbono, setConfirmDelAbono] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState('cargos'); // 'cargos' | 'abonos'

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [resDeudas, resAbonos] = await Promise.all([
        deudasAPI.getByCliente(cliente.id),
        abonosAPI.getByCliente(cliente.id)
      ]);
      setDeudas(resDeudas.data);
      setAbonos(resAbonos.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [cliente.id]);

  useEffect(() => { cargar(); }, [cargar]);

  const pendientes = deudas.filter(d => !d.pagado);
  const totalPendiente = pendientes.reduce((s, d) => s + Number(d.monto), 0);
  const totalAbonado = abonos.reduce((s, a) => s + Number(a.monto), 0);
  const saldoReal = totalPendiente - totalAbonado;

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleSaved(deuda) {
    setDeudas(prev => {
      const idx = prev.findIndex(d => d.id === deuda.id);
      if (idx >= 0) { const a = [...prev]; a[idx] = deuda; return a; }
      return [deuda, ...prev];
    });
    showToast('✓ Cambios guardados');
    if (onClienteUpdated) onClienteUpdated();
  }

  function handleAbonoSaved(abono) {
    setAbonos(prev => [abono, ...prev]);
    showToast('✓ Abono registrado');
    if (onClienteUpdated) onClienteUpdated();
  }

  async function togglePago(deuda) {
    try {
      const res = await deudasAPI.togglePago(deuda.id, !deuda.pagado);
      handleSaved(res.data);
    } catch (e) { setError(e.message); }
  }

  async function eliminar() {
    setDelLoading(true);
    try {
      await deudasAPI.delete(confirmDel.id);
      setDeudas(prev => prev.filter(d => d.id !== confirmDel.id));
      setConfirmDel(null);
      showToast('✓ Cargo eliminado');
      if (onClienteUpdated) onClienteUpdated();
    } catch (e) { setError(e.message); }
    finally { setDelLoading(false); }
  }

  async function eliminarAbono() {
    setDelLoading(true);
    try {
      await abonosAPI.delete(confirmDelAbono.id);
      setAbonos(prev => prev.filter(a => a.id !== confirmDelAbono.id));
      setConfirmDelAbono(null);
      showToast('✓ Abono eliminado');
      if (onClienteUpdated) onClienteUpdated();
    } catch (e) { setError(e.message); }
    finally { setDelLoading(false); }
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', marginBottom: 16 }}>
          ← Volver a clientes
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>{cliente.nombre}</h2>
            {cliente.notas && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{cliente.notas}</p>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={() => setAbonoFormOpen(true)}>+ Abono</Btn>
            <Btn onClick={() => { setEditDeuda(null); setFormOpen(true); }}>+ Cargo</Btn>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total cargos" value={formatCurrency(totalPendiente)} color="var(--accent)" />
        <StatCard label="Total abonos" value={formatCurrency(totalAbonado)} color="var(--green)" />
        <StatCard label="Saldo pendiente" value={formatCurrency(saldoReal)} color={saldoReal > 0 ? 'var(--blue)' : 'var(--text3)'} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <TabBtn active={tab === 'cargos'} onClick={() => setTab('cargos')}>Cargos ({deudas.length})</TabBtn>
        <TabBtn active={tab === 'abonos'} onClick={() => setTab('abonos')}>Abonos ({abonos.length})</TabBtn>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, color: 'var(--green)', zIndex: 999, animation: 'slideIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {error && <Alert msg={error} onClose={() => setError('')} style={{ marginBottom: 16 }} />}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Spinner size={32} /></div>
      ) : tab === 'cargos' ? (
        deudas.length === 0 ? (
          <Empty icon="📋" title="Sin cargos registrados" desc="Agrega el primer cargo para este cliente" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {deudas.map(d => (
              <DeudaRow key={d.id} deuda={d} onEdit={() => { setEditDeuda(d); setFormOpen(true); }} onDelete={() => setConfirmDel(d)} onTogglePago={() => togglePago(d)} />
            ))}
          </div>
        )
      ) : (
        abonos.length === 0 ? (
          <Empty icon="💰" title="Sin abonos registrados" desc="Registra el primer abono de este cliente" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {abonos.map(a => (
              <AbonoRow key={a.id} abono={a} onDelete={() => setConfirmDelAbono(a)} />
            ))}
          </div>
        )
      )}

      <DeudaForm open={formOpen} onClose={() => { setFormOpen(false); setEditDeuda(null); }}
        clienteId={cliente.id} clienteNombre={cliente.nombre} deuda={editDeuda} onSaved={handleSaved} />

      <AbonoForm open={abonoFormOpen} onClose={() => setAbonoFormOpen(false)}
        clienteId={cliente.id} clienteNombre={cliente.nombre} onSaved={handleAbonoSaved} />

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={eliminar}
        loading={delLoading} title="Eliminar cargo"
        message={`¿Eliminar "${confirmDel?.descripcion}" de ${formatCurrency(confirmDel?.monto)}?`} />

      <ConfirmDialog open={!!confirmDelAbono} onClose={() => setConfirmDelAbono(null)} onConfirm={eliminarAbono}
        loading={delLoading} title="Eliminar abono"
        message={`¿Eliminar el abono de ${formatCurrency(confirmDelAbono?.monto)} del ${formatDate(confirmDelAbono?.fecha_registro)}?`} />
    </div>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer',
      fontSize: 14, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text3)',
      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
      transition: 'all 0.2s', marginBottom: -1
    }}>
      {children}
    </button>
  );
}

function AbonoRow({ abono, onDelete }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center',
      gap: 14, flexWrap: 'wrap'
    }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green)', color: '#0d0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
        $
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
          Abono recibido
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          📅 {formatDate(abono.fecha_registro)}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>
        {formatCurrency(abono.monto)}
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Btn variant="danger" size="sm" onClick={onDelete}>🗑️</Btn>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
    </div>
  );
}

function DeudaRow({ deuda, onEdit, onDelete, onTogglePago }) {
  const pagado = !!deuda.pagado;
  return (
    <div style={{
      background: 'var(--bg2)', border: `1px solid ${pagado ? 'var(--border)' : 'var(--border2)'}`,
      borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center',
      gap: 14, flexWrap: 'wrap', opacity: pagado ? 0.65 : 1, transition: 'all 0.15s'
    }}>
      <button onClick={onTogglePago} title={pagado ? 'Marcar como pendiente' : 'Marcar como pagado'}
        style={{
          width: 22, height: 22, borderRadius: '50%', border: `2px solid ${pagado ? 'var(--green)' : 'var(--border2)'}`,
          background: pagado ? 'var(--green)' : 'transparent', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d0f14', fontSize: 12, fontWeight: 700
        }}>
        {pagado ? '✓' : ''}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: pagado ? 'var(--text3)' : 'var(--text)', textDecoration: pagado ? 'line-through' : 'none', marginBottom: 2 }}>
          {deuda.descripcion}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          📅 {formatDate(deuda.fecha_registro)}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--font-head)', fontSize: 16, fontWeight: 700, color: pagado ? 'var(--text3)' : 'var(--accent)', flexShrink: 0 }}>
        {formatCurrency(deuda.monto)}
      </div>

      <Badge color={pagado ? 'green' : 'red'}>{pagado ? 'Pagado' : 'Pendiente'}</Badge>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Btn variant="ghost" size="sm" onClick={onEdit}>✏️</Btn>
        <Btn variant="danger" size="sm" onClick={onDelete}>🗑️</Btn>
      </div>
    </div>
  );
}
