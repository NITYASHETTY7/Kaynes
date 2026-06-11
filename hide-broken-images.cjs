const fs = require('fs');
let code = fs.readFileSync('src/components/MediaGallery.tsx', 'utf8');

// 1. Add state
code = code.replace(
  "const [viewer, setViewer] = useState<ViewerState>({ isOpen: false, item: null, deviceName: '' })",
  "const [viewer, setViewer] = useState<ViewerState>({ isOpen: false, item: null, deviceName: '' })\n  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})"
);

// 2. Update filter
code = code.replace(
  "const filtered = all.filter(\n    (f) => (kind === 'all' || f.item.kind === kind) && (deviceId === 'all' || f.deviceId === deviceId),\n  )",
  "const filtered = all.filter(\n    (f) => !failedImages[f.item.id] && (kind === 'all' || f.item.kind === kind) && (deviceId === 'all' || f.deviceId === deviceId),\n  )"
);

// 3. Add onImageError to CaptureThumb
code = code.replace(
  "onImageClick={() => setViewer({ isOpen: true, item: f.item, deviceName: f.deviceName })}",
  "onImageClick={() => setViewer({ isOpen: true, item: f.item, deviceName: f.deviceName })}\n                onImageError={() => setFailedImages(prev => ({ ...prev, [f.item.id]: true }))}"
);

fs.writeFileSync('src/components/MediaGallery.tsx', code);
console.log('MediaGallery updated');
