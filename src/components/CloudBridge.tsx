import { useState, useEffect } from 'react'

interface CloudService {
  name: string
  status: 'online' | 'syncing' | 'offline'
  uptime: string
  latency: string
  region: string
  description: string
}

export default function CloudBridge() {
  const [services, setServices] = useState<CloudService[]>([
    {
      name: 'AWS IoT Core',
      status: 'online',
      uptime: '99.99%',
      latency: '18ms',
      region: 'ap-south-1',
      description: 'MQTT telemetry ingestion & shadow management'
    },
    {
      name: 'Amazon S3',
      status: 'online',
      uptime: '100%',
      latency: '45ms',
      region: 'ap-south-1',
      description: 'Media storage for ML training sets'
    },
    {
      name: 'AWS SageMaker',
      status: 'online',
      uptime: '99.95%',
      latency: '120ms',
      region: 'ap-south-1',
      description: 'Real-time inference & model retraining'
    },
    {
      name: 'AWS Lambda',
      status: 'online',
      uptime: '100%',
      latency: '5ms',
      region: 'ap-south-1',
      description: 'Serverless event processing & notifications'
    }
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

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-slate-700/50 bg-white dark:bg-[#334155]/60 backdrop-blur-xl p-6 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors duration-300">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#185FA5] to-sky-400 opacity-70" />
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-600/30 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-sky-500 dark:text-sky-400 text-lg leading-none">☁</span>
          <div>
            <h2 className="text-[11px] font-black text-[#0F172A] dark:text-white tracking-tight leading-none">
              AWS Cloud Infrastructure Bridge
            </h2>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">
              Production Target Architecture ● AP-SOUTH-1
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Last Sync: {lastSync}</div>
          <div className="flex items-center gap-1.5 mt-1.5 justify-end">
             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">● Healthy</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        {services.map((s) => (
          <div key={s.name} className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 group ${
            s.name === 'Amazon S3' 
              ? 'bg-sky-50 dark:bg-[#1e293b]/80 border-[#185FA5] dark:border-sky-500 shadow-md' 
              : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800/60'
          }`}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <div className={`truncate text-[11px] font-black uppercase tracking-tight ${s.name === 'Amazon S3' ? 'text-[#185FA5] dark:text-sky-400' : 'text-[#0F172A] dark:text-slate-200'}`}>{s.name}</div>
                <div className="mt-1 text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-tight h-7 line-clamp-2">{s.description}</div>
              </div>
              <div className={`flex h-4 items-center gap-1 rounded px-1.5 text-[7px] font-black uppercase tracking-widest border ${
                s.status === 'online' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
              }`}>
                {s.status === 'syncing' && <span className="h-1 w-1 animate-ping rounded-full bg-sky-500" />}
                ONLINE
              </div>
            </div>
            
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                <div>
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Availability</span>
                  <span className="text-[11px] font-black text-[#0F172A] dark:text-slate-100">{s.uptime}</span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Latency</span>
                  <span className="text-[11px] font-black text-[#0F172A] dark:text-slate-100">{s.latency}</span>
                </div>
              </div>

            {s.status === 'syncing' && (
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-sky-500/10">
                <div className="h-full bg-sky-500 animate-shimmer" style={{ width: '40%' }} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-5 flex items-center justify-between relative z-10 px-1">
        <div className="flex items-center gap-3">
           <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-bold">i</div>
           <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
             Staging for Phase-2 migration to AWS native services as per SOW section 4.1.
           </p>
        </div>
        <button className="text-[10px] font-black text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-white transition-colors uppercase tracking-widest">
          View Architecture →
        </button>
      </div>
    </div>
  )
}
