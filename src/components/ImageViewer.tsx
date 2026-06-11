import { type MediaItem } from '../data/devices'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'

interface Props {
  isOpen: boolean
  item: MediaItem | null
  deviceName: string
  onClose: () => void
}

export default function ImageViewer({ isOpen, item, deviceName, onClose }: Props) {
  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative flex max-h-[90vh] max-w-4xl flex-col rounded-lg bg-ink-900 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-700 p-4">
          <div>
            <h3 className="font-semibold text-fg">{item.label}</h3>
            <p className="text-sm text-slate-400">{deviceName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-slate-400 hover:bg-ink-800 hover:text-fg"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Image Content */}
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-2 min-h-[300px]">
          {item.kind === 'image' ? (
            <img
              src={(item as any).url || getDeviceImageUrl(deviceName, item.seed, item.label)}
              alt={item.label}
              className="max-h-full max-w-full rounded object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 text-slate-400 py-12">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-4xl">▶</span>
              <div className="text-center">
                <span className="block text-sm font-medium text-slate-200">Video playback staged</span>
                <span className="text-xs">Referencing S3 bucket: kaynes-argo-media/{item.id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="border-t border-ink-700 bg-ink-800 p-4 text-xs text-slate-400">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Captured</span>
              {item.capturedAt}
            </div>
            <div>
              <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Size</span>
              {item.sizeMb} MB
            </div>
            {item.kind === 'video' && item.durationSec && (
              <div>
                <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Duration</span>
                {Math.floor(item.durationSec / 60)}:{String(item.durationSec % 60).padStart(2, '0')}
              </div>
            )}
            <div>
              <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Type</span>
              {item.kind === 'image' ? 'Photo (Still)' : 'Video (Clip)'}
            </div>
          </div>
          {item.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span key={t} className="rounded bg-argo-violet/20 px-2 py-1 text-argo-violet border border-argo-violet/30">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
