// Tiny inline area sparkline (pure SVG) for historical telemetry.
import { motion } from 'framer-motion'
interface SparklineProps {
  data: number[] // values 0–100
  width?: number
  height?: number
  color?: string
}

export default function Sparkline({
  data,
  width = 220,
  height = 56,
  color = '#22d3ee',
}: SparklineProps) {
  if (data.length === 0) return null
  const max = 100
  const min = 0
  const stepX = width / (data.length - 1)
  const pts = data.map((d, i) => {
    const x = i * stepX
    const y = height - ((d - min) / (max - min)) * height
    return [x, y] as const
  })
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `0,${height} ${line} ${width},${height}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block w-full">
      <defs>
        <filter id="glow-sparkline">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon 
        points={area} 
        fill="url(#spark-fill)" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      />
      <motion.polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-sparkline)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  )
}
