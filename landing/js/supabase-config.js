/**
 * ============================================================
 * HOYENPUNTO — Supabase Configuration
 * ============================================================
 * Proyecto conectado a Supabase (ca-central-1)
 * Auth + PostgreSQL + RLS + RPC Functions
 * ============================================================
 */

// ===== CONFIGURACIÓN HOYENPUNTO =====
const SUPABASE_URL = 'https://kbdmkpkvfuooaxeprgcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZG1rcGt2ZnVvb2F4ZXByZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzkyODgsImV4cCI6MjEwMzQxNTI4OH0.81n10GmyAeD9a7CMRmMCDSdVRQwinU517wC0UvI-ntM';

// ===== INICIALIZAR CLIENTE =====
// unpkg.com/@supabase/supabase-js@2 expone window.supabase.createClient
let supabase;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[HoyEnPunto] ✅ Supabase conectado');
} else {
    console.error('[HoyEnPunto] ❌ Supabase SDK no encontrado. window.supabase =', typeof window.supabase, window.supabase);
    // Intento alternativo: a veces el SDK se carga async
    document.addEventListener('DOMContentLoaded', () => {
        if (window.supabase && typeof window.supabase.createClient === 'function' && !supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('[HoyEnPunto] ✅ Supabase conectado (deferred)');
        }
    });
}

// ===== DEBUG MODE =====
const DEBUG = true; // Activar debug temporalmente para diagnosticar
function log(...args) { console.log('[HoyEnPunto]', ...args); }

