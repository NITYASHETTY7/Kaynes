import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDB() {
  console.log("Resetting database...");
  
  // Tables to clear
  const tables = ['notifications', 'ai_results', 'images', 'devices', 'assets', 'plants', 'profiles', 'tenants'];
  
  for (const table of tables) {
    console.log(`Clearing ${table}...`);
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything
    
    // Fallback if id is not UUID or different type, deleting by not null
    if (error) {
       console.log(`Fallback clear for ${table}...`);
       // Devices uses serial
       if (table === 'devices') {
           await supabase.from(table).delete().neq('serial', 'invalid-serial-123');
       } else {
           // We might need to just try to delete everything based on a column that is not null
           // Supabase requires a filter for delete
           await supabase.from(table).delete().gte('created_at', '2000-01-01');
       }
    }
  }
  
  console.log("Database reset complete!");
}

resetDB().catch(console.error);
