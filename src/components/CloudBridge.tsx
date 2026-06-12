import { useEffect, useState } from 'react'

interface CloudService {
  name: string
  status: 'online' | 'syncing' | 'offline'
  uptime: string
  latency: string
  region: string
  description: string
  icon: string
  accentColor: string
}

/* ── AWS cloud SVG icon ─────────────────────────────────────────────────── */
function CloudIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 40 28" fill="none">
      <path
        d="M32.5 11.5C32.5 11.5 32 7 27 7C22.5 7 21 10 21 10C21 10 19.5 8 16.5 8C12 8 10 12 10 12C10 12 6 12.5 6 17C6 21 9 22 9 22H32.5C32.5 22 37 21 37 17C37 13.5 34 11.5 32.5 11.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export default function CloudBridge() {
  const [services, setServices] = useState<CloudService[]>([
    {
      name: 'AWS IoT Core',
      status: 'online',
      uptime: '99.99%',
      latency: '18ms',
      region: 'ap-south-1',
      description: 'MQTT telemetry ingestion & device shadow management',
      icon: '📡',
      accentColor: '#FF9900',
    },
    {
      name: 'Amazon S3',
      status: 'online',
      uptime: '100%',
      latency: '45ms',
      region: 'ap-south-1',
      description: 'Secure media storage for ML training datasets',
      icon: '🗄',
      accentColor: '#38bdf8',
    },
    {
      name: 'AWS SageMaker',
      status: 'online',
      uptime: '99.95%',
      latency: '120ms',
      region: 'ap-south-1',
      description: 'Real-time inference & automated model retraining',
      icon: '🧠',
      accentColor: '#a78bfa',
    },
    {
      name: 'AWS Lambda',
      status: 'online',
      uptime: '100%',
      latency: '5ms',
      region: 'ap-south-1',
      description: 'Serverless event processing & SNS notifications',
      icon: '⚡',
      accentColor: '#34d399',
    },
  ])

  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString().toLowerCase())

  useEffect(() => {
    const interval = setInterval(() => {
      setLastSync(new Date().toLocaleTimeString().toLowerCase())
      // Randomly toggle status for visual effect
      setServices(prev => prev.map(s => {
        if (s.name === 'Amazon S3' || s.name === 'AWS IoT Core') {
          return { ...s, status: Math.random() > 0.8 ? 'syncing' : 'online' }
        }
        return s
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const onlineCount = services.filter(s => s.status === 'online' || s.status === 'syncing').length

  return (
    <div
      className="relative overflow-hidden rounded-2xl border transition-all duration-200"
      style={{
        background: 'rgb(var(--s-800))',
        borderColor: 'rgb(var(--s-600))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top accent — AWS orange */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, #FF9900 0%, #38bdf8 60%, transparent 100%)' }}
      />

      {/* Decorative glow */}
      <div
        className="absolute top-0 right-0 w-80 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(255,153,0,0.04) 0%, transparent 60%)' }}
      />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 pt-5 pb-4 border-b"
        style={{ borderColor: 'rgb(var(--s-600))' }}
      >
        <div className="flex items-center gap-3">
          {/* AWS-style cloud icon */}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.2)' }}
          >
            <CloudIcon className="h-5 w-5" style={{ color: '#FF9900' }} />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold font-display tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
              AWS Cloud Infrastructure Bridge
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
                Production Target Architecture
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(255,153,0,0.1)', color: '#FF9900', border: '1px solid rgba(255,153,0,0.2)' }}
              >
                AP-SOUTH-1
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500"
              style={{ boxShadow: '0 0 8px rgba(16,185,129,0.6)' }}
            />
            <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">
              {onlineCount}/{services.length} Online
            </span>
          </div>
          <div className="text-[9px] font-medium mt-1" style={{ color: 'rgb(var(--n-600))' }}>
            Last sync: <span className="font-mono">{lastSync}</span>
          </div>
        </div>
      </div>

      {/* ── Service Cards Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <div
            key={s.name}
            className="group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 cursor-default"
            style={{
              borderColor: 'rgb(var(--s-600))',
              background: 'rgb(var(--s-700) / 0.5)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = s.accentColor + '50'
              el.style.background = 'rgb(var(--s-700))'
              el.style.boxShadow = `0 0 20px ${s.accentColor}18`
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'rgb(var(--s-600))'
              el.style.background = 'rgb(var(--s-700) / 0.5)'
              el.style.boxShadow = ''
            }}
          >
            {/* Card accent top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-60"
              style={{ background: s.accentColor }}
            />

            {/* Background glow blob */}
            <div
              className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{ background: s.accentColor }}
            />

            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: s.accentColor + '18', border: `1px solid ${s.accentColor}28` }}
                >
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <div
                    className="truncate text-[11px] font-semibold"
                    style={{ color: 'rgb(var(--fg))' }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="text-[8px] font-medium mt-0.5 uppercase tracking-widest font-mono"
                    style={{ color: 'rgb(var(--n-600))' }}
                  >
                    {s.region}
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider shrink-0 ${
                s.status === 'online'  ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' :
                s.status === 'syncing' ? 'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20' :
                                         'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/20'
              }`}>
                {s.status === 'syncing' && (
                  <span className="h-1 w-1 animate-ping rounded-full bg-sky-400 shrink-0" />
                )}
                {s.status}
              </div>
            </div>

            {/* Description */}
            <p className="text-[9px] leading-relaxed font-medium mb-3 line-clamp-2" style={{ color: 'rgb(var(--n-500))' }}>
              {s.description}
            </p>

            {/* Stats row */}
            <div
              className="grid grid-cols-2 gap-2 pt-3 border-t"
              style={{ borderColor: 'rgb(var(--s-600))' }}
            >
              <div>
                <span className="block text-[8px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgb(var(--n-600))' }}>
                  Availability
                </span>
                <span className="text-[11px] font-bold" style={{ color: s.accentColor }}>
                  {s.uptime}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[8px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgb(var(--n-600))' }}>
                  Latency
                </span>
                <span className="text-[11px] font-bold" style={{ color: s.accentColor }}>
                  {s.latency}
                </span>
              </div>
            </div>

            {/* Syncing progress bar */}
            {s.status === 'syncing' && (
              <div
                className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden rounded-b-xl"
                style={{ background: 'rgba(56,189,248,0.1)' }}
              >
                <div
                  className="h-full animate-shimmer"
                  style={{
                    width: '35%',
                    background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 pb-5 pt-1"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold shrink-0"
            style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}
          >
            i
          </div>
          <p className="text-[10px] font-medium" style={{ color: 'rgb(var(--n-500))' }}>
            Staging for Phase-2 migration to AWS native services as per SOW section 4.1.
          </p>
        </div>
        <button
          className="shrink-0 text-[10px] font-semibold uppercase tracking-widest transition-colors hover:underline"
          style={{ color: '#FF9900' }}
        >
          View Architecture →
        </button>
      </div>
    </div>
  )
}
