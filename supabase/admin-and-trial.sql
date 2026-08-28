-- ============================================================
-- HOYENPUNTO — Admin Panel + Trial System
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de schema.sql
-- Agrega: campos de trial, tabla de super-admins, RLS de admin,
-- y vista para el panel de administración.
-- ============================================================

-- ===== 1. CAMPOS DE TRIAL EN BUSINESSES =====
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'perpetual', 'cancelled'));
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS notes_admin TEXT; -- Notas internas del admin (CRM)

-- Set trial_ends_at para negocios existentes que no lo tengan (7 días desde su creación)
UPDATE businesses
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE trial_ends_at IS NULL;

-- ===== 2. TABLA DE SUPER-ADMINS =====
-- Lista de emails que tienen acceso al panel de administración global
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== 3. FUNCIÓN: verificar si el usuario actual es super-admin =====
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM super_admins
        WHERE user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 4. RLS: super-admins pueden ver/editar TODOS los negocios =====
CREATE POLICY "Super admins can view all businesses"
    ON businesses FOR SELECT
    USING (is_super_admin());

CREATE POLICY "Super admins can update all businesses"
    ON businesses FOR UPDATE
    USING (is_super_admin());

-- Super-admins pueden ver todos los clientes (CRM global)
CREATE POLICY "Super admins view all customers"
    ON customers FOR SELECT
    USING (is_super_admin());

-- Super-admins pueden ver todas las reservas
CREATE POLICY "Super admins view all bookings"
    ON bookings FOR SELECT
    USING (is_super_admin());

-- Super-admins pueden ver todos los servicios
CREATE POLICY "Super admins view all services"
    ON services FOR SELECT
    USING (is_super_admin());

-- ===== 5. VISTA: resumen de negocios para el panel admin =====
CREATE OR REPLACE VIEW admin_businesses_overview AS
SELECT
    b.id,
    b.name,
    b.slug,
    b.category,
    b.plan,
    b.subscription_status,
    b.trial_ends_at,
    b.phone,
    b.address,
    b.primary_color,
    b.is_active,
    b.notes_admin,
    b.created_at,
    (SELECT email FROM auth.users WHERE id = b.owner_id) AS owner_email,
    (SELECT COUNT(*) FROM bookings bk WHERE bk.business_id = b.id) AS total_bookings,
    (SELECT COUNT(*) FROM customers c WHERE c.business_id = b.id) AS total_customers,
    (SELECT COUNT(*) FROM services s WHERE s.business_id = b.id AND s.is_active = true) AS total_services,
    (SELECT COUNT(*) FROM staff st WHERE st.business_id = b.id AND st.is_active = true) AS total_staff
FROM businesses b;

-- ===== 6. FUNCIÓN RPC: obtener overview de negocios (solo super-admin) =====
CREATE OR REPLACE FUNCTION get_admin_overview()
RETURNS SETOF admin_businesses_overview AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Access denied: super-admin only';
    END IF;
    RETURN QUERY SELECT * FROM admin_businesses_overview ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 7. FUNCIÓN RPC: stats globales para el admin =====
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Access denied: super-admin only';
    END IF;

    SELECT json_build_object(
        'total_businesses', (SELECT COUNT(*) FROM businesses),
        'active_businesses', (SELECT COUNT(*) FROM businesses WHERE is_active = true),
        'trial_businesses', (SELECT COUNT(*) FROM businesses WHERE subscription_status = 'trial'),
        'perpetual_businesses', (SELECT COUNT(*) FROM businesses WHERE subscription_status = 'perpetual'),
        'total_bookings', (SELECT COUNT(*) FROM bookings),
        'total_customers', (SELECT COUNT(*) FROM customers),
        'bookings_this_month', (SELECT COUNT(*) FROM bookings WHERE start_time >= date_trunc('month', NOW())),
        'new_businesses_this_month', (SELECT COUNT(*) FROM businesses WHERE created_at >= date_trunc('month', NOW())),
        'perpetual_spots_used', (SELECT COUNT(*) FROM businesses WHERE subscription_status = 'perpetual'),
        'perpetual_spots_total', 50
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 8. FUNCIÓN RPC: actualizar cuenta desde el admin =====
CREATE OR REPLACE FUNCTION admin_update_business(
    p_business_id UUID,
    p_plan TEXT DEFAULT NULL,
    p_subscription_status TEXT DEFAULT NULL,
    p_is_active BOOLEAN DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    IF NOT is_super_admin() THEN
        RAISE EXCEPTION 'Access denied: super-admin only';
    END IF;

    UPDATE businesses SET
        plan = COALESCE(p_plan, plan),
        subscription_status = COALESCE(p_subscription_status, subscription_status),
        is_active = COALESCE(p_is_active, is_active),
        notes_admin = COALESCE(p_notes, notes_admin),
        updated_at = NOW()
    WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 9. CONFIGURAR TU SUPER-ADMIN
-- ============================================================
-- IMPORTANTE: Reemplaza 'tu-email@gmail.com' con TU email real
-- (el mismo con el que te registraste en HoyEnPunto)
--
-- INSERT INTO super_admins (email, user_id)
-- SELECT 'tu-email@gmail.com', id
-- FROM auth.users
-- WHERE email = 'tu-email@gmail.com';
--
-- ============================================================
