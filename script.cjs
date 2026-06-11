
const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. generateUUID
code = code.replace('export function generateUUID()', 'function generateUUID()');

// 2. deleteCapture AppContext definition
code = code.replace(
  'deleteImage: (id: string) => Promise<void>;',
  'deleteImage: (id: string) => Promise<void>;\n  deleteCapture: (deviceId: number, captureId: string) => Promise<void>;'
);

// 3. deleteCapture implementation
code = code.replace(
  'const deleteImage = async (id: string) => {',
  'const deleteCapture = async (deviceId: number, captureId: string) => {\n    const targetDev = devices.find(d => d.id === deviceId);\n    if (targetDev) {\n      const updatedCaptures = targetDev.captures.filter(c => c.id !== captureId);\n      await updateDevice(deviceId, { captures: updatedCaptures });\n    }\n  };\n\n  const deleteImage = async (id: string) => {'
);

// 4. deleteCapture context provider
code = code.replace(
  'deleteImage,\n      archiveImage,',
  'deleteImage,\n      deleteCapture,\n      archiveImage,'
);

// 5. App.tsx changes for deleteCapture
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
  'const { devices, currentUser, deleteImage } = useApp();',
  'const { devices, currentUser, deleteImage, deleteCapture } = useApp();'
);
appCode = appCode.replace(
  'const deleteCapture = (_deviceId: number, mediaId: string) => {\n    deleteImage(mediaId);\n  };',
  ''
);

fs.writeFileSync('src/context/AppContext.tsx', code);
fs.writeFileSync('src/App.tsx', appCode);

console.log('App changes done');

