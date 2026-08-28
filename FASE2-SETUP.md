# 🚀 HoyEnPunto — Fase 2: Pagos, Recordatorios y Analytics

Guía para activar las 3 nuevas funcionalidades.

---

## 1. 💳 Pagos con MercadoPago

### 1.1 Crear cuenta y obtener credenciales

1. Ve a **https://www.mercadopago.cl/developers/panel**
2. Inicia sesión (o crea cuenta de MercadoPago)
3. Crea una aplicación → **"Crear aplicación"**
4. En **Credenciales de producción**, copia el **Access Token** (empieza con `APP_USR-...`)

> 💡 Para pruebas, usa las **credenciales de prueba** (Access Token de test) y tarjetas de prueba de MercadoPago.

### 1.2 Configurar en Netlify

En **Netlify → Site settings → Environment variables**, agrega:

| Variable | Valor |
|----------|-------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-...` (tu access token) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key de Supabase (ver abajo) |

### 1.3 Obtener el SUPABASE_SERVICE_ROLE_KEY

1. Supabase → **Settings → API**
2. En **Project API keys**, copia la key **`service_role`** (la secreta, NO la anon)
3. ⚠️ Esta key es SECRETA — solo se usa server-side en las Netlify Functions, nunca en el frontend

### 1.4 Cómo funciona el flujo de pago

```
Usuario en trial → Dashboard muestra banner "Activar por $29"
   → Click → /dashboard/upgrade.html
   → Click "Pagar $29" → /api/create-payment (crea preferencia MercadoPago)
   → Redirige a checkout de MercadoPago
   → Usuario paga
   → MercadoPago llama a /api/payment-webhook
   → Webhook verifica pago aprobado → actualiza subscription_status = 'perpetual'
   → Usuario vuelve al dashboard con cuenta perpetua ✅
```

### 1.5 Ajustar el precio

En `netlify/functions/create-payment.js`, línea del `PRICE_CLP`:
```js
const PRICE_CLP = 27000; // ~$29 USD. Ajusta según tipo de cambio.
```

---

## 2. ⏰ Recordatorios Automáticos

### 2.1 ¿Cómo funciona?

Una **Scheduled Function** de Netlify (`send-reminders.js`) se ejecuta **cada hora** automáticamente y:
- Busca reservas confirmadas que ocurren en ~24h → envía recordatorio 24h
- Busca reservas confirmadas que ocurren en ~2h → envía recordatorio 2h
- Marca cada recordatorio como enviado para no duplicar

### 2.2 Configuración

Ya está configurado en `netlify.toml`:
```toml
[functions."send-reminders"]
  schedule = "@hourly"
```

Requiere las env vars (ya configuradas si hiciste el paso 1):
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 Verificar que funciona

1. Netlify → **Functions** → busca `send-reminders`
2. Verás sus ejecuciones cada hora en los logs
3. Para probar manualmente: Netlify → Functions → send-reminders → **"Run"**

> 💡 Las scheduled functions solo corren en producción (Netlify), no en local.

---

## 3. 📊 Analytics

### 3.1 Ejecutar el SQL

En **Supabase → SQL Editor**, ejecuta el archivo `supabase/analytics.sql`.

Esto crea la función `get_business_analytics()` que calcula:
- Ingresos totales y del mes
- Reservas totales, completadas, canceladas, no-show
- Tasa de no-show
- Clientes totales y recurrentes
- Reservas por mes (últimos 6 meses)
- Reservas por día de la semana
- Top 5 servicios

### 3.2 Acceder

- En el dashboard → sidebar → **📈 Analytics**
- O directo: `https://hoyenpunto.netlify.app/dashboard/analytics.html`

Los gráficos usan **Chart.js** (vía CDN, sin instalación).

---

## ✅ Resumen de Variables de Entorno en Netlify

Para que TODO funcione, en **Netlify → Environment variables** debes tener:

| Variable | Para qué | Dónde obtenerla |
|----------|----------|-----------------|
| `RESEND_API_KEY` | Emails (confirmación + recordatorios) | resend.com |
| `MERCADOPAGO_ACCESS_TOKEN` | Pagos | mercadopago.cl/developers |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhook + recordatorios (server-side) | Supabase → Settings → API |

---

## ✅ Resumen de SQL a ejecutar en Supabase

En orden:
1. `supabase/schema.sql` (ya ejecutado)
2. `supabase/admin-and-trial.sql` (ya ejecutado)
3. `supabase/analytics.sql` ← **NUEVO, ejecutar ahora**

---

© 2026 HoyEnPunto — Powered by Eternal Beat Medios CL 🏎️
