/**
 * ============================================================
 * HOYENPUNTO — Authentication Module
 * ============================================================
 * Maneja registro, login, logout y sesión con Supabase Auth.
 * Depende de: supabase-config.js
 * ============================================================
 */

const Auth = {
    /**
     * Registrar un nuevo usuario (email + password)
     * @returns {Object} { user, error }
     */
    async signUp(email, password) {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard/`
            }
        });
        if (error) {
            log('SignUp error:', error.message);
            return { user: null, error: error.message };
        }
        log('SignUp success:', data.user?.id);
        return { user: data.user, error: null };
    },

    /**
     * Login con email + password
     * @returns {Object} { user, error }
     */
    async signIn(email, password) {
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            log('SignIn error:', error.message);
            return { user: null, error: error.message };
        }
        log('SignIn success:', data.user?.id);
        return { user: data.user, session: data.session, error: null };
    },

    /**
     * Login con Google OAuth
     */
    async signInWithGoogle() {
        const { data, error } = await sb.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard/`
            }
        });
        if (error) {
            log('Google OAuth error:', error.message);
            return { error: error.message };
        }
        return { data, error: null };
    },

    /**
     * Cerrar sesión
     */
    async signOut() {
        const { error } = await sb.auth.signOut();
        if (!error) {
            window.location.href = '/';
        }
        return { error };
    },

    /**
     * Obtener el usuario actual (null si no está logueado)
     */
    async getUser() {
        try {
            const { data: { user } } = await sb.auth.getUser();
            return user;
        } catch(e) {
            return null;
        }
    },

    /**
     * Obtener la sesión actual
     */
    async getSession() {
        try {
            const { data: { session } } = await sb.auth.getSession();
            return session;
        } catch(e) {
            return null;
        }
    },

    /**
     * Verificar si el usuario está autenticado. Si no, redirigir.
     * Usar en páginas protegidas (dashboard, etc.)
     */
    async requireAuth(redirectTo = '/registro/') {
        const user = await this.getUser();
        if (!user) {
            window.location.href = redirectTo;
            return null;
        }
        return user;
    },

    /**
     * Si el usuario YA está logueado, redirigir al dashboard.
     * Usar en páginas públicas (registro, login).
     */
    async redirectIfAuthenticated(redirectTo = '/dashboard/') {
        const user = await this.getUser();
        if (user) {
            window.location.href = redirectTo;
        }
        return user;
    },

    /**
     * Escuchar cambios de estado de autenticación
     */
    onAuthStateChange(callback) {
        sb.auth.onAuthStateChange((event, session) => {
            log('Auth state change:', event);
            callback(event, session);
        });
    }
};

/**
 * ============================================================
 * ACCESS CONTROL — Evaluación de acceso según suscripción
 * ============================================================
 * Reglas:
 *  - perpetual / active           → acceso total (nunca expira)
 *  - trial y dentro de 7 días     → acceso con banner de trial
 *  - trial y en período de gracia → acceso con banner urgente (3 días extra)
 *  - trial y gracia expirada      → BLOQUEADO
 *  - expired / cancelled          → BLOQUEADO
 * ============================================================
 */
const GRACE_DAYS = 3; // Días de gracia después de que expira el trial

const Access = {
    /**
     * Evalúa el acceso de un negocio.
     * @returns {Object} {
     *   allowed: boolean,        // ¿puede usar la plataforma?
     *   state: string,           // 'active' | 'trial' | 'grace' | 'blocked'
     *   daysLeft: number,        // días restantes (trial o gracia)
     *   message: string
     * }
     */
    evaluate(business) {
        if (!business) {
            return { allowed: false, state: 'blocked', daysLeft: 0, message: 'Sin negocio' };
        }

        const status = business.subscription_status;

        // Perpetua o activa (pagando) → acceso total, nunca expira
        if (status === 'perpetual' || status === 'active') {
            return { allowed: true, state: 'active', daysLeft: null, message: 'Cuenta activa' };
        }

        // Cancelado o expirado explícitamente → bloqueado
        if (status === 'cancelled' || status === 'expired') {
            return { allowed: false, state: 'blocked', daysLeft: 0, message: 'Suscripción inactiva' };
        }

        // Trial → calcular días
        if (status === 'trial') {
            const now = new Date();
            const trialEnd = business.trial_ends_at ? new Date(business.trial_ends_at) : null;

            if (!trialEnd) {
                // Sin fecha de trial → dar acceso por seguridad
                return { allowed: true, state: 'trial', daysLeft: 7, message: 'Prueba activa' };
            }

            // Días hasta que termine el trial (puede ser negativo si ya pasó)
            const msLeft = trialEnd - now;
            const daysLeftTrial = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

            if (daysLeftTrial > 0) {
                // Dentro del trial
                return { allowed: true, state: 'trial', daysLeft: daysLeftTrial, message: `Prueba: ${daysLeftTrial} días` };
            }

            // Trial expirado → verificar período de gracia
            const graceEnd = new Date(trialEnd.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
            const graceMsLeft = graceEnd - now;
            const daysLeftGrace = Math.ceil(graceMsLeft / (1000 * 60 * 60 * 24));

            if (daysLeftGrace > 0) {
                // En período de gracia
                return { allowed: true, state: 'grace', daysLeft: daysLeftGrace, message: `Gracia: ${daysLeftGrace} días` };
            }

            // Gracia expirada → bloqueado
            return { allowed: false, state: 'blocked', daysLeft: 0, message: 'Prueba y gracia expiradas' };
        }

        // Default: permitir (fallback seguro)
        return { allowed: true, state: 'trial', daysLeft: 0, message: 'Estado desconocido' };
    },

    /**
     * Requiere que el negocio tenga acceso. Si no, redirige a la pantalla de bloqueo.
     * Usar en páginas protegidas del dashboard.
     */
    requireAccess(business, redirectTo = '/dashboard/bloqueado.html') {
        const result = this.evaluate(business);
        if (!result.allowed) {
            window.location.href = redirectTo;
        }
        return result;
    }
};
