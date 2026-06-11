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

  return (
    <div className="light" style={{ colorScheme: 'light' }}>
      <div className="h-screen flex flex-col bg-[#F1F5F9] dark:bg-slate-950 text-[#0F172A] dark:text-slate-200 overflow-hidden">
        
        {/* 1. PAGE HEADER: Light/Dark Topbar */}
        <div className="w-full bg-[#F8FAFC] dark:bg-[#0C1B2E] px-8 py-5 border-b border-[#E2E8F0] dark:border-slate-700">
          <h1 className="text-[15px] font-medium text-[#0F172A] dark:text-[#B5D4F4]">Facilities & organizations</h1>
          <p className="text-[12px] text-[#64748B] dark:text-[#378ADD]/70">Manage plants, geo-locations, and corporate subscriptions</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* 2. TABS: Underline style sitting below topbar */}
          <div className="px-8 border-b border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0D1B2A]">
            <div className="flex gap-8">
              <button
                onClick={() => { setActiveTab('plants'); setSearchQuery(''); }}
                className={`flex items-center gap-2 pb-3 pt-4 text-sm font-medium transition-all relative ${
                  activeTab === 'plants' ? 'text-[#185FA5]' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
                }`}
              >
                <Building2 size={15} />
                Plants / facilities
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === 'plants' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#F1F5F9] dark:bg-slate-800 text-[#94A3B8] dark:text-slate-500'
                }`}>
                  {plants.length}
                </span>
                {activeTab === 'plants' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#185FA5]" />
                )}
              </button>
              <button
                onClick={() => { setActiveTab('tenants'); setSearchQuery(''); }}
                className={`flex items-center gap-2 pb-3 pt-4 text-sm font-medium transition-all relative ${
                  activeTab === 'tenants' ? 'text-[#185FA5]' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200'
                }`}
              >
                <Building size={15} />
                Tenant accounts
                <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  activeTab === 'tenants' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#F1F5F9] dark:bg-slate-800 text-[#94A3B8] dark:text-slate-500'
                }`}>
                  {tenants.length}
                </span>
                {activeTab === 'tenants' && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#185FA5]" />
                )}
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* 3. SEARCH BAR & CTA Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-slate-500" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'plants' ? "Search plants..." : "Search tenants..."}
                  className="h-[34px] w-full rounded-md border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-4 text-sm text-[#0F172A] dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#185FA5]"
                />
              </div>

              <button 
                onClick={activeTab === 'plants' ? openPlantCreate : openTenantCreate}
                className="h-[34px] flex items-center justify-center gap-2 rounded-md bg-[#185FA5] px-4 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              >
                <Plus size={15} />
                {activeTab === 'plants' ? "Register Plant" : "Create Tenant"}
              </button>
            </div>

            {/* 4. TABLE */}
            <div className="overflow-hidden rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0D1B2A] shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] dark:bg-slate-800/50 border-b border-[#E2E8F0] dark:border-slate-700">
                  <tr className="text-[10px] font-medium uppercase tracking-[0.07em] text-[#64748B] dark:text-slate-400">
                    <th className="px-5 py-3">{activeTab === 'plants' ? "PLANT NAME" : "TENANT NAME"}</th>
                    <th className="px-5 py-3">{activeTab === 'plants' ? "ASSOCIATED TENANT" : "SUBSCRIPTION"}</th>
                    <th className="px-5 py-3">{activeTab === 'plants' ? "LOCATION" : "STATUS"}</th>
                    <th className="px-5 py-3">{activeTab === 'plants' ? "MANAGER" : "CREATED"}</th>
                    <th className="px-5 py-3">{activeTab === 'plants' ? "OUTPUT CAPACITY" : "USERS"}</th>
                    <th className="px-5 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-slate-700 bg-white dark:bg-[#0D1B2A]">
                  {activeTab === 'plants' ? (
                    filteredPlants.map(p => {
                      const tName = tenants.find(t => t.id === p.tenantId)?.name || 'Unknown';
                      return (
                        <tr key={p.id} className="group hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors">
                          <td className="px-5 py-3">
                            <div className="text-[13px] font-medium text-[#0F172A] dark:text-white">{p.name}</div>
                            <div className="text-[11px] text-[#94A3B8] dark:text-slate-400">{p.type}</div>
                          </td>
                          <td className="px-5 py-3 text-[#475569] dark:text-slate-400">{tName}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-[6px] text-[#475569] dark:text-slate-400">
                              <MapPin size={13} className="text-[#378ADD]" />
                              {p.location}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[#475569] dark:text-slate-400">{p.manager}</td>
                          <td className="px-5 py-3">
                            <div className="font-mono text-[#185FA5] font-semibold">
                              {p.capacity}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => openPlantEdit(p)}
                                className="h-[28px] w-[28px] rounded-md border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#475569] dark:text-slate-400"
                              >
                                <Pencil size={14} />
                              </button>
                              <button 
                                onClick={() => { if (confirm('Delete plant?')) deletePlant(p.id); }}
                                className="h-[28px] w-[28px] rounded-md border border-[#FECACA] dark:border-red-900 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 text-[#DC2626] dark:text-red-500"
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
                      <tr key={t.id} className="group hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors">
                        <td className="px-5 py-3 text-[13px] font-medium text-[#0F172A] dark:text-white">{t.name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.subscription === 'Enterprise' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30' : 
                            t.subscription === 'Professional' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {t.subscription}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <span className={t.status === 'active' ? 'text-emerald-600 font-medium' : 'text-red-600'}>
                              {t.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-[#64748B] dark:text-slate-500 font-mono text-xs">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-[#475569] dark:text-slate-400 font-bold">128</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openTenantEdit(t)}
                              className="h-[28px] w-[28px] rounded-md border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#475569] dark:text-slate-400"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => { if (confirm('Delete tenant?')) deleteTenant(t.id); }}
                              className="h-[28px] w-[28px] rounded-md border border-[#FECACA] dark:border-red-900 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 text-[#DC2626] dark:text-red-500"
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
                <div className="py-20 text-center bg-white dark:bg-[#0D1B2A]">
                  <Search size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-slate-500 dark:text-slate-600 text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── MODALS ──────────────── */}
        {(showTenantModal || showPlantModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4">
            <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0D1B2A] p-8 shadow-2xl text-[#0F172A] dark:text-white">
              <h3 className="text-lg font-bold mb-6">
                {showPlantModal ? (editingPlant ? 'Update Plant' : 'Register Plant') : (editingTenant ? 'Edit Tenant' : 'Register Tenant')}
              </h3>
              
              <form onSubmit={showPlantModal ? handlePlantSubmit : handleTenantSubmit} className="space-y-4">
                {showPlantModal ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Plant Name</label>
                        <input required type="text" value={plantName} onChange={(e) => setPlantName(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Plant Type</label>
                        <input required type="text" value={plantType} onChange={(e) => setPlantType(e.target.value)} placeholder="e.g. Manufacturing" className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Tenant Owner</label>
                      <select value={plantTenantId} onChange={(e) => setPlantTenantId(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]">
                        {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                        <input type="text" value={plantLocation} onChange={(e) => setPlantLocation(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Manager</label>
                        <input type="text" value={plantManager} onChange={(e) => setPlantManager(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Output Capacity</label>
                      <input type="text" value={plantCapacity} onChange={(e) => setPlantCapacity(e.target.value)} placeholder="e.g. 1.2M units/yr" className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                      <input required type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Subscription</label>
                        <select value={tenantSub} onChange={(e) => setTenantSub(e.target.value as any)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]">
                          <option value="Starter">Starter</option>
                          <option value="Professional">Professional</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest mb-1.5">Status</label>
                        <select value={tenantStatus} onChange={(e) => setTenantStatus(e.target.value as any)} className="w-full rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm outline-none focus:border-[#185FA5]">
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 mt-4">
                  <button type="button" onClick={() => { setShowPlantModal(false); setShowTenantModal(false); }} className="px-4 py-2 text-sm font-semibold text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white">Cancel</button>
                  <button type="submit" className="rounded-md bg-[#185FA5] px-6 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
