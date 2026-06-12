import { useMemo, useState } from 'react'
import { type Device, type Alert, buildAlerts } from '../data/devices'
import { BatteryWarning, WifiOff, HardDrive, Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'

interface Props {
  devices: Device[]
  onOpenDevice: (id: number) => void
}

type SevFilter = 'all' | 'critical' | 'warning' | 'normal'

const SEV_COLOR: Record<Alert['severity'], string> = {
  critical: '#f87171',
  warning:  '#fbbf24',
  normal:   '#34d399',
}

const SEV_BG: Record<Alert['severity'], string> = {
  critical: 'rgba(248,113,113,0.08)',
  warning:  'rgba(251,191,36,0.08)',
  normal:   'rgba(52,211,153,0.08)',
}

const SEV_BORDER: Record<Alert['severity'], string> = {
  critical: 'rgba(248,113,113,0.2)',
  warning:  'rgba(251,191,36,0.2)',
  normal:   'rgba(52,211,153,0.2)',
}

const TYPE_ICON: Record<string, any> = {
  'Low battery':       BatteryWarning,
  'Device offline':    WifiOff,
  'Storage near full': HardDrive,
  'High temperature':  Thermometer,
}

export default function AlertsFeed({ devices, onOpenDevice }: Props) {
  const alerts = useMemo(() => buildAlerts(devices), [devices])
  const [sevFilter, setSevFilter] = useState<SevFilter>('all')

  const critical = alerts.filter(a => a.severity === 'critical').length
  const warning  = alerts.filter(a => a.severity === 'warning').length
  const normal   = alerts.filter(a => a.severity === 'normal').length

  const filtered = useMemo(() => {
    if (sevFilter === 'all') return alerts
    return alerts.filter(a => a.severity === sevFilter)
  }, [alerts, sevFilter])

  const filterTabs: { key: SevFilter; label: string; count: number; color: string }[] = [
    { key: 'all',      label: 'All',      count: alerts.length, color: 'rgb(var(--n-400))'  },
    { key: 'critical', label: 'Critical', count: critical,      color: '#f87171'             },
    { key: 'warning',  label: 'Warning',  count: warning,       color: '#fbbf24'             },
    { key: 'normal',   label: 'Normal',   count: normal,        color: '#34d399'             },
  ]

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8" style={{ background: 'rgb(var(--s-base))' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div
          className="text-[10px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: '#577E89' }}
        >
          Real-time Monitoring
        </div>
        <h1 className="text-xl font-bold font-display tracking-tight mb-1" style={{ color: 'rgb(var(--fg))' }}>
          Alarms & Notifications
        </h1>
        <p className="text-[11px] font-medium" style={{ color: 'rgb(var(--n-500))' }}>
          {alerts.length} active alerts · {critical} critical · delivered via Amazon SNS in production
        </p>
      </div>

      {/* ── Stats row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6 max-w-lg">
        {[
          { label: 'Critical', value: critical, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
          { label: 'Warning',  value: warning,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
          { label: 'Normal',   value: normal,   color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl p-3 text-center border"
            style={{
              background: stat.bg,
              borderColor: stat.color + '30',
              boxShadow: `0 0 12px ${stat.color}10`,
            }}
          >
            <div className="text-2xl font-bold font-display" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: stat.color + 'aa' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────────── */}
      <div
        className="flex gap-1 mb-5 rounded-xl p-1 w-fit"
        style={{ background: 'rgb(var(--s-700))', border: '1px solid rgb(var(--s-600))' }}
      >
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSevFilter(tab.key)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all duration-150"
            style={sevFilter === tab.key ? {
              background: 'rgb(var(--s-800))',
              color: tab.color,
              boxShadow: 'var(--shadow-card)',
            } : {
              color: 'rgb(var(--n-500))',
            }}
          >
            {tab.label}
            <span
              className="rounded-full px-1.5 py-0.5 text-[8px] font-bold"
              style={{
                background: sevFilter === tab.key ? tab.color + '20' : 'rgb(var(--s-600))',
                color: sevFilter === tab.key ? tab.color : 'rgb(var(--n-500))',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Alerts list ────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed text-center"
          style={{ borderColor: 'rgb(var(--s-500))', background: 'rgb(var(--s-700) / 0.4)' }}
        >
          <div className="mb-3 text-emerald-500"><CheckCircle size={32} /></div>
          <p className="text-[12px] font-semibold text-emerald-500">No active alerts in this category</p>
          <p className="text-[10px] font-medium mt-1" style={{ color: 'rgb(var(--n-600))' }}>Fleet is healthy</p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-2.5">
          {filtered.map(a => {
            const c = SEV_COLOR[a.severity]
            return (
              <button
                key={a.id}
                onClick={() => onOpenDevice(a.deviceId)}
                className="group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(90deg, ${c}12 0%, ${SEV_BG[a.severity]} 100%)`,
                  borderColor: SEV_BORDER[a.severity],
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${c}18, var(--shadow-card-hover)`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ''
                }}
              >
                {/* Icon */}
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                  style={{ background: c + '18', border: `1px solid ${c}28`, color: c }}
                >
                  {(() => {
                    const Icon = TYPE_ICON[a.type] || AlertTriangle;
                    return <Icon size={18} strokeWidth={2} />;
                  })()}
                </span>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[12px] font-semibold" style={{ color: 'rgb(var(--fg))' }}>
                      {a.type}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                      style={{ background: c + '18', color: c, border: `1px solid ${c}28` }}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed mb-1.5" style={{ color: 'rgb(var(--n-400))' }}>
                    {a.message}
                  </p>
                  <p className="font-mono text-[10px]" style={{ color: 'rgb(var(--n-600))' }}>
                    {a.deviceName} · {a.serial} · {a.site}
                  </p>
                </div>

                {/* Time + arrow */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-medium" style={{ color: 'rgb(var(--n-600))' }}>
                    {a.time}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: c }}
                  >
                    Open →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
