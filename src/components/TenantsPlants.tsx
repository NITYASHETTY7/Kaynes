import React, { useState } from 'react';
import { useApp, type Tenant, type Plant } from '../context/AppContext';

export default function TenantsPlants() {
  const { tenants, plants, addTenant, updateTenant, deleteTenant, addPlant, updatePlant, deletePlant, currentUser } = useApp();
  
  // States
  const [activeTab, setActiveTab] = useState<'tenants' | 'plants'>('plants');
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
  const [plantTenantId, setPlantTenantId] = useState('');
  const [plantLocation, setPlantLocation] = useState('');
  const [plantCapacity, setPlantCapacity] = useState('');
  const [plantManager, setPlantManager] = useState('');

  const isAdmin = currentUser?.role === 'admin';

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
    setPlantTenantId(tenants[0]?.id || '');
    setPlantLocation('');
    setPlantCapacity('');
    setPlantManager('');
    setShowPlantModal(true);
  };

  const openPlantEdit = (p: Plant) => {
    setEditingPlant(p);
    setPlantName(p.name);
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
      updatePlant(editingPlant.id, { name: plantName, tenantId: plantTenantId, location: plantLocation, capacity: plantCapacity, manager: plantManager });
    } else {
      addPlant({ name: plantName, tenantId: plantTenantId, location: plantLocation, capacity: plantCapacity, manager: plantManager });
    }
    setShowPlantModal(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-ink-900 p-6 text-slate-200">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-fg">Facilities & Organizations</h1>
          <p className="text-xs text-slate-400">Manage business units, plants, geo-locations, and corporate subscriptions.</p>
        </div>
        
        {/* Toggle between Tenant and Plant */}
        <div className="flex rounded-lg border border-ink-600 bg-ink-800 p-0.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('plants')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'plants' ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
            }`}
          >
            🏭 Plants / Facilities
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'tenants' ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
            }`}
          >
            🏢 Tenant Accounts
          </button>
        </div>
      </div>

      {/* ── TENANTS SECTION ──────────────────────────────── */}
      {activeTab === 'tenants' && (
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">Registered Tenant Accounts</h2>
            {isAdmin && (
              <button 
                onClick={openTenantCreate}
                className="rounded-lg bg-argo-cyan px-3 py-1.5 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                + Create Tenant
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-ink-600 text-slate-500">
                  <th className="py-2">Client ID</th>
                  <th className="py-2">Company / Tenant Name</th>
                  <th className="py-2">Subscription Tier</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Registered On</th>
                  {isAdmin && <th className="py-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-600/50">
                {tenants.map(t => (
                  <tr key={t.id} className="hover:bg-ink-700/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500">{t.id}</td>
                    <td className="py-3 font-semibold text-fg">{t.name}</td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.subscription === 'Enterprise' ? 'bg-argo-violet/10 text-argo-violet border border-argo-violet/30' : 
                        t.subscription === 'Professional' ? 'bg-argo-cyan/10 text-argo-cyan' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.subscription}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5`}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.status === 'active' ? '#10b981' : '#ef4444' }} />
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => openTenantEdit(t)}
                          className="mr-3 text-argo-cyan hover:underline"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => { if (confirm('Are you sure you want to delete this tenant and all associated data?')) deleteTenant(t.id); }}
                          className="text-argo-red hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PLANTS SECTION ───────────────────────────────── */}
      {activeTab === 'plants' && (
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">Active Plant Facilities</h2>
            {isAdmin && (
              <button 
                onClick={openPlantCreate}
                className="rounded-lg bg-argo-cyan px-3 py-1.5 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                + Register Plant
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-ink-600 text-slate-500">
                  <th className="py-2">Plant Name</th>
                  <th className="py-2">Associated Tenant</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Manager</th>
                  <th className="py-2">Output Capacity</th>
                  {isAdmin && <th className="py-2 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-600/50">
                {plants.map(p => {
                  const tenantName = tenants.find(t => t.id === p.tenantId)?.name || 'Unknown Tenant';
                  return (
                    <tr key={p.id} className="hover:bg-ink-700/30">
                      <td className="py-3 font-semibold text-fg">{p.name}</td>
                      <td className="py-3 text-slate-400">{tenantName}</td>
                      <td className="py-3">{p.location}</td>
                      <td className="py-3 font-medium text-slate-300">{p.manager}</td>
                      <td className="py-3 font-mono text-[11px] text-argo-cyan">{p.capacity}</td>
                      {isAdmin && (
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => openPlantEdit(p)}
                            className="mr-3 text-argo-cyan hover:underline"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => { if (confirm('Are you sure you want to delete this plant facility?')) deletePlant(p.id); }}
                            className="text-argo-red hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TENANT MODAL ─────────────────────────────────── */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleTenantSubmit} className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-fg mb-4">{editingTenant ? 'Edit Tenant Profile' : 'Create New Tenant'}</h3>
            
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Company Name</label>
            <input 
              required
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="e.g. Kaynes Aero Division"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Subscription Tier</label>
                <select 
                  value={tenantSub}
                  onChange={(e) => setTenantSub(e.target.value as any)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Account Status</label>
                <select 
                  value={tenantStatus}
                  onChange={(e) => setTenantStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink-600 pt-4">
              <button 
                type="button" 
                onClick={() => setShowTenantModal(false)}
                className="rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                {editingTenant ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── PLANT MODAL ──────────────────────────────────── */}
      {showPlantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handlePlantSubmit} className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-fg mb-4">{editingPlant ? 'Edit Plant Details' : 'Register New Plant Facility'}</h3>
            
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Plant Name</label>
            <input 
              required
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="e.g. Mysuru Plant 2"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Assign to Tenant Account</label>
            <select 
              value={plantTenantId}
              onChange={(e) => setPlantTenantId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Geo Location</label>
            <input 
              type="text"
              value={plantLocation}
              onChange={(e) => setPlantLocation(e.target.value)}
              placeholder="e.g. Karnataka, India"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Facility Manager</label>
                <input 
                  type="text"
                  value={plantManager}
                  onChange={(e) => setPlantManager(e.target.value)}
                  placeholder="e.g. S. Ranganath"
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Annual Output Capacity</label>
                <input 
                  type="text"
                  value={plantCapacity}
                  onChange={(e) => setPlantCapacity(e.target.value)}
                  placeholder="e.g. 1.2M units/yr"
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink-600 pt-4">
              <button 
                type="button" 
                onClick={() => setShowPlantModal(false)}
                className="rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                {editingPlant ? 'Save Changes' : 'Register Facility'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
