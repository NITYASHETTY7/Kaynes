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
    <div className="border-b border-ink-600 px-4 py-4">
      <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
      {children}
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
    <label className="flex cursor-pointer items-center gap-2 py-1 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-argo-cyan"
      />
      {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
      {label}
    </label>
  )
}

export default function FilterSidebar({ filters, setFilters, resultCount }: Props) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-white/5 bg-ink-900/60 backdrop-blur-2xl md:flex">
      <div className="flex items-center justify-between px-4 pt-4 mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Filters</h2>
        <span className="rounded-full bg-ink-700/80 px-2 py-0.5 text-[11px] text-argo-cyan font-semibold shadow-glow-cyan">
          {resultCount} devices
        </span>
      </div>

      <Section title="Search">
        <input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder="Name, serial, operator…"
          className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-argo-cyan"
        />
      </Section>

      <Section title="Status">
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
      </Section>

      <Section title="Site">
        <select
          value={filters.site}
          onChange={(e) => setFilters((f) => ({ ...f, site: e.target.value }))}
          className="w-full rounded-lg border border-ink-500 bg-ink-700 px-2 py-2 text-sm text-slate-200 outline-none focus:border-argo-cyan"
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
      </Section>

      <Section title={`Min battery — ${filters.minBattery}%`}>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.minBattery}
          onChange={(e) => setFilters((f) => ({ ...f, minBattery: Number(e.target.value) }))}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>0%</span>
          <span>100%</span>
        </div>
      </Section>
    </aside>
  )
}
