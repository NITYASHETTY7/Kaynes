import { useState, useMemo } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate, useParams, Outlet, useOutletContext } from 'react-router-dom'
import { useApp } from './context/AppContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import TenantsPlants from './components/TenantsPlants'
import Assets from './components/Assets'
import AIPipeline from './components/AIPipeline'
import Users from './components/Users'
import Reports from './components/Reports'

// Import original components
import { type FleetView } from './components/DeviceList'
import DeviceList from './components/DeviceList'
import DeviceDrawer from './components/DeviceDrawer'
import FilterSidebar from './components/FilterSidebar'
import AlertsFeed from './components/AlertsFeed'
import { DEFAULT_FILTERS, applyFilters, type Filters } from './lib/filters'

export default function App() {
  const { currentUser } = useApp();

  // Auth Guard
  if (!currentUser) return <Login />;

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardWrapper />} />
        <Route path="plants" element={<TenantsPlants />} />
        <Route path="assets" element={<AssetsWrapper />} />
        <Route path="assets/:id" element={<AssetsWrapper />} />
        <Route path="fleet" element={<FleetWrapper />} />
        <Route path="ai-pipeline" element={<AIPipeline />} />
        <Route path="users" element={<Users />} />
        <Route path="alerts" element={<AlertsWrapper />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  )
}

function AppLayout() {
  const { 
    currentUser, 
    logout, 
    devices, 
    updateDevice, 
    deleteImage, 
    notifications, 
    isSupabaseConnected, 
    isSyncing,
    theme,
    toggleTheme
  } = useApp();

  const location = useLocation();
  const isAdmin = currentUser?.role === 'admin';
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const renameDevice = (id: number, name: string) => {
    updateDevice(id, { name });
  };

  const deleteCapture = (_deviceId: number, mediaId: string) => {
    deleteImage(mediaId);
  };

  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedDeviceId) ?? null, [devices, selectedDeviceId]);

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-slate-200 overflow-hidden font-sans">
      <header className="z-30 flex flex-wrap items-center gap-4 border-b border-ink-600 bg-ink-800 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-argo-cyan/15 text-argo-cyan text-lg font-bold">
            ◉
          </span>
          <div>
            <h1 className="text-sm font-bold leading-tight text-fg sm:text-base">
              Argo Glasses · Enterprise Console
            </h1>
            <p className="text-[10px] leading-tight text-argo-cyan font-mono font-bold flex items-center gap-1.5">
              <span>Kaynes Technology</span>
              <span className="h-1 w-1 bg-ink-500 rounded-full" />
              <span className={isSupabaseConnected ? 'text-argo-green' : 'text-argo-amber'}>
                {isSupabaseConnected ? '● Cloud Connected' : '⊚ Disconnected'}
              </span>
              {isSyncing && <span className="animate-spin text-argo-cyan">↻</span>}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right xl:block">
            <span className="text-xs font-semibold text-fg block">{currentUser?.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">{currentUser?.role} Account</span>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-500 bg-ink-700 text-slate-300 transition-colors hover:text-fg"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-ink-500 bg-ink-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-fg"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="z-20 w-16 sm:w-60 border-r border-ink-600 bg-ink-800 flex flex-col justify-between py-4">
          <div className="space-y-1 px-2.5">
            {[
              { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'plants', path: '/plants', label: 'Plants & Tenants', icon: '🏭', adminOnly: true },
              { id: 'assets', path: '/assets', label: 'Industrial Assets', icon: '📦' },
              { id: 'fleet', path: '/fleet', label: 'Argo Glasses Fleet', icon: '🛰' },
              { id: 'ai-pipeline', path: '/ai-pipeline', label: 'AI Inference Lab', icon: '🧠' },
              { id: 'users', path: '/users', label: 'Staff Identity', icon: '👥', adminOnly: true },
              { id: 'alerts', path: '/alerts', label: 'Alarms Feed', icon: '🔔', badge: unacknowledgedCount },
              { id: 'reports', path: '/reports', label: 'Audit & Reports', icon: '📊' },
            ].map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center justify-center sm:justify-start gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-argo-cyan text-ink-900 shadow-md' 
                      : 'text-slate-400 hover:bg-ink-700/50 hover:text-fg'
                  }`}
                  title={item.label}
                >
                  <span className="text-sm leading-none">{item.icon}</span>
                  <span className="hidden sm:inline-block flex-1 text-left truncate">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`hidden sm:inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      isActive ? 'bg-ink-900 text-argo-cyan' : 'bg-argo-red/20 text-argo-red'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="px-4 text-center hidden sm:block">
            <span className="text-[10px] text-slate-600 font-mono">Kaynes Fleet v2.0</span>
          </div>
        </aside>

        <main className="relative flex-1 flex flex-col min-h-0 bg-ink-900">
          <Outlet context={{ setSelectedDeviceId }} />
        </main>
      </div>

      <DeviceDrawer
        device={selectedDevice}
        role={currentUser?.role as any}
        onClose={() => setSelectedDeviceId(null)}
        onRename={renameDevice}
        onDeleteCapture={deleteCapture}
      />
    </div>
  )
}

function DashboardWrapper() {
  const navigate = useNavigate();
  return <Dashboard onNavigate={(tab, param) => {
    if (tab === 'assets' && param) {
      navigate(`/assets/${param}`);
    } else {
      navigate(`/${tab}`);
    }
  }} />;
}

function AssetsWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <Assets selectedAssetId={id || null} onClearSelect={() => navigate('/assets')} />;
}

function FleetWrapper() {
  const { devices } = useApp();
  const [fleetViewMode, setFleetViewMode] = useState<FleetView>('grid');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const { setSelectedDeviceId } = useOutletContext<{ setSelectedDeviceId: (id: number | null) => void }>();

  const filteredDevices = useMemo(() => applyFilters(devices, filters), [devices, filters]);

  return (
    <div className="flex h-full min-h-0">
      <FilterSidebar 
        filters={filters} 
        setFilters={setFilters} 
        resultCount={filteredDevices.length} 
      />
      <div className="flex-grow relative flex flex-col min-h-0 bg-ink-900 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fleet Monitoring View</h2>
          <div className="flex rounded-lg border border-ink-500 bg-ink-700 p-0.5">
            {(['grid', 'table'] as FleetView[]).map((m) => (
              <button
                key={m}
                onClick={() => setFleetViewMode(m)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                  fleetViewMode === m ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <DeviceList 
            devices={filteredDevices} 
            view={fleetViewMode} 
            onSelect={(d) => setSelectedDeviceId(d.id)} 
          />
        </div>
      </div>
    </div>
  );
}

function AlertsWrapper() {
  const { devices } = useApp();
  const { setSelectedDeviceId } = useOutletContext<{ setSelectedDeviceId: (id: number | null) => void }>();
  const navigate = useNavigate();
  return (
    <div className="h-full overflow-y-auto p-4">
      <AlertsFeed 
        devices={devices} 
        onOpenDevice={(id) => {
          setSelectedDeviceId(id);
          navigate('/fleet');
        }} 
      />
    </div>
  );
}
