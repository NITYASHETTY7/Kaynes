import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL detected:', !!supabaseUrl);
console.log('Supabase Anon Key detected:', !!supabaseAnonKey);

if (supabaseUrl && supabaseAnonKey) {
  console.log('Attempting to initialize Supabase client...');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing or invalid. ' +
    'The Kaynes Fleet Console is running in local-fallback mode.'
  );
}
