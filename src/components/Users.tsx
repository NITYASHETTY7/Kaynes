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
    <div
      className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
      style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--fg))' }}
    >
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold font-display" style={{ color: 'rgb(var(--fg))' }}>Identity &amp; Access Control</h1>
          <p className="text-xs" style={{ color: 'rgb(var(--n-400))' }}>Add inspectors/operators, assign secure roles, and toggle platform access permissions.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openCreate}
            className="rounded-lg px-4 py-2 text-xs font-semibold shadow-md hover:brightness-110 self-start sm:self-auto transition-all"
            style={{
              background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
              color: '#0D0F15',
            }}
          >
            + Register Staff Account
          </button>
        )}
      </div>

      {/* Grid List of Staff Profiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'rgb(var(--s-800))',
            borderColor: 'rgb(var(--s-600))',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgb(var(--n-500))' }}
          >
            Admins
          </span>
          <span className="block text-2xl font-bold mt-1" style={{ color: 'rgb(var(--fg))' }}>
            {activeUsers.filter(u=>u.role==='admin').length}
          </span>
        </div>
        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'rgb(var(--s-800))',
            borderColor: 'rgb(var(--s-600))',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgb(var(--n-500))' }}
          >
            QA Inspectors
          </span>
          <span className="block text-2xl font-bold text-argo-violet mt-1">
            {activeUsers.filter(u=>u.role==='inspector').length}
          </span>
        </div>
        <div
          className="rounded-2xl border p-4"
          style={{
            background: 'rgb(var(--s-800))',
            borderColor: 'rgb(var(--s-600))',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'rgb(var(--n-500))' }}
          >
            Line Operators
          </span>
          <span className="block text-2xl font-bold mt-1" style={{ color: '#FF9900' }}>
            {activeUsers.filter(u=>u.role==='operator').length}
          </span>
        </div>
      </div>

      {/* Users table */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: 'rgb(var(--s-800))',
          borderColor: 'rgb(var(--s-600))',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <h2
          className="text-[10px] font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'rgb(var(--n-500))' }}
        >
          Authorized Operators Index
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                <th className="py-2 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Staff Member Name</th>
                <th className="py-2 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Corporate Email</th>
                <th className="py-2 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Role Assigned</th>
                <th className="py-2 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Assigned Plant</th>
                <th className="py-2 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Status</th>
                {isAdmin && <th className="py-2 text-right font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(u => {
                const isSelf = u.id === currentUser?.id;
                const assignedPlantName = u.plantId ? plants.find(p=>p.id===u.plantId)?.name || 'Central Site' : 'Unassigned (Global)';
                
                return (
                  <tr
                    key={u.id}
                    style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-3 font-semibold" style={{ color: 'rgb(var(--fg))' }}>
                      {u.name} {isSelf && <span className="text-[10px]" style={{ color: '#FF9900' }}>(You)</span>}
                    </td>
                    <td className="py-3 font-mono" style={{ color: 'rgb(var(--n-400))' }}>{u.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        u.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 
                        u.role === 'inspector' ? 'bg-argo-violet/10 text-argo-violet' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-medium" style={{ color: 'rgb(var(--n-400))' }}>{assignedPlantName}</td>
                    <td className="py-3">
                      <button 
                        disabled={!isAdmin || isSelf}
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 capitalize rounded px-1.5 py-0.5 transition-colors ${isAdmin && !isSelf ? 'hover:bg-[rgb(var(--s-600))]' : ''}`}
                        style={{ color: 'rgb(var(--n-300))' }}
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: u.status === 'active' ? '#10b981' : '#ef4444' }} />
                        {u.status}
                      </button>
                    </td>
                    {isAdmin && (
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => openEdit(u)}
                          className="mr-3 hover:underline transition-colors"
                          style={{ color: '#FF9900' }}
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
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
            style={{
              background: 'rgb(var(--s-800))',
              borderColor: 'rgb(var(--s-600))',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <h3 className="text-base font-bold font-display mb-4" style={{ color: 'rgb(var(--fg))' }}>
              {editingUser ? 'Edit Operator Profile' : 'Register New Staff Member'}
            </h3>
            
            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Full Name</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. S. Prakash"
              className="mb-4 w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                border: '1px solid rgb(var(--s-500))',
                background: 'rgb(var(--s-700))',
                color: 'rgb(var(--n-200))',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
            />

            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Corporate Email Address</label>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@kaynes.com"
              className="mb-4 w-full rounded-lg px-3 py-2 text-sm outline-none font-mono transition-colors"
              style={{
                border: '1px solid rgb(var(--s-500))',
                background: 'rgb(var(--s-700))',
                color: 'rgb(var(--n-200))',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
            />

            <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Login Password</label>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-4 w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
              style={{
                border: '1px solid rgb(var(--s-500))',
                background: 'rgb(var(--s-700))',
                color: 'rgb(var(--n-200))',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Platform Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    border: '1px solid rgb(var(--s-500))',
                    background: 'rgb(var(--s-700))',
                    color: 'rgb(var(--n-200))',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                >
                  <option value="admin">Admin</option>
                  <option value="inspector">QA Inspector</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Account Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    border: '1px solid rgb(var(--s-500))',
                    background: 'rgb(var(--s-700))',
                    color: 'rgb(var(--n-200))',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Tenant Account</label>
                <select 
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    border: '1px solid rgb(var(--s-500))',
                    background: 'rgb(var(--s-700))',
                    color: 'rgb(var(--n-200))',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'rgb(var(--n-500))' }}>Plant Site</label>
                <select 
                  value={plantId}
                  onChange={(e) => setPlantId(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    border: '1px solid rgb(var(--s-500))',
                    background: 'rgb(var(--s-700))',
                    color: 'rgb(var(--n-200))',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                >
                  <option value="none">Unassigned (Global)</option>
                  {plants.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="flex justify-end gap-3 pt-4"
              style={{ borderTop: '1px solid rgb(var(--s-600))' }}
            >
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
                style={{
                  border: '1px solid rgb(var(--s-500))',
                  color: 'rgb(var(--n-300))',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg px-4 py-2 text-xs font-semibold hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
                  color: '#0D0F15',
                }}
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
