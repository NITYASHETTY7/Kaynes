import { useEffect, useMemo, useState } from 'react'
import {
  DEVICES,
  type Device,
  fleetStats,
  ORG_NAME,
} from './data/devices'
import { DEFAULT_FILTERS, applyFilters, type Filters } from './lib/filters'
import Login, { type Session } from './components/Login'
import FilterSidebar from './components/FilterSidebar'
import DeviceList, { type FleetView } from './components/DeviceList'
import DeviceDrawer from './components/DeviceDrawer'
import MediaGallery from './components/MediaGallery'
import AlertsFeed from './components/AlertsFeed'

type Theme = 'dark' | 'light'
type Tab = 'fleet' | 'media' | 'alerts'

const SESSION_KEY = 'argo.session'

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span
        className="text-lg font-semibold tabular-nums text-fg"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? 'border-argo-cyan text-fg'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-argo-red/20 px-1.5 text-[10px] font-semibold text-argo-red">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as Session) : null
    } catch {
      return null
    }
  })

  // Live fleet (in React state so admin rename / capture-delete reflect).
  const [devices, setDevices] = useState<Device[]>(DEVICES)
  const [tab, setTab] = useState<Tab>('fleet')
  const [view, setView] = useState<FleetView>('grid')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  const stats = useMemo(() => fleetStats(devices), [devices])
  const filtered = useMemo(() => applyFilters(devices, filters), [devices, filters])
  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) ?? null,
    [devices, selectedId],
  )
  const activeAlerts = stats.lowBattery + stats.offline

  function login(s: Session) {
    setSession(s)
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  }
  function logout() {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }

  function renameDevice(id: number, name: string) {
    setDevices((ds) => ds.map((d) => (d.id === id ? { ...d, name } : d)))
  }
  function deleteCapture(deviceId: number, mediaId: string) {
    setDevices((ds) =>
      ds.map((d) =>
        d.id === deviceId
          ? { ...d, captures: d.captures.filter((c) => c.id !== mediaId) }
          : d,
      ),
    )
  }

  function openDevice(id: number) {
    setTab('fleet')
    setSelectedId(id)
  }

  if (!session) return <Login onLogin={login} />

  return (
    <div className="flex h-screen flex-col bg-ink-900 text-slate-200">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="z-20 flex flex-wrap items-center gap-4 border-b border-ink-600 bg-ink-800 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-argo-cyan/15 text-lg">
            ◉
          </span>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-fg sm:text-base">
              Argo Glasses · IoT Fleet Console
            </h1>
            <p className="text-[11px] leading-tight text-argo-cyan">{ORG_NAME}</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="ml-2 hidden items-center gap-6 lg:flex">
          <Kpi label="Devices" value={String(stats.total)} />
          <Kpi label="Online" value={String(stats.online)} accent="#10b981" />
          <Kpi
            label="Critical"
            value={String(stats.critical)}
            accent={stats.critical > 0 ? '#ef4444' : '#10b981'}
          />
          <Kpi label="Low battery" value={String(stats.lowBattery)} accent="#f59e0b" />
          <Kpi label="Captures" value={String(stats.totalCaptures)} accent="#22d3ee" />
        </div>

        {/* right controls */}
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[11px] text-slate-500 xl:inline">
            {session.name} · {session.role}
          </span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-500 bg-ink-700 text-slate-300 transition-colors hover:text-fg"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-ink-500 bg-ink-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-fg"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Tab bar ────────────────────────────────────────── */}
      <div className="z-10 flex items-center justify-between border-b border-ink-600 bg-ink-800 px-3">
        <div className="flex">
          <TabButton active={tab === 'fleet'} onClick={() => setTab('fleet')}>
            🛰 Fleet
          </TabButton>
          <TabButton active={tab === 'media'} onClick={() => setTab('media')}>
            🖼 Media
          </TabButton>
          <TabButton active={tab === 'alerts'} onClick={() => setTab('alerts')} badge={activeAlerts}>
            🔔 Alerts
          </TabButton>
        </div>

        {tab === 'fleet' && (
          <div className="flex items-center gap-3 pr-2">
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              {filtered.length} shown
            </span>
            <div className="flex rounded-lg border border-ink-500 bg-ink-700 p-0.5">
              {(['grid', 'table'] as FleetView[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setView(m)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    view === m ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {tab === 'fleet' && (
          <FilterSidebar filters={filters} setFilters={setFilters} resultCount={filtered.length} />
        )}

        <main className="relative min-w-0 flex-1">
          {tab === 'fleet' && (
            <DeviceList devices={filtered} view={view} onSelect={(d) => setSelectedId(d.id)} />
          )}
          {tab === 'media' && (
            <MediaGallery devices={devices} role={session.role} onDeleteCapture={deleteCapture} />
          )}
          {tab === 'alerts' && <AlertsFeed devices={devices} onOpenDevice={openDevice} />}
        </main>
      </div>

      <DeviceDrawer
        device={selected}
        role={session.role}
        onClose={() => setSelectedId(null)}
        onRename={renameDevice}
        onDeleteCapture={deleteCapture}
      />
    </div>
  )
}
