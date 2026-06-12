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
    <div
      className="px-4 py-4"
      style={{ borderBottom: '1px solid rgb(var(--s-600))' }}
    >
      <h3 className="mb-3 text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
        {title}
      </h3>
      <div>{children}</div>
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
    <label
      className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[11px] font-medium transition-colors group"
      style={{ color: 'rgb(var(--n-400))' }}
    >
      {/* Custom checkbox */}
      <div
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150"
        style={checked ? {
          background: '#577E89',
          borderColor: '#577E89',
          boxShadow: '0 0 8px rgba(87,126,137,0.25)',
        } : {
          borderColor: 'rgb(var(--s-500))',
          background: 'rgb(var(--s-700))',
        }}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      {dot && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: dot, boxShadow: `0 0 5px ${dot}80` }}
        />
      )}
      <span className="group-hover:text-fg transition-colors">{label}</span>
    </label>
  )
}

export default function FilterSidebar({ filters, setFilters, resultCount }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`hidden shrink-0 flex-col overflow-y-auto border-r md:flex z-10 transition-all duration-300 ${
        isCollapsed ? 'w-14 items-center' : 'w-60'
      }`}
      style={{
        background: 'rgb(var(--s-800))',
        borderColor: 'rgb(var(--s-600))',
        boxShadow: '1px 0 0 0 rgb(var(--s-600))',
      }}
    >
      {/* Header */}
      <div
        className={`flex items-center pt-5 pb-3 w-full shrink-0 ${
          isCollapsed ? 'justify-center flex-col gap-3 px-2' : 'justify-between px-4'
        }`}
      >
        {!isCollapsed && (
          <>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--fg))' }}>
              Filters
            </h2>
            <span
              className="rounded-lg px-2 py-1 text-[9px] font-semibold uppercase tracking-wider"
              style={{
                background: 'rgba(87,126,137,0.1)',
                color: '#577E89',
                border: '1px solid rgba(87,126,137,0.2)',
              }}
            >
              {resultCount}
            </span>
          </>
        )}

        {isCollapsed && (
          <span
            className="rounded-lg px-1.5 py-1 text-[8px] font-bold"
            style={{ background: 'rgba(87,126,137,0.1)', color: '#577E89', border: '1px solid rgba(87,126,137,0.2)' }}
          >
            {resultCount}
          </span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all"
          style={{
            background: 'rgb(var(--s-700))',
            borderColor: 'rgb(var(--s-600))',
            color: 'rgb(var(--n-500))',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-600))'
            ;(e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-200))'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgb(var(--s-700))'
            ;(e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-500))'
          }}
          title={isCollapsed ? 'Expand Filters' : 'Collapse Filters'}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            {isCollapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M3 5l7 7-7 7"/>
              : <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M21 19l-7-7 7-7"/>
            }
          </svg>
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <Section title="Search">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                style={{ color: 'rgb(var(--n-500))' }}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                placeholder="Name, serial, operator…"
                className="w-full rounded-lg border pl-9 pr-3 py-2 text-[11px] font-medium outline-none transition-all"
                style={{
                  borderColor: 'rgb(var(--s-500))',
                  background: 'rgb(var(--s-700))',
                  color: 'rgb(var(--n-200))',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(87,126,137,0.5)'
                  e.target.style.boxShadow = '0 0 0 3px rgba(87,126,137,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgb(var(--s-500))'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </Section>

          {/* Status */}
          <Section title="Status">
            <div className="space-y-0.5">
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

          {/* Site */}
          <Section title="Site">
            <select
              value={filters.site}
              onChange={(e) => setFilters((f) => ({ ...f, site: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-[11px] font-medium outline-none transition-all appearance-none cursor-pointer"
              style={{
                borderColor: 'rgb(var(--s-500))',
                background: 'rgb(var(--s-700))',
                color: 'rgb(var(--n-200))',
              }}
              onFocus={e => {
                e.target.style.borderColor = 'rgba(87,126,137,0.5)'
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgb(var(--s-500))'
              }}
            >
              <option value="">All sites</option>
              {ALL_SITES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Section>

          {/* Connection */}
          <Section title="Connection">
            <div className="space-y-0.5">
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

          {/* Battery range */}
          <Section title={`Min battery — ${filters.minBattery}%`}>
            <div className="pt-1">
              <input
                type="range"
                min={0}
                max={100}
                value={filters.minBattery}
                onChange={(e) => setFilters((f) => ({ ...f, minBattery: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                style={{ background: 'rgb(var(--s-600))', accentColor: '#577E89' }}
              />
              <div className="mt-2 flex justify-between text-[9px] font-mono font-semibold" style={{ color: 'rgb(var(--n-600))' }}>
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
