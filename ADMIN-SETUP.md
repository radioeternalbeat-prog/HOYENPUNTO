# 🔐 HoyEnPunto — Panel de Administrador (Super-Admin)

Guía para configurar tu acceso de administrador y usar el CRM interno.

---

## ¿Qué es el Panel Admin?

El panel de administrador (`/admin/`) te permite (solo a ti, el dueño de HoyEnPunto):

- 📊 Ver **stats globales** de toda la plataforma (negocios, reservas, clientes, cupos vendidos)
- 📋 Ver **todas las cuentas** creadas por cualquier negocio
- ✏️ **Modificar** el estado de cada cuenta (plan, suscripción, activar/suspender)
- 📝 Llevar **notas internas (CRM)** por cada negocio
- 🔗 Acceder al portal de reservas de cualquier negocio
- 🔥 Monitorear los **50 cupos** de la oferta de lanzamiento

---

## Configuración (una sola vez)

### Paso 1: Ejecutar el SQL del admin

1. Ve a **Supabase → SQL Editor → New Query**
2. Copia y pega TODO el contenido de `supabase/admin-and-trial.sql`
3. Click **Run**

Esto agrega:
- Campos de trial (`trial_ends_at`, `subscription_status`, `notes_admin`)
- Tabla `super_admins`
- Funciones y políticas RLS para super-admin

### Paso 2: Registrarte como Super-Admin

En el **SQL Editor**, ejecuta esto (reemplaza con TU email real, el mismo con el que te registraste en HoyEnPunto):

```sql
INSERT INTO super_admins (email, user_id)
SELECT 'TU-EMAIL@gmail.com', id
FROM auth.users
WHERE email = 'TU-EMAIL@gmail.com';
```

> ⚠️ Si aún no tienes cuenta en HoyEnPunto, primero regístrate en `/registro/`, luego ejecuta este SQL con tu email.

### Paso 3: Acceder al Panel

1. Inicia sesión normalmente en `/login/`
2. Ve a **`https://hoyenpunto.netlify.app/admin/`**
3. O verás un nuevo link **⚡ Panel Admin** en el sidebar de tu dashboard

> Si no eres super-admin, verás una pantalla de "Acceso Restringido".

---

## Cómo usar el CRM interno

### Ver todas las cuentas
En el panel admin verás la lista completa de negocios con:
- Nombre y email del dueño
- Slug del portal
- Número de reservas y clientes
- Estado de suscripción (Trial / Activo / Perpetua / Expirado / Cancelado)

### Modificar una cuenta
Click en cualquier negocio para abrir su detalle. Ahí puedes:

| Campo | Opciones |
|-------|----------|
| **Estado de suscripción** | Trial, Activo, Perpetua ($29), Expirado, Cancelado |
| **Plan** | Starter, Professional, Business |
| **Cuenta activa** | Sí (operativa) / No (suspendida) |
| **Notas internas** | Texto libre para tu CRM (ej: "Contactado, quiere Business") |

Click **Guardar Cambios** y listo.

### Ejemplo de flujo con un cliente:
1. Un negocio se registra → aparece como **Trial** (7 días)
2. Le vendes la oferta perpetua → cambias su estado a **Perpetua**
3. Anotas en las notas CRM: *"Pagó $29 vía transferencia el 15-nov"*
4. El contador de cupos se actualiza automáticamente (X/50)

---

## Seguridad

- Solo los emails en la tabla `super_admins` pueden acceder
- Las políticas RLS de Supabase bloquean el acceso a nivel de base de datos
- Aunque alguien conozca la URL `/admin/`, no verá nada si no es super-admin
- La `anon key` expuesta en el frontend es segura porque RLS protege los datos

---

## Agregar más administradores (opcional)

Si quieres dar acceso admin a un socio o colaborador:

```sql
INSERT INTO super_admins (email, user_id)
SELECT 'socio@email.com', id
FROM auth.users
WHERE email = 'socio@email.com';
```

---

© 2026 HoyEnPunto — Powered by Eternal Beat Medios CL 🏎️
