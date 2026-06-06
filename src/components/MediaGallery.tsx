import { useMemo, useState } from 'react'
import { type Device, type MediaItem } from '../data/devices'
import { type Role } from './Login'
import CaptureThumb from './CaptureThumb'

interface Props {
  devices: Device[]
  role: Role
  onDeleteCapture: (deviceId: number, mediaId: string) => void
}

interface FlatItem {
  item: MediaItem
  deviceId: number
  deviceName: string
  serial: string
  site: string
}

type KindFilter = 'all' | 'image' | 'video'

export default function MediaGallery({ devices, role, onDeleteCapture }: Props) {
  const [kind, setKind] = useState<KindFilter>('all')
  const [deviceId, setDeviceId] = useState<number | 'all'>('all')
  const [toast, setToast] = useState<string | null>(null)

  const all: FlatItem[] = useMemo(
    () =>
      devices.flatMap((d) =>
        d.captures.map((item) => ({
          item,
          deviceId: d.id,
          deviceName: d.name,
          serial: d.serial,
          site: d.site,
        })),
      ),
    [devices],
  )

  const filtered = all.filter(
    (f) => (kind === 'all' || f.item.kind === kind) && (deviceId === 'all' || f.deviceId === deviceId),
  )

  const withCaptures = devices.filter((d) => d.captures.length > 0)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const isAdmin = role === 'admin'

  return (
    <div className="h-full overflow-auto p-4">
      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-base font-semibold text-fg">Media Repository</h2>
          <p className="text-[11px] text-slate-500">
            {all.length} captures across the fleet · staged for AI/ML training (Amazon S3 in production)
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-ink-500 bg-ink-700 p-0.5">
            {(['all', 'image', 'video'] as KindFilter[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  kind === k ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
                }`}
              >
                {k === 'all' ? 'All' : k === 'image' ? 'Images' : 'Clips'}
              </button>
            ))}
          </div>

          <select
            value={String(deviceId)}
            onChange={(e) => setDeviceId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-ink-500 bg-ink-700 px-2 py-2 text-xs text-slate-200 outline-none focus:border-argo-cyan"
          >
            <option value="all">All devices</option>
            {withCaptures.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.captures.length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500">No media matches the current filter.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((f) => (
            <div
              key={f.item.id}
              className="group overflow-hidden rounded-xl border border-ink-600 bg-ink-800"
            >
              <CaptureThumb item={f.item} serial={f.serial} className="aspect-video w-full" />
              <div className="p-3">
                <div className="truncate text-sm text-slate-200">{f.item.label}</div>
                <div className="text-[11px] text-slate-500">
                  {f.deviceName} · {f.item.capturedAt}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {f.item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-argo-violet/15 px-1.5 py-0.5 text-[10px] text-argo-violet"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-ink-600 pt-2">
                  <span className="text-[11px] text-slate-500">
                    {f.item.kind === 'video' ? 'Clip' : 'Image'} · {f.item.sizeMb} MB
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => flash(`Preparing "${f.item.label}" for download…`)}
                        className="rounded border border-ink-500 px-2 py-0.5 text-[11px] text-slate-300 hover:border-argo-cyan hover:text-fg"
                      >
                        ↓ Download
                      </button>
                      <button
                        onClick={() => {
                          onDeleteCapture(f.deviceId, f.item.id)
                          flash('Capture deleted.')
                        }}
                        className="rounded border border-ink-500 px-2 py-0.5 text-[11px] text-slate-300 hover:border-argo-red hover:text-argo-red"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fadeIn rounded-lg bg-ink-700 px-4 py-2 text-xs text-slate-100 shadow-lg ring-1 ring-ink-500">
          {toast}
        </div>
      )}
    </div>
  )
}
