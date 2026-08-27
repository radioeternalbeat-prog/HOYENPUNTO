/**
 * ============================================================
 * HOYENPUNTO — Utility Functions
 * ============================================================
 * Helpers compartidos: formateo, validación, UI, etc.
 * ============================================================
 */

const Utils = {

    // ===== FORMATTING =====

    /**
     * Formatear precio en CLP
     */
    formatPrice(amount, currency = 'CLP') {
        if (currency === 'CLP') {
            return '$' + Math.round(amount).toLocaleString('es-CL');
        }
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency
        }).format(amount);
    },

    /**
     * Formatear fecha para mostrar
     */
    formatDate(dateStr, options = {}) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...options
        });
    },

    /**
     * Formatear hora
     */
    formatTime(timeStr) {
        // "14:00:00" -> "14:00"
        return timeStr.substring(0, 5);
    },

    /**
     * Formatear duración
     */
    formatDuration(minutes) {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    },

    // ===== VALIDATION =====

    /**
     * Validar email
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Validar teléfono chileno
     */
    isValidPhone(phone) {
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        return /^(\+?56)?9\d{8}$/.test(cleaned);
    },

    /**
     * Generar slug desde un nombre
     */
    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 40);
    },

    // ===== UI HELPERS =====

    /**
     * Mostrar loading spinner en un botón
     */
    btnLoading(btn, loading = true) {
        if (loading) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner"></span> Cargando...';
            btn.disabled = true;
        } else {
            btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
            btn.disabled = false;
        }
    },

    /**
     * Mostrar notificación toast
     */
    toast(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="toast-message">${message}</span>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    z-index: 9999;
                    animation: toastIn 0.3s ease, toastOut 0.3s ease forwards;
                    animation-delay: 0s, ${duration}ms;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    backdrop-filter: blur(10px);
                }
                .toast-success {
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: #34d399;
                }
                .toast-error {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #f87171;
                }
                .toast-info {
                    background: rgba(255, 128, 0, 0.15);
                    border: 1px solid rgba(255, 128, 0, 0.3);
                    color: #ff9933;
                }
                @keyframes toastIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes toastOut {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(20px); opacity: 0; }
                }
                .spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: currentColor;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration + 300);
    },

    /**
     * Confirmar acción (dialog simple)
     */
    async confirm(message) {
        return window.confirm(message);
    },

    // ===== DATE HELPERS =====

    /**
     * Obtener fecha de hoy en formato YYYY-MM-DD
     */
    today() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Nombre del día de la semana
     */
    dayName(date) {
        return new Date(date).toLocaleDateString('es-CL', { weekday: 'long' });
    },

    /**
     * Verificar si una fecha es hoy
     */
    isToday(dateStr) {
        return dateStr === this.today();
    }
};
