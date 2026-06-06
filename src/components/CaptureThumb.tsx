import { type MediaItem } from '../data/devices'

// Procedural "smart-glasses capture" thumbnail. There are no binary image
// assets in this POC (and no S3 yet) — each frame is drawn from the item's
// seed so it's deterministic, offline-safe, and looks like real POV footage
// with a heads-up overlay. Production swaps this for the S3/CloudFront image.

function hashHue(seed: number, salt: number): number {
  return Math.abs((seed * 2654435761 + salt * 40503) % 360)
}

interface Props {
  item: MediaItem
  serial?: string
  className?: string
}

export default function CaptureThumb({ item, serial, className }: Props) {
  const h1 = hashHue(item.seed, 1)
  const h2 = (h1 + 40) % 360
  const gid = `cap-${item.id}`
  // Pseudo "machinery" rectangles placed from the seed.
  const rng = (n: number) => Math.abs(Math.sin(item.seed * (n + 1)))
  const shapes = Array.from({ length: 5 }, (_, i) => ({
    x: 8 + rng(i) * 70,
    y: 14 + rng(i + 10) * 50,
    w: 12 + rng(i + 20) * 34,
    h: 8 + rng(i + 30) * 26,
    o: 0.12 + rng(i + 40) * 0.22,
  }))

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black ${className ?? ''}`}>
      <svg viewBox="0 0 160 110" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${h1} 45% 22%)`} />
            <stop offset="100%" stopColor={`hsl(${h2} 50% 10%)`} />
          </linearGradient>
        </defs>
        <rect width="160" height="110" fill={`url(#${gid})`} />
        {/* faux machinery / workpiece blocks */}
        {shapes.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx="2"
            fill="white"
            opacity={s.o}
          />
        ))}
        {/* scanline sheen */}
        <rect width="160" height="110" fill="url(#scan)" opacity="0.04" />
        {/* HUD corner ticks */}
        <g stroke={`hsl(${h1} 80% 70%)`} strokeWidth="1.4" opacity="0.85" fill="none">
          <path d="M8 8 h10 M8 8 v10" />
          <path d="M152 8 h-10 M152 8 v10" />
          <path d="M8 102 h10 M8 102 v-10" />
          <path d="M152 102 h-10 M152 102 v-10" />
        </g>
        {/* center reticle for image captures */}
        {item.kind === 'image' && (
          <g stroke={`hsl(${h1} 80% 75%)`} strokeWidth="1" opacity="0.5" fill="none">
            <circle cx="80" cy="55" r="9" />
            <path d="M80 42 v6 M80 62 v6 M67 55 h6 M87 55 h6" />
          </g>
        )}
      </svg>

      {/* REC / timestamp HUD */}
      <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] text-white/90">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {item.kind === 'video' ? 'CLIP' : 'STILL'}
      </div>
      {serial && (
        <div className="absolute bottom-1.5 left-1.5 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
          {serial}
        </div>
      )}
      {item.kind === 'video' && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white">
              ▶
            </span>
          </div>
          {item.durationSec != null && (
            <div className="absolute bottom-1.5 right-1.5 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] text-white/80">
              {Math.floor(item.durationSec / 60)}:{String(item.durationSec % 60).padStart(2, '0')}
            </div>
          )}
        </>
      )}
    </div>
  )
}
