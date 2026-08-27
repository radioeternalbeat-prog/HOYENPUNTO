# 🕐 HoyEnPunto

**Plataforma SaaS de Gestión de Reservas y Citas para Negocios Locales**

> *"Puntualidad absoluta. Cero excusas."*

---

## 🎯 ¿Qué es HoyEnPunto?

HoyEnPunto es una solución integral que permite a negocios locales y profesionales independientes digitalizar su agenda de citas con una experiencia que transmite **orden, eficiencia y puntualidad absoluta**.

### Principales beneficios:
- ✅ Reservas online 24/7 para tus clientes
- ✅ Reducción drástica de no-shows con recordatorios automáticos
- ✅ Calendario inteligente sin dobles reservas
- ✅ Personalización de marca (White-Label)
- ✅ Panel de gestión completo (clientes, servicios, empleados)

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML estático + JavaScript vanilla + CSS |
| UI Framework | Ninguno (CSS custom con glassmorphism McLaren theme) |
| Backend | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Base de Datos | PostgreSQL 16 (via Supabase) |
| Motor de Reservas | Función SQL `get_available_slots()` + `create_booking()` RPC |
| Anti-dobles | EXCLUDE constraint con GiST + transacciones SERIALIZABLE |
| Hosting | Netlify (frontend) + Supabase (backend) |
| CDN | Supabase JS SDK via jsDelivr CDN |

---

## 📁 Estructura del Proyecto

```
HOYENPUNTO/
├── docs/                      # Documentación del producto
│   └── PRD-HoyEnPunto-MVP.md # Especificación de requerimientos
├── supabase/                  # Backend (Database + Auth)
│   ├── schema.sql            # Schema completo (tablas, RLS, funciones)
│   └── seed.sql              # Datos de prueba
├── landing/                   # Frontend (Netlify)
│   ├── index.html            # Landing page pública
│   ├── styles.css            # Estilos McLaren theme
│   ├── js/                   # Módulos JavaScript
│   │   ├── supabase-config.js  # Configuración Supabase
│   │   ├── auth.js             # Autenticación
│   │   ├── db.js               # CRUD de datos
│   │   ├── availability.js     # Motor de disponibilidad
│   │   └── utils.js            # Helpers
│   ├── reservar/             # Portal de reservas (B2C dinámico)
│   ├── dashboard/            # Panel de control (B2B protegido)
│   ├── registro/             # Onboarding wizard
│   └── assets/
├── netlify.toml               # Configuración de despliegue
├── SETUP.md                   # 🛠️ Guía de instalación paso a paso
└── README.md
```

---

## 🚀 Despliegue

La landing page se despliega automáticamente en **Netlify** con cada push a `main`.

**Guía completa de instalación:** [SETUP.md](./SETUP.md)

### Quick Start:
1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Edita `landing/js/supabase-config.js` con tus credenciales
4. Push a GitHub → Netlify despliega automáticamente

---

## 📋 Documentación

- [PRD del MVP](./docs/PRD-HoyEnPunto-MVP.md) — Especificación completa del producto

---

## 🎯 Segmentos Objetivo

- Salones de belleza y barberías
- Clínicas y consultorios médicos
- Consultores y coaches
- Talleres y servicios técnicos
- Academias y tutores

---

## 📄 Licencia

Proyecto privado — © 2026 HoyEnPunto. Todos los derechos reservados.
