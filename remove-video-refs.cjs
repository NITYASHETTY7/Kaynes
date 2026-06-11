const fs = require('fs');

// MediaGallery.tsx
let mediaGallery = fs.readFileSync('src/components/MediaGallery.tsx', 'utf8');
mediaGallery = mediaGallery.replace(
  '{f.item.kind === \'video\' ? \'Clip\' : \'Image\'} · {f.item.sizeMb} MB',
  'Image · {f.item.sizeMb} MB'
);

if (!mediaGallery.includes('const handleDownload = async (item: MediaItem)')) {
  mediaGallery = mediaGallery.replace(
    'const isAdmin = role === \'admin\'',
    'const isAdmin = role === \'admin\'\n\n  const handleDownload = async (item: MediaItem) => {\n    flash(`Downloading "${item.label}"…`);\n    try {\n      const url = `https://picsum.photos/seed/${item.seed}/600/400`;\n      const response = await fetch(url);\n      const blob = await response.blob();\n      const objectUrl = URL.createObjectURL(blob);\n      const link = document.createElement(\'a\');\n      link.href = objectUrl;\n      link.download = `${item.label.replace(/\\s+/g, \'_\')}.jpg`;\n      document.body.appendChild(link);\n      link.click();\n      document.body.removeChild(link);\n      URL.revokeObjectURL(objectUrl);\n    } catch (err) {\n      flash(`Failed to download "${item.label}"`);\n    }\n  };'
  );
  mediaGallery = mediaGallery.replace(
    'onClick={() => flash(`Preparing "${f.item.label}" for download…`)}',
    'onClick={() => handleDownload(f.item)}'
  );
}
fs.writeFileSync('src/components/MediaGallery.tsx', mediaGallery);

// DeviceDrawer.tsx
let deviceDrawer = fs.readFileSync('src/components/DeviceDrawer.tsx', 'utf8');
deviceDrawer = deviceDrawer.replace(
  '{m.kind === \'video\' ? \'Clip\' : \'Image\'} · {m.sizeMb} MB · {m.capturedAt}',
  'Image · {m.sizeMb} MB · {m.capturedAt}'
);

if (!deviceDrawer.includes('async function download(item: MediaItem)')) {
  deviceDrawer = deviceDrawer.replace(
    'function download(item: MediaItem) {\n    // Placeholder — production streams from S3 / CloudFront.\n    flash(`Preparing "${item.label}" for download…`)\n  }',
    'async function download(item: MediaItem) {\n    flash(`Downloading "${item.label}"…`);\n    try {\n      const url = `https://picsum.photos/seed/${item.seed}/600/400`;\n      const response = await fetch(url);\n      const blob = await response.blob();\n      const objectUrl = URL.createObjectURL(blob);\n      const link = document.createElement(\'a\');\n      link.href = objectUrl;\n      link.download = `${item.label.replace(/\\s+/g, \'_\')}.jpg`;\n      document.body.appendChild(link);\n      link.click();\n      document.body.removeChild(link);\n      URL.revokeObjectURL(objectUrl);\n    } catch (err) {\n      flash(`Failed to download "${item.label}"`);\n    }\n  }'
  );
}
fs.writeFileSync('src/components/DeviceDrawer.tsx', deviceDrawer);

// CaptureThumb.tsx
let captureThumb = fs.readFileSync('src/components/CaptureThumb.tsx', 'utf8');
captureThumb = captureThumb.replace(
  '{item.kind === \'video\' ? \'CLIP\' : \'STILL\'}',
  '\'STILL\''
);
// Remove the duration div safely
captureThumb = captureThumb.replace(
  /{item\.kind === 'video' && \([\s\S]*?<\/div>\n      \)}/,
  ''
);
fs.writeFileSync('src/components/CaptureThumb.tsx', captureThumb);

// ImageViewer.tsx
let imageViewer = fs.readFileSync('src/components/ImageViewer.tsx', 'utf8');
imageViewer = imageViewer.replace(
  /{item\.kind === 'video' && item\.durationSec && \([\s\S]*?<\/div>\n            \)}/,
  ''
);
fs.writeFileSync('src/components/ImageViewer.tsx', imageViewer);

console.log('Video refs removed properly');
