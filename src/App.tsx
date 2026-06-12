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

/* ── SVG Icon set — replaces emojis ────────────────────────────────────── */
function Icon({ name }: { name: string }) {
  const cls = 'h-[18px] w-[18px] shrink-0'
  switch (name) {
    case 'dashboard':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
    case 'plants':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V9m0 0l6-6 6 6M6 9h12v12M10 13h4v8h-4z"/></svg>
    case 'assets':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
    case 'fleet':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 0v10m0 0l3.5-3.5M12 12l-3.5-3.5"/></svg>
    case 'ai-pipeline':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    case 'media':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
    case 'users':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    case 'alerts':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    case 'reports':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    case 'collapse':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M21 19l-7-7 7-7"/></svg>
    case 'expand':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M3 5l7 7-7 7"/></svg>
    case 'sun':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    case 'moon':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
    case 'bell':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
    case 'logout':
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
    default:
      return null
  }
}

/* ── Page title lookup ───────────────────────────────────────────────────── */
const PAGE_TITLES: Record<SidebarItem, string> = {
  dashboard:    'Operations Dashboard',
  plants:       'Plants & Tenants',
  assets:       'Industrial Assets',
  fleet:        'Argo Glasses Fleet',
  'ai-pipeline':'AI Inference Lab',
  media:        'Media Repository',
  users:        'Staff Identity',
  alerts:       'Alarms & Alerts',
  reports:      'Audit & Reports',
}

/* ── Role colour pill ────────────────────────────────────────────────────── */
function RolePill({ role }: { role: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    admin:    { bg: 'rgba(255,153,0,0.15)', text: '#FF9900' },
    inspector:{ bg: 'rgba(56,189,248,0.15)', text: '#38bdf8' },
    operator: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  }
  const style = map[role] || map.operator
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
      style={{ background: style.bg, color: style.text }}
    >
      {role}
    </span>
  )
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
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo mark */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)', boxShadow: '0 2px 8px rgba(255,153,0,0.3)' }}
          >
            K
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
                Argo Glasses
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(255,153,0,0.12)', color: '#FF9900', border: '1px solid rgba(255,153,0,0.2)' }}
              >
                Enterprise
              </span>
            </div>
            <div className="text-[9px] font-medium text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
              IoT Fleet Console · Kaynes Technology
            </div>
          </div>
        </div>

        {/* Breadcrumb (center) */}
        <div className="hidden md:flex items-center gap-2 flex-1 justify-center">
          <span className="text-slate-300 dark:text-slate-600 text-xs">/</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            {PAGE_TITLES[activeMenu]}
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
              {isSupabaseConnected ? 'AWS Live' : 'Local'}
            </span>
          </div>

          <div className="h-5 w-px bg-ink-600 dark:bg-ink-600" />

          {/* User info */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-none">
              {currentUser.name || 'Kaynes Admin'}
            </span>
            <div className="mt-1">
              <RolePill role={currentUser.role} />
            </div>
          </div>

          {/* Avatar */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)' }}
          >
            {(currentUser.name || currentUser.email || 'A')[0].toUpperCase()}
          </div>

          <div className="h-5 w-px bg-ink-600 dark:bg-ink-600" />

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
                      background: 'linear-gradient(135deg, rgba(255,153,0,0.18) 0%, rgba(255,153,0,0.08) 100%)',
                      color: '#FF9900',
                      boxShadow: 'inset 0 0 0 1px rgba(255,153,0,0.2)',
                    } : {}}
                    title={!isSidebarOpen ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: '#FF9900' }}
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
                          background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
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
