import { useState } from 'react'
import {
  type DeviceStatus,
  type Connection,
  STATUS_LABEL,
  STATUS_COLOR,
  ALL_SITES,
} from '../data/devices'
import { type Filters } from '../lib/filters'

interface Props {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  resultCount: number
}

const STATUSES: DeviceStatus[] = ['online', 'warning', 'critical', 'offline']
const CONNECTIONS: Connection[] = ['Wi-Fi', 'BLE', 'Offline']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-600/50 px-5 py-4">
      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
        {title}
      </h3>
      <div>
        {children}
      </div>
    </div>
  )
}

function Check({
  checked,
  onChange,
  label,
  dot,
}: {
  checked: boolean
  onChange: () => void
  label: string
  dot?: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-[11px] font-bold text-slate-300 hover:text-fg transition-colors group">
      <div className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
        checked ? 'border-argo-cyan bg-argo-cyan' : 'border-ink-500 bg-ink-900 group-hover:border-argo-cyan/50'
      }`}>
        {checked && <span className="text-ink-900 text-[10px]">✓</span>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      {dot && <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: dot }} />}
      {label}
    </label>
  )
}

export default function FilterSidebar({ filters, setFilters, resultCount }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`hidden shrink-0 flex-col overflow-y-auto border-r border-ink-600 bg-ink-800/80 backdrop-blur-xl md:flex shadow-xl z-10 transition-all duration-300 ${isCollapsed ? 'w-16 items-center' : 'w-64'}`}>
      <div className={`flex items-center pt-5 pb-2 w-full ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between px-5'}`}>
        {!isCollapsed && (
          <>
            <h2 className="text-xs font-black uppercase tracking-widest text-fg">Filters</h2>
            <span className="rounded-md bg-argo-cyan/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-argo-cyan border border-argo-cyan/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              {resultCount} devices
            </span>
          </>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-700/50 text-slate-400 hover:bg-ink-700 hover:text-fg transition-colors"
          title={isCollapsed ? "Expand Filters" : "Collapse Filters"}
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <Section title="Search">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">🔍</span>
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Name, serial, operator…"
                className="w-full rounded-lg border border-ink-600 bg-ink-900/50 pl-8 pr-3 py-2 text-xs font-medium text-slate-200 outline-none placeholder:text-slate-600 focus:border-argo-cyan transition-colors shadow-inner"
              />
            </div>
          </Section>

          <Section title="Status">
            <div className="space-y-1">
              {STATUSES.map((s) => (
                <Check
                  key={s}
                  checked={filters.statuses[s]}
                  onChange={() =>
                    setFilters((f) => ({
                      ...f,
                      statuses: { ...f.statuses, [s]: !f.statuses[s] },
                    }))
                  }
                  label={STATUS_LABEL[s]}
                  dot={STATUS_COLOR[s]}
                />
              ))}
            </div>
          </Section>

          <Section title="Site">
            <select
              value={filters.site}
              onChange={(e) => setFilters((f) => ({ ...f, site: e.target.value }))}
              className="w-full rounded-lg border border-ink-600 bg-ink-900/50 px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-argo-cyan transition-colors appearance-none cursor-pointer shadow-inner"
            >
              <option value="">All sites</option>
              {ALL_SITES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Section>

          <Section title="Connection">
            <div className="space-y-1">
              {CONNECTIONS.map((c) => (
                <Check
                  key={c}
                  checked={filters.connections[c]}
                  onChange={() =>
                    setFilters((f) => ({
                      ...f,
                      connections: { ...f.connections, [c]: !f.connections[c] },
                    }))
                  }
                  label={c}
                />
              ))}
            </div>
          </Section>

          <Section title={`Min battery — ${filters.minBattery}%`}>
            <div className="pt-2">
              <input
                type="range"
                min={0}
                max={100}
                value={filters.minBattery}
                onChange={(e) => setFilters((f) => ({ ...f, minBattery: Number(e.target.value) }))}
                className="w-full h-1.5 bg-ink-900 rounded-lg appearance-none cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </Section>
        </>
      )}
    </aside>
  )
}
