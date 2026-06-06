import { useMemo } from 'react'
import { type Device, type Alert, buildAlerts } from '../data/devices'

interface Props {
  devices: Device[]
  onOpenDevice: (id: number) => void
}

const SEV_COLOR: Record<Alert['severity'], string> = {
  critical: '#ef4444',
  warning: '#f59e0b',
  normal: '#10b981',
}

const TYPE_ICON: Record<string, string> = {
  'Low battery': '🔋',
  'Device offline': '⊘',
  'Storage near full': '💾',
  'High temperature': '🌡',
}

export default function AlertsFeed({ devices, onOpenDevice }: Props) {
  const alerts = useMemo(() => buildAlerts(devices), [devices])
  const critical = alerts.filter((a) => a.severity === 'critical').length

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-fg">Alerts & Notifications</h2>
        <p className="text-[11px] text-slate-500">
          {alerts.length} active · {critical} critical · would be delivered via Amazon SNS in production
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          ✓ No active alerts — the fleet is healthy.
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-2">
          {alerts.map((a) => {
            const c = SEV_COLOR[a.severity]
            return (
              <button
                key={a.id}
                onClick={() => onOpenDevice(a.deviceId)}
                className="flex w-full items-start gap-3 rounded-xl border border-ink-600 bg-ink-800 p-3.5 text-left transition-colors hover:border-argo-cyan/40 hover:bg-ink-700/50"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: `${c}1f` }}
                >
                  {TYPE_ICON[a.type] ?? '⚠'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-100">{a.type}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{ background: `${c}1f`, color: c }}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{a.message}</p>
                  <p className="mt-1 font-mono text-[11px] text-slate-500">
                    {a.deviceName} · {a.serial} · {a.site}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-500">{a.time}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
