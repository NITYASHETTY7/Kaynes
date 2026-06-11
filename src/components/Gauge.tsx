// Semi-circular gauge (pure SVG, no deps). Used for battery / utilisation.
interface GaugeProps {
  value: number // 0–100
  label?: string
  sublabel?: string
  color?: string // override (else auto by value)
}

function autoColor(v: number): string {
  if (v < 15) return '#ef4444'
  if (v < 35) return '#f59e0b'
  return '#10b981'
}

export default function Gauge({ value, label, sublabel, color }: GaugeProps) {
  const v = Math.max(0, Math.min(100, value))
  const radius = 70
  // Math.PI * radius is the length of a semi-circle
  const circumference = Math.PI * radius
  // To fill 50%, we need to stroke half of the semi-circle
  const dash = (v / 100) * circumference
  const stroke = color ?? autoColor(v)

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="104" viewBox="0 0 180 104">
        {/* Filled Background Area - ONLY IN DARK MODE */}
        <path
          d="M 20 96 A 70 70 0 0 1 160 96 Z"
          fill="none"
          className="dark:fill-[#185FA512]" 
        />
        {/* Background Arc */}
        <path
          d="M 20 96 A 70 70 0 0 1 160 96"
          fill="none"
          stroke="rgb(var(--s-600))"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Foreground Arc */}
        <path
          d="M 20 96 A 70 70 0 0 1 160 96"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
          className="dark:!stroke-[#185FA5]"
        />
        <text
          x="90"
          y="86"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="rgb(var(--fg))"
          className="dark:!fill-slate-200"
        >
          {v}%
        </text>
      </svg>
      {label && <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>}
      {sublabel && <div className="text-[11px] text-slate-500">{sublabel}</div>}
    </div>
  )
}
