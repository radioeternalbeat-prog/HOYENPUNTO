# 📦 HoyEnPunto — JavaScript Modules

## Archivos

| Archivo | Descripción | Depende de |
|---------|-------------|-----------|
| `supabase-config.js` | Inicializa el cliente de Supabase | Supabase SDK (CDN) |
| `auth.js` | Autenticación (registro, login, logout, sesión) | supabase-config |
| `db.js` | CRUD de todas las entidades (businesses, services, staff, bookings, customers) | supabase-config, auth |
| `availability.js` | Motor de disponibilidad (slots libres, días activos) | supabase-config, db |
| `utils.js` | Helpers (formateo, validación, UI toasts, spinners) | Ninguno |

## Cómo incluir en una página HTML

```html
<!-- Supabase SDK via CDN (SIEMPRE primero) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Módulos de HoyEnPunto (en este orden) -->
<script src="/js/supabase-config.js"></script>
<script src="/js/auth.js"></script>
<script src="/js/db.js"></script>
<script src="/js/availability.js"></script>
<script src="/js/utils.js"></script>
```

## Configuración requerida

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En el SQL Editor, ejecuta `supabase/schema.sql`
3. Edita `supabase-config.js`:
   - `SUPABASE_URL` → Tu project URL (Settings > API)
   - `SUPABASE_ANON_KEY` → Tu anon/public key (Settings > API)
4. En Authentication > URL Configuration:
   - Site URL: `https://tu-sitio.netlify.app`
   - Redirect URLs: `https://tu-sitio.netlify.app/dashboard/`

## Uso básico

```javascript
// Auth
const { user, error } = await Auth.signUp('email@test.com', 'password123');
const { user } = await Auth.signIn('email@test.com', 'password123');
await Auth.signOut();

// Business
const { data: business } = await DB.businesses.getMine();
const { data: business } = await DB.businesses.getBySlug('estilo-carolina');

// Services
const { data: services } = await DB.services.getByBusiness(businessId);
await DB.services.create(businessId, { name: 'Corte', duration_minutes: 45, price: 15000 });

// Availability
const slots = await Availability.getSlots(businessId, staffId, '2026-08-27', 45);
// → [{start: "09:00", end: "09:45"}, {start: "09:30", end: "10:15"}, ...]

// Bookings
const { bookingId } = await DB.bookings.create({
    businessId, serviceId, staffId,
    startTime: '2026-08-27T14:00:00',
    customerName: 'Martín Rojas',
    customerEmail: 'martin@email.com',
    customerPhone: '+56944444444'
});
```
