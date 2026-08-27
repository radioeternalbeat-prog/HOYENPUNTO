# 🛠️ HoyEnPunto — Guía de Setup

## Requisitos Previos

- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [Netlify](https://netlify.com) (gratis)
- Repositorio GitHub conectado a Netlify

---

## 1. Configurar Supabase (Backend)

### 1.1 Crear Proyecto

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Nombre: `hoyenpunto`
4. Región: Elige la más cercana a tus usuarios (São Paulo para Chile/LATAM)
5. Password: Genera una segura y guárdala
6. Click **"Create new project"** (tarda ~2 min)

### 1.2 Ejecutar Schema SQL

1. En el panel de Supabase, ve a **SQL Editor**
2. Click **"New Query"**
3. Copia y pega TODO el contenido de `supabase/schema.sql`
4. Click **"Run"** (debe ejecutarse sin errores)

> ⚠️ Si ves errores con `EXCLUDE USING gist`, necesitas la extensión `btree_gist`:
> ```sql
> CREATE EXTENSION IF NOT EXISTS btree_gist;
> ```
> Ejecuta esto antes del schema.

### 1.3 Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL** → `https://xxxxxxxxx.supabase.co`
   - **anon/public key** → `eyJhbGciOi...` (la larga)

### 1.4 Configurar Autenticación

1. Ve a **Authentication** → **URL Configuration**
2. Configura:
   - **Site URL**: `https://tu-sitio.netlify.app`
   - **Redirect URLs**: Agrega:
     - `https://tu-sitio.netlify.app/dashboard/`
     - `http://localhost:3000/dashboard/` (para desarrollo local)

3. En **Authentication** → **Providers**:
   - ✅ Email (ya habilitado por defecto)
   - Opcional: Habilitar Google OAuth (necesita Google Cloud Console)

4. En **Authentication** → **Email Templates**:
   - Personaliza el email de confirmación si lo deseas

### 1.5 Configurar RLS (Row Level Security)

El schema ya incluye todas las políticas RLS. Verifica que estén activas:

1. Ve a **Table Editor**
2. Para cada tabla, verifica que "RLS enabled" aparezca ✓

---

## 2. Configurar Frontend

### 2.1 Actualizar Credenciales

Edita el archivo `landing/js/supabase-config.js`:

```javascript
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';    // ← Reemplazar
const SUPABASE_ANON_KEY = 'eyJhbGciOi...TU_KEY_AQUI...';  // ← Reemplazar
```

### 2.2 Verificar Estructura

```
landing/
├── index.html          ← Landing page (pública)
├── styles.css          ← Estilos globales
├── js/
│   ├── supabase-config.js  ← ⚙️ EDITAR AQUÍ tus credenciales
│   ├── auth.js             ← Autenticación
│   ├── db.js               ← CRUD de datos
│   ├── availability.js     ← Motor de disponibilidad
│   └── utils.js            ← Helpers
├── reservar/
│   └── index.html      ← Portal de reservas (público, dinámico por ?slug=)
├── dashboard/
│   └── index.html      ← Panel de control (requiere auth)
├── registro/
│   └── index.html      ← Onboarding (registro + configuración)
└── assets/
    └── favicon.svg
```

---

## 3. Desplegar en Netlify

### 3.1 Conectar Repositorio

1. Ve a [app.netlify.com](https://app.netlify.com)
2. **"Add new site"** → **"Import an existing project"**
3. Selecciona GitHub → Repositorio `HOYENPUNTO`
4. Configuración de build:
   - **Build command**: (vacío o `echo 'ok'`)
   - **Publish directory**: `landing`
5. Click **"Deploy site"**

### 3.2 Configurar Dominio (Opcional)

1. En Netlify → **Domain management**
2. Click **"Add a domain"**
3. Si tienes `hoyenpunto.com`, sigue las instrucciones de DNS

---

## 4. Verificar que Todo Funciona

### Test 1: Registro
1. Ve a `https://tu-sitio.netlify.app/registro/`
2. Crea una cuenta con email/password
3. Completa el wizard de onboarding (4 pasos)
4. Debe redirigir al dashboard

### Test 2: Dashboard
1. Ve a `https://tu-sitio.netlify.app/dashboard/`
2. Debe mostrar los stats (vacíos al inicio)
3. El enlace del portal debe mostrar tu slug

### Test 3: Portal de Reservas
1. Copia tu enlace: `https://tu-sitio.netlify.app/reservar/?slug=TU-SLUG`
2. Debe cargar tu negocio (nombre, servicios, staff)
3. Selecciona servicio → profesional → fecha → hora → datos
4. La reserva debe crearse en Supabase (verifica en Table Editor > bookings)

### Test 4: Anti-Dobles Reservas
1. Crea una reserva para las 14:00
2. Intenta crear otra para las 14:00 con el mismo staff
3. Debe mostrar error "Este horario acaba de ser tomado"

---

## 5. Datos de Prueba (Opcional)

Si quieres cargar datos demo:

1. Ve a **SQL Editor** en Supabase
2. Abre `supabase/seed.sql`
3. Reemplaza `'YOUR_USER_UUID'` con tu UUID de usuario (lo encuentras en **Authentication** → **Users**)
4. Descomenta el SQL y ejecútalo

---

## 6. Troubleshooting

| Problema | Solución |
|----------|----------|
| "Not authenticated" al cargar dashboard | Verifica que las credenciales en supabase-config.js sean correctas |
| El registro no funciona | Verifica que Email Auth esté habilitado en Supabase |
| "Service not found" al reservar | El negocio no tiene servicios. Ve al dashboard o ejecuta el seed |
| No aparecen slots disponibles | Verifica que el negocio tenga horarios configurados (tabla schedules) |
| Error CORS | Agrega tu dominio en Supabase → Settings → API → Allowed Origins |
| El portal dice "Negocio no encontrado" | Verifica el slug en la URL (?slug=mi-negocio) y que el negocio esté activo |

---

## 7. Variables de Entorno (Producción)

Para mayor seguridad, las credenciales de Supabase pueden manejarse como variables de entorno en Netlify:

1. Netlify → Site settings → Environment variables
2. Agrega:
   - `SUPABASE_URL` = `https://xxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbG...`

> ⚠️ NOTA: La `anon key` es segura para exponer en el frontend porque Supabase la protege con RLS. NUNCA expongas la `service_role key`.

---

## 8. Arquitectura de Seguridad

```
┌──────────────────────────────────────────┐
│  Frontend (HTML + JS)                    │
│  • Solo usa la anon key                  │
│  • No tiene acceso directo a la DB       │
│  • Todas las queries pasan por RLS       │
├──────────────────────────────────────────┤
│  Supabase (Backend as a Service)         │
│  • Auth: maneja registro/login/sesión    │
│  • RLS: filtra data por business_id      │
│  • Functions: create_booking() valida    │
│  • EXCLUDE constraint: previene dobles   │
└──────────────────────────────────────────┘
```

---

© 2026 HoyEnPunto — Powered by Eternal Beat Medios CL 🏎️
