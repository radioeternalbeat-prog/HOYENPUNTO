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
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DEBUG MODE =====
const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
function log(...args) { if (DEBUG) console.log('[HoyEnPunto]', ...args); }
