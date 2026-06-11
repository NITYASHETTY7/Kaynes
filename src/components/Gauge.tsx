// Semi-circular gauge (pure SVG, no deps). Used for battery / utilisation.
import { motion } from 'framer-motion';
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
  const circumference = Math.PI * radius // semicircle
  const dash = (v / 100) * circumference
  const stroke = color ?? autoColor(v)

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="104" viewBox="0 0 180 104">
        <defs>
          <filter id="glow-gauge">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 20 96 A 70 70 0 0 1 160 96"
          fill="none"
          stroke="currentColor"
          className="text-white/10"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <motion.path
          d="M 20 96 A 70 70 0 0 1 160 96"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${dash} ${circumference}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter="url(#glow-gauge)"
        />
        <text
          x="90"
          y="86"
          textAnchor="middle"
          fontSize="30"
          fontWeight="700"
          fill="rgb(var(--fg))"
        >
          {v}%
        </text>
      </svg>
      {label && <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>}
      {sublabel && <div className="text-[11px] text-slate-500">{sublabel}</div>}
    </div>
  )
}
