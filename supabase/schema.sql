-- ============================================================
-- HOYENPUNTO — Schema SQL Completo para Supabase (PostgreSQL)
-- ============================================================
-- Ejecutar este script en el SQL Editor de Supabase Dashboard
-- Orden: Extensions → Types → Tables → RLS → Functions → Triggers
-- ============================================================

-- ===== EXTENSIONS =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===== CUSTOM TYPES =====
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE user_role AS ENUM ('owner', 'staff');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ============================================================
-- TABLE: businesses
-- El negocio/tenant principal. Cada negocio tiene un slug único.
-- ============================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT,
    description TEXT,
    address TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'America/Santiago',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#ff8000',
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'business')),
    bookings_this_month INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- ============================================================
-- TABLE: staff
-- Empleados del negocio (incluye al owner como staff también)
-- ============================================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'staff',
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_business ON staff(business_id);

-- ============================================================
-- TABLE: services
-- Servicios que ofrece el negocio
-- ============================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'CLP',
    icon TEXT DEFAULT '⭐',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_business ON services(business_id);

-- ============================================================
-- TABLE: staff_services (many-to-many)
-- Qué servicios puede prestar cada empleado
-- ============================================================
CREATE TABLE staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(staff_id, service_id)
);

-- ============================================================
-- TABLE: schedules
-- Horarios semanales de atención (por negocio o por staff)
-- ============================================================
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX idx_schedules_business ON schedules(business_id);
CREATE INDEX idx_schedules_staff ON schedules(staff_id);

-- ============================================================
-- TABLE: blocked_slots
-- Bloqueos puntuales (feriados, pausas, vacaciones)
-- ============================================================
CREATE TABLE blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    all_day BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blocked_business_date ON blocked_slots(business_id, date);

-- ============================================================
-- TABLE: customers
-- Clientes que reservan (no necesitan cuenta en el sistema)
-- ============================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    total_visits INTEGER DEFAULT 0,
    last_visit_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_email ON customers(business_id, email);
CREATE INDEX idx_customers_phone ON customers(business_id, phone);

-- ============================================================
-- TABLE: bookings
-- Las reservas/citas — tabla principal del sistema
-- ============================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status DEFAULT 'confirmed',
    notes TEXT,
    total_price DECIMAL(10,2),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    reminder_sent_24h BOOLEAN DEFAULT false,
    reminder_sent_2h BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_booking_time CHECK (start_time < end_time),
    -- Prevención de dobles reservas: un staff no puede tener 2 citas al mismo tiempo
    CONSTRAINT no_double_booking EXCLUDE USING gist (
        staff_id WITH =,
        tstzrange(start_time, end_time) WITH &&
    ) WHERE (status NOT IN ('cancelled', 'no_show'))
);

CREATE INDEX idx_bookings_business ON bookings(business_id);
CREATE INDEX idx_bookings_staff_time ON bookings(staff_id, start_time);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(business_id, start_time);
CREATE INDEX idx_bookings_status ON bookings(business_id, status);

-- ============================================================
-- TABLE: notifications_log
-- Registro de notificaciones enviadas
-- ============================================================
CREATE TABLE notifications_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_2h', 'cancellation'
    channel TEXT NOT NULL DEFAULT 'email', -- 'email', 'whatsapp', 'sms'
    recipient TEXT NOT NULL,
    status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada negocio solo ve su propia data
-- ============================================================

-- Businesses: owner ve solo los suyos
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage own businesses"
    ON businesses FOR ALL
    USING (owner_id = auth.uid());

CREATE POLICY "Public can read active businesses by slug"
    ON businesses FOR SELECT
    USING (is_active = true);

-- Staff: solo visible por el owner del negocio
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages staff"
    ON staff FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Public can read active staff"
    ON staff FOR SELECT
    USING (is_active = true AND business_id IN (SELECT id FROM businesses WHERE is_active = true));

-- Services: owner gestiona, público lee
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages services"
    ON services FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Public can read active services"
    ON services FOR SELECT
    USING (is_active = true AND business_id IN (SELECT id FROM businesses WHERE is_active = true));

