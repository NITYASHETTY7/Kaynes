import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Reports() {
  const { assets, devices, plants, aiResults } = useApp();
  const [reportType, setReportType] = useState<'assets' | 'devices' | 'ai' | 'plants'>('assets');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      let headers: string[] = [];
      let rows: string[][] = [];
      let filename = 'report.csv';

      if (reportType === 'assets') {
        filename = 'Kaynes_Asset_Health_Report.csv';
        headers = ['Asset ID', 'Asset Name', 'Serial Number', 'Category', 'Health Score', 'Status', 'Last Serviced'];
        rows = assets.map(a => [
          a.id,
          a.name,
          a.serialNumber,
          a.category,
          `${a.healthScore}%`,
          a.status,
          a.lastServiced
        ]);
      } else if (reportType === 'devices') {
        filename = 'Kaynes_Device_Telemetry_Export.csv';
        headers = ['Device Name', 'Serial ID', 'Firmware Version', 'Site Location', 'Battery Status', 'Connection', 'Status'];
        rows = devices.map(d => [
          d.name,
          d.serial,
          d.firmware,
          d.site,
          `${d.battery}%`,
          d.connection,
          d.status
        ]);
      } else if (reportType === 'ai') {
        filename = 'Kaynes_AI_Inference_Defect_Log.csv';
        headers = ['Inference ID', 'Image ID', 'Classification', 'Confidence', 'Defect Detected', 'Severity', 'Created At'];
        rows = aiResults.map(res => [
          res.id,
          res.imageId,
          res.classification,
          `${res.confidence}%`,
          res.defectDetected ? 'TRUE' : 'FALSE',
          res.severity,
          new Date(res.created_at).toLocaleString()
        ]);
      } else {
        filename = 'Kaynes_Plant_Metrics_Report.csv';
        headers = ['Plant ID', 'Plant Name', 'Location', 'Capacity', 'Manager', 'Created At'];
        rows = plants.map(p => [
          p.id,
          p.name,
          p.location,
          p.capacity,
          p.manager,
          new Date(p.created_at).toLocaleDateString()
        ]);
      }

      // Convert to CSV
      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
    }, 1500);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="h-full overflow-y-auto bg-ink-900 p-6 text-slate-200 print:bg-white print:text-black">
      
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold text-fg">Platform Diagnostic Reports</h1>
          <p className="text-xs text-slate-400">Compile industrial assets telemetry logs, fleet battery wear models, and AI defects audit reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 print:grid-cols-1">
        
        {/* Controls Column (Left, Hidden in print) */}
        <div className="space-y-6 lg:col-span-1 print:hidden">
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Configure Export</h3>
            
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Select Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full rounded-md border border-ink-500 bg-ink-700 px-3 py-2 text-xs outline-none text-slate-300 focus:border-argo-cyan"
              >
                <option value="assets">Asset Health Summary</option>
                <option value="devices">Connected Device Telemetry</option>
                <option value="ai">AI Defects Inference Logs</option>
                <option value="plants">Facility Capacity Metrics</option>
              </select>
            </div>

            <div className="space-y-2 pt-2 border-t border-ink-600/50">
              <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full rounded-lg border border-ink-500 bg-ink-700 hover:text-fg py-2 text-xs font-semibold text-slate-300 disabled:opacity-40"
              >
                {isExporting ? 'Compiling CSV...' : '📊 Export to Excel / CSV'}
              </button>
              <button 
                onClick={handlePrintPDF}
                className="w-full rounded-lg bg-argo-cyan py-2 text-xs font-semibold text-ink-900 hover:brightness-110"
              >
                🖨 Generate Print PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview Column (Right, Full width in print) */}
        <div className="lg:col-span-3 rounded-xl border border-ink-600 bg-ink-800 p-8 print:border-none print:bg-white print:p-0">
          
          {/* Print Header */}
          <div className="border-b-2 border-ink-600/50 pb-5 mb-6 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-argo-cyan font-bold font-mono">Kaynes Technology Limited</div>
              <h2 className="text-lg font-bold text-fg print:text-black mt-1 capitalize">{reportType} Diagnostic Report</h2>
              <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleString()} · Target: Fleet Systems Console</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-400 font-mono">CONFIDENTIAL</div>
              <div className="text-[9px] text-slate-500 mt-1">SECURE AUDIT WINDOW</div>
            </div>
          </div>

          {/* Asset Report Preview */}
          {reportType === 'assets' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed">This report summarizes the operational health metrics of registered physical assets currently active across all physical facility locations. Defect rates are derived from active AI optical inspection models.</p>
              
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead>
                  <tr className="border-b border-ink-600 text-slate-500 font-bold">
                    <th className="py-2.5">Asset Name</th>
                    <th className="py-2.5">Serial</th>
                    <th className="py-2.5 text-center">Health score</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Last Serviced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600/30">
                  {assets.map(a => (
                    <tr key={a.id}>
                      <td className="py-3 font-semibold text-fg print:text-black">{a.name}</td>
                      <td className="py-3 font-mono text-slate-400">{a.serialNumber}</td>
                      <td className="py-3 text-center font-mono text-argo-cyan font-bold">{a.healthScore}%</td>
                      <td className="py-3 capitalize font-semibold">{a.status}</td>
                      <td className="py-3 text-right font-mono text-[11px] text-slate-500">{a.lastServiced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Devices Telemetry Report Preview */}
          {reportType === 'devices' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed">Real-time telemetry and network diagnostic output of the active smart glasses fleet. Status is evaluated via active device ping heartbeats and local storage capacity thresholds.</p>
              
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead>
                  <tr className="border-b border-ink-600 text-slate-500 font-bold">
                    <th className="py-2.5">Glasses Tag Name</th>
                    <th className="py-2.5">Serial</th>
                    <th className="py-2.5">Assigned Facility</th>
                    <th className="py-2.5 text-center">Battery</th>
                    <th className="py-2.5">Connection</th>
                    <th className="py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600/30">
                  {devices.map(d => (
                    <tr key={d.id}>
                      <td className="py-3 font-semibold text-fg print:text-black">{d.name}</td>
                      <td className="py-3 font-mono text-slate-400">{d.serial}</td>
                      <td className="py-3 text-slate-400">{d.site}</td>
                      <td className="py-3 text-center font-mono text-argo-cyan font-bold">{d.battery}%</td>
                      <td className="py-3">{d.connection}</td>
                      <td className="py-3 text-right capitalize font-semibold">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Defect Inference Report Preview */}
          {reportType === 'ai' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed">Comprehensive audit log of convolutional defect classification output results. Bounding boxes are drawn for solder joint bridge faults and surface fractures.</p>
              
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead>
                  <tr className="border-b border-ink-600 text-slate-500 font-bold">
                    <th className="py-2.5">Inference Classification</th>
                    <th className="py-2.5 text-center">Confidence</th>
                    <th className="py-2.5">Defect detected</th>
                    <th className="py-2.5">Severity</th>
                    <th className="py-2.5 text-right">Execution Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600/30">
                  {aiResults.map(res => (
                    <tr key={res.id}>
                      <td className="py-3 font-semibold text-fg print:text-black">{res.classification}</td>
                      <td className="py-3 text-center font-mono text-argo-cyan font-bold">{res.confidence}%</td>
                      <td className="py-3 font-semibold">{res.defectDetected ? '⚠️ TRUE' : '✓ FALSE'}</td>
                      <td className="py-3 capitalize">{res.severity}</td>
                      <td className="py-3 text-right font-mono text-[11px] text-slate-500">{new Date(res.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Plant metrics Report Preview */}
          {reportType === 'plants' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400 print:text-slate-600 leading-relaxed font-medium">Facility output capacity, supervisor assignments, and operational geo-location indexing for certified Kaynes plants.</p>
              
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead>
                  <tr className="border-b border-ink-600 text-slate-500 font-bold">
                    <th className="py-2.5">Plant Facility</th>
                    <th className="py-2.5">Location</th>
                    <th className="py-2.5">Managing Supervisor</th>
                    <th className="py-2.5 text-right">Capacity Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-600/30">
                  {plants.map(p => (
                    <tr key={p.id}>
                      <td className="py-3 font-semibold text-fg print:text-black">{p.name}</td>
                      <td className="py-3 text-slate-400">{p.location}</td>
                      <td className="py-3 text-slate-300 font-medium">{p.manager}</td>
                      <td className="py-3 text-right font-mono font-bold text-argo-cyan">{p.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Diagnostic Disclaimer / Signature block */}
          <div className="mt-12 pt-8 border-t-2 border-ink-600/40 grid grid-cols-2 gap-6 text-[10px] text-slate-500 print:text-slate-600">
            <div>
              <p className="leading-relaxed">This report is compile-generated from encrypted telemetry streams on physical assets. AI optical inspections are statistical models. Re-evaluate anomalous results in physical labs as required by standard SOPs.</p>
            </div>
            <div className="text-right flex flex-col justify-end items-end space-y-4">
              <div className="border-b border-ink-600/40 w-36 pb-1">Approved Signature</div>
              <div className="font-semibold text-fg print:text-black uppercase">Fleet Systems Director</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
