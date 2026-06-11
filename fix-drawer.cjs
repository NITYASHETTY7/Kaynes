const fs = require('fs');
let code = fs.readFileSync('src/components/DeviceDrawer.tsx', 'utf8');

if (!code.includes("import { getDeviceImageUrl }")) {
  code = code.replace(
    "import ImageViewer from './ImageViewer'",
    "import ImageViewer from './ImageViewer'\nimport { getDeviceImageUrl } from '../lib/deviceImageMapper'"
  );
}

// Convert all newlines in both strings to regex matches for \r?\n to handle CRLF issues
const regexPattern = /function download\(item: MediaItem\) \{\s*\/\/ Placeholder — production streams from S3 \/ CloudFront\.\s*flash\(`Preparing "\$\{item\.label\}" for download…`\)\s*\}/m;

const replacement = `async function download(item: MediaItem) {
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
  }`;

if (regexPattern.test(code)) {
  code = code.replace(regexPattern, replacement);
  fs.writeFileSync('src/components/DeviceDrawer.tsx', code);
  console.log('Fixed drawer using regex match');
} else {
  console.error('Target not found in drawer. Regex failed.');
}
