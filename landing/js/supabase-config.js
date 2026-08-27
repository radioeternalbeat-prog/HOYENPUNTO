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
// Supabase UMD bundle expone window.supabase con createClient
let supabase;
try {
    // El UMD bundle de @supabase/supabase-js expone window.supabase
    const { createClient } = window.supabase || window.Supabase || {};
    if (createClient) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[HoyEnPunto] ✅ Supabase conectado:', SUPABASE_URL);
    } else {
        console.error('[HoyEnPunto] ❌ Supabase SDK no encontrado. window.supabase =', window.supabase);
    }
} catch(e) {
    console.error('[HoyEnPunto] ❌ Error inicializando Supabase:', e.message);
}

// ===== DEBUG MODE =====
const DEBUG = true; // Activar debug temporalmente para diagnosticar
function log(...args) { console.log('[HoyEnPunto]', ...args); }

