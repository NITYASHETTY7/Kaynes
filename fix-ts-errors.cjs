
const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace('deleteImage, \\n    deleteCapture,', 'deleteCapture,');
fs.writeFileSync('src/App.tsx', appTsx);

let captureThumb = fs.readFileSync('src/components/CaptureThumb.tsx', 'utf8');
captureThumb = captureThumb.replace(/\\{item\\.kind === 'video' && \\([\\s\\S]*?\\)\\}/, '');
fs.writeFileSync('src/components/CaptureThumb.tsx', captureThumb);

let imageViewer = fs.readFileSync('src/components/ImageViewer.tsx', 'utf8');
imageViewer = imageViewer.replace(/\\{item\\.kind === 'video' && item\\.durationSec && \\([\\s\\S]*?\\)\\}/, '');
fs.writeFileSync('src/components/ImageViewer.tsx', imageViewer);

let devicesTs = fs.readFileSync('src/data/devices.ts', 'utf8');
devicesTs = devicesTs.replace(/export function mediaVid[\\s\\S]*?\\}[\\s\\S]*?\\}/, '');
fs.writeFileSync('src/data/devices.ts', devicesTs);

console.log('Fixed TS errors');

