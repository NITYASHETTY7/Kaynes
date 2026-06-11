const fs = require('fs');

function fixMediaGallery() {
  let code = fs.readFileSync('src/components/MediaGallery.tsx', 'utf8');

  // Add import
  if (!code.includes("import { getDeviceImageUrl }")) {
    code = code.replace(
      "import ImageViewer from './ImageViewer'",
      "import ImageViewer from './ImageViewer'\nimport { getDeviceImageUrl } from '../lib/deviceImageMapper'"
    );
  }

  // Update handleDownload signature and URL calculation
  code = code.replace(
    /const handleDownload = async \(item: MediaItem\) => \{[\s\S]*?const url = `https:\/\/picsum\.photos\/seed\/\$\{item\.seed\}\/600\/400`;/,
    "const handleDownload = async (item: MediaItem, deviceName: string) => {\n    flash(`Downloading \"${item.label}\"…`);\n    try {\n      const url = (item as any).url || getDeviceImageUrl(deviceName, item.seed, item.label);"
  );

  // Update handleDownload call
  code = code.replace(
    /onClick=\{\(\) => handleDownload\(f\.item\)\}/,
    "onClick={() => handleDownload(f.item, f.deviceName)}"
  );

  fs.writeFileSync('src/components/MediaGallery.tsx', code);
}

function fixDeviceDrawer() {
  let code = fs.readFileSync('src/components/DeviceDrawer.tsx', 'utf8');

  // Add import
  if (!code.includes("import { getDeviceImageUrl }")) {
    code = code.replace(
      "import ImageViewer from './ImageViewer'",
      "import ImageViewer from './ImageViewer'\nimport { getDeviceImageUrl } from '../lib/deviceImageMapper'"
    );
  }

  // Replace download function
  code = code.replace(
    /function download\(item: MediaItem\) \{[\s\S]*?\}/,
    `async function download(item: MediaItem) {
    flash(\`Downloading "\${item.label}"…\`);
    try {
      const url = (item as any).url || getDeviceImageUrl(d.name, item.seed, item.label);
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = \`\${item.label.replace(/\\s+/g, '_')}.jpg\`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      flash(\`Failed to download "\${item.label}"\`);
    }
  }`
  );

  fs.writeFileSync('src/components/DeviceDrawer.tsx', code);
}

fixMediaGallery();
fixDeviceDrawer();
console.log('Fixed downloads');
