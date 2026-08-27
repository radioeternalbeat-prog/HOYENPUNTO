/**
 * ============================================================
 * HOYENPUNTO — Supabase Configuration
 * ============================================================
 */

// ===== CONFIGURACIÓN =====
const SUPABASE_URL = 'https://kbdmkpkvfuooaxeprgcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZG1rcGt2ZnVvb2F4ZXByZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MzkyODgsImV4cCI6MjEwMzQxNTI4OH0.81n10GmyAeD9a7CMRmMCDSdVRQwinU517wC0UvI-ntM';

// ===== INICIALIZAR CLIENTE =====
// El CDN crea window.supabase con createClient adentro.
// Creamos el cliente como variable global 'sb' para evitar conflicto de nombres.
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('[HoyEnPunto] ✅ Supabase conectado');

// ===== DEBUG =====
function log(...args) { console.log('[HoyEnPunto]', ...args); }
