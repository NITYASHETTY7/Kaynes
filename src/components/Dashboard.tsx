import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Gauge from './Gauge';
import CloudBridge from './CloudBridge';

/* ── KPI config ────────────────────────────────────────────────────────── */
const KPI_META = {
  cyan:   { accent: '#38bdf8', glow: 'rgba(56,189,248,0.15)',  icon: '📦' },
  teal:   { accent: '#2dd4bf', glow: 'rgba(45,212,191,0.15)',  icon: '🏭' },
  green:  { accent: '#34d399', glow: 'rgba(52,211,153,0.15)',  icon: '📡' },
  red:    { accent: '#f87171', glow: 'rgba(248,113,113,0.2)',   icon: '⚠' },
  violet: { accent: '#a78bfa', glow: 'rgba(167,139,250,0.15)', icon: '🧠' },
}

/* ── Trend arrow ─────────────────────────────────────────────────────────── */
function TrendBadge({ value, label }: { value: number; label: string }) {
  const positive = value > 0
  return (
    <div className="flex items-center gap-0.5">
      <span className={`text-[9px] font-semibold ${positive ? 'text-emerald-500' : 'text-slate-400'}`}>
        {positive ? '↑' : '—'} {label}
      </span>
    </div>
  )
}

/* ── Section card wrapper ──────────────────────────────────────────────── */
function SectionCard({
  accentColor = '#FF9900',
  children,
  className = '',
}: {
  accentColor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${className}`}
      style={{
        background: 'rgb(var(--s-800))',
        borderColor: 'rgb(var(--s-600))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)` }}
      />
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard({ onNavigate }: { onNavigate: (tab: string, param?: any) => void }) {
  const { assets, plants, devices, notifications, aiResults } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats calculation
  const totalAssets     = assets.length;
  const totalPlants     = plants.length;
  const activeDevices   = devices.filter(d => d.status !== 'offline').length;
  const criticalAlerts  = notifications.filter(n => !n.acknowledged && n.severity === 'critical').length;
  const totalPredictions= aiResults.length;

  // Recent predictions
  const recentPredictions = useMemo(() => aiResults.slice(0, 5), [aiResults]);

  // Solder defect rate simulation
  const defectRate = useMemo(() => {
    if (aiResults.length === 0) return 0;
    const defects = aiResults.filter(r => r.defectDetected).length;
    return Math.round((defects / aiResults.length) * 100);
  }, [aiResults]);

  // Filtered assets for quick look
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchQuery, statusFilter]);

  const kpis = [
    { label: 'Total Assets',     value: totalAssets,     sub: 'Active',     color: 'cyan'   as const, route: 'assets'      },
    { label: 'Plant Sites',      value: totalPlants,     sub: 'Sites',      color: 'teal'   as const, route: 'plants'      },
    { label: 'Active Devices',   value: activeDevices,   sub: 'Online',     color: 'green'  as const, route: 'fleet'       },
    { label: 'Critical Alerts',  value: criticalAlerts,  sub: 'Pending',    color: 'red'    as const, route: 'alerts',     pulse: criticalAlerts > 0 },
    { label: 'AI Predictions',   value: totalPredictions,sub: 'Inferences', color: 'violet' as const, route: 'ai-pipeline' },
  ]

  return (
    <div
      className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 relative font-sans"
      style={{ background: 'rgb(var(--s-base))' }}
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,153,0,0.04) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)' }} />

      {/* ── Title block ─────────────────────────────────────────────────── */}
      <div className="relative mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
              style={{ background: 'rgba(255,153,0,0.1)', color: '#FF9900', border: '1px solid rgba(255,153,0,0.2)' }}
            >
              Live Operations
            </span>
            <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-emerald-500">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                style={{ boxShadow: '0 0 6px #10b981' }}
              />
              Global Fleet Nominal
            </span>
          </div>
          <h1 className="text-xl font-bold font-display tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
            Operations Command Dashboard
          </h1>
          <p className="text-[11px] font-medium mt-1" style={{ color: 'rgb(var(--n-500))' }}>
            Real-time telemetry · AWS AP-SOUTH-1 ·{' '}
            <span style={{ color: 'rgb(var(--n-400))' }} className="font-mono">
              {new Date().toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[11px] font-medium transition-all hover:scale-[1.02]"
            style={{
              borderColor: 'rgb(var(--s-500))',
              background: 'rgb(var(--s-800))',
              color: 'rgb(var(--n-300))',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Generate Report
          </button>
          <button
            onClick={() => onNavigate('ai-pipeline')}
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-[11px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
              color: '#0D0F15',
              boxShadow: '0 4px 14px rgba(255,153,0,0.3)',
            }}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Run AI Inference
          </button>
        </div>
      </div>

      {/* ── AWS Cloud Bridge ─────────────────────────────────────────────── */}
      <div className="relative mb-7">
        <CloudBridge />
      </div>

      {/* ── KPI Grid ──────────────────────────────────────────────────────── */}
      <div className="relative mb-7 grid grid-cols-2 gap-4 md:grid-cols-5">
        {kpis.map((kpi) => {
          const meta = KPI_META[kpi.color]
          return (
            <button
              key={kpi.label}
              onClick={() => onNavigate(kpi.route)}
              className="group relative flex flex-col text-left rounded-2xl border p-5 transition-all duration-200
                hover:-translate-y-1 overflow-hidden"
              style={{
                background: 'rgb(var(--s-800))',
                borderColor: 'rgb(var(--s-600))',
                boxShadow: 'var(--shadow-card)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `var(--shadow-card-hover), 0 0 24px ${meta.glow}`
                ;(e.currentTarget as HTMLElement).style.borderColor = meta.accent + '60'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgb(var(--s-600))'
              }}
            >
              {/* Accent top line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${meta.accent} 0%, transparent 100%)` }}
              />

              {/* Background circle glow */}
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-30 transition-opacity group-hover:opacity-60"
                style={{ background: `radial-gradient(circle, ${meta.accent} 0%, transparent 70%)` }}
              />

              <span className="text-[9px] font-semibold uppercase tracking-widest mb-3 relative z-10"
                style={{ color: 'rgb(var(--n-500))' }}>
                {kpi.label}
              </span>

              <div className="flex items-end justify-between w-full relative z-10">
                <span
                  className={`text-3xl font-bold font-display tracking-tight leading-none ${kpi.pulse ? 'animate-pulseRing' : ''}`}
                  style={{ color: meta.accent }}
                >
                  {kpi.value}
                </span>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-semibold uppercase tracking-widest"
                    style={{ color: 'rgb(var(--n-500))' }}>
                    {kpi.sub}
                  </span>
                  <TrendBadge value={kpi.value} label="Active" />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Main Panel Split ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Left/Center: Analytics & Assets */}
        <div className="space-y-6 lg:col-span-2">

          {/* AI Inference Health */}
          <SectionCard accentColor="#a78bfa">
            <div className="p-6">
              <h2 className="k-section-title mb-6">AI Inference Health</h2>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-4 lg:grid-cols-2">

                <div className="flex flex-col items-center justify-center xl:col-span-1 lg:col-span-1">
                  <div className="h-28 w-28 relative">
                    <Gauge value={100 - defectRate} color="rgb(var(--argo-orange, 255 153 0))" />
                  </div>
                  <span className="mt-3 text-[11px] font-semibold text-center" style={{ color: 'rgb(var(--fg))' }}>
                    Defect-Free Rate
                  </span>
                  <span className="text-[9px] font-medium mt-0.5" style={{ color: 'rgb(var(--n-500))' }}>
                    Inference pipeline
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center xl:col-span-1 lg:col-span-1">
                  <div className="h-28 w-28 relative">
                    <Gauge
                      value={activeDevices > 0 ? Math.round((devices.filter(d => d.status === 'online').length / devices.length) * 100) : 100}
                      color="#34d399"
                    />
                  </div>
                  <span className="mt-3 text-[11px] font-semibold text-center" style={{ color: 'rgb(var(--fg))' }}>
                    Device Availability
                  </span>
                  <span className="text-[9px] font-medium mt-0.5" style={{ color: 'rgb(var(--n-500))' }}>
                    Online glasses ratio
                  </span>
                </div>

                <div
                  className="flex flex-col justify-center xl:col-span-2 lg:col-span-2 xl:pl-5 xl:border-l xl:border-t-0 lg:border-t lg:pt-5"
                  style={{ borderColor: 'rgb(var(--s-600))' }}
                >
                  <h3 className="k-section-title mb-4">Anomaly Severity Distribution</h3>
                  <div className="space-y-4">
                    {/* Critical */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: 'rgb(var(--n-400))' }}>Critical Assets</span>
                        <span className="text-[11px] font-bold text-rose-500">
                          {assets.filter(a => a.status === 'critical').length} assets
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgb(var(--s-700))' }}>
                        <div
                          className="h-full rounded-full bg-rose-500 transition-all"
                          style={{ width: `${(assets.filter(a => a.status === 'critical').length / (assets.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Warning */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: 'rgb(var(--n-400))' }}>Warning States</span>
                        <span className="text-[11px] font-bold text-amber-500">
                          {assets.filter(a => a.status === 'warning').length} assets
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgb(var(--s-700))' }}>
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all"
                          style={{ width: `${(assets.filter(a => a.status === 'warning').length / (assets.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Healthy */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium" style={{ color: 'rgb(var(--n-400))' }}>Healthy Assets</span>
                        <span className="text-[11px] font-bold text-emerald-500">
                          {assets.filter(a => a.status === 'healthy').length} assets
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgb(var(--s-700))' }}>
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all"
                          style={{ width: `${(assets.filter(a => a.status === 'healthy').length / (assets.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </SectionCard>

          {/* Industrial Assets Watch */}
          <SectionCard accentColor="#38bdf8">
            <div className="p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="k-section-title">Industrial Assets Watch</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                      style={{ color: 'rgb(var(--n-500))' }}
                      fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search assets…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-lg border pl-9 pr-3 py-1.5 text-[11px] font-medium outline-none transition-all"
                      style={{
                        borderColor: 'rgb(var(--s-600))',
                        background: 'rgb(var(--s-700))',
                        color: 'rgb(var(--n-200))',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(255,153,0,0.5)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255,153,0,0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'rgb(var(--s-600))';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border px-3 py-1.5 text-[11px] font-medium outline-none transition-all"
                    style={{
                      borderColor: 'rgb(var(--s-600))',
                      background: 'rgb(var(--s-700))',
                      color: 'rgb(var(--n-300))',
                    }}
                  >
                    <option value="all">All States</option>
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                      {['Asset Name', 'Plant', 'Health Score', 'Status', 'Actions'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[9px] font-semibold uppercase tracking-widest ${i === 2 ? 'text-center' : i === 4 ? 'text-right' : ''}`}
                          style={{ color: 'rgb(var(--n-500))' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[11px] font-medium" style={{ color: 'rgb(var(--n-500))' }}>
                          No assets match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset, idx) => (
                        <tr
                          key={asset.id}
                          className="transition-colors group"
                          style={{
                            borderBottom: '1px solid rgb(var(--s-600))',
                            background: idx % 2 === 0 ? 'transparent' : 'rgb(var(--s-700) / 0.35)',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700) / 0.7)')}
                          onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgb(var(--s-700) / 0.35)')}
                        >
                          <td className="px-4 py-3.5 font-semibold" style={{ color: 'rgb(var(--fg))' }}>
                            {asset.name}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-[10px] uppercase tracking-tight" style={{ color: 'rgb(var(--n-400))' }}>
                            {plants.find(p => p.id === asset.plantId)?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-semibold ${
                              asset.healthScore > 85
                                ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                                : asset.healthScore > 60
                                ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
                            }`}>
                              {asset.healthScore}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full shrink-0 ${
                                asset.status === 'healthy' ? 'bg-emerald-500' :
                                asset.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{
                                boxShadow: asset.status === 'healthy' ? '0 0 6px #10b981' :
                                           asset.status === 'warning'  ? '0 0 6px #f59e0b' : '0 0 6px #ef4444'
                              }}
                              />
                              <span className="capitalize text-[11px] font-medium" style={{ color: 'rgb(var(--n-300))' }}>
                                {asset.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => onNavigate('assets', asset.id)}
                              className="text-[10px] font-semibold transition-all hover:underline"
                              style={{ color: '#FF9900' }}
                            >
                              View Details →
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Real-time Streams */}
        <div className="space-y-6">

          {/* Live AI Inference Stream */}
          <SectionCard accentColor="#a78bfa">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="k-section-title">Live AI Inference</h2>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-blink"
                    style={{ boxShadow: '0 0 6px #ef4444' }} />
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-rose-500">
                    Live
                  </span>
                </span>
              </div>
              <div className="space-y-3">
                {recentPredictions.length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed text-center"
                    style={{ borderColor: 'rgb(var(--s-600))', background: 'rgb(var(--s-700) / 0.4)' }}
                  >
                    <p className="text-[10px] font-medium" style={{ color: 'rgb(var(--n-500))' }}>
                      Awaiting inference stream…
                    </p>
                  </div>
                ) : (
                  recentPredictions.map(res => (
                    <div
                      key={res.id}
                      className="rounded-xl border p-4 transition-all"
                      style={{
                        background: 'rgb(var(--s-700) / 0.5)',
                        borderColor: 'rgb(var(--s-600))',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold" style={{ color: 'rgb(var(--fg))' }}>
                          {res.classification}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${
                          res.severity === 'critical' ? 'bg-rose-500/15 text-rose-500 ring-1 ring-rose-500/25' :
                          res.severity === 'warning'  ? 'bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/25' :
                                                        'bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/25'
                        }`}>
                          {res.severity}
                        </span>
                      </div>
                      <p className="text-[10px] line-clamp-2 leading-relaxed font-medium mb-2.5"
                        style={{ color: 'rgb(var(--n-500))' }}>
                        {res.recommendation}
                      </p>
                      <div className="flex items-center justify-between text-[9px] font-medium"
                        style={{ color: 'rgb(var(--n-600))' }}>
                        <span>Conf: <span style={{ color: 'rgb(var(--n-300))' }}>{res.confidence}%</span></span>
                        <span>Score: <span style={{ color: 'rgb(var(--n-300))' }}>{res.healthScore}</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => onNavigate('ai-pipeline')}
                className="w-full mt-4 py-2.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wider transition-all hover:scale-[1.01]"
                style={{
                  borderColor: 'rgb(var(--s-500))',
                  background: 'rgb(var(--s-700))',
                  color: '#a78bfa',
                }}
              >
                Open AI Studio →
              </button>
            </div>
          </SectionCard>

          {/* Operational Alerts */}
          <SectionCard accentColor="#f87171">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="k-section-title">Operational Alerts</h2>
                <button
                  onClick={() => onNavigate('alerts')}
                  className="text-[10px] font-semibold uppercase tracking-widest hover:underline"
                  style={{ color: '#FF9900' }}
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {notifications.filter(n => !n.acknowledged).slice(0, 4).length === 0 ? (
                  <div
                    className="flex flex-col items-center justify-center py-6 rounded-xl border border-dashed text-center"
                    style={{ borderColor: 'rgb(var(--s-600))', background: 'rgb(var(--s-700) / 0.4)' }}
                  >
                    <span className="text-emerald-500 text-lg mb-1">✓</span>
                    <p className="text-[10px] font-medium text-emerald-500">All systems nominal</p>
                  </div>
                ) : (
                  notifications.filter(n => !n.acknowledged).slice(0, 4).map(notif => (
                    <div
                      key={notif.id}
                      className="rounded-xl pl-4 pr-3 py-3 border-l-2"
                      style={{
                        borderLeftColor: notif.severity === 'critical' ? '#f87171' : '#fbbf24',
                        background: notif.severity === 'critical'
                          ? 'rgba(248,113,113,0.05)'
                          : 'rgba(251,191,36,0.05)',
                        border: `1px solid ${notif.severity === 'critical' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)'}`,
                        borderLeft: `2px solid ${notif.severity === 'critical' ? '#f87171' : '#fbbf24'}`,
                      }}
                    >
                      <h3 className="text-[11px] font-semibold leading-tight mb-1 uppercase tracking-tight"
                        style={{ color: 'rgb(var(--fg))' }}>
                        {notif.title}
                      </h3>
                      <p className="text-[10px] leading-normal font-medium" style={{ color: 'rgb(var(--n-500))' }}>
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
