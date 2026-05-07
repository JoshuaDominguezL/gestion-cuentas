# 💼 Cuentas del Negocio

Sistema de gestión de cuentas/deudas de clientes. Construido con **React + Vite + Axios** en el frontend y **Node.js + Express + MySQL** en el backend.

---

## 📋 Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [MySQL](https://dev.mysql.com/downloads/) 8.0 o superior (o MariaDB 10.6+)

---

## 🚀 Instalación rápida

### 1. Configurar el Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=cuentas_negocio
PORT=3001
```

### 2. Iniciar el Backend

```bash
# En la carpeta /backend
npm start
# ó para desarrollo con auto-reload:
npm run dev
```

El servidor corre en `http://localhost:3001`. La base de datos y tablas se crean **automáticamente** al iniciar.

---

### 3. Configurar e iniciar el Frontend

```bash
cd frontend
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`

---

## 🗄️ Estructura de la base de datos

```sql
-- Tabla de clientes
clientes (id, nombre, telefono, notas, creado_en, actualizado_en)

-- Tabla de cargos/deudas
deudas (id, cliente_id, descripcion, monto, pagado, fecha_registro, creado_en, actualizado_en)
```

---

## 🌐 Endpoints de la API

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/clientes | Lista todos los clientes con total de deuda |
| GET | /api/clientes/:id | Obtiene un cliente |
| POST | /api/clientes | Crea un cliente |
| PUT | /api/clientes/:id | Actualiza un cliente |
| DELETE | /api/clientes/:id | Elimina cliente y sus cargos |

### Deudas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/deudas | Lista todas las deudas |
| GET | /api/deudas/cliente/:id | Deudas de un cliente |
| POST | /api/deudas | Crea un cargo |
| PUT | /api/deudas/:id | Actualiza un cargo |
| PATCH | /api/deudas/:id/pago | Marca como pagado/pendiente |
| DELETE | /api/deudas/:id | Elimina un cargo |

---

## 🛠️ Tecnologías usadas

**Frontend**
- React 18
- Vite 5
- Axios (cliente HTTP)

**Backend**
- Node.js + Express
- mysql2 (driver MySQL)
- dotenv, cors

---

## 📂 Estructura del proyecto

```
cuentas-negocio/
├── backend/
│   ├── routes/
│   │   ├── clientes.js
│   │   └── deudas.js
│   ├── db.js          ← Conexión MySQL + init tablas
│   ├── server.js      ← Servidor Express
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── UI.jsx           ← Componentes base
    │   │   ├── ClienteForm.jsx  ← Formulario cliente
    │   │   ├── ClienteDetalle.jsx ← Vista de cargos
    │   │   ├── DeudaForm.jsx    ← Formulario cargo
    │   │   └── ConfirmDialog.jsx
    │   ├── api.js      ← Axios + endpoints
    │   ├── App.jsx     ← App principal
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```
