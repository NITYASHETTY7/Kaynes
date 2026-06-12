import { useMemo, useState } from 'react'
import { type UserRole as Role } from '../context/AppContext'
import { type Device, type MediaItem } from '../data/devices'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'
import CaptureThumb from './CaptureThumb'
import ImageViewer from './ImageViewer'

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

interface ViewerState {
  isOpen: boolean
  item: MediaItem | null
  deviceName: string
}

type KindFilter = 'all' | 'image'

export default function MediaGallery({ devices, role, onDeleteCapture }: Props) {
  const [kind, setKind] = useState<KindFilter>('all')
  const [deviceId, setDeviceId] = useState<number | 'all'>('all')
  const [toast, setToast] = useState<string | null>(null)
  const [viewer, setViewer] = useState<ViewerState>({ isOpen: false, item: null, deviceName: '' });
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

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
    (f) => !failedImages[f.item.id] && (kind === 'all' || f.item.kind === kind) && (deviceId === 'all' || f.deviceId === deviceId),
  )

  const withCaptures = devices.filter((d) => d.captures.length > 0)

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function download(f: FlatItem) {
    let mediaUrl = (f.item as any).url;
    if (!mediaUrl || mediaUrl.startsWith('blob:') && f.item.kind === 'video') {
      if (f.item.kind === 'video') {
        mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      } else {
        mediaUrl = getDeviceImageUrl(f.serial || f.deviceName, f.item.seed, f.item.label);
      }
    }
    
    const extension = f.item.kind === 'video' ? 'mp4' : 'jpg';
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${f.item.label.replace(/\s+/g, '_')}_${f.item.id.slice(0, 5)}.${extension}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    flash(`Downloading "${f.item.label}"…`);
  }

  const isAdmin = role === 'admin'

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-black tracking-tight text-fg">Cloud Media Repository</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-argo-green animate-pulse" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              S3 Bucket: <span className="text-argo-cyan">kaynes-argo-media-prod</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <div className="flex rounded-lg border border-ink-600 bg-ink-800 p-0.5 shadow-sm">
            {(['all', 'image'] as KindFilter[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`rounded-md px-4 py-1.5 text-[10px] font-black uppercase tracking-tighter transition-all ${
                  kind === k ? 'bg-argo-cyan text-ink-900 shadow-md' : 'text-slate-400 hover:text-fg'
                }`}
              >
                {k === 'all' ? 'All' : 'Photos'}
              </button>
            ))}
          </div>

          <select
            value={String(deviceId)}
            onChange={(e) => setDeviceId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-ink-600 bg-ink-800 px-3 py-1.5 text-[11px] font-bold text-slate-300 outline-none focus:border-argo-cyan shadow-sm"
          >
            <option value="all">All Devices</option>
            {withCaptures.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.captures.length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cloud Stats Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Storage Used', value: `${Math.round(all.reduce((acc, f) => acc + f.item.sizeMb, 0))}`, unit: 'MB', icon: '💾' },
          { label: 'Total Objects', value: all.length, unit: 'Items', icon: '📦' },
          { label: 'Sync Status', value: '100', unit: '%', icon: '☁', color: 'text-argo-green' },
          { label: 'AWS Region', value: 'AP-SOUTH-1', unit: '', icon: '🌐' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-ink-600 bg-ink-800/40 p-4 transition-all hover:border-argo-cyan/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">{stat.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
            </div>
            <div className={`text-xl font-black ${stat.color || 'text-fg'}`}>
              {stat.value} <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{stat.unit}</span>
            </div>
          </div>
        ))}
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
              <CaptureThumb 
                item={f.item} 
                serial={f.serial} 
                deviceName={f.deviceName}
                className="aspect-video w-full" 
                onImageClick={() => setViewer({ isOpen: true, item: f.item, deviceName: f.deviceName })}
                onImageError={() => setFailedImages(prev => ({ ...prev, [f.item.id]: true }))}
              />
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
                    Image · {f.item.sizeMb} MB
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => download(f)}
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

      <ImageViewer 
        isOpen={viewer.isOpen} 
        item={viewer.item} 
        deviceName={viewer.deviceName} 
        serial={all.find(a => a.item.id === viewer.item?.id)?.serial}
        onClose={() => setViewer({ ...viewer, isOpen: false })}
      />
    </div>
  )
}
