const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// Replace syncFromSupabase entirely
const syncStart = code.indexOf('const syncFromSupabase = async () => {');
const syncEnd = code.indexOf('  // Mount logic - Try Supabase sync');
if (syncStart !== -1 && syncEnd !== -1) {
  const newSyncFunc = `  const syncFromSupabase = async () => {
    if (!supabase) return;
    setIsSyncing(true);
    try {
      // 1. Tenants
      const { data: dbTenants } = await supabase.from('tenants').select('*');
      if (dbTenants) setTenants(dbTenants);

      // 2. Plants
      const { data: dbPlants } = await supabase.from('plants').select('*');
      if (dbPlants) setPlants(dbPlants);

      // 3. Profiles
      const { data: dbUsers } = await supabase.from('profiles').select('*');
      if (dbUsers) {
        setUsers(dbUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.password_hash,
          role: u.role,
          tenantId: u.tenant_id,
          plantId: u.plant_id,
          status: u.status,
          isDeleted: u.is_deleted || false,
          created_at: u.created_at
        })));
      }

      // 4. Assets
      const { data: dbAssets } = await supabase.from('assets').select('*');
      if (dbAssets) {
        setAssets(dbAssets.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type,
          location: a.location,
          capacity: a.capacity,
          manager: a.manager,
          created_at: a.created_at
        })));
      }

      // 5. Devices
      const { data: dbDevices } = await supabase.from('devices').select('*');
      if (dbDevices) {
        setDevices(dbDevices.map(d => ({
          ...d,
          logs: d.logs || [],
          captures: d.captures || []
        })));
      }

      // 6. Images
      const { data: dbImages } = await supabase.from('images').select('*');
      if (dbImages) {
        setImages(dbImages.map(img => ({
          id: img.id,
          file_name: img.file_name || '',
          label: img.label,
          type: img.type || 'photo',
          url: img.url,
          tags: img.tags || [],
          deviceId: img.device_id,
          assetId: img.asset_id,
          status: img.status || 'synced',
          isArchived: img.is_archived || false,
          created_at: img.created_at
        })));
      }

      // 7. AI Results
      const { data: dbAi } = await supabase.from('ai_results').select('*');
      if (dbAi) {
        setAiResults(dbAi.map(r => ({
          id: r.id,
          imageId: r.image_id,
          filterType: r.filter_type,
          confidence: r.confidence,
          insights: r.insights,
          flags: r.flags || [],
          created_at: r.created_at
        })));
      }

      // 8. Notifications
      const { data: dbNotif } = await supabase.from('notifications').select('*');
      if (dbNotif) {
        setNotifications(dbNotif.map(n => ({
          id: n.id,
          severity: n.severity || 'warning',
          title: n.title,
          message: n.message,
          acknowledged: n.acknowledged || false,
          created_at: n.created_at
        })));
      }

      setIsSupabaseConnected(true);
    } catch (e) {
      console.error('Failed to sync with Supabase tables:', e);
      setIsSupabaseConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

`;
  code = code.substring(0, syncStart) + newSyncFunc + code.substring(syncEnd);
}

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('Fallbacks removed gracefully from sync');
