import React, { useState } from 'react';
import { useApp, type User, type UserRole, type UserStatus } from '../context/AppContext';

export default function Users() {
  const { users, plants, tenants, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [status, setStatus] = useState<UserStatus>('active');
  const [tenantId, setTenantId] = useState('');
  const [plantId, setPlantId] = useState<string>('none');

  const isAdmin = currentUser?.role === 'admin';

  // Filter active (non soft-deleted) users
  const activeUsers = users.filter(u => !u.isDeleted);

  const openCreate = () => {
    setEditingUser(null);
    setEmail('');
    setName('');
    setPassword('');
    setRole('operator');
    setStatus('active');
    setTenantId(tenants[0]?.id || '');
    setPlantId('none');
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEmail(u.email);
    setName(u.name);
    setPassword(u.passwordHash);
    setRole(u.role);
    setStatus(u.status);
    setTenantId(u.tenantId);
    setPlantId(u.plantId || 'none');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim() || !password.trim()) return;

    const assignedPlant = plantId === 'none' ? null : plantId;

    if (editingUser) {
      updateUser(editingUser.id, {
        email,
        name,
        passwordHash: password,
        role,
        status,
        tenantId,
        plantId: assignedPlant
      });
    } else {
      addUser({
        email,
        name,
        passwordHash: password,
        role,
        status,
        tenantId,
        plantId: assignedPlant
      });
    }
    setShowModal(false);
  };

  const handleToggleStatus = (u: User) => {
    const nextStatus: UserStatus = u.status === 'active' ? 'inactive' : 'active';
    updateUser(u.id, { status: nextStatus });
  };

  return (
    <div className="h-full overflow-y-auto bg-ink-900 p-6 text-slate-200">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-fg">Identity & Access Control</h1>
          <p className="text-xs text-slate-400">Add inspectors/operators, assign secure roles, and toggle platform access permissions.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openCreate}
            className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-semibold text-ink-900 shadow-md hover:brightness-110 self-start sm:self-auto"
          >
            + Register Staff Account
          </button>
        )}
      </div>

      {/* Grid List of Staff Profiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Admins</span>
          <span className="block text-2xl font-bold text-fg mt-1">{activeUsers.filter(u=>u.role==='admin').length}</span>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">QA Inspectors</span>
          <span className="block text-2xl font-bold text-argo-violet mt-1">{activeUsers.filter(u=>u.role==='inspector').length}</span>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Line Operators</span>
          <span className="block text-2xl font-bold text-argo-cyan mt-1">{activeUsers.filter(u=>u.role==='operator').length}</span>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Authorized Operators Index</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-ink-600 text-slate-500">
                <th className="py-2">Staff Member Name</th>
                <th className="py-2">Corporate Email</th>
                <th className="py-2">Role Assigned</th>
                <th className="py-2">Assigned Plant</th>
                <th className="py-2">Status</th>
                {isAdmin && <th className="py-2 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-600/50">
              {activeUsers.map(u => {
                const isSelf = u.id === currentUser?.id;
                const assignedPlantName = u.plantId ? plants.find(p=>p.id===u.plantId)?.name || 'Central Site' : 'Unassigned (Global)';
                
                return (
                  <tr key={u.id} className="hover:bg-ink-700/30">
                    <td className="py-3 font-semibold text-fg">
                      {u.name} {isSelf && <span className="text-[10px] text-argo-cyan">(You)</span>}
                    </td>
                    <td className="py-3 text-slate-400 font-mono">{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        u.role === 'admin' ? 'bg-argo-cyan/10 text-argo-cyan' : 
                        u.role === 'inspector' ? 'bg-argo-violet/10 text-argo-violet' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 font-medium">{assignedPlantName}</td>
                    <td className="py-3">
                      <button 
                        disabled={!isAdmin || isSelf}
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 capitalize rounded px-1.5 py-0.5 ${isAdmin && !isSelf ? 'hover:bg-ink-600' : ''}`}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: u.status === 'active' ? '#10b981' : '#ef4444' }} />
                        {u.status}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => openEdit(u)}
                          className="mr-3 text-argo-cyan hover:underline"
                        >
                          Edit Profile
                        </button>
                        <button 
                          disabled={isSelf}
                          onClick={() => { if (confirm(`Soft-delete operator ${u.name}?`)) deleteUser(u.id); }}
                          className={`text-argo-red hover:underline ${isSelf ? 'opacity-25' : ''}`}
                        >
                          Revoke Access
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

      {/* ── USER MODAL ───────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-fg mb-4">{editingUser ? 'Edit Operator Profile' : 'Register New Staff Member'}</h3>
            
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Prakash"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Corporate Email Address</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@kaynes.com"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg font-mono focus:border-argo-cyan"
            />

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Login Password</label>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Platform Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="admin">Admin</option>
                  <option value="inspector">QA Inspector</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Account Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Tenant Account</label>
                <select 
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Plant Site</label>
                <select 
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="none">Unassigned (Global)</option>
                  {plants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-ink-600 pt-4">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                {editingUser ? 'Save Operator Changes' : 'Confirm Registration'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
