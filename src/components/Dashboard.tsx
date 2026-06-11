import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Gauge from './Gauge';
import CloudBridge from './CloudBridge';

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
    <div className="h-full overflow-y-auto p-6 text-slate-900 dark:text-slate-200 relative bg-[#F1F5F9] dark:bg-slate-950 font-sans">
      
      {/* Subtle ambient background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-argo-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-argo-violet/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Title block ─────────────────────────────────── */}
      <div className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A] dark:text-fg">Operations Command Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Global Fleet Nominal
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-2">
              Live Refresh: <span className="text-slate-600 dark:text-slate-300 font-mono">Just now</span>
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate('reports')}
            className="rounded-lg border border-slate-200 dark:border-ink-600 bg-white dark:bg-ink-800/80 px-4 py-2 text-[10px] font-black text-[#0F172A] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-ink-700 uppercase tracking-widest shadow-sm transition-all"
          >
            📊 Generate Report
          </button>
          <button 
            onClick={() => onNavigate('ai-pipeline')}
            className="rounded-lg bg-[#185FA5] px-5 py-2 text-[10px] font-black text-white shadow-lg shadow-sky-900/10 hover:brightness-110 active:translate-y-px uppercase tracking-widest transition-all"
          >
            RUN AI INFERENCE
          </button>
        </div>
      </div>

      {/* ── AWS Cloud Bridge ────────────────────────────── */}
      <div className="relative mb-8 z-10">
        <CloudBridge />
      </div>

      {/* ── KPI Grid ────────────────────────────────────── */}
      <div className="relative mb-8 grid grid-cols-2 gap-5 md:grid-cols-5 z-10">
        {[
          { label: 'Total Assets', value: totalAssets, sub: 'Active', color: 'cyan', route: 'assets' },
          { label: 'Total Plants', value: totalPlants, sub: 'Sites', color: 'slate', route: 'plants' },
          { label: 'Active Devices', value: activeDevices, sub: 'Online', color: 'green', route: 'fleet' },
          { label: 'Critical Alerts', value: criticalAlerts, sub: 'Pending', color: 'red', pulse: criticalAlerts > 0, route: 'alerts' },
          { label: 'AI Predictions', value: totalPredictions, sub: 'Inferences', color: 'violet', route: 'ai-pipeline' },
        ].map((kpi) => (
          <button 
            key={kpi.label} 
            onClick={() => onNavigate(kpi.route)}
            className={`group relative flex flex-col text-left rounded-2xl border border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800/60 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white dark:hover:bg-ink-800 hover:shadow-xl overflow-hidden shadow-sm ${
              kpi.color === 'red' && kpi.value > 0 
                ? 'border-red-400/40 hover:border-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.15)]' 
                : 'hover:border-sky-400/40 hover:shadow-[0_4px_20px_rgba(14,165,233,0.1)]'
            }`}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />

            {/* Subtle glow effect behind card */}
            <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${
              kpi.color === 'cyan' ? 'bg-sky-400' :
              kpi.color === 'green' ? 'bg-emerald-400' :
              kpi.color === 'violet' ? 'bg-indigo-400' :
              kpi.color === 'red' ? 'bg-red-400' : 'bg-slate-400'
            }`} />

            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition-colors relative z-10">{kpi.label}</span>
            <div className="mt-4 flex items-end w-full justify-between relative z-10">
              <span className={`text-4xl font-black tracking-tighter leading-none ${
                kpi.color === 'red' ? 'text-red-500' : 
                kpi.color === 'cyan' ? 'text-[#185FA5] dark:text-sky-500' : 
                kpi.color === 'green' ? 'text-emerald-500' : 
                kpi.color === 'violet' ? 'text-indigo-600 dark:text-indigo-400' : 'text-[#0F172A] dark:text-fg'
              }`}>{kpi.value}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.pulse ? 'animate-pulse' : ''} ${
                kpi.color === 'red' ? 'text-red-500' : 'text-slate-400'
              }`}>{kpi.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Main Panel Split ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 relative z-10">
        {/* Left/Center Columns: Analytics & Assets */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Inference Health Insights */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800/60 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />
            <h2 className="mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">AI Inference Health Insights</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="flex flex-col items-center justify-center lg:col-span-1">
                <div className="h-28 w-28 relative flex items-center justify-center">
                  <Gauge value={100 - defectRate} color="var(--argo-cyan)" />
                </div>
                <span className="mt-3 text-[11px] font-black text-[#0F172A] dark:text-fg uppercase tracking-tight">Defect-Free Rate</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Inference pipeline status</span>
              </div>
              
              <div className="flex flex-col items-center justify-center lg:col-span-1">
                <div className="h-28 w-28 relative flex items-center justify-center">
                  <Gauge value={activeDevices > 0 ? Math.round((devices.filter(d=>d.status==='online').length / devices.length)*100) : 100} color="var(--argo-green)" />
                </div>
                <span className="mt-3 text-[11px] font-black text-[#0F172A] dark:text-fg uppercase tracking-tight">Device Availability</span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Online glasses ratio</span>
              </div>

              <div className="flex flex-col justify-center lg:col-span-2 pl-4 border-l border-[#E2E8F0] dark:border-ink-700/50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Anomaly Severity Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Critical Alerts</span>
                    <span className="text-[11px] font-black text-red-500 uppercase">{assets.filter(a=>a.status==='critical').length} assets</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500">Warning States</span>
                      <span className="text-[11px] font-black text-amber-500 uppercase">{assets.filter(a=>a.status==='warning').length} assets</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-ink-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(assets.filter(a=>a.status==='warning').length / (totalAssets || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industrial Assets Watch */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800/60 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industrial Assets Watch</h2>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">🔍</span>
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border border-[#E2E8F0] dark:border-ink-600 bg-slate-50 dark:bg-ink-900/30 pl-8 pr-3 py-1.5 text-xs font-medium text-[#0F172A] dark:text-fg outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-[#E2E8F0] dark:border-ink-600 bg-slate-50 dark:bg-ink-900/30 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-sky-500 transition-colors"
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
                  <tr className="text-slate-400 font-black uppercase tracking-widest border-b border-slate-100 dark:border-ink-700/50">
                    <th className="px-4 py-3 font-black">Asset Name</th>
                    <th className="px-4 py-3 font-black">Plant</th>
                    <th className="px-4 py-3 font-black text-center">Health Score</th>
                    <th className="px-4 py-3 font-black">Status</th>
                    <th className="px-4 py-3 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-ink-700/50">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-medium uppercase tracking-widest">No assets match your filter criteria.</td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-ink-700/30 transition-colors group">
                        <td className="px-4 py-4 font-black text-[#0F172A] dark:text-fg">{asset.name}</td>
                        <td className="px-4 py-4 text-slate-500 font-bold uppercase tracking-tight">{plants.find(p => p.id === asset.plantId)?.name || 'N/A'}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2 py-1 rounded-md font-black shadow-sm ${
                            asset.healthScore > 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                            asset.healthScore > 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {asset.healthScore}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              asset.status === 'healthy' ? 'bg-emerald-500' : asset.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <span className="font-black capitalize text-slate-950 dark:text-slate-200">{asset.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            onClick={() => onNavigate('assets', asset.id)}
                            className="text-[#185FA5] dark:text-argo-cyan font-black uppercase tracking-widest text-[9px] hover:underline"
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

        {/* Right Column: Real-time Streams */}
        <div className="space-y-6">
          {/* Live AI Inference Stream */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800/60 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />
            <h2 className="mb-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Live AI Inference Stream</h2>
            <div className="space-y-4">
              {recentPredictions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-ink-900/30 rounded-xl border border-[#E2E8F0] dark:border-ink-700 border-dashed">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Awaiting inference stream...</p>
                </div>
              ) : (
                recentPredictions.map(res => (
                  <div key={res.id} className="rounded-xl border border-slate-100 dark:border-ink-700 bg-white dark:bg-ink-900/40 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black text-[#0F172A] dark:text-fg uppercase tracking-tight">{res.classification}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        res.severity === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 
                        res.severity === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}>
                        {res.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium mb-3">{res.recommendation}</p>
                    <div className="flex items-center justify-between text-[9px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-tighter">
                      <span>Conf: <span className="text-black dark:text-slate-200">{res.confidence}%</span></span>
                      <span>Health Score: <span className="text-black dark:text-slate-200">{res.healthScore}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => onNavigate('ai-pipeline')}
              className="w-full mt-4 py-2.5 rounded-lg bg-slate-50 dark:bg-ink-700/50 hover:bg-slate-100 dark:hover:bg-ink-700 text-[10px] font-black text-sky-600 dark:text-argo-cyan uppercase tracking-widest transition-colors border border-[#E2E8F0] dark:border-ink-600"
            >
              Open Studio
            </button>
          </div>

          {/* Operational Alerts */}
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-ink-600 bg-white dark:bg-ink-800/60 backdrop-blur-xl p-6 shadow-sm relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Alerts</h2>
              <button 
                onClick={() => onNavigate('alerts')}
                className="text-[9px] font-black uppercase tracking-widest text-sky-600 dark:text-argo-cyan hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {notifications.filter(n => !n.acknowledged).slice(0, 4).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 dark:bg-ink-900/30 rounded-xl border border-[#E2E8F0] dark:border-ink-700 border-dashed">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All systems nominal</p>
                </div>
              ) : (
                notifications.filter(n => !n.acknowledged).slice(0, 4).map(notif => (
                  <div key={notif.id} className={`border-l-2 pl-4 py-2 rounded-r-lg bg-slate-50 dark:bg-ink-900/40 ${
                    notif.severity === 'critical' ? 'border-red-500' : 'border-amber-500'
                  }`}>
                    <h3 className="text-[11px] font-black text-[#0F172A] dark:text-fg leading-tight mb-1 uppercase tracking-tight">{notif.title}</h3>
                    <p className="text-[10px] text-slate-500 leading-normal font-medium">{notif.message}</p>
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
