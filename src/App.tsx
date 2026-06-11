import { useMemo, useState } from 'react'
import AIPipeline from './components/AIPipeline'
import Assets from './components/Assets'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import MediaGallery from './components/MediaGallery'
import Reports from './components/Reports'
import TenantsPlants from './components/TenantsPlants'
import Users from './components/Users'
import { useApp } from './context/AppContext'

// Import original components
import AlertsFeed from './components/AlertsFeed'
import DeviceDrawer from './components/DeviceDrawer'
import DeviceList, { type FleetView } from './components/DeviceList'
import FilterSidebar from './components/FilterSidebar'
import { DEFAULT_FILTERS, applyFilters, type Filters } from './lib/filters'

type Theme = 'dark' | 'light'
type SidebarItem = 'dashboard' | 'plants' | 'assets' | 'fleet' | 'ai-pipeline' | 'media' | 'users' | 'alerts' | 'reports'

export default function App() {
  const { 
    currentUser, 
    logout, 
    devices, 
    updateDevice, 
    deleteImage, 
    notifications,
    isSupabaseConnected
  } = useApp();

  // Tab & UI View States
  const [activeMenu, setActiveMenu] = useState<SidebarItem>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fleet View specific states
  const [fleetViewMode, setFleetViewMode] = useState<FleetView>('grid');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');

  // Change theme side-effect
  useMemo(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Devices calculations for original fleet view
  const filteredDevices = useMemo(() => applyFilters(devices, filters), [devices, filters]);
  const selectedDevice = useMemo(() => devices.find((d) => d.id === selectedDeviceId) ?? null, [devices, selectedDeviceId]);

  // Handle navigation requests from cards/dashboard
  const handleNavigate = (menu: string, param?: any) => {
    setActiveMenu(menu as SidebarItem);
    if (menu === 'assets' && typeof param === 'string') {
      setSelectedAssetId(param);
    }
  };

  const renameDevice = (id: number, name: string) => {
    updateDevice(id, { name });
  };

  const deleteCapture = (_deviceId: number, mediaId: string) => {
    deleteImage(mediaId);
  };

  // Auth Guard
  if (!currentUser) return <Login />;

  const isAdmin = currentUser.role === 'admin';
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  return (
    <div className="flex h-screen flex-col bg-[#F1F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-200 overflow-hidden font-sans">
      
      {/* ── Top Header ────────────────────────────────────────── */}
      <header className="z-30 flex items-center justify-between border-b border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800 px-6 py-2 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#185FA5] text-white text-base font-black">
            A
          </div>
          <div>
            <h1 className="text-xs font-black tracking-tight text-[#0F172A] dark:text-fg leading-none">
              ARGO <span className="text-slate-400 font-bold">GLASSES</span>
            </h1>
            <div className="mt-1">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#185FA5] bg-sky-50 dark:bg-sky-500/10 px-1 py-0.5 rounded border border-sky-100 dark:border-sky-500/20">
                Enterprise Console
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar Center */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-slate-50 dark:bg-ink-900/50 border border-slate-200 dark:border-ink-600 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-[#185FA5] transition-colors"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">⌘K</span>
        </div>

        {/* Right Header Panel */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-black text-[#0F172A] dark:text-fg block leading-none">Kaynes Tech Admin</span>
            <div className="flex items-center gap-1.5 mt-1 justify-end">
               <span className={`h-1 w-1 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
               <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">{isSupabaseConnected ? 'AWS Connected' : 'Local Mode'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 border-l border-slate-100 dark:border-ink-600 pl-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-100 dark:border-ink-600 bg-white dark:bg-ink-800 text-slate-400 hover:text-[#185FA5] transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            
            <button className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-ink-700 relative">
              🔔
              <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full border border-white" />
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3 py-1.5 text-[10px] font-black text-[#0F172A] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-ink-700 uppercase tracking-widest shadow-sm transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Workspace Body ───────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        
        {/* ── Left Sidebar Navigation ──────── */}
        <aside className={`z-20 bg-white dark:bg-ink-800 border-r border-[#E2E8F0] dark:border-ink-600 flex flex-col justify-between py-6 shadow-xl transition-all duration-300 ${isSidebarOpen ? 'w-60' : 'w-20'} shrink-0 hidden sm:flex`}>
          <div className="space-y-1.5 px-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
              { id: 'plants', label: 'Plants & Tenants', icon: '🏭', adminOnly: true },
              { id: 'assets', label: 'Industrial Assets', icon: '📦' },
              { id: 'fleet', label: 'Argo Glasses Fleet', icon: '🛰' },
              { id: 'ai-pipeline', label: 'AI Inference Lab', icon: '🧠' },
              { id: 'media', label: 'Media Repository', icon: '🎬' },
              { id: 'users', label: 'Staff Identity', icon: '👥', adminOnly: true },
              { id: 'alerts', label: 'Alarms Feed', icon: '🔔', badge: unacknowledgedCount },
              { id: 'reports', label: 'Audit & Reports', icon: '📊' },
            ].map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = activeMenu === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id as SidebarItem);
                    if (item.id === 'assets') setSelectedAssetId(null);
                  }}
                  className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} gap-3 py-2.5 rounded-lg text-[11px] font-black transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-[#185FA5] text-white shadow-lg shadow-sky-900/10' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-ink-700/50 hover:text-[#0F172A] dark:hover:text-fg'
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <span className={`text-base leading-none transition-transform duration-200 ${isActive ? 'scale-100' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>{item.icon}</span>
                  
                  {isSidebarOpen && (
                    <span className="flex-1 text-left truncate tracking-wide uppercase">{item.label}</span>
                  )}
                  
                  {item.badge != null && item.badge > 0 && (
                    <span className={`flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                      isSidebarOpen ? 'px-2 py-0.5 ml-auto' : 'absolute top-1.5 right-1.5 h-4 w-4'
                    } ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-argo-red text-white shadow-argo-red/30'
                    }`}>
                      {isSidebarOpen ? item.badge : (item.badge > 9 ? '9+' : item.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 flex flex-col gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex w-full items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'} gap-3 py-3 rounded-xl text-xs font-bold transition-all duration-200 text-slate-400 hover:bg-slate-100 dark:hover:bg-ink-700/50 hover:text-fg`}
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <span className="text-sm leading-none">{isSidebarOpen ? '◀' : '▶'}</span>
              {isSidebarOpen && <span className="flex-1 text-left tracking-wide font-bold">Collapse Menu</span>}
            </button>
            <div className={`rounded-lg bg-slate-50 dark:bg-ink-900/50 border border-[#E2E8F0] dark:border-ink-600 transition-all text-center ${isSidebarOpen ? 'p-3 mx-1' : 'p-2'}`}>
               <span className={`font-black uppercase tracking-widest text-slate-500 block ${isSidebarOpen ? 'text-[9px] mb-1' : 'text-[7px]'}`}>Build</span>
               <span className={`text-slate-400 font-mono ${isSidebarOpen ? 'text-xs' : 'text-[9px]'}`}>{isSidebarOpen ? 'Kaynes v2.1' : 'v2.1'}</span>
            </div>
          </div>
        </aside>

        {/* ── Main Panel Viewer ───────────────────────────────── */}
        <main className="relative flex-1 flex flex-col min-h-0 bg-[#F1F5F9] dark:bg-slate-950">
          
          {/* SECTION: DASHBOARD */}
          {activeMenu === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}

          {/* SECTION: PLANTS & TENANTS */}
          {activeMenu === 'plants' && <TenantsPlants />}

          {/* SECTION: ASSETS */}
          {activeMenu === 'assets' && (
            <Assets 
              selectedAssetId={selectedAssetId} 
              onClearSelect={() => setSelectedAssetId(null)} 
            />
          )}

          {/* SECTION: ORIGINAL ARGO GLASSES FLEET VIEW */}
          {activeMenu === 'fleet' && (
            <div className="flex h-full min-h-0">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                resultCount={filteredDevices.length} 
              />
              <div className="flex-grow relative flex flex-col min-h-0 bg-[#F1F5F9] dark:bg-slate-950 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fleet Monitoring View</h2>
                  <div className="flex rounded-lg border border-[#E2E8F0] dark:border-ink-500 bg-white dark:bg-ink-700 p-0.5">
                    {(['grid', 'table'] as FleetView[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setFleetViewMode(m)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                          fleetViewMode === m ? 'bg-sky-600 text-white dark:bg-argo-cyan dark:text-ink-900' : 'text-slate-500 dark:text-slate-400 hover:text-fg'
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
          )}

          {/* SECTION: AI PIPELINE PLAYGROUND */}
          {activeMenu === 'ai-pipeline' && <AIPipeline />}

          {/* SECTION: MEDIA REPOSITORY */}
          {activeMenu === 'media' && (
            <MediaGallery 
              devices={devices}
              role={currentUser.role}
              onDeleteCapture={deleteCapture}
            />
          )}

          {/* SECTION: STAFF IDENTITY CRUD */}
          {activeMenu === 'users' && <Users />}

          {/* SECTION: NOTIFICATIONS/ALARMS FEED */}
          {activeMenu === 'alerts' && (
            <div className="h-full overflow-y-auto p-4">
              <AlertsFeed 
                devices={devices} 
                onOpenDevice={(id) => {
                  setSelectedDeviceId(id);
                  setActiveMenu('fleet');
                }} 
              />
            </div>
          )}

          {/* SECTION: REPORTS EXPORT */}
          {activeMenu === 'reports' && <Reports />}

        </main>
      </div>

      {/* ── Original Slide Drawer overlay for Fleet Glasses Details ── */}
      <DeviceDrawer
        device={selectedDevice}
        role={currentUser.role as any}
        onClose={() => setSelectedDeviceId(null)}
        onRename={renameDevice}
        onDeleteCapture={deleteCapture}
      />
    </div>
  )
}
