import React, { useState, useEffect, useCallback } from 'react';
import { clientesAPI } from './api.js';
import { Btn, Spinner, Empty, Alert, Badge, formatCurrency, formatDate } from './components/UI.jsx';
import ClienteForm from './components/ClienteForm.jsx';
import ClienteDetalle from './components/ClienteDetalle.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editCliente, setEditCliente] = useState(null);
  const [viendoCliente, setViendoCliente] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toast, setToast] = useState('');

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await clientesAPI.getAll();
      setClientes(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function handleSaved(cliente) {
    setClientes(prev => {
      const idx = prev.findIndex(c => c.id === cliente.id);
      if (idx >= 0) { const a = [...prev]; a[idx] = { ...a[idx], ...cliente }; return a; }
      return [{ ...cliente, total_pendiente: 0, items_pendientes: 0 }, ...prev];
    });
    showToast('Cliente guardado');
  }

  async function eliminar() {
    setDelLoading(true);
    try {
      await clientesAPI.delete(confirmDel.id);
      setClientes(prev => prev.filter(c => c.id !== confirmDel.id));
      setConfirmDel(null);
      showToast('Cliente eliminado');
    } catch (e) { setError(e.message); }
    finally { setDelLoading(false); }
  }

  const filtered = clientes.filter(c =>
    !search || c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const totalGlobal = clientes.reduce((s, c) => s + Number(c.total_pendiente || 0), 0);
  const conDeuda = clientes.filter(c => Number(c.total_pendiente) > 0).length;

  // Si hay un cliente seleccionado, mostrar detalle
  if (viendoCliente) {
    const clienteActual = clientes.find(c => c.id === viendoCliente.id) || viendoCliente;
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
        <Header />
        <ClienteDetalle
          cliente={clienteActual}
          onBack={() => setViendoCliente(null)}
          onClienteUpdated={cargar}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>
      <Header />

      {/* Stats globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
        <GlobalStat label="Deuda total pendiente" value={formatCurrency(totalGlobal)} color="var(--accent)" />
        <GlobalStat label="Clientes con deuda" value={conDeuda}color="var(--red)" />
        <GlobalStat label="Total clientes" value={clientes.length}color="var(--blue)" />
      </div>

      {/* Barra de acciones */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 14 }}>🔍</span>
          <input
            placeholder="Buscar cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 34px',
              background: 'var(--bg2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 14,
              fontFamily: 'var(--font-body)', outline: 'none'
            }}
          />
        </div>
        <Btn onClick={() => { setEditCliente(null); setFormOpen(true); }} size="lg">+ Nuevo cliente</Btn>
      </div>

      {error && <Alert msg={error} onClose={() => setError('')} style={{ marginBottom: 16 }} />}

      {/* Lista de clientes */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        search
          ? <Empty title="Sin resultados" desc={`No se encontró ningún cliente con "${search}"`} />
          : <Empty title="Sin clientes aún" desc='Haz clic en "+ Nuevo cliente" para comenzar' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c, i) => (
            <ClienteCard
              key={c.id}
              cliente={c}
              delay={i * 30}
              onVer={() => setViendoCliente(c)}
              onEdit={e => { e.stopPropagation(); setEditCliente(c); setFormOpen(true); }}
              onDelete={e => { e.stopPropagation(); setConfirmDel(c); }}
            />
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 18px', fontSize: 13, color: 'var(--green)', zIndex: 999, animation: 'slideIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      <ClienteForm open={formOpen} onClose={() => { setFormOpen(false); setEditCliente(null); }}
        cliente={editCliente} onSaved={handleSaved} />

      <ConfirmDialog open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={eliminar}
        loading={delLoading} title="Eliminar cliente"
        message={`¿Eliminar a "${confirmDel?.nombre}" y todos sus cargos? Esta acción no se puede deshacer.`} />
    </div>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
          Cuentas del Negocio
        </h1>
      </div>
    </div>
  );
}

function GlobalStat({ label, value, icon, color }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-head)', color }}>{value}</div>
      </div>
    </div>
  );
}

function ClienteCard({ cliente, delay, onVer, onEdit, onDelete }) {
  const pendiente = Number(cliente.total_pendiente || 0);
  const items = Number(cliente.items_pendientes || 0);
  return (
    <div
      onClick={onVer}
      style={{
        background: 'var(--bg2)', border: `1px solid ${pendiente > 0 ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '16px 20px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        transition: 'border-color 0.15s, background 0.15s',
        animation: `fadeIn 0.2s ease ${delay}ms both`,
        borderLeft: pendiente > 0 ? '3px solid var(--accent)' : '3px solid transparent',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
    >
      {/* Avatar */}
      <div style={{
        width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
        background: pendiente > 0 ? 'var(--accent-dim)' : 'rgba(139,146,168,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16,
        color: pendiente > 0 ? 'var(--accent)' : 'var(--text3)',
        border: `1px solid ${pendiente > 0 ? 'rgba(245,200,66,0.2)' : 'var(--border)'}`,
      }}>
        {cliente.nombre.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 2 }}>{cliente.nombre}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span>🗓 Desde {formatDate(cliente.creado_en)}</span>
          {items > 0 && <span style={{ color: 'var(--accent)' }}>• {items} cargo{items > 1 ? 's' : ''} pendiente{items > 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Monto */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 800, color: pendiente > 0 ? 'var(--accent)' : 'var(--text3)' }}>
          {formatCurrency(pendiente)}
        </div>
        <Badge color={pendiente > 0 ? 'red' : 'green'}>{pendiente > 0 ? 'Debe' : 'Al día'}</Badge>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <Btn variant="ghost" size="sm" onClick={onEdit} title="Editar">✏️</Btn>
        <Btn variant="danger" size="sm" onClick={onDelete} title="Eliminar">🗑️</Btn>
      </div>
    </div>
  );
}
