/**
 * ============================================================
 * HOYENPUNTO — Database Module
 * ============================================================
 * CRUD operations para todas las entidades del sistema.
 * Depende de: supabase-config.js
 * ============================================================
 */

const DB = {

    // ===== BUSINESSES =====
    businesses: {
        /**
         * Crear un nuevo negocio (al registrarse)
         */
        async create({ name, slug, category, description, address, phone, timezone, logo_url, primary_color }) {
            const user = await Auth.getUser();
            if (!user) return { data: null, error: 'Not authenticated' };

            // Trial de 7 días desde hoy
            const trialEnds = new Date();
            trialEnds.setDate(trialEnds.getDate() + 7);

            const { data, error } = await sb
                .from('businesses')
                .insert({
                    owner_id: user.id,
                    name,
                    slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    category,
                    description,
                    address,
                    phone,
                    timezone: timezone || 'America/Santiago',
                    logo_url,
                    primary_color: primary_color || '#ff8000',
                    trial_ends_at: trialEnds.toISOString(),
                    subscription_status: 'trial'
                })
                .select()
                .single();

            if (!error) {
                // Auto-crear un staff entry para el owner
                await sb.from('staff').insert({
                    business_id: data.id,
                    user_id: user.id,
                    display_name: name.split(' ')[0],
                    role: 'owner',
                    email: user.email
                });
            }

            log('Business created:', data?.id);
            return { data, error: error?.message };
        },

        /**
         * Obtener el negocio del usuario actual
         */
        async getMine() {
            const user = await Auth.getUser();
            if (!user) return { data: null, error: 'Not authenticated' };

            const { data, error } = await sb
                .from('businesses')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            return { data, error: error?.message };
        },

        /**
         * Obtener un negocio por slug (público, para el portal de reservas)
         */
        async getBySlug(slug) {
            const { data, error } = await sb
                .from('businesses')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            return { data, error: error?.message };
        },

        /**
         * Actualizar datos del negocio
         */
        async update(businessId, updates) {
            const { data, error } = await sb
                .from('businesses')
                .update(updates)
                .eq('id', businessId)
                .select()
                .single();

            return { data, error: error?.message };
        },

        /**
         * Verificar si un slug está disponible
         */
        async isSlugAvailable(slug) {
            const { data } = await sb
                .from('businesses')
                .select('id')
                .eq('slug', slug)
                .single();

            return !data;
        }
    },

    // ===== SERVICES =====
    services: {
        /**
         * Obtener servicios de un negocio
         */
        async getByBusiness(businessId, activeOnly = true) {
            let query = sb
                .from('services')
                .select('*')
                .eq('business_id', businessId)
                .order('sort_order', { ascending: true });

            if (activeOnly) query = query.eq('is_active', true);

            const { data, error } = await query;
            return { data: data || [], error: error?.message };
        },

        /**
         * Crear un servicio
         */
        async create(businessId, { name, description, duration_minutes, price, icon, sort_order }) {
            const { data, error } = await sb
                .from('services')
                .insert({
                    business_id: businessId,
                    name,
                    description,
                    duration_minutes: duration_minutes || 30,
                    price: price || 0,
                    icon: icon || '⭐',
                    sort_order: sort_order || 0
                })
                .select()
                .single();

            return { data, error: error?.message };
        },

        /**
         * Actualizar un servicio
         */
        async update(serviceId, updates) {
            const { data, error } = await sb
                .from('services')
                .update(updates)
                .eq('id', serviceId)
                .select()
                .single();

            return { data, error: error?.message };
        },

        /**
         * Eliminar (desactivar) un servicio
         */
        async delete(serviceId) {
            const { error } = await sb
                .from('services')
                .update({ is_active: false })
                .eq('id', serviceId);

            return { error: error?.message };
        }
    },

    // ===== STAFF =====
    staff: {
        /**
         * Obtener staff de un negocio
         */
        async getByBusiness(businessId, activeOnly = true) {
            let query = sb
                .from('staff')
                .select('*, staff_services(service_id)')
                .eq('business_id', businessId);

            if (activeOnly) query = query.eq('is_active', true);

            const { data, error } = await query;
            return { data: data || [], error: error?.message };
        },

        /**
         * Crear un empleado
         */
        async create(businessId, { display_name, email, phone, bio, role }) {
            const { data, error } = await sb
                .from('staff')
                .insert({
                    business_id: businessId,
                    display_name,
                    email,
                    phone,
                    bio,
                    role: role || 'staff'
                })
                .select()
                .single();

            return { data, error: error?.message };
        },

        /**
         * Asignar servicios a un empleado
         */
        async assignServices(staffId, serviceIds) {
            // Delete existing assignments
            await sb.from('staff_services').delete().eq('staff_id', staffId);

            // Insert new ones
            const rows = serviceIds.map(sid => ({ staff_id: staffId, service_id: sid }));
            const { error } = await sb.from('staff_services').insert(rows);

            return { error: error?.message };
        }
    },

    // ===== SCHEDULES =====
    schedules: {
        /**
         * Obtener horarios de un negocio
         */
        async getByBusiness(businessId) {
            const { data, error } = await sb
                .from('schedules')
                .select('*')
                .eq('business_id', businessId)
                .eq('is_active', true)
                .order('day');

            return { data: data || [], error: error?.message };
        },

        /**
         * Guardar horarios completos (delete + re-insert)
         */
        async saveAll(businessId, scheduleData) {
            // Delete existing
            await sb.from('schedules')
                .delete()
                .eq('business_id', businessId)
                .is('staff_id', null);

            // Insert new
            const rows = scheduleData
                .filter(s => s.is_active)
                .map(s => ({
                    business_id: businessId,
                    staff_id: null,
                    day: s.day,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    is_active: true
                }));

            if (rows.length === 0) return { error: null };

            const { error } = await sb.from('schedules').insert(rows);
            return { error: error?.message };
        }
    },

    // ===== CUSTOMERS =====
    customers: {
        /**
         * Obtener clientes de un negocio
         */
        async getByBusiness(businessId, { limit = 50, offset = 0, search = '' } = {}) {
            let query = sb
                .from('customers')
                .select('*', { count: 'exact' })
                .eq('business_id', businessId)
                .order('last_visit_at', { ascending: false, nullsFirst: false })
                .range(offset, offset + limit - 1);

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
            }

            const { data, count, error } = await query;
            return { data: data || [], count, error: error?.message };
        }
    },

    // ===== BOOKINGS =====
    bookings: {
        /**
         * Obtener reservas de un negocio (con filtros)
         */
        async getByBusiness(businessId, { date, status, staffId, limit = 50 } = {}) {
            let query = sb
                .from('bookings')
                .select(`
                    *,
                    customer:customers(name, email, phone),
                    service:services(name, duration_minutes, price, icon),
                    staff_member:staff(display_name)
                `)
                .eq('business_id', businessId)
                .order('start_time', { ascending: true })
                .limit(limit);

            if (date) {
                const dayStart = `${date}T00:00:00`;
                const dayEnd = `${date}T23:59:59`;
                query = query.gte('start_time', dayStart).lte('start_time', dayEnd);
            }

            if (status) {
                query = query.eq('status', status);
            }

            if (staffId) {
                query = query.eq('staff_id', staffId);
            }

            const { data, error } = await query;
            return { data: data || [], error: error?.message };
        },

        /**
         * Obtener stats del dashboard
         */
        async getStats(businessId) {
            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Citas hoy
            const { count: todayCount } = await sb
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .gte('start_time', `${today}T00:00:00`)
                .lte('start_time', `${today}T23:59:59`)
                .neq('status', 'cancelled');

            // Reservas esta semana
            const { count: weekCount } = await sb
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .gte('start_time', `${weekAgo}T00:00:00`)
                .neq('status', 'cancelled');

            // Nuevos clientes este mes
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
            const { count: newClientsCount } = await sb
                .from('customers')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .gte('created_at', monthStart);

            // Tasa de no-show (últimos 30 días)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count: totalRecent } = await sb
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .gte('start_time', thirtyDaysAgo);

            const { count: noShowCount } = await sb
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('business_id', businessId)
                .eq('status', 'no_show')
                .gte('start_time', thirtyDaysAgo);

            const noShowRate = totalRecent > 0 ? Math.round((noShowCount / totalRecent) * 100) : 0;

            return {
                todayBookings: todayCount || 0,
                weekBookings: weekCount || 0,
                newClients: newClientsCount || 0,
                noShowRate
            };
        },

        /**
         * Actualizar estado de una reserva
         */
        async updateStatus(bookingId, status, reason = null) {
            const updates = { status };
            if (status === 'cancelled') {
                updates.cancelled_at = new Date().toISOString();
                updates.cancellation_reason = reason;
            }

            const { data, error } = await sb
                .from('bookings')
                .update(updates)
                .eq('id', bookingId)
                .select()
                .single();

            return { data, error: error?.message };
        },

        /**
         * Crear una reserva (usado desde el portal público)
         * Usa la función RPC create_booking del backend
         */
        async create({ businessId, serviceId, staffId, startTime, customerName, customerEmail, customerPhone, notes }) {
            const { data, error } = await sb.rpc('create_booking', {
                p_business_id: businessId,
                p_service_id: serviceId,
                p_staff_id: staffId,
                p_start_time: startTime,
                p_customer_name: customerName,
                p_customer_email: customerEmail,
                p_customer_phone: customerPhone,
                p_notes: notes || null
            });

            if (error) {
                log('Booking creation error:', error.message);
                return { bookingId: null, error: error.message };
            }

            return { bookingId: data, error: null };
        }
    },

    // ===== ADMIN (Super-Admin only) =====
    admin: {
        /**
         * Verificar si el usuario actual es super-admin
         */
        async isSuperAdmin() {
            const { data, error } = await sb.rpc('is_super_admin');
            if (error) return false;
            return data === true;
        },

        /**
         * Obtener overview de todos los negocios
         */
        async getBusinessesOverview() {
            const { data, error } = await sb.rpc('get_admin_overview');
            return { data: data || [], error: error?.message };
        },

        /**
         * Obtener stats globales de la plataforma
         */
        async getStats() {
            const { data, error } = await sb.rpc('get_admin_stats');
            return { data, error: error?.message };
        },

        /**
         * Actualizar una cuenta (plan, estado, notas)
         */
        async updateBusiness(businessId, { plan, subscriptionStatus, isActive, notes }) {
            const { error } = await sb.rpc('admin_update_business', {
                p_business_id: businessId,
                p_plan: plan || null,
                p_subscription_status: subscriptionStatus || null,
                p_is_active: isActive === undefined ? null : isActive,
                p_notes: notes === undefined ? null : notes
            });
            return { error: error?.message };
        }
    }
};
