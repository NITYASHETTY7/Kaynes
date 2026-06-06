import { useState } from 'react'
import { ORG_NAME } from '../data/devices'

export type Role = 'admin' | 'user'
export interface Session {
  role: Role
  name: string
}

interface Props {
  onLogin: (s: Session) => void
}

// Smart-glasses brand mark (two connected lenses) — drawn, so no asset needed.
function GlassesMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 48" className={className} fill="none">
      <circle cx="30" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
      <circle cx="90" cy="24" r="18" stroke="currentColor" strokeWidth="3" />
      <path d="M48 24h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 16 4 12M108 16l8-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="24" r="6" fill="currentColor" />
      <circle cx="90" cy="24" r="6" fill="currentColor" />
    </svg>
  )
}

// Decorative IoT node-mesh + ambient glow behind the card.
function Backdrop() {
  const nodes = [
    [12, 22], [22, 60], [34, 34], [46, 72], [58, 28],
    [70, 64], [82, 38], [90, 18], [66, 14], [40, 88],
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-argo-cyan/15 blur-3xl" />
      <div className="absolute -bottom-44 -right-40 h-[30rem] w-[30rem] rounded-full bg-argo-violet/15 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.5]" preserveAspectRatio="none">
        <defs>
          <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgb(var(--n-500) / 0.25)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
      {/* faint connection mesh */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {nodes.map(([x, y], i) => {
          const [nx, ny] = nodes[(i + 1) % nodes.length]
          return (
            <line
              key={i}
              x1={x} y1={y} x2={nx} y2={ny}
              stroke="rgb(var(--argo-cyan) / 0.12)"
              strokeWidth="0.15"
            />
          )
        })}
        {nodes.map(([x, y], i) => (
          <circle
            key={`n${i}`}
            cx={x} cy={y} r="0.5"
            fill="rgb(var(--argo-cyan) / 0.5)"
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </svg>
    </div>
  )
}

// Mock auth only — no backend, no real credentials, no 2FA (per the POC plan).
// Admin unlocks rename / download / delete / OTA; User is read-only monitoring.
// Production swaps this for Amazon Cognito.
export default function Login({ onLogin }: Props) {
  const [role, setRole] = useState<Role>('admin')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    onLogin({ role, name: name.trim() || (role === 'admin' ? 'Fleet Admin' : 'Operator') })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-900 p-4">
      <Backdrop />

      <div className="relative z-10 grid w-full max-w-4xl animate-fadeIn overflow-hidden rounded-2xl border border-ink-600 shadow-2xl md:grid-cols-2">
        {/* ── Brand hero panel ───────────────────────────── */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-argo-cyan to-argo-violet p-8 text-white md:flex">
          {/* subtle inner texture */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>

          <div className="relative">
            <GlassesMark className="h-12 w-28 text-white" />
            <h1 className="mt-6 text-2xl font-bold leading-tight">
              Argo Glasses
              <br />
              IoT Fleet Console
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              Centralised monitoring for the connected smart-glasses fleet — telemetry,
              captured media and operational alerts in one place.
            </p>
          </div>

          <ul className="relative space-y-3 text-sm text-white/90">
            {[
              ['🛰', 'Live device fleet & telemetry'],
              ['🖼', 'Captured media for AI/ML training'],
              ['🔔', 'Battery, storage & health alerts'],
            ].map(([icon, label]) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                  {icon}
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="relative text-xs text-white/70">
            Powered by <span className="font-semibold text-white">{ORG_NAME}</span>
          </div>
        </div>

        {/* ── Form panel ─────────────────────────────────── */}
        <form onSubmit={submit} className="bg-ink-800 p-8">
          {/* compact brand for mobile (hero hidden there) */}
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-argo-cyan/15 text-argo-cyan">
              <GlassesMark className="h-5 w-12" />
            </span>
            <div>
              <h1 className="text-base font-semibold leading-tight text-fg">Argo Glasses</h1>
              <p className="text-[11px] leading-tight text-argo-cyan">IoT Fleet Console</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-fg">Welcome back</h2>
          <p className="mb-6 mt-1 text-xs leading-relaxed text-slate-400">
            Sign in to monitor the {ORG_NAME} Argo Glasses fleet.
          </p>

          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">
            Sign in as
          </label>
          <div className="mb-4 flex rounded-lg border border-ink-500 bg-ink-700 p-0.5">
            {(['admin', 'user'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  role === r ? 'bg-argo-cyan text-ink-900' : 'text-slate-400 hover:text-fg'
                }`}
              >
                {r === 'admin' ? 'Admin' : 'User'}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">
            Name <span className="text-slate-600">(optional)</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === 'admin' ? 'Fleet Admin' : 'Operator'}
            className="mb-3 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-argo-cyan"
          />

          <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-slate-500">
            Password <span className="text-slate-600">(mock — anything works)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mb-5 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-argo-cyan"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-argo-cyan py-2.5 text-sm font-semibold text-ink-900 transition-colors hover:brightness-110"
          >
            Enter console →
          </button>

          <p className="mt-4 text-center text-[10px] text-slate-600">
            POC · mock authentication · no data leaves the browser
          </p>
        </form>
      </div>
    </div>
  )
}
