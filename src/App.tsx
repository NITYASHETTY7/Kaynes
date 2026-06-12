import { useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Factory,
  Package,
  Radio,
  Brain,
  Film,
  Users as UsersIcon,
  AlertTriangle,
  BarChart2,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
  Bell,
  LogOut
} from 'lucide-react'
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

/* ── SVG Icon set — replaces emojis ────────────────────────────────────── */
function Icon({ name }: { name: string }) {
  const cls = 'h-[18px] w-[18px] shrink-0'
  switch (name) {
    case 'dashboard': return <LayoutDashboard className={cls} />
    case 'plants': return <Factory className={cls} />
    case 'assets': return <Package className={cls} />
    case 'fleet': return <Radio className={cls} />
    case 'ai-pipeline': return <Brain className={cls} />
    case 'media': return <Film className={cls} />
    case 'users': return <UsersIcon className={cls} />
    case 'alerts': return <AlertTriangle className={cls} />
    case 'reports': return <BarChart2 className={cls} />
    case 'collapse': return <ChevronsLeft className={cls} />
    case 'expand': return <ChevronsRight className={cls} />
    case 'sun': return <Sun className={cls} />
    case 'moon': return <Moon className={cls} />
    case 'bell': return <Bell className={cls} />
    case 'logout': return <LogOut className={cls} />
    default: return null
  }
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const {
    currentUser,
    logout,
    devices,
    updateDevice,
    deleteCapture,
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

  // Auth Guard
  if (!currentUser) return <Login />;

  const isAdmin = currentUser.role === 'admin';
  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',         icon: 'dashboard'    },
    { id: 'plants',       label: 'Plants & Tenants',  icon: 'plants',      adminOnly: true },
    { id: 'assets',       label: 'Industrial Assets', icon: 'assets'       },
    { id: 'fleet',        label: 'Argo Fleet',        icon: 'fleet'        },
    { id: 'ai-pipeline',  label: 'AI Inference',      icon: 'ai-pipeline'  },
    { id: 'media',        label: 'Media Repository',  icon: 'media'        },
    { id: 'users',        label: 'Staff Identity',    icon: 'users',       adminOnly: true },
    { id: 'alerts',       label: 'Alarms Feed',       icon: 'alerts',      badge: unacknowledgedCount },
    { id: 'reports',      label: 'Reports',           icon: 'reports'      },
  ]

  return (
    <div
      className="flex h-screen flex-col overflow-hidden font-sans"
      style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--fg))' }}
    >

      {/* ══ Top Header ══════════════════════════════════════════════════════ */}
      <header className={`z-30 flex h-14 items-center justify-between border-b px-5 shrink-0
        bg-white dark:bg-ink-800 border-ink-600 dark:border-ink-600
        shadow-[0_1px_0_0_rgb(var(--s-600))] dark:shadow-[0_1px_0_0_rgb(var(--s-600))]`}
      >
        {/* Brand & Profile */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)', boxShadow: '0 2px 8px rgba(87,126,137,0.3)' }}
          >
            K
          </div>
          <div className="hidden sm:flex flex-col min-w-0">
            <span className="text-[13px] font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display leading-tight">
              Argo Glasses
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                {currentUser.name || 'Kaynes Admin'}
              </span>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#577E89]">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Connection Status */}
        <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-600 shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">
              {isSupabaseConnected ? 'AWS Live' : 'Local'}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8 flex items-center justify-center rounded-lg border transition-all
              border-ink-600 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600
              dark:bg-ink-700 dark:hover:bg-ink-600 dark:text-slate-400 dark:hover:text-slate-200"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          {/* Bell */}
          <button
            onClick={() => handleNavigate('alerts')}
            className="relative h-8 w-8 flex items-center justify-center rounded-lg border transition-all
              border-ink-600 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600
              dark:bg-ink-700 dark:hover:bg-ink-600 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Icon name="bell" />
            {unacknowledgedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-ink-700 animate-pulseRing" />
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-ink-600 mx-1" />

          {/* Sign out */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all
              border-ink-600 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700
              dark:bg-ink-700 dark:hover:bg-ink-600 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <Icon name="logout" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ══ Main workspace ══════════════════════════════════════════════════ */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left Sidebar Navigation ──────────────────────────────────── */}
        <aside className={`z-20 flex shrink-0 flex-col justify-between border-r py-4 transition-all duration-300
          bg-white dark:bg-ink-800 border-ink-600 dark:border-ink-600
          shadow-[1px_0_0_0_rgb(var(--s-600))] dark:shadow-[1px_0_0_0_rgb(var(--s-600))]
          hidden sm:flex
          ${isSidebarOpen ? 'w-56' : 'w-[60px]'}`}
        >
          {/* Nav items */}
          <nav className="flex flex-col gap-0.5 px-2.5">
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null
              const isActive = activeMenu === item.id

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveMenu(item.id as SidebarItem)
                      if (item.id === 'assets') setSelectedAssetId(null)
                    }}
                    className={`w-full flex items-center gap-3 rounded-xl py-2.5 text-[11px] font-medium transition-all duration-150
                      ${isSidebarOpen ? 'px-3' : 'px-0 justify-center'}
                      ${isActive
                        ? 'text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-ink-700/60'
                      }`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(87,126,137,0.18) 0%, rgba(87,126,137,0.08) 100%)',
                      color: '#577E89',
                      boxShadow: 'inset 0 0 0 1px rgba(87,126,137,0.2)',
                    } : {}}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: '#577E89' }}
                      />
                    )}

                    <span className={`transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-105'}`}>
                      <Icon name={item.icon} />
                    </span>

                    {isSidebarOpen && (
                      <span className="flex-1 text-left truncate tracking-wide">{item.label}</span>
                    )}

                    {/* Badge */}
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className={`flex items-center justify-center rounded-full text-[9px] font-bold text-white
                          ${isSidebarOpen ? 'px-1.5 py-0.5 min-w-[18px]' : 'absolute top-1.5 right-1.5 h-4 w-4'}`}
                        style={{ background: '#ef4444' }}
                      >
                        {isSidebarOpen ? item.badge : (item.badge > 9 ? '9+' : item.badge)}
                      </span>
                    )}
                  </button>

                  {/* Collapsed tooltip */}
                  {!isSidebarOpen && (
                    <div
                      className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                        hidden group-hover:block animate-fadeIn"
                    >
                      <div
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap"
                        style={{
                          background: 'rgb(var(--s-700))',
                          color: 'rgb(var(--n-100))',
                          border: '1px solid rgb(var(--s-500))',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        }}
                      >
                        {item.label}
                        {item.badge ? (
                          <span className="ml-1.5 rounded-full bg-rose-500 text-white px-1.5 py-0.5 text-[8px]">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      {/* Arrow */}
                      <div
                        className="absolute right-full top-1/2 -translate-y-1/2 mr-0.5 border-4 border-transparent"
                        style={{ borderRightColor: 'rgb(var(--s-500))' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Bottom: Collapse + version */}
          <div className="px-2.5 flex flex-col gap-2">
            {/* Version pill */}
            {isSidebarOpen && (
              <div
                className="mx-1 rounded-xl px-3 py-2.5 text-center"
                style={{ background: 'rgb(var(--s-700))', border: '1px solid rgb(var(--s-600))' }}
              >
                <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
                  Build
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Kaynes v2.1
                </div>
                <div
                  className="mt-1.5 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider inline-block"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  Stable
                </div>
              </div>
            )}

            {/* Collapse button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex w-full items-center gap-2.5 rounded-xl py-2.5 text-[11px] font-medium
                transition-all duration-150 text-slate-400 dark:text-slate-500
                hover:bg-slate-50 dark:hover:bg-ink-700/60 hover:text-slate-600 dark:hover:text-slate-300
                ${isSidebarOpen ? 'px-3' : 'px-0 justify-center'}`}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Icon name={isSidebarOpen ? 'collapse' : 'expand'} />
              {isSidebarOpen && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* ── Main Panel Viewer ─────────────────────────────────────────── */}
        <main
          className="relative flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ background: 'rgb(var(--s-base))' }}
        >

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
              <div
                className="flex-grow relative flex flex-col min-h-0 p-4 sm:p-6 lg:p-8"
                style={{ background: 'rgb(var(--s-base))' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Fleet Monitoring View
                  </h2>
                  <div
                    className="flex rounded-lg border p-0.5"
                    style={{ borderColor: 'rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
                  >
                    {(['grid', 'table'] as FleetView[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setFleetViewMode(m)}
                        className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all ${
                          fleetViewMode === m
                            ? 'text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-fg'
                        }`}
                        style={fleetViewMode === m ? {
                          background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
                          color: '#0D0F15',
                        } : {}}
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
