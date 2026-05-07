import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Error de conexión';
    return Promise.reject(new Error(msg));
  }
);

// ── CLIENTES ──────────────────────────────────────────────
export const clientesAPI = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
};

// ── DEUDAS ────────────────────────────────────────────────
export const deudasAPI = {
  getAll: () => api.get('/deudas'),
  getByCliente: (clienteId) => api.get(`/deudas/cliente/${clienteId}`),
  create: (data) => api.post('/deudas', data),
  update: (id, data) => api.put(`/deudas/${id}`, data),
  togglePago: (id, pagado) => api.patch(`/deudas/${id}/pago`, { pagado }),
  delete: (id) => api.delete(`/deudas/${id}`),
};

// ── ABONOS ────────────────────────────────────────────────
export const abonosAPI = {
  getAll: () => api.get('/abonos'),
  getByCliente: (clienteId) => api.get(`/abonos/cliente/${clienteId}`),
  create: (data) => api.post('/abonos', data),
  delete: (id) => api.delete(`/abonos/${id}`),
};
