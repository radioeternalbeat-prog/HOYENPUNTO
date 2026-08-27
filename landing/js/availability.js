/**
 * ============================================================
 * HOYENPUNTO — Availability Engine
 * ============================================================
 * Motor de disponibilidad: calcula slots disponibles para
 * un negocio/staff/fecha dados.
 * Depende de: supabase-config.js, db.js
 * ============================================================
 */

const Availability = {

    /**
     * Obtener slots disponibles para una fecha y staff específicos
     * Usa la función PostgreSQL get_available_slots() via RPC
     * 
     * @param {string} businessId - UUID del negocio
     * @param {string} staffId - UUID del empleado
     * @param {string} date - Fecha en formato YYYY-MM-DD
     * @param {number} durationMinutes - Duración del servicio
     * @returns {Array} [{slot_start: "09:00:00", slot_end: "09:30:00"}, ...]
     */
    async getSlots(businessId, staffId, date, durationMinutes = 30) {
        const { data, error } = await sb.rpc('get_available_slots', {
            p_business_id: businessId,
            p_staff_id: staffId,
            p_date: date,
            p_duration_minutes: durationMinutes
        });

        if (error) {
            log('Availability error:', error.message);
            return [];
        }

        // Format time slots for display
        return (data || []).map(slot => ({
            start: slot.slot_start.substring(0, 5), // "09:00"
            end: slot.slot_end.substring(0, 5),     // "09:30"
            startFull: slot.slot_start,
            endFull: slot.slot_end
        }));
    },

    /**
     * Obtener días con disponibilidad en un mes dado
     * (Para mostrar qué días están habilitados en el calendario)
     * 
     * @param {string} businessId
     * @param {number} year
     * @param {number} month (0-indexed)
     * @returns {Array} [1, 2, 5, 6, ...] días con disponibilidad
     */
    async getAvailableDays(businessId, year, month) {
        // Get business schedules to know which days of week are active
        const { data: schedules } = await sb
            .from('schedules')
            .select('day')
            .eq('business_id', businessId)
            .eq('is_active', true);

        if (!schedules || schedules.length === 0) return [];

        const activeDays = schedules.map(s => s.day);
        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };

        const activeWeekdays = activeDays.map(d => dayMap[d]);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get blocked dates for this month
        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;

        const { data: blockedDates } = await sb
            .from('blocked_slots')
            .select('date')
            .eq('business_id', businessId)
            .eq('all_day', true)
            .gte('date', monthStart)
            .lte('date', monthEnd);

        const blockedSet = new Set((blockedDates || []).map(b => b.date));

        const availableDays = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            // Skip past dates
            if (date < today) continue;

            // Skip days not in schedule
            if (!activeWeekdays.includes(date.getDay())) continue;

            // Skip blocked days
            if (blockedSet.has(dateStr)) continue;

            availableDays.push(day);
        }

        return availableDays;
    },

    /**
     * Construir el timestamp completo para una reserva
     * Combina fecha + hora + timezone del negocio
     * 
     * @param {string} date - "2026-08-27"
     * @param {string} time - "14:00"
     * @param {string} timezone - "America/Santiago"
     * @returns {string} ISO timestamp con timezone
     */
    buildTimestamp(date, time, timezone = 'America/Santiago') {
        // Create a datetime string and let the browser handle it
        // The DB function will handle timezone conversion
        return `${date}T${time}:00`;
    },

    /**
     * Obtener el staff disponible para un servicio en una fecha/hora dada
     */
    async getAvailableStaff(businessId, serviceId, date, time) {
        // Get all staff that provide this service
        const { data: staffServices } = await sb
            .from('staff_services')
            .select('staff_id, staff:staff(id, display_name, bio, avatar_url, is_active)')
            .eq('service_id', serviceId);

        if (!staffServices) return [];

        const activeStaff = staffServices
            .filter(ss => ss.staff?.is_active)
            .map(ss => ss.staff);

        // For each staff, check if the time slot is available
        const available = [];
        for (const member of activeStaff) {
            const slots = await this.getSlots(businessId, member.id, date);
            if (slots.some(s => s.start === time)) {
                available.push(member);
            }
        }

        return available;
    }
};
