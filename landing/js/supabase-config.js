/**
 * ============================================================
 * HOYENPUNTO — Supabase Configuration
 * ============================================================
 * Este archivo inicializa el cliente de Supabase y se importa
 * en todas las páginas del sitio.
 * 
 * SETUP:
 * 1. Crea un proyecto en https://supabase.com
 * 2. Ejecuta supabase/schema.sql en el SQL Editor
 * 3. Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY abajo
 * 4. En Authentication > Settings, configura:
 *    - Site URL: https://tu-sitio.netlify.app
 *    - Redirect URLs: https://tu-sitio.netlify.app/dashboard/
 * ============================================================
 */

// ===== CONFIGURACIÓN — REEMPLAZAR CON TUS VALORES =====
const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_AQUI';

// ===== INICIALIZAR CLIENTE =====
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== DEBUG MODE =====
const DEBUG = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
function log(...args) { if (DEBUG) console.log('[HoyEnPunto]', ...args); }
