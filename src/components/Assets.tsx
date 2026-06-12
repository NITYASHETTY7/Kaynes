import { useMemo, useState } from 'react';
import { useApp, type Asset } from '../context/AppContext';

export default function Assets({ selectedAssetId, onClearSelect }: { selectedAssetId: string | null; onClearSelect: () => void }) {
  const { assets, plants, devices, addAsset, updateAsset, mapDeviceToAsset, addAssetHistory, currentUser } = useApp();
  
  // Selection
  const [selectedId, setSelectedId] = useState<string | null>(selectedAssetId);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Search/Filters
  const [search, setSearch] = useState('');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState('all');

  // Form - Asset
  const [assetName, setAssetName] = useState('');
  const [assetSerial, setAssetSerial] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [assetPlantId, setAssetPlantId] = useState('');
  const [assetImage, setAssetImage] = useState('');

  // Form - History
  const [historyType, setHistoryType] = useState('Maintenance');
  const [historyDesc, setHistoryDesc] = useState('');

  const isOperator = currentUser?.role === 'operator';
  const isAdmin = currentUser?.role === 'admin';

  // Get active asset details
  const activeAsset = useMemo(() => {
    const id = selectedId || selectedAssetId;
    return assets.find(a => a.id === id) || null;
  }, [assets, selectedId, selectedAssetId]);

  // List of devices mapped to this asset
  const assetDevices = useMemo(() => {
    if (!activeAsset) return [];
    return devices.filter(d => d.assetId === activeAsset.id);
  }, [devices, activeAsset]);

  // List of devices that are NOT mapped to any asset (available for mapping)
  const availableDevices = useMemo(() => {
    return devices.filter(d => d.assetId === null);
  }, [devices]);

  // Filtered lists
  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                            a.serialNumber.toLowerCase().includes(search.toLowerCase());
      const matchesPlant = selectedPlantFilter === 'all' || a.plantId === selectedPlantFilter;
      return matchesSearch && matchesPlant;
    });
  }, [assets, search, selectedPlantFilter]);

  const openCreateAsset = () => {
    setEditingAsset(null);
    setAssetName('');
    setAssetSerial(`ASSET-${Date.now().toString().slice(-4)}`);
    setAssetCategory('Reflow Oven');
    setAssetPlantId(plants[0]?.id || '');
    setAssetImage('');
    setShowAssetModal(true);
  };

  const openEditAsset = (a: Asset) => {
    setEditingAsset(a);
    setAssetName(a.name);
    setAssetSerial(a.serialNumber);
    setAssetCategory(a.category);
    setAssetPlantId(a.plantId);
    setAssetImage(a.imageUrl || '');
    setShowAssetModal(true);
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !assetPlantId) return;

    if (editingAsset) {
      updateAsset(editingAsset.id, {
        name: assetName,
        serialNumber: assetSerial,
        category: assetCategory,
        plantId: assetPlantId,
        imageUrl: assetImage || null
      });
    } else {
      addAsset({
        name: assetName,
        serialNumber: assetSerial,
        category: assetCategory,
        plantId: assetPlantId,
        lastServiced: new Date().toISOString().split('T')[0],
        imageUrl: assetImage || null
      });
    }
    setShowAssetModal(false);
  };

  const handleAddHistorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAsset || !historyDesc.trim()) return;

    addAssetHistory(activeAsset.id, {
      date: new Date().toLocaleDateString(),
      type: historyType,
      description: historyDesc,
      operator: currentUser?.name || 'Authorized User'
    });
    setHistoryDesc('');
    setShowHistoryModal(false);
  };

  const handleMapDevice = (deviceId: number) => {
    if (!activeAsset) return;
    mapDeviceToAsset(deviceId, activeAsset.id);
  };

  const handleUnmapDevice = (deviceId: number) => {
    mapDeviceToAsset(deviceId, null);
  };

  // AI Summary simulation text generator
  const aiSummary = useMemo(() => {
    if (!activeAsset) return '';
    const name = activeAsset.name;
    const score = activeAsset.healthScore;
    const status = activeAsset.status;

    if (status === 'critical') {
      return `WARNING: AI analysis reports high risk profile for ${name}. Health score is at ${score}%. The detection pipeline flags structural solder faults and thermal anomalies. It is highly advised to schedule immediate preventive maintenance (within next 12 hours) and re-verify thermal profile settings to prevent complete nozzle fatigue.`;
    } else if (status === 'warning') {
      return `ATTENTION: ${name} is showing micro-level warning indicators. Telemetry suggests standard wear-and-tear on active sensors. Overall system is operational, but recommended to inspect the harness pinouts and clean the laser aperture during the next weekly scheduled downtime.`;
    } else {
      return `NOMINAL: AI health analytics show 100% nominal signals for ${name}. Calibration profiles and sensor diagnostics are fully aligned. The estimated remaining useful life (RUL) exceeds 900 operational hours before standard service cycle. No operator intervention required.`;
    }
  }, [activeAsset]);

  return (
    <div className="flex h-full min-h-0" style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--n-200))' }}>
      
      {/* ── Left column: Asset List ─────────────────────── */}
      <div className={`flex w-full flex-col border-r border-ink-600 bg-ink-800/40 lg:w-80 ${activeAsset ? 'hidden lg:flex' : 'flex'}`}>
        <div className="border-b border-ink-600 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-fg">Industrial Assets</h2>
            {!isOperator && (
              <button 
                onClick={openCreateAsset}
                className="rounded-md bg-argo-cyan px-2.5 py-1 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                + Add
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="space-y-2">
            <input 
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-ink-500 bg-ink-700 px-3 py-1.5 text-xs outline-none focus:border-argo-cyan"
            />
            <select
              value={selectedPlantFilter}
              onChange={(e) => setSelectedPlantFilter(e.target.value)}
              className="w-full rounded-md border border-ink-500 bg-ink-700 px-3 py-1.5 text-xs outline-none text-slate-300 focus:border-argo-cyan"
            >
              <option value="all">All Plants</option>
              {plants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Asset Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredAssets.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-6">No assets registered.</p>
          ) : (
            filteredAssets.map(asset => {
              const plantName = plants.find(p => p.id === asset.plantId)?.name || 'Unknown Site';
              const isSelected = activeAsset?.id === asset.id;
              
              return (
                <div 
                  key={asset.id}
                  onClick={() => { setSelectedId(asset.id); if(onClearSelect) onClearSelect(); }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                    isSelected 
                      ? 'border-argo-cyan bg-argo-cyan/5 shadow-md' 
                      : 'border-ink-600 bg-ink-800 hover:bg-ink-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-fg truncate pr-2">{asset.name}</h3>
                    <span className={`h-2 w-2 rounded-full`} style={{ 
                      backgroundColor: asset.status === 'healthy' ? '#10b981' : asset.status === 'warning' ? '#f59e0b' : '#ef4444' 
                    }} />
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>{plantName}</span>
                    <span className="font-mono font-semibold text-slate-300">{asset.healthScore}% SoH</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Column: Asset Details ─────────────────── */}
      <div
        className={`flex-1 flex-col min-h-0 ${activeAsset ? 'flex' : 'hidden lg:flex items-center justify-center'}`}
        style={{ background: 'rgb(var(--s-base))' }}
      >
        {!activeAsset ? (
          <div className="text-center p-6 max-w-sm">
            <span className="text-4xl text-slate-600 block mb-3">📦</span>
            <h2 className="text-sm font-semibold text-fg">No Asset Selected</h2>
            <p className="text-xs text-slate-500 mt-1">Select an asset from the side explorer to view its diagnostic health log, timeline history, and mapped smart glasses.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            
            {/* Asset Header Info */}
            <div className="flex flex-col justify-between gap-4 border-b border-ink-600 pb-5 sm:flex-row sm:items-start mb-6">
              <div>
                <button 
                  onClick={() => { setSelectedId(null); if(onClearSelect) onClearSelect(); }}
                  className="mb-2 text-xs text-argo-cyan hover:underline lg:hidden"
                >
                  ← Back to Assets List
                </button>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-bold text-fg">{activeAsset.name}</h1>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    activeAsset.status === 'critical' ? 'bg-argo-red/10 text-argo-red' : 
                    activeAsset.status === 'warning' ? 'bg-argo-amber/10 text-argo-amber' : 'bg-argo-green/10 text-argo-green'
                  }`}>
                    {activeAsset.status}
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={() => openEditAsset(activeAsset)}
                      className="ml-2 rounded border border-ink-600 bg-ink-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-argo-cyan hover:border-argo-cyan"
                    >
                      Edit Asset
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Category: <strong className="text-slate-300">{activeAsset.category}</strong> · Serial: <strong className="text-slate-300 font-mono">{activeAsset.serialNumber}</strong> · Plant: <strong className="text-slate-300">{plants.find(p=>p.id===activeAsset.plantId)?.name}</strong>
                </p>
              </div>

              {/* Health score badge */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-ink-800 border border-ink-600 px-5 py-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Health Index</span>
                <span className={`text-2xl font-bold font-mono ${
                  activeAsset.healthScore > 85 ? 'text-argo-green' : 
                  activeAsset.healthScore > 60 ? 'text-argo-amber' : 'text-argo-red'
                }`}>{activeAsset.healthScore}%</span>
              </div>
            </div>

            {/* Layout Panels split */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Left detail grid (2 Cols) */}
              <div className="space-y-6 lg:col-span-2">
                
                {/* AI Summary Card */}
                <div className="rounded-xl border border-argo-cyan/30 bg-gradient-to-br from-argo-cyan/5 to-transparent p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🧠</span>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-argo-cyan">AI Core Diagnostics</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">{aiSummary}</p>
                </div>

                {/* Device Mapping details */}
                <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Mapped Fleet Glasses</h3>
                  
                  {assetDevices.length === 0 ? (
                    <p className="text-xs text-slate-500 italic mb-4">No smart glasses mapped to this asset.</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {assetDevices.map(dev => (
                        <div key={dev.id} className="flex items-center justify-between rounded-lg border border-ink-600 bg-ink-700/20 p-3">
                          <div>
                            <h4 className="text-xs font-semibold text-fg">{dev.name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Serial: {dev.serial} · Operator: {dev.operator}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`h-1.5 w-1.5 rounded-full ${dev.status==='online' ? 'bg-argo-green' : 'bg-argo-red'}`} />
                            {!isOperator && (
                              <button 
                                onClick={() => handleUnmapDevice(dev.id)}
                                className="text-[10px] text-argo-red hover:underline"
                              >
                                Unmap
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Device mapping selector */}
                  {!isOperator && availableDevices.length > 0 && (
                    <div className="border-t border-ink-600/50 pt-4">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2">Map Available Glasses to Asset</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          id="mapDeviceSelect"
                          className="flex-1 min-w-0 rounded-md border border-ink-500 bg-ink-700 px-3 py-1.5 text-xs outline-none text-slate-300 focus:border-argo-cyan"
                        >
                          {availableDevices.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.serial})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const select = document.getElementById('mapDeviceSelect') as HTMLSelectElement;
                            if (select?.value) handleMapDevice(Number(select.value));
                          }}
                          className="rounded-md bg-argo-cyan px-4 py-1.5 text-xs font-bold text-ink-900 hover:brightness-110 shrink-0 whitespace-nowrap"
                        >
                          Link Device
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* History table */}
                <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calibration & Service Logs</h3>
                    {!isOperator && (
                      <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="rounded bg-ink-700 px-2.5 py-1 text-[11px] font-semibold text-argo-cyan border border-ink-600 hover:text-fg"
                      >
                        + Log Event
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-ink-600 text-slate-500">
                          <th className="py-2">Date</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Description</th>
                          <th className="py-2">Operator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-600/30">
                        {activeAsset.history.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-500">No logs registered yet.</td>
                          </tr>
                        ) : (
                          activeAsset.history.map(hist => (
                            <tr key={hist.id} className="hover:bg-ink-700/10">
                              <td className="py-2.5 text-slate-500 font-mono text-[10px]">{hist.date}</td>
                              <td className="py-2.5 font-medium text-argo-cyan">{hist.type}</td>
                              <td className="py-2.5 text-slate-400 pr-4">{hist.description}</td>
                              <td className="py-2.5 text-slate-300 font-medium">{hist.operator}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right panel: Timeline nodes (1 Col) */}
              <div className="space-y-6">
                
                {/* Image check preview if available */}
                {activeAsset.imageUrl && (
                  <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden">
                    <img 
                      src={activeAsset.imageUrl} 
                      alt={activeAsset.name} 
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Asset Image</span>
                    </div>
                  </div>
                )}

                {/* Timeline node panel */}
                <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 font-semibold">Asset Timeline Node</h3>
                  
                  {activeAsset.timeline.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No events logged on timeline yet.</p>
                  ) : (
                    <div className="relative border-l border-ink-600 pl-4 ml-2.5 space-y-5">
                      {activeAsset.timeline.map(node => (
                        <div key={node.id} className="relative">
                          {/* Pulse dot */}
                          <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border-2 ${
                            node.severity === 'critical' ? 'bg-argo-red border-argo-red/35' : 
                            node.severity === 'warning' ? 'bg-argo-amber border-argo-amber/35' : 'bg-argo-cyan border-argo-cyan/35'
                          }`} />
                          
                          <span className="text-[10px] font-mono text-slate-500 block">{node.date}</span>
                          <h4 className="text-xs font-semibold text-fg leading-tight mt-0.5">{node.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{node.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── ASSET MODAL (Create/Update) ─────────────────────────────── */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAssetSubmit} className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-fg mb-4">
              {editingAsset ? `Update Asset: ${editingAsset.name}` : 'Register New Industrial Asset'}
            </h3>
            
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Asset Name</label>
            <input 
              required
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. SMT Wave Reflow Nozzle A"
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Serial Number</label>
                <input 
                  required
                  type="text"
                  value={assetSerial}
                  onChange={(e) => setAssetSerial(e.target.value)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg font-mono focus:border-argo-cyan"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Asset Category</label>
                <select 
                  value={assetCategory}
                  onChange={(e) => setAssetCategory(e.target.value)}
                  className="w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
                >
                  <option value="Reflow Oven">Reflow Oven</option>
                  <option value="QA Jig">QA Jig</option>
                  <option value="Assembler">Assembler</option>
                  <option value="Feeder System">Feeder System</option>
                </select>
              </div>
            </div>

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Assign to Facility / Plant</label>
            <select 
              value={assetPlantId}
              onChange={(e) => setAssetPlantId(e.target.value)}
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
            >
              {plants.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Asset Image URL <span className="text-slate-600">(optional)</span></label>
            <input 
              type="text"
              value={assetImage}
              onChange={(e) => setAssetImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="mb-5 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan"
            />

            <div className="flex justify-end gap-3 border-t border-ink-600 pt-4">
              <button 
                type="button" 
                onClick={() => setShowAssetModal(false)}
                className="rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-bold text-ink-900 shadow-md hover:brightness-110"
              >
                {editingAsset ? 'Save Asset Details' : 'Register Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── LOG HISTORY MODAL ─────────────────────────────── */}
      {showHistoryModal && activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAddHistorySubmit} className="w-full max-w-md rounded-xl border border-ink-600 bg-ink-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-fg mb-4">Log Event on {activeAsset.name}</h3>
            
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Event Type</label>
            <select 
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
              className="mb-4 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-slate-300 focus:border-argo-cyan"
            >
              <option value="Maintenance">Maintenance / Repair</option>
              <option value="Calibration">Sensor Calibration</option>
              <option value="Inspection">Manual Visual Inspection</option>
              <option value="Decommissioning">Incident / Alert Review</option>
            </select>

            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Detailed Description</label>
            <textarea 
              required
              rows={4}
              value={historyDesc}
              onChange={(e) => setHistoryDesc(e.target.value)}
              placeholder="Explain the service performed, calibration variables adjusted, or faults inspected..."
              className="mb-5 w-full rounded-lg border border-ink-500 bg-ink-700 px-3 py-2 text-sm outline-none text-fg focus:border-argo-cyan resize-none"
            />

            <div className="flex justify-end gap-3 border-t border-ink-600 pt-4">
              <button 
                type="button" 
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg border border-ink-500 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-ink-700"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="rounded-lg bg-argo-cyan px-4 py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                Confirm Event
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
