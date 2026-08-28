/**
 * ============================================================
 * HOYENPUNTO — Scheduled Function: Send Booking Reminders
 * ============================================================
 * Se ejecuta automáticamente cada hora (cron).
 * Busca reservas que necesitan recordatorio (24h y 2h antes)
 * y envía el email correspondiente.
 *
 * Requires env vars:
 *   - RESEND_API_KEY
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Configuración del cron en netlify.toml:
 *   [functions."send-reminders"]
 *     schedule = "@hourly"
 * ============================================================
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbdmkpkvfuooaxeprgcz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Helper: consultar Supabase REST
async function sbQuery(path, options = {}) {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: {
            'apikey': SERVICE_KEY,
            'Authorization': `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });
    if (options.method === 'PATCH' || options.method === 'POST') {
        return resp.ok;
    }
    return resp.json();
}

// Helper: enviar email de recordatorio
async function sendReminderEmail(booking, type) {
    const customer = booking.customer;
    const service = booking.service;
    const biz = booking.business;
    const startTime = new Date(booking.start_time);

    const dateStr = startTime.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = startTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

    const timeLabel = type === 'reminder_24h' ? 'mañana' : 'en 2 horas';

    const html = `
    <!DOCTYPE html>
    <html><body style="margin:0; padding:0; font-family:-apple-system,sans-serif; background:#05140b;">
        <div style="max-width:560px; margin:0 auto; padding:40px 24px;">
            <div style="text-align:center; margin-bottom:32px;">
                <h1 style="color:#ff8000; font-size:24px; margin:0;">🕐 HoyEnPunto</h1>
            </div>
            <div style="background:#0a2616; border-radius:16px; padding:32px; border:1px solid rgba(255,255,255,0.08);">
                <h2 style="color:#fff; font-size:20px; margin:0 0 8px;">⏰ Recordatorio de tu cita</h2>
                <p style="color:rgba(255,255,255,0.6); font-size:14px; margin:0 0 24px;">
                    Hola <strong style="color:#fff;">${customer?.name || 'Cliente'}</strong>, te recordamos que tienes una cita ${timeLabel}:
                </p>
                <div style="background:rgba(255,255,255,0.03); border-radius:12px; padding:20px; border:1px solid rgba(255,255,255,0.06);">
                    <table style="width:100%; border-collapse:collapse;">
                        <tr><td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:13px;">Negocio</td><td style="padding:8px 0; color:#fff; font-size:13px; font-weight:600; text-align:right;">${biz?.name || ''}</td></tr>
                        <tr><td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:13px; border-top:1px solid rgba(255,255,255,0.05);">Servicio</td><td style="padding:8px 0; color:#fff; font-size:13px; font-weight:600; text-align:right; border-top:1px solid rgba(255,255,255,0.05);">${service?.name || ''}</td></tr>
                        <tr><td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:13px; border-top:1px solid rgba(255,255,255,0.05);">Fecha</td><td style="padding:8px 0; color:#ff8000; font-size:13px; font-weight:700; text-align:right; border-top:1px solid rgba(255,255,255,0.05);">${dateStr}</td></tr>
                        <tr><td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:13px; border-top:1px solid rgba(255,255,255,0.05);">Hora</td><td style="padding:8px 0; color:#ff8000; font-size:13px; font-weight:700; text-align:right; border-top:1px solid rgba(255,255,255,0.05);">${timeStr}</td></tr>
                        ${biz?.address ? `<tr><td style="padding:8px 0; color:rgba(255,255,255,0.5); font-size:13px; border-top:1px solid rgba(255,255,255,0.05);">Dirección</td><td style="padding:8px 0; color:#fff; font-size:13px; text-align:right; border-top:1px solid rgba(255,255,255,0.05);">📍 ${biz.address}</td></tr>` : ''}
                    </table>
                </div>
                <p style="color:rgba(255,255,255,0.5); font-size:12px; margin:20px 0 0; text-align:center;">
                    ¡Te esperamos puntualmente! 🏎️
                </p>
            </div>
            <div style="text-align:center; margin-top:24px;">
                <p style="color:rgba(255,255,255,0.3); font-size:11px; margin:0;">Powered by HoyEnPunto — Eternal Beat Medios CL 🏎️</p>
            </div>
        </div>
    </body></html>`;

    const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            from: 'HoyEnPunto <onboarding@resend.dev>',
            to: [customer.email],
            subject: `⏰ Recordatorio: tu cita ${timeLabel} en ${biz?.name || 'HoyEnPunto'}`,
            html
        })
    });

    return resp.ok;
}

exports.handler = async () => {
    if (!SERVICE_KEY || !RESEND_API_KEY) {
        console.error('Missing env vars');
        return { statusCode: 200, body: 'skipped: missing config' };
    }

    const now = new Date();
    let sent24 = 0, sent2 = 0;

    try {
        // ===== RECORDATORIOS 24H =====
        // Buscar reservas entre 23h y 25h desde ahora, confirmadas, sin recordatorio 24h enviado
        const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
        const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

        const bookings24 = await sbQuery(
            `bookings?select=*,customer:customers(name,email),service:services(name),business:businesses(name,address)` +
            `&status=eq.confirmed&reminder_sent_24h=eq.false` +
            `&start_time=gte.${in23h}&start_time=lte.${in25h}`
        );

        for (const booking of (bookings24 || [])) {
            if (!booking.customer?.email) continue;
            const ok = await sendReminderEmail(booking, 'reminder_24h');
            if (ok) {
                await sbQuery(`bookings?id=eq.${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ reminder_sent_24h: true })
                });
                sent24++;
            }
        }

        // ===== RECORDATORIOS 2H =====
        // Buscar reservas entre 1.5h y 2.5h desde ahora, confirmadas, sin recordatorio 2h enviado
        const in90m = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
        const in150m = new Date(now.getTime() + 150 * 60 * 1000).toISOString();

        const bookings2 = await sbQuery(
            `bookings?select=*,customer:customers(name,email),service:services(name),business:businesses(name,address)` +
            `&status=eq.confirmed&reminder_sent_2h=eq.false` +
            `&start_time=gte.${in90m}&start_time=lte.${in150m}`
        );

        for (const booking of (bookings2 || [])) {
            if (!booking.customer?.email) continue;
            const ok = await sendReminderEmail(booking, 'reminder_2h');
            if (ok) {
                await sbQuery(`bookings?id=eq.${booking.id}`, {
                    method: 'PATCH',
                    headers: { 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ reminder_sent_2h: true })
                });
                sent2++;
            }
        }

        console.log(`✅ Reminders sent — 24h: ${sent24}, 2h: ${sent2}`);
        return {
            statusCode: 200,
            body: JSON.stringify({ sent_24h: sent24, sent_2h: sent2 })
        };

    } catch (error) {
        console.error('Reminder error:', error);
        return { statusCode: 200, body: JSON.stringify({ error: error.message }) };
    }
};
