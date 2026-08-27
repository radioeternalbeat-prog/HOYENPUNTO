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
