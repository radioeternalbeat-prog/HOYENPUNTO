/**
 * ============================================================
 * HOYENPUNTO — Netlify Function: Create Payment (MercadoPago)
 * ============================================================
 * POST /api/create-payment
 *
 * Crea una preferencia de pago en MercadoPago para la
 * Oferta de Lanzamiento (Professional Perpetua $29 USD).
 *
 * Body: { businessId, businessName, email }
 * Returns: { init_point } — URL de checkout de MercadoPago
 *
 * Requires env var: MERCADOPAGO_ACCESS_TOKEN
 * Obtén tu token en https://www.mercadopago.cl/developers/panel
 * ============================================================
 */

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { businessId, businessName, email } = body;

    if (!businessId || !email) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing businessId or email' }) };
    }

    const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!MP_TOKEN) {
        console.error('MERCADOPAGO_ACCESS_TOKEN not configured');
        return { statusCode: 500, body: JSON.stringify({ error: 'Payment service not configured' }) };
    }

    // URL base del sitio
    const siteUrl = process.env.URL || 'https://hoyenpunto.netlify.app';

    // Precio de la oferta de lanzamiento: $29 USD
    // MercadoPago Chile trabaja en CLP. Convertimos ~$29 USD ≈ $27.000 CLP
    // (ajusta según el tipo de cambio o usa USD si tu cuenta lo soporta)
    const PRICE_CLP = 27000;

    const preference = {
        items: [
            {
                title: 'HoyEnPunto — Professional Perpetua (Oferta Lanzamiento)',
                description: 'Acceso de por vida al plan Professional. Pago único.',
                quantity: 1,
                currency_id: 'CLP',
                unit_price: PRICE_CLP
            }
        ],
        payer: {
            email: email
        },
        // Metadata para identificar el negocio en el webhook
        metadata: {
            business_id: businessId,
            plan: 'perpetual'
        },
        external_reference: businessId,
        back_urls: {
            success: `${siteUrl}/dashboard/?pago=exitoso`,
            failure: `${siteUrl}/dashboard/?pago=fallido`,
            pending: `${siteUrl}/dashboard/?pago=pendiente`
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/payment-webhook`,
        statement_descriptor: 'HOYENPUNTO'
    };

    try {
        const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preference)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('MercadoPago error:', result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: result.message || 'Error creating payment' })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                init_point: result.init_point,          // URL de producción
                sandbox_init_point: result.sandbox_init_point, // URL de prueba
                preference_id: result.id
            })
        };

    } catch (error) {
        console.error('Payment creation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
