-- ============================================================
-- HOYENPUNTO — Seed Data (para testing/demo)
-- ============================================================
-- NOTA: Ejecutar DESPUÉS de schema.sql
-- Requiere tener un usuario creado en Supabase Auth primero.
-- Reemplaza 'YOUR_USER_UUID' con el UUID del usuario de prueba.
-- ============================================================

-- Para testing: crear un negocio demo
-- (Descomenta y reemplaza el UUID después de crear un usuario en Auth)

/*
-- 1. Crear negocio
INSERT INTO businesses (id, owner_id, name, slug, category, description, address, phone, primary_color)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'YOUR_USER_UUID', -- Reemplazar con el UUID del usuario auth
    'Estilo Carolina',
    'estilo-carolina',
    'beauty',
    'Salón de belleza con 10 años de experiencia en cortes, color y tratamientos capilares.',
    'Av. Providencia 1234, Santiago',
    '+56912345678',
    '#e91e8c'
);

-- 2. Crear staff
INSERT INTO staff (id, business_id, user_id, display_name, role, bio) VALUES
('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'YOUR_USER_UUID', 'Carolina M.', 'owner', 'Directora Creativa'),
('aaaa0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', NULL, 'Daniela T.', 'staff', 'Estilista Senior'),
('aaaa0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', NULL, 'Valentina R.', 'staff', 'Colorista');

-- 3. Crear servicios
INSERT INTO services (id, business_id, name, duration_minutes, price, icon, sort_order) VALUES
('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Corte de Cabello', 45, 15000, '✂️', 1),
('bbbb0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Coloración Completa', 90, 35000, '🎨', 2),
('bbbb0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Manicure Semipermanente', 30, 12000, '💅', 3),
('bbbb0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Brushing + Tratamiento', 40, 18000, '💆‍♀️', 4),
('bbbb0005-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Perfilado de Barba', 20, 8000, '🧔', 5);

-- 4. Asignar servicios a staff
INSERT INTO staff_services (staff_id, service_id) VALUES
('aaaa0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001'),
('aaaa0001-0000-0000-0000-000000000001', 'bbbb0004-0000-0000-0000-000000000004'),
('aaaa0001-0000-0000-0000-000000000001', 'bbbb0005-0000-0000-0000-000000000005'),
('aaaa0002-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000001'),
('aaaa0002-0000-0000-0000-000000000002', 'bbbb0002-0000-0000-0000-000000000002'),
('aaaa0002-0000-0000-0000-000000000002', 'bbbb0004-0000-0000-0000-000000000004'),
('aaaa0003-0000-0000-0000-000000000003', 'bbbb0002-0000-0000-0000-000000000002'),
('aaaa0003-0000-0000-0000-000000000003', 'bbbb0003-0000-0000-0000-000000000003');

-- 5. Crear horarios (Lun-Sáb 09:00-19:00)
INSERT INTO schedules (business_id, staff_id, day, start_time, end_time) VALUES
('11111111-1111-1111-1111-111111111111', NULL, 'monday', '09:00', '19:00'),
('11111111-1111-1111-1111-111111111111', NULL, 'tuesday', '09:00', '19:00'),
('11111111-1111-1111-1111-111111111111', NULL, 'wednesday', '09:00', '19:00'),
('11111111-1111-1111-1111-111111111111', NULL, 'thursday', '09:00', '19:00'),
('11111111-1111-1111-1111-111111111111', NULL, 'friday', '09:00', '19:00'),
('11111111-1111-1111-1111-111111111111', NULL, 'saturday', '09:00', '14:00');

-- 6. Crear algunos clientes de ejemplo
INSERT INTO customers (id, business_id, name, email, phone, total_visits) VALUES
('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'María López', 'maria@email.com', '+56911111111', 12),
('cccc0002-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Pedro Soto', 'pedro@email.com', '+56922222222', 5),
('cccc0003-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Ana Ruiz', 'ana@email.com', '+56933333333', 8),
('cccc0004-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Martín Rojas', 'martin@email.com', '+56944444444', 3);
*/
