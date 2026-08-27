/**
 * ============================================================
 * HOYENPUNTO — Netlify Function: Send Booking Confirmation Email
 * ============================================================
 * POST /api/send-confirmation
 * 
 * Body: {
 *   customerName, customerEmail, serviceName, staffName,
 *   date, time, businessName, businessAddress, totalPrice
 * }
 * 
 * Requires env var: RESEND_API_KEY
 * Sign up free at https://resend.com (100 emails/day free)
 * ============================================================
 */

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Parse body
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
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
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !serviceName || !date || !time || !businessName) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Get Resend API key from environment
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
    }

    // Build email HTML
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #05140b;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #ff8000; font-size: 24px; margin: 0;">🕐 HoyEnPunto</h1>
            </div>
            
            <!-- Card -->
            <div style="background: #0a2616; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.08);">
                <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 8px;">✅ ¡Reserva Confirmada!</h2>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 24px;">
                    Hola <strong style="color: #fff;">${customerName}</strong>, tu cita ha sido agendada exitosamente.
                </p>
                
                <!-- Details -->
                <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.06);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px;">Negocio</td>
                            <td style="padding: 8px 0; color: #fff; font-size: 13px; font-weight: 600; text-align: right;">${businessName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Servicio</td>
                            <td style="padding: 8px 0; color: #fff; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${serviceName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Profesional</td>
                            <td style="padding: 8px 0; color: #fff; font-size: 13px; font-weight: 600; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${staffName || 'Asignado'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Fecha</td>
                            <td style="padding: 8px 0; color: #ff8000; font-size: 13px; font-weight: 700; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Hora</td>
                            <td style="padding: 8px 0; color: #ff8000; font-size: 13px; font-weight: 700; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${time}</td>
                        </tr>
                        ${totalPrice ? `
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Total</td>
                            <td style="padding: 8px 0; color: #e1ff00; font-size: 14px; font-weight: 700; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">${totalPrice}</td>
                        </tr>
                        ` : ''}
                        ${businessAddress ? `
                        <tr>
                            <td style="padding: 8px 0; color: rgba(255,255,255,0.5); font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05);">Dirección</td>
                            <td style="padding: 8px 0; color: #fff; font-size: 13px; text-align: right; border-top: 1px solid rgba(255,255,255,0.05);">📍 ${businessAddress}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <!-- Reminder -->
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 20px 0 0; text-align: center;">
                    📩 Recibirás un recordatorio 24 horas antes de tu cita.
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 24px;">
                <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0;">
                    Powered by HoyEnPunto — Eternal Beat Medios CL 🏎️
                </p>
                <p style="color: rgba(255,255,255,0.2); font-size: 10px; margin: 8px 0 0;">
                    Si no solicitaste esta reserva, puedes ignorar este email.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Send email via Resend API
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'HoyEnPunto <onboarding@resend.dev>',
                to: [customerEmail],
                subject: `✅ Reserva confirmada — ${serviceName} en ${businessName}`,
                html: emailHtml
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Resend API error:', result);
            // Don't fail the booking if email fails - just log it
            return {
                statusCode: 200,
                body: JSON.stringify({ sent: false, error: result.message || 'Email send failed' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ sent: true, id: result.id })
        };

    } catch (error) {
        console.error('Email send error:', error);
        return {
            statusCode: 200,
            body: JSON.stringify({ sent: false, error: error.message })
        };
    }
};
