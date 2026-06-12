import { useEffect, useState } from 'react'
import { type UserRole as Role, useApp } from '../context/AppContext'
import {
    type Device,
    FIRMWARE_LATEST,
    type MediaItem,
    STATUS_COLOR,
    STATUS_LABEL,
    batteryColor,
    needsFirmwareUpdate,
    storagePct,
} from '../data/devices'
import CaptureThumb from './CaptureThumb'
import Gauge from './Gauge'
import Sparkline from './Sparkline'
import ImageViewer from './ImageViewer'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'

interface Props {
  device: Device | null
  role: Role
  onClose: () => void
  onRename: (id: number, name: string) => void // Kept for compat, but we'll use updateDevice from context
  onDeleteCapture: (deviceId: number, mediaId: string) => void
}

interface Diagnostic {
  headline: string
  summary: string
  rootCause: string
  actions: string[]
  confidence: number
  source: string
}

interface ViewerState {
  isOpen: boolean
  item: MediaItem | null
}

function MetricCard({
  index,
  title,
  action,
  children,
}: {
  index: number
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-700 text-[11px] text-argo-cyan">
            {index}
          </span>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export default function DeviceDrawer({
  device,
  role,
  onClose,
  onDeleteCapture,
}: Props) {
  const { updateDevice, updateFirmware } = useApp();
  const [diag, setDiag] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  
  // Metadata edit states
  const [draftName, setDraftName] = useState('')
  const [draftSite, setDraftSite] = useState('')
  const [draftOperator, setDraftOperator] = useState('')

  const [toast, setToast] = useState<string | null>(null)
  const [viewer, setViewer] = useState<ViewerState>({ isOpen: false, item: null })

  useEffect(() => {
    setDiag(null)
    setLoading(false)
    setEditing(false)
    setToast(null)
    setViewer({ isOpen: false, item: null })
    
    if (device) {
      setDraftName(device.name)
      setDraftSite(device.site)
      setDraftOperator(device.operator)
    }
  }, [device?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!device) return null
  const d = device
  const color = STATUS_COLOR[d.status]
  const isAdmin = role === 'admin'

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function saveMetadata() {
    updateDevice(d.id, {
      name: draftName.trim(),
      site: draftSite.trim(),
      operator: draftOperator.trim()
    });
    setEditing(false);
    flash('Device metadata updated.');
  }

  function download(item: MediaItem) {
    let mediaUrl = (item as any).url;
    if (!mediaUrl || mediaUrl.startsWith('blob:') && item.kind === 'video') {
      if (item.kind === 'video') {
        mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      } else {
        mediaUrl = getDeviceImageUrl(d.serial || d.name, item.seed, item.label);
      }
    }
    
    const extension = item.kind === 'video' ? 'mp4' : 'jpg';
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${item.label.replace(/\s+/g, '_')}_${item.id.slice(0, 5)}.${extension}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash(`Downloading "${item.label}"…`);
  }

  function handleOTAUpdate() {
    updateFirmware(d.id);
    flash('Firmware update command sent to device.');
  }

  function remove(item: MediaItem) {
    onDeleteCapture(d.id, item.id)
    flash('Capture deleted from device storage.')
  }

  async function runDiagnostic() {
    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: d }),
      })
      setDiag(await res.json())
    } catch {
      setDiag({
        headline: 'AI service unavailable',
        summary: 'Could not reach the analysis endpoint. Showing on-device forecast instead.',
        rootCause: d.forecast.predictedIssue,
        actions: [d.forecast.recommendedAction],
        confidence: d.forecast.confidence,
        source: 'offline',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-40 flex h-full w-full max-w-lg animate-slideIn flex-col border-l border-ink-600 bg-ink-900 shadow-2xl">
        {/* header */}
        <div className="flex items-start justify-between border-b border-ink-600 p-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
              {editing ? (
                <div className="flex-1 space-y-3 pr-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Device Alias</label>
                    <input
                      autoFocus
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full rounded border border-[#185FA5] bg-ink-700 px-2 py-1 text-sm font-semibold text-fg outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Site/Plant</label>
                      <input
                        value={draftSite}
                        onChange={(e) => setDraftSite(e.target.value)}
                        className="w-full rounded border border-ink-600 bg-ink-700 px-2 py-1 text-xs text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Operator</label>
                      <input
                        value={draftOperator}
                        onChange={(e) => setDraftOperator(e.target.value)}
                        className="w-full rounded border border-ink-600 bg-ink-700 px-2 py-1 text-xs text-slate-200 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={saveMetadata} 
                      className="rounded bg-[#185FA5] px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:brightness-110"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setEditing(false)} 
                      className="text-[11px] text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-fg">{d.name}</h2>
                    {isAdmin && (
                      <button
                        onClick={() => setEditing(true)}
                        className="text-slate-500 hover:text-argo-cyan transition-colors"
                        title="Edit metadata"
                      >
                        ✎
                      </button>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">
                    {d.serial} · {d.site} · {d.operator}
                  </p>
                </div>
              )}
            </div>
            {!editing && (
              <span
                className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: `${color}1f`, color }}
              >
                {STATUS_LABEL[d.status]}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-ink-700 hover:text-fg"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {/* alert banner */}
          {(d.status === 'critical' || d.status === 'warning') && (
            <div
              className="rounded-xl border p-4"
              style={{ borderColor: `${color}66`, background: `${color}12` }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                <span className="animate-pulse">●</span>{' '}
                {d.status === 'critical' ? 'Critical Alert' : 'Attention'}
              </div>
              <p className="mt-1.5 text-sm leading-snug text-slate-200/90">{d.forecast.alertText}</p>
              <p className="mt-2 rounded-md bg-ink-900/50 px-2 py-1.5 text-[11px] text-slate-300">
                ⚡ An SNS notification would be dispatched to on-call operators (production).
              </p>
            </div>
          )}

          {/* 1. Battery */}
          <MetricCard index={1} title="Battery & Health">
            <div className="flex items-center justify-around">
              <Gauge value={d.battery} sublabel="charge" color={batteryColor(d.battery)} />
              <div className="space-y-2 text-sm">
                <Row label="State of health" value={`${d.batteryHealth}%`} />
                <Row label="Temperature" value={`${d.temperatureC}°C`} warn={d.temperatureC >= 44} />
                <Row label="Uptime" value={`${d.uptimeHrs} h`} />
              </div>
            </div>
          </MetricCard>

          {/* 2. Connectivity */}
          <MetricCard index={2} title="Connectivity">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Row label="Link" value={d.connection} />
              <Row label="Signal" value={d.connection === 'Offline' ? '—' : `${d.signal}%`} />
              <Row label="Last seen" value={d.lastSeen} />
              <Row label="Site" value={d.site} />
            </div>
            {d.connection !== 'Offline' && (
              <div className="mt-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                  <div
                    className="h-full rounded-full bg-argo-cyan"
                    style={{ width: `${d.signal}%` }}
                  />
                </div>
              </div>
            )}
          </MetricCard>

          {/* 3. Storage */}
          <MetricCard index={3} title="On-device Storage">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-fg">
                {d.storageUsedGb}
                <span className="text-base font-normal text-slate-400"> / {d.storageTotalGb} GB</span>
              </span>
              <span
                className="tabular-nums text-sm"
                style={{ color: storagePct(d) >= 90 ? '#f59e0b' : '#22d3ee' }}
              >
                {storagePct(d)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${storagePct(d)}%`,
                  background: storagePct(d) >= 90 ? '#f59e0b' : '#22d3ee',
                }}
              />
            </div>
          </MetricCard>

          {/* 4. Battery history */}
          <MetricCard index={4} title="Battery History (last 12 readings)">
            <Sparkline data={d.historicalBattery} color={batteryColor(d.battery)} />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500">
              <span>earliest</span>
              <span>now · {d.battery}%</span>
            </div>
          </MetricCard>

          {/* 5. Firmware */}
          <MetricCard
            index={5}
            title="Firmware"
            action={
              needsFirmwareUpdate(d) ? (
                <span className="rounded-full bg-argo-amber/15 px-2 py-0.5 text-[11px] font-medium text-argo-amber">
                  update available
                </span>
              ) : (
                <span className="rounded-full bg-argo-green/15 px-2 py-0.5 text-[11px] font-medium text-argo-green">
                  up to date
                </span>
              )
            }
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-slate-300">{d.firmware}</span>
              {needsFirmwareUpdate(d) && (
                <span className="text-[11px] text-slate-500">→ {FIRMWARE_LATEST}</span>
              )}
            </div>
            {isAdmin && needsFirmwareUpdate(d) && (
              <button
                onClick={handleOTAUpdate}
                className="mt-3 w-full rounded-lg border border-ink-500 bg-ink-700 py-2 text-xs font-medium text-slate-200 hover:border-argo-cyan hover:text-fg"
              >
                Push OTA update
              </button>
            )}
          </MetricCard>

          {/* 6. Captured media */}
          <MetricCard
            index={6}
            title={`Captured Media (${d.captures.length})`}
          >
            {d.captures.length === 0 ? (
              <p className="text-xs text-slate-500">No captures stored on this device.</p>
            ) : (
              <div className="space-y-2.5">
                {d.captures.map((m) => (
                  <div
                    key={m.id}
                    className="flex gap-3 rounded-lg border border-ink-600 bg-ink-900/40 p-2"
                  >
                    <CaptureThumb 
                      item={m} 
                      deviceName={d.name} 
                      className="h-16 w-24 shrink-0" 
                      onImageClick={() => setViewer({ isOpen: true, item: m })}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-slate-200">{m.label}</div>
                      <div className="text-[11px] text-slate-500">
                        Image · {m.sizeMb} MB · {m.capturedAt}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {m.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-argo-violet/15 px-1.5 py-0.5 text-[10px] text-argo-violet"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex flex-col justify-center gap-1.5">
                        <button
                          onClick={() => download(m)}
                          className="rounded border border-ink-500 px-2 py-1 text-[11px] text-slate-300 hover:border-argo-cyan hover:text-fg"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => remove(m)}
                          className="rounded border border-ink-500 px-2 py-1 text-[11px] text-slate-300 hover:border-argo-red hover:text-argo-red"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="mt-2 text-[10px] text-slate-600">
              Captures feed the future AI/ML training set — stored in Amazon S3 in production.
            </p>
          </MetricCard>

          {/* 7. AI diagnostic */}
          <div className="rounded-xl border border-argo-cyan/30 bg-argo-cyan/[0.04] p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-argo-cyan">
                ✦ AI Device Diagnostic
              </h4>
              <button
                onClick={runDiagnostic}
                disabled={loading}
                className="rounded-md bg-argo-cyan px-3 py-1.5 text-xs font-semibold text-ink-900 hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Analysing…' : diag ? 'Re-run' : 'Run analysis'}
              </button>
            </div>
            {diag ? (
              <div className="mt-3 space-y-2 text-sm">
                <div className="font-medium text-fg">{diag.headline}</div>
                <p className="leading-snug text-slate-300">{diag.summary}</p>
                <p className="text-xs text-slate-400">
                  <span className="text-slate-500">Root cause: </span>
                  {diag.rootCause}
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-300">
                  {diag.actions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
                <div className="text-[11px] text-slate-500">
                  {diag.confidence}% confidence ·{' '}
                  <span className="font-mono">
                    {diag.source === 'gemini' ? 'live model' : 'on-device model'}
                  </span>
                </div>
              </div>
            ) : (
              !loading && (
                <p className="mt-2 text-[11px] text-slate-500">
                  Routes through the secure serverless layer (any API key stays server-side).
                </p>
              )
            )}
          </div>
        </div>

        {/* toast */}
        {toast && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 animate-fadeIn rounded-lg bg-ink-700 px-4 py-2 text-xs text-slate-100 shadow-lg ring-1 ring-ink-500">
            {toast}
          </div>
        )}
      </div>

      <ImageViewer 
        isOpen={viewer.isOpen} 
        item={viewer.item} 
        deviceName={d.name} 
        serial={d.serial}
        onClose={() => setViewer({ ...viewer, isOpen: false })}
      />
    </>
  )
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className={`tabular-nums ${warn ? 'text-argo-red' : 'text-slate-200'}`}>{value}</span>
    </div>
  )
}
