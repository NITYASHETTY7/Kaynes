import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const DEFAULT_TENANTS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Kaynes Technology Ltd', subscription: 'Enterprise', status: 'active', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Mirai Labs', subscription: 'Starter', status: 'active', created_at: new Date().toISOString() },
];

export const DEFAULT_PLANTS = [
  { id: '00000000-0000-0000-0000-000000000002', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Mysuru Plant 2', location: 'Karnataka, India', capacity: '1.2M units/yr', manager: 'S. Ranganath', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000102', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Bangalore Facility 3', location: 'Karnataka, India', capacity: '800k units/yr', manager: 'R. Kulkarni', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000103', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Chennai Aerospace', location: 'Tamil Nadu, India', capacity: '200k units/yr', manager: 'K. Srinivasan', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000104', tenantId: '00000000-0000-0000-0000-000000000002', name: 'Tokyo Central R&D', location: 'Tokyo, Japan', capacity: '100k units/yr', manager: 'Y. Tanaka', created_at: new Date().toISOString() },
];

async function run() {
    try {
      const { data: dbTenants, error: tenantErr } = await supabase.from('tenants').select('*');
      if (tenantErr) throw tenantErr;
      if (!dbTenants || dbTenants.length === 0) {
        console.log("inserting tenants...");
        const res = await supabase.from('tenants').insert(DEFAULT_TENANTS);
        if (res.error) throw res.error;
      }

      const { data: dbPlants, error: plantErr } = await supabase.from('plants').select('*');
      if (plantErr) throw plantErr;
      if (!dbPlants || dbPlants.length === 0) {
        console.log("inserting plants...");
        const toInsert = DEFAULT_PLANTS.map(p => ({
          id: p.id,
          tenant_id: p.tenantId,
          name: p.name,
          location: p.location,
          capacity: p.capacity,
          manager: p.manager,
          created_at: p.created_at
        }));
        const res = await supabase.from('plants').insert(toInsert);
        if (res.error) throw res.error;
      }
      
      console.log("Successfully ran test sync");
    } catch (e) {
      console.error("Caught error:", e);
    }
}

run();
