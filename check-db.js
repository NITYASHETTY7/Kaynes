import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const tables = ['ai_results', 'images', 'devices', 'assets', 'plants', 'profiles', 'tenants'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Error reading ${table}:`, error.message);
    } else {
      console.log(`Table ${table} has ${data ? data.length : 0} rows. (We didn't actually fetch rows, just checked if error).`);
    }
    
    const { count, error: countErr } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`Table ${table} count: ${count}`);
  }
}

checkDB().catch(console.error);
