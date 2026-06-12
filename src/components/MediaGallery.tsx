import { useMemo, useState } from 'react'
import { type UserRole as Role } from '../context/AppContext'
import { type Device, type MediaItem } from '../data/devices'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'
import CaptureThumb from './CaptureThumb'
import ImageViewer from './ImageViewer'
import { Save, Package, Cloud, Globe, FolderOpen, Trash2 } from 'lucide-react';

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
    if (!mediaUrl || mediaUrl.startsWith('blob:')) {
      mediaUrl = getDeviceImageUrl(f.serial || f.deviceName, f.item.seed, f.item.label);
    }
    
    const extension = 'jpg';
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
    <div
      className="h-full overflow-auto p-4 sm:p-6 lg:p-8"
      style={{ background: 'rgb(var(--s-base))' }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: '#577E89' }}
          >
            Amazon S3 · ap-south-1
          </div>
          <h1
            className="text-xl font-bold font-display tracking-tight"
            style={{ color: 'rgb(var(--fg))' }}
          >
            Cloud Media Repository
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span
              className="flex h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }}
            />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
              Bucket: <span style={{ color: '#38bdf8' }}>kaynes-argo-media-prod</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Kind toggle */}
          <div
            className="flex rounded-xl p-1 shadow-sm"
            style={{
              border: '1px solid rgb(var(--s-600))',
              background: 'rgb(var(--s-800))',
            }}
          >
            {(['all', 'image'] as KindFilter[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className="rounded-lg px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all"
                style={kind === k ? {
                  background: 'linear-gradient(135deg, #577E89 0%, #74A1B0 100%)',
                  color: '#0D0F15',
                  boxShadow: '0 2px 8px rgba(87,126,137,0.25)',
                } : {
                  color: 'rgb(var(--n-500))',
                }}
              >
                {k === 'all' ? 'All Media' : 'Photos'}
              </button>
            ))}
          </div>

          {/* Device filter */}
          <select
            value={String(deviceId)}
            onChange={(e) => setDeviceId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-xl px-3 py-1.5 text-[11px] font-medium outline-none transition-all shadow-sm"
            style={{
              border: '1px solid rgb(var(--s-600))',
              background: 'rgb(var(--s-800))',
              color: 'rgb(var(--n-300))',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(87,126,137,0.5)' }}
            onBlur={e => { e.target.style.borderColor = 'rgb(var(--s-600))' }}
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

      {/* ── Cloud Stats Bar ─────────────────────────────────────────── */}
      <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Storage Used', value: `${Math.round(all.reduce((acc, f) => acc + f.item.sizeMb, 0))}`, unit: 'MB',  icon: Save, accent: '#38bdf8' },
          { label: 'Total Objects', value: all.length,  unit: 'Items', icon: Package, accent: '#a78bfa' },
          { label: 'Sync Status',   value: '100',       unit: '%',     icon: Cloud,  accent: '#34d399' },
          { label: 'AWS Region',    value: 'AP-SOUTH-1',unit: '',      icon: Globe, accent: '#577E89' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-4 transition-all"
            style={{
              borderColor: 'rgb(var(--s-600))',
              background: 'rgb(var(--s-800))',
              boxShadow: 'var(--shadow-card)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = stat.accent + '50'
              ;(e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-card-hover), 0 0 20px ${stat.accent}15`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--s-600))'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm"><stat.icon size={16} /></span>
              <span
                className="text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: 'rgb(var(--n-500))' }}
              >
                {stat.label}
              </span>
            </div>
            <div className="text-xl font-bold font-display" style={{ color: stat.accent }}>
              {stat.value}{' '}
              <span
                className="text-[10px] font-medium uppercase tracking-tight"
                style={{ color: 'rgb(var(--n-500))' }}
              >
                {stat.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Media Grid ──────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed text-center"
          style={{ borderColor: 'rgb(var(--s-500))', background: 'rgb(var(--s-700) / 0.4)' }}
        >
          <FolderOpen className="mb-3 mx-auto" size={30} />
          <p className="text-[12px] font-semibold" style={{ color: 'rgb(var(--n-500))' }}>
            No media matches the current filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((f) => (
            <div
              key={f.item.id}
              className="group overflow-hidden rounded-2xl border transition-all duration-200"
              style={{
                borderColor: 'rgb(var(--s-600))',
                background: 'rgb(var(--s-800))',
                boxShadow: 'var(--shadow-card)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card-hover)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(87,126,137,0.35)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--s-600))'
              }}
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
                <div
                  className="truncate text-sm font-semibold"
                  style={{ color: 'rgb(var(--fg))' }}
                >
                  {f.item.label}
                </div>
                <div
                  className="text-[10px] font-medium mt-0.5"
                  style={{ color: 'rgb(var(--n-500))' }}
                >
                  {f.deviceName} · {f.item.capturedAt}
                </div>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        background: 'rgba(167,139,250,0.1)',
                        color: '#a78bfa',
                        border: '1px solid rgba(167,139,250,0.2)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div
                  className="mt-2.5 flex items-center justify-between pt-2.5"
                  style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                >
                  <span className="text-[10px] font-medium" style={{ color: 'rgb(var(--n-600))' }}>
                    Image · {f.item.sizeMb} MB
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => download(f)}
                        className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all"
                        style={{
                          border: '1px solid rgb(var(--s-500))',
                          background: 'transparent',
                          color: 'rgb(var(--n-400))',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#38bdf8'
                          ;(e.currentTarget as HTMLElement).style.color = '#38bdf8'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--s-500))'
                          ;(e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-400))'
                        }}
                      >
                        ↓ Save
                      </button>
                      <button
                        onClick={() => {
                          onDeleteCapture(f.deviceId, f.item.id)
                          flash('Capture deleted.')
                        }}
                        className="rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all"
                        style={{
                          border: '1px solid rgb(var(--s-500))',
                          background: 'transparent',
                          color: 'rgb(var(--n-400))',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#f87171'
                          ;(e.currentTarget as HTMLElement).style.color = '#f87171'
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--s-500))'
                          ;(e.currentTarget as HTMLElement).style.color = 'rgb(var(--n-400))'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fadeIn rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xl"
          style={{
            background: 'rgb(var(--s-700))',
            color: 'rgb(var(--n-200))',
            border: '1px solid rgb(var(--s-500))',
            boxShadow: 'var(--shadow-card-hover)',
          }}
        >
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
