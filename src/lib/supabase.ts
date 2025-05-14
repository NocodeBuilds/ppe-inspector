import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client with additional configuration for optimal performance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 1, // Limit to avoid rate limits
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'ppe-inspector',
    },
  },
});

// Define cached API routes for the service worker
export const API_ROUTES = [
  `${supabaseUrl}/rest/v1/equipment*`,
  `${supabaseUrl}/rest/v1/inspections*`,
  `${supabaseUrl}/rest/v1/inspection_templates*`
];

export default supabase;
