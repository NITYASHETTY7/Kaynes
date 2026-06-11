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

  return (
    <div className="h-full overflow-y-auto bg-ink-900 p-6 text-slate-200">
      
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-ink-600 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-fg">AWS SageMaker <span className="text-slate-500 font-medium">Inference Studio</span></h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-argo-cyan shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              MODEL ENDPOINT: <span className="text-argo-cyan">ARGO-VISION-V2-ENDPOINT</span>
            </p>
            <span className="h-3 w-px bg-ink-600 mx-1" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
              INSTANCE: <span className="text-argo-cyan">ML.T3.MEDIUM</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="flex flex-col text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Inference Cost (Sim)</span>
              <span className="text-xs font-mono font-bold text-fg">$0.0012 / call</span>
           </div>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        
        {/* Left Side: Upload / Select List (1 Col) */}
        <div className="space-y-6 xl:col-span-1">
          
          {/* Section: Upload Capture */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Upload Industrial Image</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-3">
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-ink-500 rounded-lg p-4 text-center hover:border-argo-cyan transition-colors"
              >
                <input 
                  required
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-2xl text-slate-500 block mb-1">📸</span>
                <span className="text-[11px] text-slate-400 font-semibold block">Click to select inspection capture</span>
              </div>

              {fileDetails && (
                <div className="rounded-lg bg-ink-700/40 p-2.5 space-y-1 text-[10px] border border-ink-600/50">
                  <div className="text-slate-500 font-mono truncate">{fileDetails.name}</div>
                  <div className="flex justify-between text-slate-400">
                    <span>Size: {fileDetails.size}</span>
                    <span>Res: {fileDetails.resolution}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={fileDetails.status === 'Valid' ? 'text-argo-green font-bold' : 'text-argo-red font-bold'}>{fileDetails.status}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Label Name</label>
                <input 
                  type="text"
                  placeholder="e.g. PCB Solder Bridge test"
                  value={uploadLabel}
                  onChange={(e) => setUploadLabel(e.target.value)}
                  className="w-full rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1.5 text-xs outline-none text-fg focus:border-argo-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Asset</label>
                  <select 
                    value={uploadAssetId}
                    onChange={(e) => setUploadAssetId(e.target.value)}
                    className="w-full rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1.5 text-xs outline-none text-slate-300 focus:border-argo-cyan"
                  >
                    <option value="none">Unlinked</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Glasses</label>
                  <select 
                    value={uploadDeviceId}
                    onChange={(e) => setUploadDeviceId(e.target.value)}
                    className="w-full rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1.5 text-xs outline-none text-slate-300 focus:border-argo-cyan"
                  >
                    <option value="none">Unlinked</option>
                    {devices.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tags <span className="text-slate-600">(comma separated)</span></label>
                <input 
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="solder, pcb, quality"
                  className="w-full rounded-md border border-ink-500 bg-ink-700 px-2.5 py-1.5 text-xs outline-none text-fg focus:border-argo-cyan"
                />
              </div>

              <button 
                type="submit"
                disabled={isUploading}
                className="w-full rounded-lg bg-argo-cyan py-2 text-xs font-semibold text-ink-900 hover:brightness-110 disabled:opacity-40"
              >
                {isUploading ? 'Uploading to cloud...' : '📤 Upload & Mount Capture'}
              </button>
            </form>
          </div>

          {/* Section: Select Capture */}
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Media Pool Captures</h2>
            <div className="space-y-2 h-44 overflow-y-auto pr-1">
              {images.map(img => {
                const isSelected = selectedImageId === img.id;
                return (
                  <div 
                    key={img.id}
                    onClick={() => setSelectedImageId(img.id)}
                    className={`cursor-pointer flex items-center gap-2 p-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                      isSelected ? 'border-argo-cyan bg-argo-cyan/5' : 'border-ink-600 bg-ink-700/30 hover:bg-ink-700'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-8 w-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-fg">{img.label}</div>
                      <div className="text-[10px] text-slate-500">{img.status === 'processed' ? 'Processed' : 'Awaiting AI'}</div>
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
            <div className="flex-1 rounded-xl border border-ink-600 bg-ink-800 p-8 flex flex-col items-center justify-center text-center">
              <span className="text-5xl mb-4">🧠</span>
              <h2 className="text-base font-bold text-fg">AI Inference Center</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">Select an active image from the media pool or upload an original frame to customize and launch the defect-detection pipeline.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Pipeline Interactive controls */}
              <div className="rounded-xl border border-ink-600 bg-ink-800 p-5">
                <div className="flex flex-col gap-4 justify-between md:flex-row md:items-center pb-4 border-b border-ink-600/50 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-fg leading-tight">{activeImage.label}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parameters: {activeImage.sizeMb}MB · Status: <strong className={activeImage.status === 'processed' ? 'text-argo-green' : 'text-argo-amber'}>{activeImage.status}</strong></p>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {/* Pipeline trigger */}
                    <button 
                      onClick={handleProcessInference}
                      disabled={isProcessing}
                      className="rounded-lg bg-gradient-to-r from-argo-cyan to-argo-violet px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-40"
                    >
                      {isProcessing ? 'AI Inference Executing...' : '⚡ Run Detection AI'}
                    </button>
                  </div>
                </div>

                {/* Preprocessing Filters Checkboxes */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Image Preprocessing Step Config</label>
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
                          className={`cursor-pointer rounded-lg border p-2.5 text-center text-xs font-semibold transition-all ${
                            active ? 'border-argo-cyan bg-argo-cyan/5 text-fg' : 'border-ink-600 bg-ink-700/30 text-slate-400 hover:text-fg'
                          }`}
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
                <div className="rounded-xl border border-argo-cyan/20 bg-argo-cyan/5 p-4 animate-pulse">
                  <div className="flex justify-between items-center text-xs text-argo-cyan font-bold mb-2">
                    <span>Active Convolutional Pipeline Steps</span>
                    <span>78% complete</span>
                  </div>
                  <div className="h-2 w-full bg-ink-600 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-argo-cyan to-argo-violet" style={{ width: '78%' }} />
                  </div>
                  <div className="mt-2.5 flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>[✓] Check Integrity</span>
                    <span>[✓] Resize & Rescale</span>
                    <span>[✓] CLAHE contrast</span>
                    <span className="text-argo-cyan">[...] Inference Model</span>
                  </div>
                </div>
              )}

              {/* Slider Side-by-Side comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual view panel (2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden p-4">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Live Split Compare View (Original vs Preprocessed)</h4>
                    
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
                              className={`absolute border-2 text-[8px] font-bold text-white px-0.5 py-0.5 rounded shadow animate-pulse ${
                                det.confidence > 0.8 ? 'border-argo-red bg-argo-red/10' : 'border-argo-amber bg-argo-amber/10'
                              }`}
                              style={{ 
                                left: `${left}%`,
                                top: `${top}%`,
                                width: `${width}%`,
                                height: `${height}%`
                              }}
                            >
                              {det.name} {Math.round(det.confidence * 100)}%
                            </div>
                          );
                        })}
                      </div>

                      {/* Slider divider line */}
                      <div 
                        className="absolute inset-y-0 w-0.5 bg-argo-cyan shadow-lg"
                        style={{ left: `${compareSliderPos}%` }}
                      >
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-argo-cyan text-ink-900 text-xs font-bold font-mono">
                          ⇄
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytical results panel (1 column) */}
                <div className="space-y-6">
                  
                  {/* Pipeline Output */}
                  <div className="rounded-xl border border-ink-600 bg-ink-800 p-5 h-full flex flex-col">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-ink-600 pb-2 mb-3">Google Cloud Vision Results</h3>
                    
                    {!realtimeResult ? (
                      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                        <span className="text-2xl mb-1">⚡</span>
                        <p className="text-xs font-medium text-slate-500 leading-normal">Ready for Google Vision analysis. Click "Run Detection AI" above.</p>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col justify-between space-y-4 text-xs">
                        <div className="space-y-2">
                          {realtimeResult.summary && (
                            <div className="bg-argo-cyan/10 border border-argo-cyan/20 p-2.5 rounded-lg mb-3">
                              <span className="text-[10px] text-argo-cyan uppercase font-bold block mb-1">AI Summary</span>
                              <p className="text-[11px] leading-relaxed text-slate-300 italic">{realtimeResult.summary}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Processing Time</span>
                            <span className="font-mono font-bold text-argo-cyan">{realtimeResult.processingTime}ms</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Accurate Labels</span>
                            <span className="font-bold text-fg text-sm">{realtimeResult.concepts.length}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Localized Objects</span>
                            <span className="font-bold text-fg text-sm">{realtimeResult.detections.length}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Potential Defects</span>
                            <span className={`font-bold text-sm ${realtimeResult.defectsFound > 0 ? 'text-argo-red' : 'text-argo-green'}`}>
                              {realtimeResult.defectsFound}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Avg Confidence</span>
                            <span className="font-mono font-bold text-argo-violet">{(realtimeResult.confidence * 100).toFixed(1)}%</span>
                          </div>

                          <div className="border-t border-ink-600/50 pt-2">
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2">Top Accurate Features</span>
                            <div className="space-y-1">
                              {realtimeResult.concepts.slice(0, 5).map((concept, i) => (
                                <div key={i} className="flex items-center justify-between bg-ink-700/30 p-1.5 rounded">
                                  <span className="text-slate-300 truncate">{concept.name}</span>
                                  <span className="text-argo-cyan font-mono font-bold text-[9px]">{Math.round(concept.value * 100)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-ink-600/50 pt-2 text-[9px] text-slate-400 font-mono">
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
