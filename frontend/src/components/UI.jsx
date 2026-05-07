import React from 'react';

// ── Spinner ──────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      border: `2px solid ${color}30`, borderTop: `2px solid ${color}`,
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0
    }} />
  );
}

// ── Button ───────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, loading, type = 'button', style }) {
  const styles = {
    primary: { bg: 'var(--accent)', color: '#0d0f14', hov: 'var(--accent2)' },
    danger: { bg: 'var(--red-dim)', color: 'var(--red)', hov: 'rgba(245,93,93,0.2)', border: '1px solid rgba(245,93,93,0.25)' },
    ghost: { bg: 'transparent', color: 'var(--text2)', hov: 'var(--bg3)', border: '1px solid var(--border)' },
    success: { bg: 'var(--green-dim)', color: 'var(--green)', hov: 'rgba(78,203,138,0.2)', border: '1px solid rgba(78,203,138,0.25)' },
  };
  const v = styles[variant] || styles.primary;
  const pad = size === 'sm' ? '5px 10px' : size === 'lg' ? '11px 24px' : '8px 16px';
  const fs = size === 'sm' ? '12px' : size === 'lg' ? '15px' : '13px';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: pad,
        fontSize: fs, fontWeight: 600, fontFamily: 'var(--font-body)',
        background: v.bg, color: v.color, border: v.border || 'none',
        borderRadius: 'var(--radius-sm)', cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.6 : 1, transition: 'all 0.15s',
        whiteSpace: 'nowrap', ...style
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hov; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
    >
      {loading ? <Spinner size={14} color={v.color} /> : null}
      {children}
    </button>
  );
}

// ── Input ────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', letterSpacing: '0.04em' }}>{label}</label>}
      <input
        {...props}
        style={{
          background: 'var(--bg)', border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)',
          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', width: '100%',
          transition: 'border-color 0.15s',
          ...props.style
        }}
        onFocus={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--border2)'; }}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ── Textarea ─────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', letterSpacing: '0.04em' }}>{label}</label>}
      <textarea
        {...props}
        style={{
          background: 'var(--bg)', border: `1px solid ${error ? 'var(--red)' : 'var(--border2)'}`,
          borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)',
          fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical',
          minHeight: 72, width: '100%', transition: 'border-color 0.15s',
          ...props.style
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border2)'; }}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        animation: 'fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', padding: 28, width: '100%', maxWidth: width,
          boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────
export function Badge({ children, color = 'accent' }) {
  const colors = {
    accent: { bg: 'var(--accent-dim)', text: 'var(--accent)', border: 'rgba(245,200,66,0.2)' },
    red: { bg: 'var(--red-dim)', text: 'var(--red)', border: 'rgba(245,93,93,0.2)' },
    green: { bg: 'var(--green-dim)', text: 'var(--green)', border: 'rgba(78,203,138,0.2)' },
    blue: { bg: 'var(--blue-dim)', text: 'var(--blue)', border: 'rgba(93,156,245,0.2)' },
    gray: { bg: 'rgba(139,146,168,0.1)', text: 'var(--text2)', border: 'var(--border)' },
  };
  const c = colors[color] || colors.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      letterSpacing: '0.03em'
    }}>{children}</span>
  );
}

// ── Empty state ───────────────────────────────────
export function Empty({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: 13 }}>{desc}</div>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────
export function Alert({ type = 'error', msg, onClose }) {
  if (!msg) return null;
  const colors = {
    error: { bg: 'var(--red-dim)', text: 'var(--red)', border: 'rgba(245,93,93,0.25)' },
    success: { bg: 'var(--green-dim)', text: 'var(--green)', border: 'rgba(78,203,138,0.25)' },
  };
  const c = colors[type] || colors.error;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
    }}>
      <span>{msg}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.7 }}>✕</button>}
    </div>
  );
}

// ── Formatters ────────────────────────────────────
export function formatCurrency(n) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(n) || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T12:00:00'));
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
