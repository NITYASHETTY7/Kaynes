import {
  type Device,
  STATUS_LABEL,
  STATUS_COLOR,
  batteryColor,
  storagePct,
} from '../data/devices'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Wifi, Bluetooth, WifiOff, MapPin, Camera, Clock } from 'lucide-react'

export type FleetView = 'grid' | 'table'

interface Props {
  devices: Device[]
  view: FleetView
  onSelect: (d: Device) => void
}

function StatusPill({ d }: { d: Device }) {
  const c = STATUS_COLOR[d.status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
      style={{ background: `${c}1f`, color: c }}
    >
      <span
        className={`h-2 w-2 rounded-full ${d.status === 'online' ? 'animate-pulse' : ''}`}
        style={{ background: c }}
      />
      {STATUS_LABEL[d.status]}
    </span>
  )
}

function BatteryBar({ pct }: { pct: number }) {
  const c = batteryColor(pct)
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-3 w-8 rounded-sm border border-slate-500/60">
        <div
          className="absolute inset-y-0.5 left-0.5 rounded-[1px]"
          style={{ width: `calc(${pct}% - 2px)`, background: c }}
        />
        <div className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r bg-slate-500/60" />
      </div>
      <span className="tabular-nums text-xs" style={{ color: c }}>
        {pct}%
      </span>
    </div>
  )
}

function ConnIcon({ d }: { d: Device }) {
  const label = d.connection
  const c = d.connection === 'Offline' ? '#64748b' : d.connection === 'Wi-Fi' ? '#22d3ee' : '#8b7aff'
  const Icon = d.connection === 'Wi-Fi' ? Wifi : d.connection === 'BLE' ? Bluetooth : WifiOff
  
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: c }}>
      <Icon size={12} /> {label}
    </span>
  )
}

const containerVars: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVars: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

// ── Card grid (primary "My Devices" view) ──────────────────────────────────
function Grid({ devices, onSelect }: Omit<Props, 'view'>) {
  return (
    <motion.div 
      variants={containerVars} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {devices.map((d) => {
        const color = STATUS_COLOR[d.status]
        return (
          <motion.button
            variants={itemVars}
            key={d.id}
            onClick={() => onSelect(d)}
            className={`group relative flex flex-col overflow-hidden rounded-[1.25rem] border bg-ink-800/40 backdrop-blur-xl p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
              d.status === 'offline' ? 'opacity-80 hover:opacity-100' : ''
            }`}
            style={{ borderColor: `${color}40`, boxShadow: `0 4px 20px -2px ${color}10` }}
          >
            {/* status accent bar + faint tint */}
            <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: color }} />
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(120deg, ${color}14, transparent 55%)`,
              }}
            />

            <div className="relative mb-4 flex items-start justify-between">
              <div className="min-w-0 pr-2">
                <div className="truncate font-bold text-fg font-display">{d.name}</div>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">{d.serial}</div>
              </div>
              <StatusPill d={d} />
            </div>

            <div className="relative mb-4 flex items-center gap-1.5 text-[11px] text-slate-400">
              <MapPin size={12} className="opacity-70" />
              <span>{d.site}</span>
            </div>

            <div className="relative mt-auto flex items-center justify-between">
              <BatteryBar pct={d.battery} />
              <ConnIcon d={d} />
            </div>

            <div className="relative mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><Camera size={12} className="opacity-70" /> {d.captures.length} captures</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="opacity-70" /> {d.lastSeen}</span>
            </div>
            
            {/* Hover Glow */}
            <div 
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
              style={{ boxShadow: `inset 0 0 20px 0 ${color}15, inset 0 0 0 1px ${color}30` }}
            />
          </motion.button>
        )
      })}
      {devices.length === 0 && <EmptyState />}
    </motion.div>
  )
}

// ── Table view (bolt-style dense list) ─────────────────────────────────────
function Table({ devices, onSelect }: Omit<Props, 'view'>) {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="overflow-hidden rounded-xl border border-ink-600">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-ink-700 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-4 py-3 font-semibold">Device</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Battery</th>
              <th className="px-4 py-3 font-semibold">Connection</th>
              <th className="px-4 py-3 font-semibold">Storage</th>
              <th className="px-4 py-3 font-semibold">Firmware</th>
              <th className="px-4 py-3 font-semibold">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr
                key={d.id}
                onClick={() => onSelect(d)}
                className={`cursor-pointer border-t border-ink-600/70 transition-colors hover:bg-ink-700/50 ${
                  d.status === 'critical' ? 'bg-argo-red/[0.06]' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-100">{d.name}</div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {d.serial} · {d.site}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusPill d={d} />
                </td>
                <td className="px-4 py-3">
                  <BatteryBar pct={d.battery} />
                </td>
                <td className="px-4 py-3">
                  <ConnIcon d={d} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-600">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${storagePct(d)}%`,
                          background: storagePct(d) >= 90 ? '#f59e0b' : '#22d3ee',
                        }}
                      />
                    </div>
                    <span className="tabular-nums text-[11px] text-slate-400">{storagePct(d)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{d.firmware}</td>
                <td className="px-4 py-3 text-[11px] text-slate-400">{d.lastSeen}</td>
              </tr>
            ))}
            {devices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No devices match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="col-span-full py-16 text-center text-slate-500">
      No devices match the current filters.
    </div>
  )
}

export default function DeviceList({ devices, view, onSelect }: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        {view === 'grid' ? (
          <Grid devices={devices} onSelect={onSelect} />
        ) : (
          <Table devices={devices} onSelect={onSelect} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
