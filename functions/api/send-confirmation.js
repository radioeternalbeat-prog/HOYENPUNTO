/**
 * HOYENPUNTO — Cloudflare Pages Function: Send Booking Confirmation Email
 * Route: POST /api/send-confirmation
 *
 * Adaptación de netlify/functions/send-confirmation.js.
 * Secretos disponibles en context.env:
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL (opcional)
 */

const json = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
});

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export async function onRequestPost(context) {
    const { request, env } = context;

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const {
        customerName,
        customerEmail,
        serviceName,
        staffName,
        date,
        time,
        businessName,
        businessAddress,
        totalPrice
    } = body || {};

    if (!customerEmail || !customerName || !serviceName || !date || !time || !businessName) {
        return json({ error: 'Missing required fields' }, 400);
    }

    const resendApiKey = env.RESEND_API_KEY;
    const resendFromEmail = env.RESEND_FROM_EMAIL || 'HoyEnPunto <onboarding@resend.dev>';

    if (!resendApiKey) {
        console.error('RESEND_API_KEY not configured');
        return json({ sent: false, error: 'Email service not configured' }, 503);
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#05140b;">
        <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
                <h1 style="color:#ff8000;font-size:24px;margin:0;">🕐 HoyEnPunto</h1>
            </div>
            <div style="background:#0a2616;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
                <h2 style="color:#fff;font-size:20px;margin:0 0 8px;">✅ ¡Reserva Confirmada!</h2>
                <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">
                    Hola <strong style="color:#fff;">${escapeHtml(customerName)}</strong>, tu cita ha sido agendada exitosamente.
                </p>
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:20px;border:1px solid rgba(255,255,255,0.06);">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">Negocio</td><td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;">${escapeHtml(businessName)}</td></tr>
                        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Servicio</td><td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(serviceName)}</td></tr>
                        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Profesional</td><td style="padding:8px 0;color:#fff;font-size:13px;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(staffName || 'Asignado')}</td></tr>
                        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Fecha</td><td style="padding:8px 0;color:#ff8000;font-size:13px;font-weight:700;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(date)}</td></tr>
                        <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Hora</td><td style="padding:8px 0;color:#ff8000;font-size:13px;font-weight:700;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(time)}</td></tr>
                        ${totalPrice ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Total</td><td style="padding:8px 0;color:#e1ff00;font-size:14px;font-weight:700;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${escapeHtml(totalPrice)}</td></tr>` : ''}
                        ${businessAddress ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Dirección</td><td style="padding:8px 0;color:#fff;font-size:13px;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">📍 ${escapeHtml(businessAddress)}</td></tr>` : ''}
                    </table>
                </div>
                <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:20px 0 0;text-align:center;">📩 Recibirás un recordatorio 24 horas antes de tu cita.</p>
            </div>
            <div style="text-align:center;margin-top:24px;"><p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">Powered by HoyEnPunto — Eternal Beat Medios CL</p><p style="color:rgba(255,255,255,0.2);font-size:10px;margin:8px 0 0;">Si no solicitaste esta reserva, puedes ignorar este email.</p></div>
        </div>
    </body>
    </html>`;

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: resendFromEmail,
                to: [customerEmail],
                subject: `✅ Reserva confirmada — ${serviceName} en ${businessName}`,
                html: emailHtml
            })
        });

        const result = await response.json();
        if (!response.ok) {
            console.error('Resend API error:', result);
            return json({ sent: false, error: result.message || 'Email send failed' });
        }

        return json({ sent: true, id: result.id });
    } catch (error) {
        console.error('Email send error:', error);
        return json({ sent: false, error: error.message || 'Email send failed' });
    }
}

export function onRequest(context) {
    return json({ error: 'Method not allowed' }, 405);
}
