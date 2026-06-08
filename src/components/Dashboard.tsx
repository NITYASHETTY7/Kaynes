import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Gauge from './Gauge';

export default function Dashboard({ onNavigate }: { onNavigate: (tab: string, param?: any) => void }) {
  const { assets, plants, devices, notifications, aiResults } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats calculation
  const totalAssets = assets.length;
  const totalPlants = plants.length;
  const activeDevices = devices.filter(d => d.status !== 'offline').length;
  const criticalAlerts = notifications.filter(n => !n.acknowledged && n.severity === 'critical').length;
  const totalPredictions = aiResults.length;

  // Recent predictions
  const recentPredictions = useMemo(() => {
    return aiResults.slice(0, 5);
  }, [aiResults]);

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

  return (
    <div className="h-full overflow-y-auto bg-ink-900 p-6 text-slate-200">
      {/* ── Title block ─────────────────────────────────── */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-fg">Operations Command Dashboard</h1>
          <p className="text-xs text-slate-400">Real-time predictive diagnostics and asset fleet telemetry.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={() => onNavigate('ai-pipeline')}
            className="rounded-lg bg-gradient-to-r from-argo-cyan to-argo-violet px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110"
          >
            🧠 Run AI Inference
          </button>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4 transition-all hover:border-argo-cyan/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Assets</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-fg">{totalAssets}</span>
            <span className="text-xs text-argo-cyan">Active</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4 transition-all hover:border-argo-cyan/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total Plants</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-fg">{totalPlants}</span>
            <span className="text-xs text-slate-400">Sites</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4 transition-all hover:border-argo-cyan/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Active Devices</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-fg">{activeDevices}</span>
            <span className="text-xs text-argo-green">Online</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4 transition-all hover:border-argo-red/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Critical Alerts</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-argo-red">{criticalAlerts}</span>
            <span className="text-xs text-argo-red animate-pulse">Pending</span>
          </div>
        </div>
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4 transition-all hover:border-argo-violet/40">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">AI Predictions</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-argo-violet">{totalPredictions}</span>
            <span className="text-xs text-slate-400">Inferences</span>
          </div>
        </div>
      </div>

      {/* ── Main Panel Split ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Analytics Gauges & AI Predictions (Left/Center Column) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Diagnostic Charts */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">AI Inference Health Insights</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center p-4">
                <div className="h-28 w-28">
                  <Gauge value={100 - defectRate} color="var(--argo-cyan)" />
                </div>
                <span className="mt-3 text-xs font-medium text-slate-300">Defect-Free Rate</span>
                <span className="text-[10px] text-slate-500">Inference pipeline status</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4">
                <div className="h-28 w-28">
                  <Gauge value={activeDevices > 0 ? Math.round((devices.filter(d=>d.status==='online').length / devices.length)*100) : 100} color="var(--argo-green)" />
                </div>
                <span className="mt-3 text-xs font-medium text-slate-300">Device Availability</span>
                <span className="text-[10px] text-slate-500">Online glasses ratio</span>
              </div>

              <div className="flex flex-col justify-center p-4 space-y-3">
                <h3 className="text-xs font-medium text-slate-300 border-b border-ink-600 pb-1.5">Anomaly Severity Distribution</h3>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Critical Alerts</span>
                      <span className="font-semibold text-argo-red">{assets.filter(a=>a.status==='critical').length} assets</span>
                    </div>
                    <div className="h-1.5 w-full bg-ink-600 rounded-full overflow-hidden">
                      <div className="h-full bg-argo-red" style={{ width: `${(assets.filter(a=>a.status==='critical').length / (totalAssets || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-0.5">
                      <span>Warning States</span>
                      <span className="font-semibold text-argo-amber">{assets.filter(a=>a.status==='warning').length} assets</span>
                    </div>
                    <div className="h-1.5 w-full bg-ink-600 rounded-full overflow-hidden">
                      <div className="h-full bg-argo-amber" style={{ width: `${(assets.filter(a=>a.status==='warning').length / (totalAssets || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Assets Explorer */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Industrial Assets Quick Watch</h2>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1 text-xs outline-none focus:border-argo-cyan"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1 text-xs outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="all">All States</option>
                  <option value="healthy">Healthy</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-ink-600 text-slate-500">
                    <th className="py-2">Asset Name</th>
                    <th className="py-2">Serial</th>
                    <th className="py-2 text-center">Health Score</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600/50">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">No assets match your filter criteria.</td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-ink-700/30">
                        <td className="py-3 font-semibold text-fg">{asset.name}</td>
                        <td className="py-3 text-slate-400 font-mono">{asset.serialNumber}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
                            asset.healthScore > 85 ? 'bg-argo-green/10 text-argo-green' : 
                            asset.healthScore > 60 ? 'bg-argo-amber/10 text-argo-amber' : 'bg-argo-red/10 text-argo-red'
                          }`}>
                            {asset.healthScore}%
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 capitalize`}>
                            <span className="h-2 w-2 rounded-full" style={{ 
                              backgroundColor: asset.status === 'healthy' ? '#10b981' : asset.status === 'warning' ? '#f59e0b' : '#ef4444' 
                            }} />
                            {asset.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => onNavigate('assets', asset.id)}
                            className="text-argo-cyan hover:underline"
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
        </div>

        {/* Real-time Predictions & Alerts Feed (Right Column) */}
        <div className="space-y-6">
          {/* Recent AI Inferences */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Live AI Inference Stream</h2>
            <div className="space-y-3">
              {recentPredictions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No AI results generated yet.</p>
              ) : (
                recentPredictions.map(res => (
                  <div key={res.id} className="rounded-lg border border-ink-600 bg-ink-700/20 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-fg">{res.classification}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        res.severity === 'critical' ? 'bg-argo-red/20 text-argo-red' : 
                        res.severity === 'warning' ? 'bg-argo-amber/20 text-argo-amber' : 'bg-argo-green/20 text-argo-green'
                      }`}>
                        {res.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{res.recommendation}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-ink-600/30 pt-1.5">
                      <span>Conf: <strong className="text-slate-300 font-mono">{res.confidence}%</strong></span>
                      <span>Health Score: <strong className="text-slate-300 font-mono">{res.healthScore}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Critical Telemetry Alerts */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operational Alerts</h2>
              <button 
                onClick={() => onNavigate('alerts')}
                className="text-[10px] text-argo-cyan hover:underline"
              >
                View Feed
              </button>
            </div>
            <div className="space-y-3">
              {notifications.filter(n => !n.acknowledged).slice(0, 4).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-xl">✅</span>
                  <p className="mt-1 text-xs font-medium text-slate-500">All alarms cleared</p>
                </div>
              ) : (
                notifications.filter(n => !n.acknowledged).slice(0, 4).map(notif => (
                  <div key={notif.id} className={`border-l-2 pl-3 py-1 ${
                    notif.severity === 'critical' ? 'border-argo-red' : 'border-argo-amber'
                  }`}>
                    <h3 className="text-[11px] font-semibold text-fg leading-tight">{notif.title}</h3>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
