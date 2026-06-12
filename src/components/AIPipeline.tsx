import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GoogleVisionResult, runGoogleVisionInference } from '../lib/googleVisionInference';

export default function AIPipeline() {
  const { images, assets, devices, uploadImageFile } = useApp();

  // Selection
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // States
  const [isUploading, setIsSupabaseUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [realtimeResult, setRealtimeResult] = useState<GoogleVisionResult | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploadAssetId, setUploadAssetId] = useState('none');
  const [uploadDeviceId, setUploadDeviceId] = useState('none');
  const [uploadTags, setUploadTags] = useState('solder, pcb, visual-inspection');

  // Preprocessing filters
  const [preprocessors, setPreprocessors] = useState<string[]>(['Resize', 'Denoise (Gaussian)']);

  // Comparison slider
  const [compareSliderPos, setCompareSliderPos] = useState(50);
  const compareContainerRef = useRef<HTMLDivElement>(null);

  // File parameters
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    type: string;
    size: string;
    resolution: string;
    status: 'Valid' | 'Corrupted' | 'Format Mismatch';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active items
  const activeImage = useMemo(() => {
    return images.find(img => img.id === selectedImageId) || null;
  }, [images, selectedImageId]);

  // Preprocessor toggles
  const handleTogglePreprocessor = (filter: string) => {
    setPreprocessors(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  // Image file select change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate parameters
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const isImage = file.type.startsWith('image/');
    
    setFileDetails({
      name: file.name,
      type: file.type,
      size: `${sizeMb} MB`,
      resolution: 'Checking...',
      status: isImage ? 'Valid' : 'Format Mismatch'
    });

    if (!uploadLabel) {
      setUploadLabel(file.name.split('.')[0].replace(/[-_]/g, ' '));
    }

    // Get resolution using Image constructor
    const imgObj = new Image();
    imgObj.src = URL.createObjectURL(file);
    imgObj.onload = () => {
      setFileDetails(prev => prev ? {
        ...prev,
        resolution: `${imgObj.width} x ${imgObj.height} px`
      } : null);
    };
  };

  // Image Upload handler
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsSupabaseUploading(true);
    try {
      const asset = uploadAssetId === 'none' ? null : uploadAssetId;
      const device = uploadDeviceId === 'none' ? null : Number(uploadDeviceId);
      const tags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);

      const uploadedItem = await uploadImageFile(file, uploadLabel || file.name, asset, device, tags);
      if (uploadedItem) {
        setSelectedImageId(uploadedItem.id);
        setUploadLabel('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFileDetails(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSupabaseUploading(false);
    }
  };

  // Process handler - runs real-time object detection
  const handleProcessInference = async () => {
    if (!activeImage) return;

    setIsProcessing(true);
    setRealtimeResult(null);
    try {
      const result = await runGoogleVisionInference(activeImage.url);
      setRealtimeResult(result);
    } catch (error) {
      console.error('Google Vision inference error:', error);
      alert('Inference failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Slider dragging
  const handleCompareMouseMove = (e: React.MouseEvent) => {
    if (!compareContainerRef.current) return;
    const rect = compareContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setCompareSliderPos(pct);
  };

  // Shared input style
  const inputStyle: React.CSSProperties = {
    borderColor: 'rgb(var(--s-500))',
    background: 'rgb(var(--s-700))',
    color: 'rgb(var(--n-200))',
  };

  return (
    <div
      className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8"
      style={{ background: 'rgb(var(--s-base))', color: 'rgb(var(--n-200))' }}
    >
      
      {/* Page Header */}
      <div
        className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center pb-6"
        style={{ borderBottom: '1px solid rgb(var(--s-600))' }}
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'rgb(var(--fg))' }}>
            AWS SageMaker <span className="font-medium" style={{ color: 'rgb(var(--n-500))' }}>Inference Studio</span>
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="flex h-2 w-2 rounded-full"
              style={{ background: '#38bdf8', boxShadow: '0 0 8px rgba(56,189,248,0.5)' }}
            />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
              MODEL ENDPOINT: <span style={{ color: '#38bdf8' }}>ARGO-VISION-V2-ENDPOINT</span>
            </p>
            <span className="h-3 w-px mx-1" style={{ background: 'rgb(var(--s-600))' }} />
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgb(var(--n-500))' }}>
              INSTANCE: <span style={{ color: '#38bdf8' }}>ML.T3.MEDIUM</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: 'rgb(var(--n-500))' }}>Inference Cost (Sim)</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'rgb(var(--fg))' }}>$0.0012 / call</span>
           </div>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        
        {/* Left Side: Upload / Select List (1 Col) */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Section: Upload Capture */}
          <div
            className="rounded-xl p-4"
            style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgb(var(--n-500))' }}>Upload Industrial Image</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg p-4 text-center transition-colors"
                style={{ border: '2px dashed rgb(var(--s-500))' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
              >
                <input 
                  required
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-2xl block mb-1" style={{ color: 'rgb(var(--n-500))' }}>📸</span>
                <span className="text-[11px] font-semibold block" style={{ color: 'rgb(var(--n-500))' }}>Click to select inspection capture</span>
              </div>

              {fileDetails && (
                <div
                  className="rounded-lg p-2.5 space-y-1 text-[10px]"
                  style={{ background: 'rgba(var(--s-700),0.4)', border: '1px solid rgba(var(--s-600),0.5)' }}
                >
                  <div className="font-mono truncate" style={{ color: 'rgb(var(--n-500))' }}>{fileDetails.name}</div>
                  <div className="flex justify-between" style={{ color: 'rgb(var(--n-500))' }}>
                    <span>Size: {fileDetails.size}</span>
                    <span>Res: {fileDetails.resolution}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'rgb(var(--n-400))' }}>
                    <span>Status:</span>
                    <span style={{ color: fileDetails.status === 'Valid' ? '#34d399' : '#f87171', fontWeight: 700 }}>{fileDetails.status}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--n-500))' }}>Label Name</label>
                <input 
                  type="text"
                  placeholder="e.g. PCB Solder Bridge test"
                  value={uploadLabel}
                  onChange={(e) => setUploadLabel(e.target.value)}
                  className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--n-500))' }}>Asset</label>
                  <select 
                    value={uploadAssetId}
                    onChange={(e) => setUploadAssetId(e.target.value)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                  >
                    <option value="none">Unlinked</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--n-500))' }}>Glasses</label>
                  <select 
                    value={uploadDeviceId}
                    onChange={(e) => setUploadDeviceId(e.target.value)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
                    style={inputStyle}
                    onFocus={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                  >
                    <option value="none">Unlinked</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--n-500))' }}>
                  Tags <span style={{ color: 'rgb(var(--n-500))' }}>(comma separated)</span>
                </label>
                <input 
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="solder, pcb, quality"
                  className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#38bdf8')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgb(var(--s-500))')}
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full rounded-lg py-2 text-xs font-semibold hover:brightness-110 disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #FF9900 0%, #FFB833 100%)',
                  color: '#0D0F15',
                  boxShadow: '0 4px 14px rgba(255,153,0,0.3)',
                }}
              >
                {isUploading ? 'Uploading to cloud...' : '📤 Upload & Mount Capture'}
              </button>
            </form>
          </div>

          {/* Section: Select Capture */}
          <div
            className="rounded-xl p-4"
            style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgb(var(--n-500))' }}>Media Pool Captures</h2>
            <div className="space-y-2 h-44 overflow-y-auto pr-1">
              {images.map(img => {
                const isSelected = selectedImageId === img.id;
                return (
                  <div 
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className="cursor-pointer flex items-center gap-2 p-2 rounded-lg text-[11px] font-semibold transition-colors"
                    style={
                      isSelected
                        ? { border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.05)' }
                        : { border: '1px solid rgb(var(--s-600))', background: 'rgba(var(--s-700),0.3)' }
                    }
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgb(var(--s-700))'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(var(--s-700),0.3)'; }}
                  >
                    <img src={img.url} alt="" className="h-8 w-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ color: 'rgb(var(--fg))' }}>{img.label}</div>
                      <div className="text-[10px]" style={{ color: 'rgb(var(--n-500))' }}>{img.status === 'processed' ? 'Processed' : 'Awaiting AI'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Center/Right: Interactive Pipeline (3 Cols) */}
        <div className="space-y-6 xl:col-span-3 flex flex-col">
          
          {!activeImage ? (
            <div
              className="flex-1 rounded-xl p-8 flex flex-col items-center justify-center text-center"
              style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
            >
              <span className="text-5xl mb-4">🧠</span>
              <h2 className="text-base font-bold" style={{ color: 'rgb(var(--fg))' }}>AI Inference Center</h2>
              <p className="text-xs max-w-sm mt-1.5 leading-relaxed" style={{ color: 'rgb(var(--n-500))' }}>Select an active image from the media pool or upload an original frame to customize and launch the defect-detection pipeline.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Pipeline Interactive controls */}
              <div
                className="rounded-xl p-5"
                style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
              >
                <div
                  className="flex flex-col gap-4 justify-between md:flex-row md:items-center pb-4 mb-4"
                  style={{ borderBottom: '1px solid rgba(var(--s-600),0.5)' }}
                >
                  <div>
                    <h3 className="text-sm font-semibold leading-tight" style={{ color: 'rgb(var(--fg))' }}>{activeImage.label}</h3>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgb(var(--n-500))' }}>
                      Parameters: {activeImage.sizeMb}MB · Status:{' '}
                      <strong style={{ color: activeImage.status === 'processed' ? '#34d399' : '#fbbf24' }}>{activeImage.status}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {/* Pipeline trigger */}
                    <button 
                      onClick={handleProcessInference}
                      disabled={isProcessing}
                      className="rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%)' }}
                    >
                      {isProcessing ? 'AI Inference Executing...' : '⚡ Run Detection AI'}
                    </button>
                  </div>
                </div>

                {/* Preprocessing Filters Checkboxes */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-2 font-bold" style={{ color: 'rgb(var(--n-500))' }}>Image Preprocessing Step Config</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      'Resize (640x640)',
                      'Denoise (Gaussian)',
                      'Bilateral Normalization',
                      'Contrast (CLAHE)'
                    ].map(filter => {
                      const active = preprocessors.includes(filter);
                      return (
                        <div 
                          key={filter}
                          onClick={() => handleTogglePreprocessor(filter)}
                          className="cursor-pointer rounded-lg p-2.5 text-center text-xs font-semibold transition-all"
                          style={
                            active
                              ? { border: '1px solid #38bdf8', background: 'rgba(56,189,248,0.05)', color: 'rgb(var(--fg))' }
                              : { border: '1px solid rgb(var(--s-600))', background: 'rgba(var(--s-700),0.3)', color: 'rgb(var(--n-500))' }
                          }
                          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.color = 'rgb(var(--fg))'; }}
                          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.color = 'rgb(var(--n-500))'; }}
                        >
                          {filter}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress visualizer during inference */}
              {isProcessing && (
                <div
                  className="rounded-xl p-4 animate-pulse"
                  style={{ border: '1px solid rgba(56,189,248,0.2)', background: 'rgba(56,189,248,0.05)' }}
                >
                  <div className="flex justify-between items-center text-xs font-bold mb-2" style={{ color: '#38bdf8' }}>
                    <span>Active Convolutional Pipeline Steps</span>
                    <span>78% complete</span>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgb(var(--s-600))' }}>
                    <div className="h-full" style={{ width: '78%', background: 'linear-gradient(90deg, #38bdf8, #a78bfa)' }} />
                  </div>
                  <div className="mt-2.5 flex justify-between text-[10px] font-mono" style={{ color: 'rgb(var(--n-500))' }}>
                    <span>[✓] Check Integrity</span>
                    <span>[✓] Resize &amp; Rescale</span>
                    <span>[✓] CLAHE contrast</span>
                    <span style={{ color: '#38bdf8' }}>[...] Inference Model</span>
                  </div>
                </div>
              )}

              {/* Slider Side-by-Side comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual view panel (2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                  <div
                    className="rounded-xl overflow-hidden p-4"
                    style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
                  >
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgb(var(--n-500))' }}>Live Split Compare View (Original vs Preprocessed)</h4>
                    
                    {/* The Comparison container */}
                    <div 
                      ref={compareContainerRef}
                      onMouseMove={handleCompareMouseMove}
                      className="relative h-72 w-full overflow-hidden rounded-lg bg-black cursor-ew-resize select-none"
                    >
                      {/* Original image as background */}
                      <img 
                        src={activeImage.url} 
                        alt="Original" 
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      {/* Processed image over top, clipped */}
                      <div 
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${compareSliderPos}%` }}
                      >
                        <img 
                          src={activeImage.url} 
                          alt="Processed" 
                          className="absolute inset-0 h-72 w-full object-cover max-w-none"
                          style={{ 
                            width: compareContainerRef.current?.getBoundingClientRect().width,
                            filter: realtimeResult 
                              ? `brightness(${preprocessors.includes('Contrast (CLAHE)') ? '1.3' : '1.0'}) blur(${preprocessors.includes('Denoise (Gaussian)') ? '1.2px' : '0px'}) grayscale(${preprocessors.includes('Bilateral Normalization') ? '0.4' : '0.0'})` 
                              : 'grayscale(0.3) blur(0.5px)' 
                          }}
                        />
                        {/* Overlay Canvas Bounding Boxes ONLY on processed side */}
                        {realtimeResult && realtimeResult.detections.map((det, i) => {
                          if (!det.boundingBox) return null;
                          const bbox = det.boundingBox;
                          const left = bbox.left_column * 100;
                          const top = bbox.top_row * 100;
                          const right = bbox.right_column * 100;
                          const bottom = bbox.bottom_row * 100;
                          const width = right - left;
                          const height = bottom - top;
                          
                          return (
                            <div 
                              key={i}
                              className="absolute border-2 text-[8px] font-bold text-white px-0.5 py-0.5 rounded shadow animate-pulse"
                              style={{ 
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                                borderColor: det.confidence > 0.8 ? '#f87171' : '#fbbf24',
                                background: det.confidence > 0.8 ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)',
                              }}
                            >
                              {det.name} {Math.round(det.confidence * 100)}%
                            </div>
                          );
                        })}
                      </div>

                      {/* Slider divider line */}
                      <div 
                        className="absolute inset-y-0 w-0.5 shadow-lg"
                        style={{ left: `${compareSliderPos}%`, background: '#38bdf8' }}
                      >
                        <div
                          className="absolute -left-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold font-mono"
                          style={{ background: '#38bdf8', color: 'rgb(var(--s-base))' }}
                        >
                          ⇄
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical results panel (1 column) */}
                <div className="space-y-6">
                  
                  {/* Pipeline Output */}
                  <div
                    className="rounded-xl p-5 h-full flex flex-col"
                    style={{ border: '1px solid rgb(var(--s-600))', background: 'rgb(var(--s-800))' }}
                  >
                    <h3
                      className="text-xs font-bold uppercase tracking-wider pb-2 mb-3"
                      style={{ color: 'rgb(var(--n-500))', borderBottom: '1px solid rgb(var(--s-600))' }}
                    >Google Cloud Vision Results</h3>
                    
                    {!realtimeResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <span className="text-2xl mb-1">⚡</span>
                        <p className="text-xs font-medium leading-normal" style={{ color: 'rgb(var(--n-500))' }}>Ready for Google Vision analysis. Click "Run Detection AI" above.</p>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col justify-between space-y-4 text-xs">
                        <div className="space-y-2">
                          {realtimeResult.summary && (
                            <div
                              className="p-2.5 rounded-lg mb-3"
                              style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
                            >
                              <span className="text-[10px] uppercase font-bold block mb-1" style={{ color: '#38bdf8' }}>AI Summary</span>
                              <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgb(var(--n-300))' }}>{realtimeResult.summary}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(var(--n-500))' }}>Processing Time</span>
                            <span className="font-mono font-bold" style={{ color: '#38bdf8' }}>{realtimeResult.processingTime}ms</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(var(--n-500))' }}>Accurate Labels</span>
                            <span className="font-bold text-sm" style={{ color: 'rgb(var(--fg))' }}>{realtimeResult.concepts.length}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(var(--n-500))' }}>Localized Objects</span>
                            <span className="font-bold text-sm" style={{ color: 'rgb(var(--fg))' }}>{realtimeResult.detections.length}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(var(--n-500))' }}>Potential Defects</span>
                            <span
                              className="font-bold text-sm"
                              style={{ color: realtimeResult.defectsFound > 0 ? '#f87171' : '#34d399' }}
                            >
                              {realtimeResult.defectsFound}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgb(var(--n-500))' }}>Avg Confidence</span>
                            <span className="font-mono font-bold" style={{ color: '#a78bfa' }}>{(realtimeResult.confidence * 100).toFixed(1)}%</span>
                          </div>

                          <div style={{ borderTop: '1px solid rgba(var(--s-600),0.5)', paddingTop: '0.5rem' }}>
                            <span className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: 'rgb(var(--n-500))' }}>Top Accurate Features</span>
                            <div className="space-y-1">
                              {realtimeResult.concepts.slice(0, 5).map((concept, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between p-1.5 rounded"
                                  style={{ background: 'rgba(var(--s-700),0.3)' }}
                                >
                                  <span className="truncate" style={{ color: 'rgb(var(--n-300))' }}>{concept.name}</span>
                                  <span className="font-mono font-bold text-[9px]" style={{ color: '#38bdf8' }}>{Math.round(concept.value * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div
                          className="pt-2 text-[9px] font-mono"
                          style={{ borderTop: '1px solid rgba(var(--s-600),0.5)', color: 'rgb(var(--n-500))' }}
                        >
                          <span>Model: Google Cloud Vision API</span>
                          <br />
                          <span>Status: API Key Active</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
