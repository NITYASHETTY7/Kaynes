import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function wipe() {
  const tables = ['notifications', 'ai_results', 'images', 'devices', 'assets', 'plants', 'profiles', 'tenants'];
  
  for (const table of tables) {
    console.log(`Wiping ${table}...`);
    // Delete all rows where created_at is not null (which should be all rows)
    const { error } = await supabase.from(table).delete().not('created_at', 'is', null);
    if (error) {
       console.log(`Error deleting ${table} with created_at:`, error.message);
       // Try deleting with id not null
       const { error: err2 } = await supabase.from(table).delete().not('id', 'is', null);
       if (err2) {
           console.log(`Error deleting ${table} with id:`, err2.message);
           // Try serial not null for devices
           if (table === 'devices') {
               const { error: err3 } = await supabase.from(table).delete().not('serial', 'is', null);
               if (err3) console.log("Failed to wipe devices:", err3.message);
           }
       }
    }
  }
  console.log("Wipe complete!");
}

wipe().catch(console.error);
