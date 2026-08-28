-- ============================================================
-- HOYENPUNTO — Analytics RPC
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql
-- Función que devuelve estadísticas de analytics para un negocio.
-- ============================================================

CREATE OR REPLACE FUNCTION get_business_analytics(p_business_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    v_owner UUID;
BEGIN
    -- Verificar que el usuario es dueño del negocio (o super-admin)
    SELECT owner_id INTO v_owner FROM businesses WHERE id = p_business_id;
    IF v_owner != auth.uid() AND NOT COALESCE(is_super_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT json_build_object(
        -- Totales
        'total_bookings', (SELECT COUNT(*) FROM bookings WHERE business_id = p_business_id),
        'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE business_id = p_business_id AND status = 'completed'),
        'cancelled_bookings', (SELECT COUNT(*) FROM bookings WHERE business_id = p_business_id AND status = 'cancelled'),
        'no_show_bookings', (SELECT COUNT(*) FROM bookings WHERE business_id = p_business_id AND status = 'no_show'),

        -- Ingresos (solo reservas completadas)
        'total_revenue', COALESCE((SELECT SUM(total_price) FROM bookings WHERE business_id = p_business_id AND status = 'completed'), 0),
        'revenue_this_month', COALESCE((SELECT SUM(total_price) FROM bookings WHERE business_id = p_business_id AND status = 'completed' AND start_time >= date_trunc('month', NOW())), 0),

        -- Tasa de no-show
        'no_show_rate', CASE
            WHEN (SELECT COUNT(*) FROM bookings WHERE business_id = p_business_id AND start_time < NOW()) > 0
            THEN ROUND(
                (SELECT COUNT(*)::numeric FROM bookings WHERE business_id = p_business_id AND status = 'no_show') /
                (SELECT COUNT(*)::numeric FROM bookings WHERE business_id = p_business_id AND start_time < NOW()) * 100, 1
            )
            ELSE 0
        END,

        -- Clientes
        'total_customers', (SELECT COUNT(*) FROM customers WHERE business_id = p_business_id),
        'returning_customers', (SELECT COUNT(*) FROM customers WHERE business_id = p_business_id AND total_visits > 1),

        -- Reservas por día de la semana (últimos 90 días)
        'bookings_by_weekday', (
            SELECT json_object_agg(dow, cnt) FROM (
                SELECT EXTRACT(DOW FROM start_time)::int AS dow, COUNT(*) AS cnt
                FROM bookings
                WHERE business_id = p_business_id AND start_time >= NOW() - INTERVAL '90 days'
                GROUP BY EXTRACT(DOW FROM start_time)
            ) t
        ),

        -- Reservas por mes (últimos 6 meses)
        'bookings_by_month', (
            SELECT json_agg(row_to_json(m)) FROM (
                SELECT
                    TO_CHAR(date_trunc('month', start_time), 'YYYY-MM') AS month,
                    COUNT(*) AS bookings,
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END), 0) AS revenue
                FROM bookings
                WHERE business_id = p_business_id AND start_time >= date_trunc('month', NOW() - INTERVAL '5 months')
                GROUP BY date_trunc('month', start_time)
                ORDER BY date_trunc('month', start_time)
            ) m
        ),

        -- Top servicios
        'top_services', (
            SELECT json_agg(row_to_json(s)) FROM (
                SELECT sv.name, sv.icon, COUNT(b.id) AS count,
                       COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END), 0) AS revenue
                FROM bookings b
                JOIN services sv ON b.service_id = sv.id
                WHERE b.business_id = p_business_id
                GROUP BY sv.id, sv.name, sv.icon
                ORDER BY count DESC
                LIMIT 5
            ) s
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
