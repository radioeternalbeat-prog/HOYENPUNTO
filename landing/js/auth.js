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
        const { data, error } = await supabase.auth.signUp({
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
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { data, error } = await supabase.auth.signInWithOAuth({
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
        const { error } = await supabase.auth.signOut();
        if (!error) {
            window.location.href = '/';
        }
        return { error };
    },

    /**
     * Obtener el usuario actual (null si no está logueado)
     */
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Obtener la sesión actual
     */
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
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
        supabase.auth.onAuthStateChange((event, session) => {
            log('Auth state change:', event);
            callback(event, session);
        });
    }
};
