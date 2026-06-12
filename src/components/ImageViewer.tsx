import { type MediaItem } from '../data/devices'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'

interface Props {
  isOpen: boolean
  item: MediaItem | null
  deviceName: string
  serial?: string
  onClose: () => void
}

export default function ImageViewer({ isOpen, item, deviceName, serial, onClose }: Props) {
  if (!isOpen || !item) return null

  // If item has a valid URL (like a blob or Supabase URL), use it. 
  // Otherwise, fallback to the deterministic image generator or sample video.
  let mediaUrl = (item as any).url;
  if (!mediaUrl || mediaUrl.startsWith('blob:') && item.kind === 'video') {
    if (item.kind === 'video') {
      mediaUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    } else {
      mediaUrl = getDeviceImageUrl(serial || deviceName, item.seed, item.label);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative flex w-full max-h-[90vh] max-w-4xl flex-col rounded-lg bg-ink-900 shadow-2xl animate-fadeIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-700 p-4 bg-ink-900">
          <div>
            <h3 className="font-semibold text-fg">{item.label}</h3>
            <p className="text-sm text-slate-400">{deviceName} {serial ? `· ${serial}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-2 text-slate-400 hover:bg-ink-800 hover:text-fg"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

<<<<<<< Updated upstream
        {/* Image Content */}
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-2 min-h-[300px]">
          <img
            src={(item as any).url || getDeviceImageUrl(deviceName, item.seed, item.label)}
            alt={item.label}
            className="max-h-full max-w-full rounded object-contain"
          />
=======
        {/* Media Content */}
        <div className="flex flex-1 items-center justify-center overflow-hidden bg-black min-h-[300px]">
          {item.kind === 'image' ? (
            <img
              src={mediaUrl}
              alt={item.label}
              className="max-h-full max-w-full rounded object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-h-full max-w-full"
            />
          )}
>>>>>>> Stashed changes
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
            <div>
              <span className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Type</span>
              Photo (Still)
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
