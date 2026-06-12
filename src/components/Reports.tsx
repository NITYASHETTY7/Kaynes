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
    <div
      className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 print:bg-white print:text-black"
      style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--fg))' }}
    >
      
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">
        <div>
          <h1 className="text-xl font-bold font-display" style={{ color: 'rgb(var(--fg))' }}>Platform Diagnostic Reports</h1>
          <p className="text-xs" style={{ color: 'rgb(var(--n-400))' }}>Compile industrial assets telemetry logs, fleet battery wear models, and AI defects audit reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 print:grid-cols-1">
        
        {/* Controls Column (Left, Hidden in print) */}
        <div className="space-y-6 lg:col-span-1 print:hidden">
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{
              background: 'rgb(var(--s-800))',
              borderColor: 'rgb(var(--s-600))',
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <h3
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'rgb(var(--n-500))' }}
            >
              Configure Export
            </h3>
            
            <div>
              <label
                className="block text-[10px] uppercase tracking-widest mb-1.5"
                style={{ color: 'rgb(var(--n-500))' }}
              >
                Select Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full rounded-md px-3 py-2 text-xs outline-none transition-colors"
                style={{
                  border: '1px solid rgb(var(--s-500))',
                  background: 'rgb(var(--s-700))',
                  color: 'rgb(var(--n-200))',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,153,0,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
              >
                <option value="assets">Asset Health Summary</option>
                <option value="devices">Connected Device Telemetry</option>
                <option value="ai">AI Defects Inference Logs</option>
                <option value="plants">Facility Capacity Metrics</option>
              </select>
            </div>

            <div
              className="space-y-2 pt-2"
              style={{ borderTop: '1px solid rgba(var(--s-600), 0.5)' }}
            >
              <button 
                onClick={handleExportCSV}
                disabled={isExporting}
                className="w-full rounded-lg py-2 text-xs font-semibold disabled:opacity-40 transition-colors"
                style={{
                  border: '1px solid rgb(var(--s-500))',
                  background: 'rgb(var(--s-700))',
                  color: 'rgb(var(--n-200))',
                }}
              >
                {isExporting ? 'Compiling CSV...' : '📊 Export to Excel / CSV'}
              </button>
              <button 
                onClick={handlePrintPDF}
                className="w-full rounded-lg py-2 text-xs font-semibold hover:brightness-110 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
                  color: '#0D0F15',
                }}
              >
                🖨 Generate Print PDF
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview Column (Right, Full width in print) */}
        <div
          className="lg:col-span-3 rounded-2xl border p-8 print:border-none print:bg-white print:p-0"
          style={{
            background: 'rgb(var(--s-800))',
            borderColor: 'rgb(var(--s-600))',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          
          {/* Print Header */}
          <div
            className="pb-5 mb-6 flex justify-between items-start"
            style={{ borderBottom: '2px solid rgba(var(--s-600), 0.5)' }}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold font-mono" style={{ color: '#FF9900' }}>Kaynes Technology Limited</div>
              <h2 className="text-lg font-bold font-display print:text-black mt-1 capitalize" style={{ color: 'rgb(var(--fg))' }}>{reportType} Diagnostic Report</h2>
              <p className="text-[10px] mt-1" style={{ color: 'rgb(var(--n-500))' }}>Generated: {new Date().toLocaleString()} · Target: Fleet Systems Console</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold font-mono" style={{ color: 'rgb(var(--n-400))' }}>CONFIDENTIAL</div>
              <div className="text-[9px] mt-1" style={{ color: 'rgb(var(--n-500))' }}>SECURE AUDIT WINDOW</div>
            </div>
          </div>

          {/* Asset Report Preview */}
          {reportType === 'assets' && (
            <div className="space-y-6">
              <p className="text-xs print:text-slate-600 leading-relaxed" style={{ color: 'rgb(var(--n-400))' }}>This report summarizes the operational health metrics of registered physical assets currently active across all physical facility locations. Defect rates are derived from active AI optical inspection models.</p>
              
              <table className="w-full text-left text-xs print:text-black">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Asset Name</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Serial</th>
                    <th className="py-2.5 text-center font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Health score</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Status</th>
                    <th className="py-2.5 text-right font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Last Serviced</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a => (
                    <tr key={a.id} style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 font-semibold print:text-black" style={{ color: 'rgb(var(--fg))' }}>{a.name}</td>
                      <td className="py-3 font-mono" style={{ color: 'rgb(var(--n-400))' }}>{a.serialNumber}</td>
                      <td className="py-3 text-center font-mono font-bold" style={{ color: '#FF9900' }}>{a.healthScore}%</td>
                      <td className="py-3 capitalize font-semibold" style={{ color: 'rgb(var(--n-200))' }}>{a.status}</td>
                      <td className="py-3 text-right font-mono text-[11px]" style={{ color: 'rgb(var(--n-500))' }}>{a.lastServiced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Devices Telemetry Report Preview */}
          {reportType === 'devices' && (
            <div className="space-y-6">
              <p className="text-xs print:text-slate-600 leading-relaxed" style={{ color: 'rgb(var(--n-400))' }}>Real-time telemetry and network diagnostic output of the active smart glasses fleet. Status is evaluated via active device ping heartbeats and local storage capacity thresholds.</p>
              
              <table className="w-full text-left text-xs print:text-black">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Glasses Tag Name</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Serial</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Assigned Facility</th>
                    <th className="py-2.5 text-center font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Battery</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Connection</th>
                    <th className="py-2.5 text-right font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(d => (
                    <tr key={d.id} style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 font-semibold print:text-black" style={{ color: 'rgb(var(--fg))' }}>{d.name}</td>
                      <td className="py-3 font-mono" style={{ color: 'rgb(var(--n-400))' }}>{d.serial}</td>
                      <td className="py-3" style={{ color: 'rgb(var(--n-400))' }}>{d.site}</td>
                      <td className="py-3 text-center font-mono font-bold" style={{ color: '#FF9900' }}>{d.battery}%</td>
                      <td className="py-3" style={{ color: 'rgb(var(--n-300))' }}>{d.connection}</td>
                      <td className="py-3 text-right capitalize font-semibold" style={{ color: 'rgb(var(--n-200))' }}>{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Defect Inference Report Preview */}
          {reportType === 'ai' && (
            <div className="space-y-6">
              <p className="text-xs print:text-slate-600 leading-relaxed" style={{ color: 'rgb(var(--n-400))' }}>Comprehensive audit log of convolutional defect classification output results. Bounding boxes are drawn for solder joint bridge faults and surface fractures.</p>
              
              <table className="w-full text-left text-xs print:text-black">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Inference Classification</th>
                    <th className="py-2.5 text-center font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Confidence</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Defect detected</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Severity</th>
                    <th className="py-2.5 text-right font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Execution Date</th>
                  </tr>
                </thead>
                <tbody>
                  {aiResults.map(res => (
                    <tr key={res.id} style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 font-semibold print:text-black" style={{ color: 'rgb(var(--fg))' }}>{res.classification}</td>
                      <td className="py-3 text-center font-mono font-bold" style={{ color: '#FF9900' }}>{res.confidence}%</td>
                      <td className="py-3 font-semibold" style={{ color: 'rgb(var(--n-200))' }}>{res.defectDetected ? '⚠️ TRUE' : '✓ FALSE'}</td>
                      <td className="py-3 capitalize" style={{ color: 'rgb(var(--n-300))' }}>{res.severity}</td>
                      <td className="py-3 text-right font-mono text-[11px]" style={{ color: 'rgb(var(--n-500))' }}>{new Date(res.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Plant metrics Report Preview */}
          {reportType === 'plants' && (
            <div className="space-y-6">
              <p className="text-xs print:text-slate-600 leading-relaxed font-medium" style={{ color: 'rgb(var(--n-400))' }}>Facility output capacity, supervisor assignments, and operational geo-location indexing for certified Kaynes plants.</p>
              
              <table className="w-full text-left text-xs print:text-black">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgb(var(--s-600))' }}>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Plant Facility</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Location</th>
                    <th className="py-2.5 font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Managing Supervisor</th>
                    <th className="py-2.5 text-right font-semibold" style={{ color: 'rgb(var(--n-500))' }}>Capacity Units</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgb(var(--s-600))' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--s-700))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 font-semibold print:text-black" style={{ color: 'rgb(var(--fg))' }}>{p.name}</td>
                      <td className="py-3" style={{ color: 'rgb(var(--n-400))' }}>{p.location}</td>
                      <td className="py-3 font-medium" style={{ color: 'rgb(var(--n-300))' }}>{p.manager}</td>
                      <td className="py-3 text-right font-mono font-bold" style={{ color: '#FF9900' }}>{p.capacity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Diagnostic Disclaimer / Signature block */}
          <div
            className="mt-12 pt-8 grid grid-cols-2 gap-6 text-[10px] print:text-slate-600"
            style={{
              borderTop: '2px solid rgba(var(--s-600), 0.4)',
              color: 'rgb(var(--n-500))'
            }}
          >
            <div>
              <p className="leading-relaxed">This report is compile-generated from encrypted telemetry streams on physical assets. AI optical inspections are statistical models. Re-evaluate anomalous results in physical labs as required by standard SOPs.</p>
            </div>
            <div className="text-right flex flex-col justify-end items-end space-y-4">
              <div
                className="w-36 pb-1"
                style={{ borderBottom: '1px solid rgba(var(--s-600), 0.4)' }}
              >
                Approved Signature
              </div>
              <div className="font-semibold print:text-black uppercase" style={{ color: 'rgb(var(--fg))' }}>Fleet Systems Director</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
