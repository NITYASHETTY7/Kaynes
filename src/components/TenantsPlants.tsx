import React, { useState, useMemo } from 'react';
import { useApp, type Tenant, type Plant } from '../context/AppContext';
import { 
  Building2, 
  Building, 
  Search, 
  MapPin, 
  Pencil, 
  Trash2, 
  Plus 
} from 'lucide-react';

export default function TenantsPlants() {
  const { tenants, plants, addTenant, updateTenant, deleteTenant, addPlant, updatePlant, deletePlant } = useApp();
  
  // States
  const [activeTab, setActiveTab] = useState<'plants' | 'tenants'>('plants');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPlantModal, setShowPlantModal] = useState(false);
  
  // Selection/Edits
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  // Forms
  const [tenantName, setTenantName] = useState('');
  const [tenantSub, setTenantSub] = useState<'Starter' | 'Professional' | 'Enterprise'>('Starter');
  const [tenantStatus, setTenantStatus] = useState<'active' | 'inactive'>('active');

  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('Manufacturing');
  const [plantTenantId, setPlantTenantId] = useState('');
  const [plantLocation, setPlantLocation] = useState('');
  const [plantCapacity, setPlantCapacity] = useState('');
  const [plantManager, setPlantManager] = useState('');

  // Filtering
  const filteredPlants = useMemo(() => {
    return plants.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plants, searchQuery]);

  const filteredTenants = useMemo(() => {
    return tenants.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  // Modal resets
  const openTenantCreate = () => {
    setEditingTenant(null);
    setTenantName('');
    setTenantSub('Starter');
    setTenantStatus('active');
    setShowTenantModal(true);
  };

  const openTenantEdit = (t: Tenant) => {
    setEditingTenant(t);
    setTenantName(t.name);
    setTenantSub(t.subscription);
    setTenantStatus(t.status);
    setShowTenantModal(true);
  };

  const openPlantCreate = () => {
    setEditingPlant(null);
    setPlantName('');
    setPlantType('Manufacturing');
    setPlantTenantId(tenants[0]?.id || '');
    setPlantLocation('');
    setPlantCapacity('');
    setPlantManager('');
    setShowPlantModal(true);
  };

  const openPlantEdit = (p: Plant) => {
    setEditingPlant(p);
    setPlantName(p.name);
    setPlantType(p.type || 'Manufacturing'); 
    setPlantTenantId(p.tenantId);
    setPlantLocation(p.location);
    setPlantCapacity(p.capacity);
    setPlantManager(p.manager);
    setShowPlantModal(true);
  };

  // Submit operations
  const handleTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim()) return;

    if (editingTenant) {
      updateTenant(editingTenant.id, { name: tenantName, subscription: tenantSub, status: tenantStatus });
    } else {
      addTenant({ name: tenantName, subscription: tenantSub, status: tenantStatus });
    }
    setShowTenantModal(false);
  };

  const handlePlantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim() || !plantTenantId) return;

    if (editingPlant) {
      updatePlant(editingPlant.id, { 
        name: plantName, 
        type: plantType,
        tenantId: plantTenantId, 
        location: plantLocation, 
        capacity: plantCapacity, 
        manager: plantManager 
      });
    } else {
      addPlant({ 
        name: plantName, 
        type: plantType,
        tenantId: plantTenantId, 
        location: plantLocation, 
        capacity: plantCapacity, 
        manager: plantManager 
      });
    }
    setShowPlantModal(false);
  };

  // Shared input style
  const inputStyle: React.CSSProperties = {
    borderColor: 'rgb(var(--s-500))',
    background: 'rgb(var(--s-700))',
    color: 'rgb(var(--n-200))',
  };

  return (
    <div style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--fg))' }} className="h-screen flex flex-col overflow-hidden">
      
      {/* 1. PAGE HEADER */}
      <div
        className="w-full px-4 sm:px-6 lg:px-8 py-5"
        style={{ background: 'rgb(var(--s-800))', borderBottom: '1px solid rgb(var(--s-600))' }}
      >
        <h1 className="text-[15px] font-medium" style={{ color: 'rgb(var(--fg))' }}>Facilities &amp; organizations</h1>
        <p className="text-[12px]" style={{ color: 'rgb(var(--n-400))' }}>Manage plants, geo-locations, and corporate subscriptions</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 2. TABS */}
        <div
          className="px-4 sm:px-6 lg:px-8"
          style={{ borderBottom: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
        >
          <div className="flex gap-8">
            <button
              onClick={() => { setActiveTab('plants'); setSearchQuery(''); }}
              className="flex items-center gap-2 pb-3 pt-4 text-sm font-medium transition-all relative"
              style={{ color: activeTab === 'plants' ? '#FF9900' : 'rgb(var(--n-400))' }}
            >
              <Building2 size={15} />
              Plants / facilities
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={
                  activeTab === 'plants'
                    ? { background: 'rgba(255,153,0,0.12)', color: '#FF9900' }
                    : { background: 'rgb(var(--s-700))', color: 'rgb(var(--n-500))' }
                }
              >
                {plants.length}
              </span>
              {activeTab === 'plants' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: '#FF9900' }} />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('tenants'); setSearchQuery(''); }}
              className="flex items-center gap-2 pb-3 pt-4 text-sm font-medium transition-all relative"
              style={{ color: activeTab === 'tenants' ? '#FF9900' : 'rgb(var(--n-400))' }}
            >
              <Building size={15} />
              Tenant accounts
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={
                  activeTab === 'tenants'
                    ? { background: 'rgba(255,153,0,0.12)', color: '#FF9900' }
                    : { background: 'rgb(var(--s-700))', color: 'rgb(var(--n-500))' }
                }
              >
                {tenants.length}
              </span>
              {activeTab === 'tenants' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: '#FF9900' }} />
              )}
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 3. SEARCH BAR & CTA Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: 'rgb(var(--n-500))' }} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'plants' ? "Search plants..." : "Search tenants..."}
                className="h-[34px] w-full rounded-md pl-9 pr-4 text-sm outline-none"
                style={{
                  border: '1px solid rgb(var(--s-600))',
                  background: 'rgb(var(--s-700))',
                  color: 'rgb(var(--n-200))',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-600))')}
              />
            </div>

            <button 
              onClick={activeTab === 'plants' ? openPlantCreate : openTenantCreate}
              className="h-[34px] flex items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
                color: '#0D0F15',
                boxShadow: '0 4px 14px rgba(255,153,0,0.3)',
              }}
            >
              <Plus size={15} />
              {activeTab === 'plants' ? "Register Plant" : "Create Tenant"}
            </button>
          </div>

          {/* 4. TABLE */}
          <div
            className="overflow-hidden rounded-lg shadow-sm"
            style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
          >
            <table className="w-full text-left text-sm">
              <thead style={{ background: 'rgb(var(--s-700))', borderBottom: '1px solid rgb(var(--s-600))' }}>
                <tr
                  className="text-[10px] font-medium uppercase tracking-[0.07em]"
                  style={{ color: 'rgb(var(--n-500))' }}
                >
                  <th className="px-5 py-3">{activeTab === 'plants' ? "PLANT NAME" : "TENANT NAME"}</th>
                  <th className="px-5 py-3">{activeTab === 'plants' ? "ASSOCIATED TENANT" : "SUBSCRIPTION"}</th>
                  <th className="px-5 py-3">{activeTab === 'plants' ? "LOCATION" : "STATUS"}</th>
                  <th className="px-5 py-3">{activeTab === 'plants' ? "MANAGER" : "CREATED"}</th>
                  <th className="px-5 py-3">{activeTab === 'plants' ? "OUTPUT CAPACITY" : "USERS"}</th>
                  <th className="px-5 py-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody style={{ background: 'rgb(var(--s-800))' }}>
                {activeTab === 'plants' ? (
                  filteredPlants.map(p => {
                    const tName = tenants.find(t => t.id === p.tenantId)?.name || 'Unknown';
                    return (
                      <tr
                        key={p.id}
                        className="group transition-colors"
                        style={{ borderTop: '1px solid rgb(var(--s-700))' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td className="px-5 py-3">
                          <div className="text-[13px] font-medium" style={{ color: 'rgb(var(--fg))' }}>{p.name}</div>
                          <div className="text-[11px]" style={{ color: 'rgb(var(--n-500))' }}>{p.type}</div>
                        </td>
                        <td className="px-5 py-3" style={{ color: 'rgb(var(--n-400))' }}>{tName}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-[6px]" style={{ color: 'rgb(var(--n-400))' }}>
                            <MapPin size={13} style={{ color: '#38bdf8' }} />
                            {p.location}
                          </div>
                        </td>
                        <td className="px-5 py-3" style={{ color: 'rgb(var(--n-400))' }}>{p.manager}</td>
                        <td className="px-5 py-3">
                          <div className="font-mono font-semibold" style={{ color: '#FF9900' }}>
                            {p.capacity}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openPlantEdit(p)}
                              className="h-[28px] w-[28px] rounded-md flex items-center justify-center transition-colors"
                              style={{ border: '1px solid rgb(var(--s-600))', color: 'rgb(var(--n-400))' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-600))')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => { if (confirm('Delete plant?')) deletePlant(p.id); }}
                              className="h-[28px] w-[28px] rounded-md flex items-center justify-center transition-colors"
                              style={{ border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredTenants.map(t => (
                    <tr
                      key={t.id}
                      className="group transition-colors"
                      style={{ borderTop: '1px solid rgb(var(--s-700))' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-3 text-[13px] font-medium" style={{ color: 'rgb(var(--fg))' }}>{t.name}</td>
                      <td className="px-5 py-3">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={
                            t.subscription === 'Enterprise'
                              ? { background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }
                              : t.subscription === 'Professional'
                              ? { background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }
                              : { background: 'rgb(var(--s-700))', color: 'rgb(var(--n-400))' }
                          }
                        >
                          {t.subscription}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: t.status === 'active' ? '#34d399' : '#f87171' }}
                          />
                          <span style={{ color: t.status === 'active' ? '#34d399' : '#f87171', fontWeight: 500 }}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs" style={{ color: 'rgb(var(--n-500))' }}>
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: 'rgb(var(--n-400))' }}>128</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openTenantEdit(t)}
                            className="h-[28px] w-[28px] rounded-md flex items-center justify-center transition-colors"
                            style={{ border: '1px solid rgb(var(--s-600))', color: 'rgb(var(--n-400))' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-600))')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => { if (confirm('Delete tenant?')) deleteTenant(t.id); }}
                            className="h-[28px] w-[28px] rounded-md flex items-center justify-center transition-colors"
                            style={{ border: '1px solid rgba(248,113,113,0.4)', color: '#f87171' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Empty State */}
            {((activeTab === 'plants' && filteredPlants.length === 0) || (activeTab === 'tenants' && filteredTenants.length === 0)) && (
              <div className="py-20 text-center" style={{ background: 'rgb(var(--s-800))' }}>
                <Search size={32} className="mx-auto mb-4" style={{ color: 'rgb(var(--n-500))' }} />
                <p className="text-sm" style={{ color: 'rgb(var(--n-500))' }}>No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────── */}
      {(showTenantModal || showPlantModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
          <div
            className="w-full max-w-md rounded-xl p-8 shadow-2xl"
            style={{
              border: '1px solid rgb(var(--s-600))',
              background: 'rgb(var(--s-800))',
              color: 'rgb(var(--fg))',
              boxShadow: 'var(--shadow-card-hover)',
            }}
          >
            <h3 className="text-lg font-bold mb-6">
              {showPlantModal ? (editingPlant ? 'Update Plant' : 'Register Plant') : (editingTenant ? 'Edit Tenant' : 'Register Tenant')}
            </h3>
            
            <form onSubmit={showPlantModal ? handlePlantSubmit : handleTenantSubmit} className="space-y-4">
              {showPlantModal ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Plant Name</label>
                      <input required type="text" value={plantName} onChange={(e) => setPlantName(e.target.value)}
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Plant Type</label>
                      <input required type="text" value={plantType} onChange={(e) => setPlantType(e.target.value)} placeholder="e.g. Manufacturing"
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Tenant Owner</label>
                    <select value={plantTenantId} onChange={(e) => setPlantTenantId(e.target.value)}
                      className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                    >
                      {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Location</label>
                      <input type="text" value={plantLocation} onChange={(e) => setPlantLocation(e.target.value)}
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Manager</label>
                      <input type="text" value={plantManager} onChange={(e) => setPlantManager(e.target.value)}
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Output Capacity</label>
                    <input type="text" value={plantCapacity} onChange={(e) => setPlantCapacity(e.target.value)} placeholder="e.g. 1.2M units/yr"
                      className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Company Name</label>
                    <input required type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)}
                      className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                      style={inputStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Subscription</label>
                      <select value={tenantSub} onChange={(e) => setTenantSub(e.target.value as any)}
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      >
                        <option value="Starter">Starter</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Status</label>
                      <select value={tenantStatus} onChange={(e) => setTenantStatus(e.target.value as any)}
                        className="w-full rounded-lg px-4 py-2 text-sm outline-none"
                        style={inputStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = '#FF9900')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div
                className="flex justify-end gap-3 pt-6 mt-4"
                style={{ borderTop: '1px solid rgb(var(--s-600))' }}
              >
                <button
                  type="button"
                  onClick={() => { setShowPlantModal(false); setShowTenantModal(false); }}
                  className="px-4 py-2 text-sm font-semibold transition-colors"
                  style={{ color: 'rgb(var(--n-500))' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgb(var(--fg))')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgb(var(--n-500))')}
                >Cancel</button>
                <button
                  type="submit"
                  className="rounded-md px-6 py-2 text-sm font-bold shadow-sm hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
                    color: '#0D0F15',
                    boxShadow: '0 4px 14px rgba(255,153,0,0.3)',
                  }}
                >Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
