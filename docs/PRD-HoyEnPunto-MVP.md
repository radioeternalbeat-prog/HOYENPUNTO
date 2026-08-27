# 📋 PRD — HoyEnPunto: Plataforma SaaS de Gestión de Reservas y Citas

**Versión:** 1.0 (MVP)  
**Fecha:** 27 de agosto de 2026  
**Autor:** Equipo de Producto HoyEnPunto  
**Estado:** Draft — Listo para revisión técnica  

---

## Índice

1. [Visión del Producto](#1-visión-del-producto)
2. [User Personas y Flujos de Usuario](#2-user-personas-y-flujos-de-usuario)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Funcionalidades Esenciales — MVP (Must Have)](#4-funcionalidades-esenciales--mvp-must-have)
5. [Funcionalidades Avanzadas — Roadmap](#5-funcionalidades-avanzadas--roadmap-de-escalabilidad)
6. [Stack Tecnológico Recomendado](#6-stack-tecnológico-recomendado)
7. [Métricas de Éxito del MVP](#7-métricas-de-éxito-del-mvp)
8. [Glosario](#8-glosario)

---

## 1. Visión del Producto

### 1.1 Propuesta de Valor

**HoyEnPunto** es la plataforma que permite a negocios locales y profesionales independientes digitalizar su agenda de citas con una experiencia que transmite **orden, eficiencia y puntualidad absoluta**. Reduce drásticamente el ausentismo de clientes (no-shows) mediante automatización inteligente de recordatorios y ofrece una experiencia de reserva en línea sin fricción para el cliente final.

### 1.2 Segmento Objetivo

| Segmento | Ejemplos |
|----------|----------|
| Salud y Bienestar | Salones de belleza, barberías, spas, centros de estética |
| Salud Profesional | Clínicas dentales, consultorios médicos, psicólogos |
| Servicios Profesionales | Consultores, abogados, contadores, coaches |
| Servicios Técnicos | Talleres mecánicos, servicios de reparación |
| Educación | Tutores, academias, profesores particulares |

### 1.3 Modelo de Negocio

SaaS basado en suscripción mensual con tiers:

| Plan | Características clave | Precio orientativo |
|------|----------------------|-------------------|
| **Starter** | 1 empleado, 50 reservas/mes, branding HoyEnPunto | Gratis / Freemium |
| **Professional** | Hasta 5 empleados, reservas ilimitadas, white-label básico | $19-29 USD/mes |
| **Business** | Empleados ilimitados, API access, integraciones avanzadas | $49-79 USD/mes |

---

## 2. User Personas y Flujos de Usuario

### 2.1 Personas

#### Persona 1: Dueño del Negocio (Business Owner)

| Atributo | Detalle |
|----------|---------|
| **Nombre Ficticio** | Carolina Méndez |
| **Edad** | 35 años |
| **Rol** | Dueña de salón de belleza "Estilo Carolina" |
| **Contexto** | Maneja 3 empleadas. Actualmente agenda citas por WhatsApp y cuaderno. Pierde ~20% de ingresos por no-shows. |
| **Frustraciones** | Dobles reservas frecuentes, tiempo excesivo coordinando agendas manualmente, no puede atender llamadas mientras trabaja. |
| **Motivaciones** | Profesionalizar su negocio, reducir cancelaciones, dedicar más tiempo a atender clientes en lugar de gestionar la agenda. |
| **Competencia Digital** | Media. Usa redes sociales e Instagram para su negocio. Cómoda con apps móviles. |

#### Persona 2: Empleado del Negocio (Staff Member)

| Atributo | Detalle |
|----------|---------|
| **Nombre Ficticio** | Daniela Torres |
| **Edad** | 26 años |
| **Rol** | Estilista en "Estilo Carolina" |
| **Contexto** | Necesita ver su agenda personal del día sin acceder a la de sus compañeras. A veces la dueña olvida avisarle de cambios. |
| **Frustraciones** | No saber con certeza su próxima cita, enterarse tarde de cancelaciones. |
| **Motivaciones** | Tener claridad sobre su horario y poder bloquear pausas personales. |
| **Competencia Digital** | Alta. Nativa digital. |

#### Persona 3: Cliente Final (End Customer)

| Atributo | Detalle |
|----------|---------|
| **Nombre Ficticio** | Martín Rojas |
| **Edad** | 42 años |
| **Rol** | Profesional que necesita agendar un corte de pelo |
| **Contexto** | Trabaja en horario de oficina. No puede llamar durante el día. Prefiere reservar en línea a cualquier hora. |
| **Frustraciones** | Llamar y que no contesten, no saber horarios disponibles, olvidar la cita. |
| **Motivaciones** | Reservar en 30 segundos desde el celular, recibir recordatorio automático. |
| **Competencia Digital** | Media-Alta. Usa apps de delivery y banca. |

---

### 2.2 Flujo del Cliente Final — Reservar una Cita

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE RESERVA — CLIENTE FINAL                      │
└─────────────────────────────────────────────────────────────────────────┘

[1] DESCUBRIMIENTO
    │  El cliente encuentra el enlace de reservas del negocio
    │  (link en bio de Instagram, tarjeta de presentación, Google Maps, QR)
    │  URL: https://hoyenpunto.com/estilo-carolina (o dominio white-label)
    ▼
[2] LANDING DE RESERVAS
    │  Se muestra la página del negocio con:
    │  • Logo y colores del negocio (white-label)
    │  • Nombre del negocio y descripción breve
    │  • Lista de servicios disponibles con duración y precio
    │  • Horario de atención
    │  • Botón principal "Reservar Ahora"
    ▼
[3] SELECCIÓN DE SERVICIO
    │  • El cliente selecciona uno o más servicios
    │  • Se muestra duración estimada total y precio
    │  • CTA: "Siguiente → Elegir profesional"
    ▼
[4] SELECCIÓN DE PROFESIONAL (Opcional)
    │  • Lista de empleados disponibles para ese servicio
    │  • Opción "Sin preferencia" (se asigna automáticamente)
    │  • Foto, nombre y especialidad de cada empleado
    │  • CTA: "Siguiente → Elegir horario"
    ▼
[5] SELECCIÓN DE FECHA Y HORA
    │  • Calendario visual con días disponibles resaltados
    │  • Al seleccionar día: slots horarios disponibles en tiempo real
    │  • Los slots ocupados NO se muestran (evita confusión)
    │  • Indicador visual del slot seleccionado
    │  • CTA: "Siguiente → Confirmar datos"
    ▼
[6] FORMULARIO DE DATOS DEL CLIENTE
    │  • Nombre completo (obligatorio)
    │  • Teléfono móvil (obligatorio)
    │  • Email (obligatorio)
    │  • Notas adicionales (opcional, ej: "Quiero un corte degradé")
    │  • Checkbox: Acepto términos y política de privacidad
    │  • CTA: "Confirmar Reserva"
    ▼
[7] CONFIRMACIÓN
    │  • Pantalla de éxito con resumen completo:
    │    - Servicio, profesional, fecha, hora, dirección del negocio
    │  • Opción: "Agregar al calendario" (descarga .ics)
    │  • Mensaje: "Recibirás un email de confirmación en breve"
    ▼
[8] NOTIFICACIONES AUTOMÁTICAS
    • Email inmediato: Confirmación de la reserva
    • Email T-24h: Recordatorio 24 horas antes
    • Email T-2h: Recordatorio 2 horas antes (configurable por negocio)
```

---

### 2.3 Flujo del Dueño del Negocio — Registro y Configuración Inicial

```
┌─────────────────────────────────────────────────────────────────────────┐
│              FLUJO DE ONBOARDING — DUEÑO DEL NEGOCIO                    │
└─────────────────────────────────────────────────────────────────────────┘

[1] REGISTRO
    │  • Accede a hoyenpunto.com → "Crear cuenta gratis"
    │  • Ingresa: Email, contraseña, nombre del negocio
    │  • Verificación de email (magic link o código OTP)
    ▼
[2] WIZARD DE CONFIGURACIÓN (Onboarding guiado - 4 pasos)
    │
    │  PASO 1/4: DATOS DEL NEGOCIO
    │  • Categoría del negocio (dropdown: Belleza, Salud, etc.)
    │  • Dirección física (autocompletado con Google Places)
    │  • Teléfono de contacto
    │  • Descripción breve (máx. 280 caracteres)
    │  • Zona horaria (autodetección)
    │
    │  PASO 2/4: HORARIOS DE ATENCIÓN
    │  • Selector visual día por día (Lun-Dom)
    │  • Hora de apertura y cierre por día
    │  • Opción de copiar horario a todos los días
    │  • Marcar días de descanso
    │
    │  PASO 3/4: SERVICIOS
    │  • Agregar al menos 1 servicio:
    │    - Nombre del servicio
    │    - Duración (en minutos, selector con incrementos de 15 min)
    │    - Precio (moneda local, autodetectada)
    │    - Descripción (opcional)
    │  • Botón "+ Agregar otro servicio"
    │
    │  PASO 4/4: PERSONALIZACIÓN
    │  • Subir logotipo (máx 2MB, formatos: PNG, JPG, SVG)
    │  • Seleccionar color primario de marca (color picker)
    │  • Preview en vivo del widget de reservas con su branding
    │  • URL personalizada: hoyenpunto.com/[slug-negocio]
    ▼
[3] DASHBOARD ACTIVO
    │  • Se muestra el panel de control con calendario vacío
    │  • Banner de bienvenida con checklist de "próximos pasos":
    │    ☐ Agregar empleados
    │    ☐ Compartir tu enlace de reservas
    │    ☐ Configurar recordatorios
    │  • Enlace copiable del portal de reservas
    │  • Vista previa de cómo se ve la página pública del negocio
    ▼
[4] OPERACIÓN DIARIA
    • Recibe notificaciones de nuevas reservas
    • Gestiona calendario (confirmar, cancelar, reprogramar)
    • Agrega reservas manuales (clientes que llaman)
    • Consulta historial de clientes
```

---

## 3. Arquitectura del Sistema

### 3.1 Diagrama Conceptual de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARQUITECTURA HOYENPUNTO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐         ┌──────────────────────────┐              │
│  │   PANEL B2B (SPA)   │         │  PORTAL B2C (SSR/SSG)    │              │
│  │                     │         │                          │              │
│  │  • Dashboard        │         │  • Landing del negocio   │              │
│  │  • Calendario       │         │  • Widget de reservas    │              │
│  │  • CRM Clientes     │         │  • Confirmación          │              │
│  │  • Config. Negocio  │         │  • White-label theming   │              │
│  │  • Gestión Staff    │         │                          │              │
│  └────────┬────────────┘         └────────────┬─────────────┘              │
│           │                                   │                            │
│           │          HTTPS / WebSocket         │                            │
│           ▼                                   ▼                            │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                     API GATEWAY (REST + WS)                  │           │
│  │              Rate Limiting · Auth · Routing                  │           │
│  └──────────────────────────┬──────────────────────────────────┘           │
│                             │                                              │
│  ┌──────────────────────────▼──────────────────────────────────┐           │
│  │                    BACKEND SERVICES                          │           │
│  │                                                             │           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │           │
│  │  │  Auth    │  │ Booking  │  │ Notif.    │  │ Business │  │           │
│  │  │ Service  │  │ Engine   │  │ Service   │  │ Service  │  │           │
│  │  └──────────┘  └──────────┘  └───────────┘  └──────────┘  │           │
│  │                                                             │           │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐                 │           │
│  │  │ Calendar │  │ Customer │  │  Tenant   │                 │           │
│  │  │ Service  │  │ Service  │  │ Service   │                 │           │
│  │  └──────────┘  └──────────┘  └───────────┘                 │           │
│  └──────────────────────────┬──────────────────────────────────┘           │
│                             │                                              │
│  ┌──────────────────────────▼──────────────────────────────────┐           │
│  │                      DATA LAYER                             │           │
│  │                                                             │           │
│  │  ┌──────────────┐  ┌─────────────┐  ┌───────────────────┐  │           │
│  │  │  PostgreSQL  │  │    Redis    │  │   Object Storage  │  │           │
│  │  │  (Primary)   │  │  (Cache +   │  │   (Logos, assets) │  │           │
│  │  │              │  │   Pub/Sub)  │  │                   │  │           │
│  │  └──────────────┘  └─────────────┘  └───────────────────┘  │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────┐           │
│  │                   INFRAESTRUCTURA                           │           │
│  │    CDN · Load Balancer · Auto-scaling · Monitoring          │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Panel B2B vs. Portal B2C

| Aspecto | Panel B2B (Negocio) | Portal B2C (Cliente Final) |
|---------|--------------------|-----------------------------|
| **Usuarios** | Dueños de negocio + empleados | Clientes finales |
| **Acceso** | Requiere autenticación | Público (sin login obligatorio) |
| **Tecnología** | SPA (Single Page Application) | SSR + Hidratación parcial |
| **Branding** | UI fija de HoyEnPunto | Personalizable por negocio (white-label) |
| **Funciones** | CRUD completo, analytics, config. | Solo lectura + formulario de reserva |
| **URL** | app.hoyenpunto.com | hoyenpunto.com/{slug} o dominio propio |

### 3.3 Prevención de Dobles Reservas — Estrategia de Concurrencia

La integridad de las reservas es **crítica**. Se implementa un sistema de doble validación:

```
┌─────────────────────────────────────────────────────────────┐
│           ESTRATEGIA ANTI-DOBLE RESERVA                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CAPA 1: LOCK OPTIMISTA (Redis)                            │
│  ─────────────────────────────────                          │
│  • Al seleccionar un slot, se crea un "soft lock" en Redis  │
│    con TTL de 5 minutos (tiempo para completar formulario)  │
│  • Key: lock:{business_id}:{staff_id}:{datetime}           │
│  • Si otro usuario intenta el mismo slot → "No disponible" │
│  • Si el usuario no completa → TTL expira, slot se libera  │
│                                                             │
│  CAPA 2: CONSTRAINT A NIVEL DE BASE DE DATOS               │
│  ────────────────────────────────────────────               │
│  • UNIQUE constraint compuesto en tabla `bookings`:          │
│    (business_id, staff_id, start_time, status != cancelled) │
│  • Transacción con isolation level SERIALIZABLE             │
│    para la operación INSERT de reserva                      │
│  • En caso de conflicto DB → error manejado                │
│    → se notifica al usuario y se ofrecen alternativas       │
│                                                             │
│  CAPA 3: VALIDACIÓN EN TIEMPO REAL (WebSocket)             │
│  ─────────────────────────────────────────────              │
│  • Cuando se confirma una reserva, se emite evento via WS   │
│  • Todos los clientes viendo el mismo día/staff reciben     │
│    actualización instantánea del calendario                 │
│  • Los slots recién ocupados desaparecen sin refresh        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Flujo técnico de la reserva:**

```sql
-- Pseudocódigo de la transacción de reserva
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 1. Verificar que el slot sigue libre
SELECT COUNT(*) FROM bookings
WHERE business_id = $1
  AND staff_id = $2
  AND start_time = $3
  AND status NOT IN ('cancelled', 'no_show');

-- 2. Si count = 0, insertar
INSERT INTO bookings (business_id, staff_id, customer_id, service_id, start_time, end_time, status)
VALUES ($1, $2, $3, $4, $5, $6, 'confirmed');

-- 3. Liberar lock en Redis
-- 4. Emitir evento WebSocket: 'booking:created'
-- 5. Encolar notificación de confirmación

COMMIT;
```

### 3.4 Modelo de Datos Multi-Tenant

Se utiliza un modelo **single-database, shared-schema** con discriminador `business_id` en todas las tablas. Esto permite:

- Escalabilidad con menor costo operacional
- Queries eficientes con índices compuestos
- Aislamiento lógico de datos entre negocios
- Migración futura a sharding si el volumen lo requiere

**Diagrama ER simplificado (entidades principales):**

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   businesses   │     │     staff      │     │   services     │
├────────────────┤     ├────────────────┤     ├────────────────┤
│ id (PK)        │◄────│ business_id(FK)│     │ id (PK)        │
│ owner_id (FK)  │     │ id (PK)        │     │ business_id(FK)│
│ name           │     │ user_id (FK)   │     │ name           │
│ slug (UNIQUE)  │     │ display_name   │     │ duration_min   │
│ category       │     │ role           │     │ price          │
│ timezone       │     │ avatar_url     │     │ description    │
│ logo_url       │     │ is_active      │     │ is_active      │
│ primary_color  │     └────────────────┘     └────────────────┘
│ address        │              │                      │
│ phone          │              │                      │
│ plan_tier      │              ▼                      │
└────────────────┘     ┌────────────────┐             │
        │              │ staff_services │             │
        │              ├────────────────┤             │
        │              │ staff_id (FK)  │◄────────────┘
        │              │ service_id(FK) │
        │              └────────────────┘
        │
        ▼
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│   schedules    │     │   bookings     │     │   customers    │
├────────────────┤     ├────────────────┤     ├────────────────┤
│ id (PK)        │     │ id (PK/UUID)   │     │ id (PK)        │
│ business_id(FK)│     │ business_id(FK)│     │ business_id(FK)│
│ staff_id (FK)  │     │ staff_id (FK)  │     │ name           │
│ day_of_week    │     │ customer_id(FK)│     │ email          │
│ start_time     │     │ service_id(FK) │     │ phone          │
│ end_time       │     │ start_time     │     │ notes          │
│ is_available   │     │ end_time       │     │ total_visits   │
└────────────────┘     │ status         │     │ last_visit_at  │
                       │ notes          │     │ created_at     │
┌────────────────┐     │ created_at     │     └────────────────┘
│   holidays     │     └────────────────┘
├────────────────┤
│ id (PK)        │     Status ENUM:
│ business_id(FK)│     • pending
│ date           │     • confirmed
│ description    │     • completed
│ is_recurring   │     • cancelled
└────────────────┘     • no_show
```

### 3.5 Seguridad y Gestión de Datos

| Área | Implementación |
|------|---------------|
| **Autenticación** | JWT (access token 15 min + refresh token 7 días). OAuth 2.0 para login social (Google). |
| **Autorización** | RBAC (Role-Based Access Control): `owner`, `staff`, `customer`. Middleware de validación por ruta. |
| **Encriptación en tránsito** | TLS 1.3 obligatorio. HSTS headers. |
| **Encriptación en reposo** | AES-256 para datos sensibles (emails, teléfonos) en la base de datos. |
| **Aislamiento de datos** | Row-Level Security (RLS) en PostgreSQL filtrado por `business_id`. Cada query incluye obligatoriamente el tenant context. |
| **Rate Limiting** | 100 req/min para API pública (portal reservas), 500 req/min para panel B2B autenticado. |
| **Validación de input** | Schemas Zod/Joi en backend. Sanitización contra XSS e inyección SQL (parameterized queries). |
| **GDPR/Privacidad** | Consentimiento explícito al reservar. Derecho a eliminación de datos (soft-delete + purge schedule 30 días). Política de retención de datos documentada. |
| **Backups** | Snapshots automáticos cada 6 horas. Point-in-time recovery hasta 7 días. |
| **Auditoría** | Tabla `audit_logs` registra quién hizo qué y cuándo (CREATE, UPDATE, DELETE en entidades core). |

---

## 4. Funcionalidades Esenciales — MVP (Must Have)

### 4.1 Panel de Control del Negocio (Web App — B2B)

#### 4.1.1 Dashboard Principal

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Vista de calendario | Diario, semanal y mensual. Drag & drop para reprogramar. | P0 |
| Resumen del día | Citas de hoy, próxima cita, citas pendientes de confirmar | P0 |
| Indicadores clave | Reservas esta semana, tasa de no-show, nuevos clientes | P1 |
| Acciones rápidas | Crear reserva manual, bloquear horario, ver agenda de staff | P0 |

#### 4.1.2 Gestión de Servicios

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| CRUD de servicios | Crear, editar, eliminar, activar/desactivar servicios | P0 |
| Campos por servicio | Nombre, duración (min), precio, descripción, categoría | P0 |
| Asignación a staff | Definir qué empleados pueden prestar cada servicio | P0 |
| Ordenamiento | Drag & drop para ordenar servicios en el portal público | P1 |

#### 4.1.3 Gestión de Empleados (Staff)

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Agregar empleados | Invitación por email con rol asignado | P0 |
| Horarios individuales | Cada empleado puede tener horarios distintos | P0 |
| Permisos por rol | Owner: acceso total. Staff: solo su calendario y clientes | P0 |
| Avatar y bio | Foto y descripción visible en portal de reservas | P1 |

#### 4.1.4 Gestión de Horarios

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Horario semanal base | Definir horas de atención por día de la semana | P0 |
| Días festivos | Marcar fechas específicas como no laborables | P0 |
| Bloqueo de slots | Bloquear horarios puntuales (reunión, almuerzo, etc.) | P0 |
| Buffer entre citas | Tiempo de descanso configurable entre servicios (0-30 min) | P1 |

#### 4.1.5 CRM Básico de Clientes

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Lista de clientes | Búsqueda, filtros, ordenamiento | P0 |
| Ficha del cliente | Nombre, contacto, historial de visitas, notas | P0 |
| Historial de citas | Todas las reservas pasadas y futuras del cliente | P0 |
| Notas internas | El staff puede agregar notas sobre preferencias del cliente | P1 |
| Importación básica | Carga masiva via CSV | P2 |

#### 4.1.6 Gestión de Reservas

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Crear reserva manual | Para clientes que llaman o llegan sin cita previa | P0 |
| Confirmar/Cancelar | Cambiar estado de la reserva | P0 |
| Reprogramar | Mover cita a otro horario (notifica al cliente) | P0 |
| Marcar no-show | Registrar ausencia del cliente | P1 |
| Lista de espera | Si se cancela una cita, ofrecer a siguiente en lista | P2 |

### 4.2 Portal de Reservas — Cliente Final (B2C)

| Funcionalidad | Descripción | Prioridad |
|--------------|-------------|-----------|
| Landing del negocio | Página pública con info del negocio y servicios | P0 |
| Selector de servicio | Cards con nombre, duración, precio. Multi-selección | P0 |
| Selector de profesional | Lista con foto y nombre. Opción "Sin preferencia" | P0 |
| Calendario de disponibilidad | Vista de días disponibles + slots horarios en tiempo real | P0 |
| Formulario de datos | Nombre, teléfono, email, notas. Validación en tiempo real | P0 |
| Confirmación visual | Resumen de la cita + descarga archivo .ics | P0 |
| Responsive design | Mobile-first, funciona perfecto en cualquier dispositivo | P0 |
| Velocidad de carga | < 2 segundos en first contentful paint (3G) | P0 |
| SEO básico | Meta tags, Open Graph para compartir en redes | P1 |
| Accesibilidad | WCAG 2.1 nivel AA | P1 |

### 4.3 Sistema de Notificaciones (MVP)

| Notificación | Canal | Trigger | Contenido |
|-------------|-------|---------|-----------|
| Confirmación de reserva | Email | Inmediato al reservar | Resumen completo + enlace para cancelar/reprogramar |
| Recordatorio 24h | Email | 24 horas antes de la cita | Datos de la cita + dirección + enlace a mapa |
| Recordatorio 2h | Email | 2 horas antes (configurable) | Recordatorio breve |
| Nueva reserva (al negocio) | Email + Dashboard | Inmediato al recibir reserva | Datos del cliente y servicio |
| Cancelación | Email | Al cancelar (cualquier parte) | Confirmación de cancelación |

**Configuración por parte del negocio:**
- Activar/desactivar cada tipo de recordatorio
- Personalizar tiempos de recordatorio (2h, 4h, 12h, 24h, 48h)
- Texto personalizable en los emails (MVP: plantillas predefinidas con variables)

### 4.4 Personalización de Marca (White-Label Básico)

| Elemento personalizable | Detalle |
|-------------------------|---------|
| Logotipo | Upload de imagen, se muestra en header del portal de reservas |
| Color primario | Aplica a botones, links, acentos. Color picker en configuración |
| Color secundario | Fondo de header, bordes. Derivado automáticamente si no se elige |
| Slug de URL | hoyenpunto.com/{mi-negocio} — elegido en onboarding |
| Favicon | Generado automáticamente desde el logo (crop circular) |
| Mensaje de bienvenida | Texto libre mostrado en la landing (máx. 500 caracteres) |

**Nota:** En el MVP, el footer mantiene "Powered by HoyEnPunto" con link. En planes superiores (futuro) se elimina.

---

## 5. Funcionalidades Avanzadas — Roadmap de Escalabilidad

### 5.1 Fase 2 (Post-MVP, ~Q2 2027)

| Funcionalidad | Implementación prevista |
|--------------|------------------------|
| **Pasarela de pagos** | Integración con Stripe y MercadoPago. Cobro parcial (seña) o total al reservar. Webhook para confirmar pago → confirmar reserva. Panel de facturación para el negocio. |
| **WhatsApp Business API** | Integración con Meta Cloud API. Templates de mensajes aprobados. Recordatorios automáticos vía WhatsApp (mayor tasa de apertura que email). Confirmación con botones interactivos ("Confirmar / Reprogramar"). |
| **Sincronización de calendarios** | OAuth con Google Calendar y Microsoft Outlook. Sync bidireccional: citas de HoyEnPunto aparecen en el calendario personal del staff, y bloques del calendario personal bloquean disponibilidad en HoyEnPunto. Manejo de conflictos con prioridad configurable. |

### 5.2 Fase 3 (~Q4 2027)

| Funcionalidad | Implementación prevista |
|--------------|------------------------|
| **Programa de lealtad** | Sistema de puntos por visita. Recompensas configurables por el negocio (descuento, servicio gratis). Tarjeta digital del cliente con progreso. |
| **Reservas recurrentes** | Citas que se repiten (ej: "cada 3 semanas, mismo horario"). Gestión de serie con edición individual o completa. |
| **Reportes avanzados** | Analytics de ocupación, ingresos, no-show rate por período. Exportación PDF/Excel. Comparativas mes a mes. |
| **App móvil nativa** | React Native / Flutter para iOS y Android. Push notifications. Acceso offline al calendario del día. |
| **Marketplace** | Directorio público de negocios en HoyEnPunto. Búsqueda por categoría, ubicación, valoraciones. SEO orgánico para atraer clientes finales directamente. |

### 5.3 Fase 4 (~2028)

| Funcionalidad | Implementación prevista |
|--------------|------------------------|
| **API pública + Webhooks** | REST API documentada (OpenAPI 3.0) para integraciones de terceros. Webhooks configurables por evento. SDK en JS/Python. |
| **White-label completo** | Dominio propio del negocio (CNAME). Eliminación total de branding HoyEnPunto. Emails desde dominio del negocio (SPF/DKIM). |
| **IA predictiva** | Predicción de no-shows basada en historial. Sugerencias de horarios óptimos. Asignación automática de staff por demanda. |

---

## 6. Stack Tecnológico Recomendado

### 6.1 Resumen del Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK TECNOLÓGICO HOYENPUNTO                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND                                                       │
│  ├── Framework:      Next.js 14+ (App Router)                  │
│  ├── Lenguaje:       TypeScript 5.x                            │
│  ├── UI Library:     Tailwind CSS + shadcn/ui                  │
│  ├── Estado:         Zustand (client) + React Query (server)   │
│  ├── Formularios:    React Hook Form + Zod                     │
│  ├── Calendario:     FullCalendar (licencia comercial)         │
│  └── Real-time:      Socket.io client                          │
│                                                                 │
│  BACKEND                                                        │
│  ├── Runtime:        Node.js 20 LTS                            │
│  ├── Framework:      NestJS 10+                                │
│  ├── Lenguaje:       TypeScript 5.x                            │
│  ├── ORM:            Prisma (type-safe, migrations)            │
│  ├── Validación:     class-validator + class-transformer       │
│  ├── Auth:           Passport.js + JWT                         │
│  ├── Real-time:      Socket.io (WebSocket gateway)             │
│  ├── Queue:          BullMQ (jobs: emails, recordatorios)      │
│  └── Email:          Resend (o SendGrid como fallback)         │
│                                                                 │
│  BASE DE DATOS                                                  │
│  ├── Primary:        PostgreSQL 16 (Neon o Supabase DB)        │
│  ├── Cache/Locks:    Redis (Upstash serverless)                │
│  └── Search:         PostgreSQL Full-Text (MVP suficiente)     │
│                                                                 │
│  INFRAESTRUCTURA                                                │
│  ├── Hosting:        Vercel (Frontend) + Railway/Render (API)  │
│  ├── Storage:        Cloudflare R2 (logos, assets)             │
│  ├── CDN:            Vercel Edge / Cloudflare                  │
│  ├── DNS:            Cloudflare                                │
│  ├── Monitoring:     Sentry (errors) + Axiom (logs)           │
│  └── CI/CD:          GitHub Actions                            │
│                                                                 │
│  SERVICIOS EXTERNOS                                             │
│  ├── Email:          Resend (transactional emails)             │
│  ├── SMS (futuro):   Twilio                                   │
│  ├── Maps:           Google Places API (autocompletado)        │
│  └── Analytics:      PostHog (product analytics, self-hosted)  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Justificación de Decisiones Tecnológicas

| Decisión | Justificación |
|----------|--------------|
| **Next.js (Frontend)** | SSR para el portal de reservas (SEO + velocidad), SPA para el panel B2B. Un solo framework para ambas interfaces. Edge rendering para baja latencia global. Image optimization incluido. |
| **NestJS (Backend)** | Framework enterprise-grade con arquitectura modular por diseño. Decoradores para rutas, guards, interceptors. Soporte nativo de WebSockets y microservicios. Excelente DX con TypeScript. Comunidad activa y well-documented. |
| **TypeScript (Full-Stack)** | Type-safety end-to-end. Shared types entre frontend y backend (monorepo). Reduce bugs en producción ~40%. Mejor autocompletado y refactoring en equipo. |
| **PostgreSQL** | ACID compliance esencial para reservas. Row-Level Security para multi-tenancy. JSON columns para datos flexibles. Escalable verticalmente para MVP, horizontalmente con read replicas después. |
| **Redis (Upstash)** | Locks distribuidos para prevención de dobles reservas. Cache de slots disponibles (reduce queries). Pub/Sub para WebSocket scaling. Serverless = $0 en idle. |
| **Prisma ORM** | Migrations versionadas en Git. Type-safe queries (genera tipos desde schema). Prisma Studio para debugging. Soporta PostgreSQL y migrations automáticas. |
| **BullMQ** | Job queue robusto para tareas asíncronas (emails, recordatorios programados). Retry automático, dead-letter queues. Dashboard visual (Bull Board). Backed by Redis. |
| **Vercel + Railway** | Vercel: deployment automático, preview branches, edge functions. Railway: containers persistentes para el backend (WebSockets necesitan long-lived connections). Ambos con free tiers generosos para MVP. |
| **Monorepo (Turborepo)** | Shared packages (types, utils, validation schemas). Un solo CI/CD pipeline. Atomic commits cross-frontend/backend. Faster builds con caching. |

### 6.3 Estructura del Monorepo

```
hoyenpunto/
├── apps/
│   ├── web/                    # Next.js — Portal B2C + Panel B2B
│   │   ├── app/
│   │   │   ├── (public)/       # Rutas públicas (portal de reservas)
│   │   │   │   └── [slug]/     # Landing dinámica por negocio
│   │   │   ├── (dashboard)/    # Rutas autenticadas (panel B2B)
│   │   │   │   ├── calendar/
│   │   │   │   ├── clients/
│   │   │   │   ├── services/
│   │   │   │   ├── staff/
│   │   │   │   └── settings/
│   │   │   └── api/            # API routes (auth callbacks, webhooks)
│   │   └── components/
│   │       ├── booking/        # Componentes del widget de reservas
│   │       ├── dashboard/      # Componentes del panel
│   │       └── ui/             # shadcn/ui components
│   │
│   └── api/                    # NestJS — Backend API
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── bookings/
│       │   │   ├── businesses/
│       │   │   ├── calendar/
│       │   │   ├── customers/
│       │   │   ├── notifications/
│       │   │   ├── services/
│       │   │   └── staff/
│       │   ├── common/         # Guards, interceptors, filters
│       │   ├── config/         # Environment config module
│       │   └── prisma/         # Prisma service + schema
│       └── prisma/
│           ├── schema.prisma
│           └── migrations/
│
├── packages/
│   ├── types/                  # Shared TypeScript types/interfaces
│   ├── validators/             # Shared Zod schemas
│   ├── utils/                  # Shared utility functions
│   └── email-templates/        # React Email templates
│
├── turbo.json                  # Turborepo config
├── package.json                # Root workspace config
└── .github/
    └── workflows/
        ├── ci.yml              # Lint, type-check, test on PR
        └── deploy.yml          # Deploy on merge to main
```

---

## 7. Métricas de Éxito del MVP

### 7.1 KPIs de Producto (primeros 3 meses post-launch)

| Métrica | Objetivo | Cómo se mide |
|---------|----------|--------------|
| Negocios registrados | 50+ | Registros completados (onboarding finalizado) |
| Reservas procesadas | 1,000+ totales | Bookings con status `confirmed` o `completed` |
| Tasa de conversión (visita → reserva) | >30% | Visitas al portal / reservas completadas |
| Tasa de no-show (con recordatorios) | <15% | Bookings marcados `no_show` / total |
| NPS de dueños de negocio | >40 | Encuesta in-app al día 14 |
| Tiempo de reserva (cliente) | <90 segundos | Analytics: inicio flujo → confirmación |
| Uptime | >99.5% | Monitoring (Sentry + healthchecks) |

### 7.2 KPIs Técnicos

| Métrica | Objetivo |
|---------|----------|
| Time to First Byte (portal) | < 200ms |
| Largest Contentful Paint | < 2.5s |
| API response time (p95) | < 300ms |
| WebSocket latency | < 100ms |
| Error rate | < 0.1% |
| Deploy frequency | ≥ 1/día |

---

## 8. Glosario

| Término | Definición |
|---------|-----------|
| **Slot** | Bloque de tiempo disponible para agendar un servicio |
| **Staff** | Empleado o profesional del negocio que presta servicios |
| **Tenant** | Un negocio suscriptor dentro de la plataforma multi-tenant |
| **No-show** | Cliente que no se presenta a su cita sin cancelar previamente |
| **White-label** | Capacidad de personalizar la interfaz con la marca del negocio |
| **Soft lock** | Reserva temporal de un slot mientras el usuario completa el formulario |
| **B2B** | Business-to-Business (HoyEnPunto → Negocio suscriptor) |
| **B2C** | Business-to-Consumer (Negocio → Cliente final, a través de HoyEnPunto) |
| **MVP** | Minimum Viable Product — versión mínima funcional para validar el mercado |
| **Slug** | Identificador URL-friendly del negocio (ej: "estilo-carolina") |
| **RBAC** | Role-Based Access Control — control de acceso basado en roles |
| **RLS** | Row-Level Security — seguridad a nivel de fila en PostgreSQL |

---

## Apéndice A: Estimación de Esfuerzo MVP

| Módulo | Esfuerzo estimado | Equipo mínimo |
|--------|-------------------|--------------|
| Infraestructura + CI/CD | 1 semana | 1 DevOps/Fullstack |
| Auth + Multi-tenancy | 2 semanas | 1 Backend |
| Gestión de negocios + servicios + staff | 2 semanas | 1 Backend + 1 Frontend |
| Motor de reservas + anti-dobles | 3 semanas | 1 Backend Senior |
| Calendario visual (panel B2B) | 2 semanas | 1 Frontend |
| Portal de reservas (B2C) | 2 semanas | 1 Frontend |
| Sistema de notificaciones | 1.5 semanas | 1 Backend |
| White-label + theming | 1 semana | 1 Frontend |
| QA + Bug fixing + Polish | 2 semanas | Equipo completo |
| **Total estimado** | **~10-12 semanas** | **3-4 developers** |

---

*Documento generado como guía técnica para el equipo de desarrollo de HoyEnPunto. Sujeto a iteración conforme se valide con usuarios reales durante la fase de discovery y desarrollo del MVP.*