-- Staff Services
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages staff_services"
    ON staff_services FOR ALL
    USING (
        staff_id IN (
            SELECT s.id FROM staff s
            JOIN businesses b ON s.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can read staff_services"
    ON staff_services FOR SELECT
    USING (true);

-- Schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages schedules"
    ON schedules FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Public can read active schedules"
    ON schedules FOR SELECT
    USING (is_active = true);

-- Blocked Slots
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages blocked_slots"
    ON blocked_slots FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Public can read blocked_slots"
    ON blocked_slots FOR SELECT
    USING (true);

-- Customers: owner del negocio gestiona
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages customers"
    ON customers FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

-- Bookings: owner gestiona, público puede insertar (para reservar)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner manages bookings"
    ON bookings FOR ALL
    USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Public can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can read own bookings"
    ON bookings FOR SELECT
    USING (true);

-- Notifications Log
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owner reads notifications"
    ON notifications_log FOR SELECT
    USING (
        booking_id IN (
            SELECT bk.id FROM bookings bk
            JOIN businesses b ON bk.business_id = b.id
            WHERE b.owner_id = auth.uid()
        )
    );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Get available slots for a given business, staff, and date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_business_id UUID,
    p_staff_id UUID,
    p_date DATE,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(slot_start TIME, slot_end TIME) AS $$
DECLARE
    v_day day_of_week;
    v_schedule RECORD;
    v_slot_start TIME;
    v_slot_end TIME;
    v_interval INTERVAL;
BEGIN
    -- Determine day of week
    v_day := LOWER(TO_CHAR(p_date, 'day'))::day_of_week;
    v_interval := (p_duration_minutes || ' minutes')::INTERVAL;

    -- Check if entire day is blocked
    IF EXISTS (
        SELECT 1 FROM blocked_slots
        WHERE business_id = p_business_id
        AND (staff_id = p_staff_id OR staff_id IS NULL)
        AND date = p_date
        AND all_day = true
    ) THEN
        RETURN;
    END IF;

    -- Get schedule for this day (staff-specific or business-wide)
    SELECT s.start_time AS sched_start, s.end_time AS sched_end
    INTO v_schedule
    FROM schedules s
    WHERE s.business_id = p_business_id
    AND s.is_active = true
    AND s.day = v_day
    AND (s.staff_id = p_staff_id OR s.staff_id IS NULL)
    ORDER BY s.staff_id NULLS LAST
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Generate slots
    v_slot_start := v_schedule.sched_start;
    
    WHILE v_slot_start + v_interval <= v_schedule.sched_end LOOP
        v_slot_end := v_slot_start + v_interval;
        
        -- Check if slot conflicts with existing bookings
        IF NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.business_id = p_business_id
            AND b.staff_id = p_staff_id
            AND b.status NOT IN ('cancelled', 'no_show')
            AND b.start_time::DATE = p_date
            AND (
                (b.start_time::TIME, b.end_time::TIME) OVERLAPS (v_slot_start, v_slot_end)
            )
        )
        -- Check if slot conflicts with blocked_slots
        AND NOT EXISTS (
            SELECT 1 FROM blocked_slots bs
            WHERE bs.business_id = p_business_id
            AND (bs.staff_id = p_staff_id OR bs.staff_id IS NULL)
            AND bs.date = p_date
            AND bs.all_day = false
            AND (bs.start_time, bs.end_time) OVERLAPS (v_slot_start, v_slot_end)
        )
        THEN
            slot_start := v_slot_start;
            slot_end := v_slot_end;
            RETURN NEXT;
        END IF;

        -- Move to next slot (30 min intervals)
        v_slot_start := v_slot_start + INTERVAL '30 minutes';
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create a booking (with customer upsert)
CREATE OR REPLACE FUNCTION create_booking(
    p_business_id UUID,
    p_service_id UUID,
    p_staff_id UUID,
    p_start_time TIMESTAMPTZ,
    p_customer_name TEXT,
    p_customer_email TEXT,
    p_customer_phone TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_booking_id UUID;
    v_service RECORD;
    v_end_time TIMESTAMPTZ;
BEGIN
    -- Get service duration and price
    SELECT duration_minutes, price INTO v_service
    FROM services
    WHERE id = p_service_id AND business_id = p_business_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Service not found or inactive';
    END IF;

    -- Calculate end time
    v_end_time := p_start_time + (v_service.duration_minutes || ' minutes')::INTERVAL;

    -- Upsert customer (find by email or phone, or create new)
    SELECT id INTO v_customer_id
    FROM customers
    WHERE business_id = p_business_id
    AND (
        (email = p_customer_email AND email IS NOT NULL)
        OR (phone = p_customer_phone AND phone IS NOT NULL)
    )
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO customers (business_id, name, email, phone)
        VALUES (p_business_id, p_customer_name, p_customer_email, p_customer_phone)
        RETURNING id INTO v_customer_id;
    ELSE
        -- Update customer name if changed
        UPDATE customers
        SET name = p_customer_name, updated_at = NOW()
        WHERE id = v_customer_id;
    END IF;

    -- Create the booking
    INSERT INTO bookings (
        business_id, customer_id, service_id, staff_id,
        start_time, end_time, total_price, notes, status
    )
    VALUES (
        p_business_id, v_customer_id, p_service_id, p_staff_id,
        p_start_time, v_end_time, v_service.price, p_notes, 'confirmed'
    )
    RETURNING id INTO v_booking_id;

    -- Update customer stats
    UPDATE customers
    SET total_visits = total_visits + 1, last_visit_at = NOW()
    WHERE id = v_customer_id;

    -- Increment monthly booking counter
    UPDATE businesses
    SET bookings_this_month = bookings_this_month + 1
    WHERE id = p_business_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on businesses
CREATE TRIGGER trg_businesses_updated
    BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at on staff
CREATE TRIGGER trg_staff_updated
    BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at on services
CREATE TRIGGER trg_services_updated
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at on customers
CREATE TRIGGER trg_customers_updated
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update updated_at on bookings
CREATE TRIGGER trg_bookings_updated
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MONTHLY RESET (run as cron or scheduled function)
-- Resets bookings_this_month on the 1st of each month
-- ============================================================
CREATE OR REPLACE FUNCTION reset_monthly_bookings()
RETURNS void AS $$
BEGIN
    UPDATE businesses SET bookings_this_month = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SEED DATA (Optional: for demo/testing)
-- Run this separately after creating the schema
-- ============================================================
-- See: supabase/seed.sql
