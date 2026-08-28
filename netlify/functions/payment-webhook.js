/**
 * ============================================================
 * HOYENPUNTO — Netlify Function: Payment Webhook (MercadoPago)
 * ============================================================
 * POST /api/payment-webhook
 *
 * MercadoPago llama a esta URL cuando cambia el estado de un pago.
 * Si el pago fue aprobado, actualiza el negocio a subscription_status = 'perpetual'.
 *
 * Requires env vars:
 *   - MERCADOPAGO_ACCESS_TOKEN
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY  (¡NO la anon key! Esta es secreta, solo server-side)
 *
 * Config en MercadoPago: notification_url apunta aquí (ya configurado en create-payment.js)
 * ============================================================
 */

exports.handler = async (event) => {
    // MercadoPago envía notificaciones vía POST (y a veces GET para validación)
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kbdmkpkvfuooaxeprgcz.supabase.co';
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!MP_TOKEN || !SERVICE_KEY) {
        console.error('Missing env vars: MERCADOPAGO_ACCESS_TOKEN or SUPABASE_SERVICE_ROLE_KEY');
        return { statusCode: 200, body: 'ok' }; // Responder 200 para que MP no reintente infinitamente
    }

    // Extraer el ID del pago (viene por query params o body según el tipo de notificación)
    let paymentId = null;
    let topic = null;

    // Query params: ?topic=payment&id=123 o ?type=payment&data.id=123
    const params = event.queryStringParameters || {};
    topic = params.topic || params.type;
    paymentId = params.id || params['data.id'];

    // También puede venir en el body
    if (!paymentId && event.body) {
        try {
            const body = JSON.parse(event.body);
            topic = topic || body.type || body.topic;
            paymentId = paymentId || body.data?.id || body.id;
        } catch (e) { /* ignore */ }
    }

    // Solo procesar notificaciones de tipo 'payment'
    if (topic !== 'payment' || !paymentId) {
        return { statusCode: 200, body: 'ok' };
    }

    try {
        // 1. Consultar el detalle del pago en MercadoPago
        const payResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
        });
        const payment = await payResp.json();

        if (!payResp.ok) {
            console.error('Error fetching payment:', payment);
            return { statusCode: 200, body: 'ok' };
        }

        // 2. Solo procesar si el pago está aprobado
        if (payment.status !== 'approved') {
            console.log(`Payment ${paymentId} status: ${payment.status} — no action`);
            return { statusCode: 200, body: 'ok' };
        }

        // 3. Obtener el business_id desde metadata o external_reference
        const businessId = payment.metadata?.business_id || payment.external_reference;

        if (!businessId) {
            console.error('No business_id in payment metadata');
            return { statusCode: 200, body: 'ok' };
        }

        // 4. Actualizar el negocio a perpetual via Supabase REST API (con service role key)
        const updateResp = await fetch(
            `${SUPABASE_URL}/rest/v1/businesses?id=eq.${businessId}`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SERVICE_KEY,
                    'Authorization': `Bearer ${SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    subscription_status: 'perpetual',
                    plan: 'professional'
                })
            }
        );

        if (!updateResp.ok) {
            const err = await updateResp.text();
            console.error('Error updating business:', err);
            return { statusCode: 200, body: 'ok' };
        }

        console.log(`✅ Business ${businessId} upgraded to perpetual (payment ${paymentId})`);

        // 5. Registrar el pago en notifications_log (opcional, para tracking)
        await fetch(`${SUPABASE_URL}/rest/v1/notifications_log`, {
            method: 'POST',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                type: 'payment_approved',
                channel: 'mercadopago',
                recipient: payment.payer?.email || 'unknown',
                status: 'sent'
            })
        }).catch(() => {}); // No fallar si esto falla

        return { statusCode: 200, body: 'ok' };

    } catch (error) {
        console.error('Webhook error:', error);
        return { statusCode: 200, body: 'ok' }; // Siempre 200 para MercadoPago
    }
};
