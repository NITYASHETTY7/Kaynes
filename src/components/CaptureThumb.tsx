import { useState } from 'react'
import { type MediaItem } from '../data/devices'
import { getDeviceImageUrl } from '../lib/deviceImageMapper'

interface Props {
  item: MediaItem
  serial?: string
  deviceName?: string
  className?: string
  onImageClick?: () => void
  onImageError?: () => void
}

export default function CaptureThumb({ 
  item, 
  serial, 
  deviceName = 'Device',
  className,
  onImageClick,
  onImageError
}: Props) {
  const [imageError, setImageError] = useState(false)
  
  // Get real image URL based on device type and seed, or use Supabase URL if available
  const imageUrl = (item as any).url || getDeviceImageUrl(serial || deviceName, item.seed, item.label)

  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-black group cursor-pointer transition-transform hover:scale-105 ${className ?? ''}`}
      onClick={onImageClick}
    >
      {/* Real image or fallback */}
      <img
        src={imageUrl}
        alt={item.label}
        className="h-full w-full object-cover"
        onError={() => {
          setImageError(true);
          onImageError?.();
        }}
        loading="lazy"
      />
      
      {/* Loading/Error overlay */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-700 to-black">
          <span className="text-center text-[10px] text-slate-400">Image unavailable</span>
        </div>
      )}

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* REC / timestamp HUD */}
      <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/90">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> 
        'STILL'
      </div>
      
      {serial && (
        <div className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
          {serial}
        </div>
      )}
      
<<<<<<< Updated upstream

=======
      {item.kind === 'video' && item.durationSec != null && (
        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
          {Math.floor(item.durationSec / 60)}:{String(item.durationSec % 60).padStart(2, '0')}
        </div>
      )}
>>>>>>> Stashed changes
      
      {/* Label on hover (image) */}
      {item.kind === 'image' && (
        <div className="absolute bottom-0 left-0 right-0 px-2 py-2 text-[9px] text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.label}
        </div>
      )}
    </div>
  )
}
