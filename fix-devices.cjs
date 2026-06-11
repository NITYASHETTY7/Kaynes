const fs = require('fs');

// 1. devices.ts
let devicesTs = fs.readFileSync('src/data/devices.ts', 'utf8');

// Update MediaKind
devicesTs = devicesTs.replace('export type MediaKind = \'image\' | \'video\'', 'export type MediaKind = \'image\'');

// Remove durationSec
devicesTs = devicesTs.replace('durationSec?: number // video only', 'durationSec?: number // duration removed');

// Disable video gen
devicesTs = devicesTs.replace('const isVid = rng() < 0.25', 'const isVid = false // rng() < 0.25');

// Remove mediaVid definition
devicesTs = devicesTs.replace(/export function mediaVid[\s\S]*?\}[\s\S]*?\}/, '');

// Remove mediaVid usages in HERO_DEVICES
devicesTs = devicesTs.replace(
  /mediaVid\('00000000-0000-0000-0000-000000000403', 'Remote-assist: rework cell', '1 h ago', 88\.0, 142, 4203, \[\s*'remote-assist',\s*'rework',\s*\]\),/,
  ''
);

devicesTs = devicesTs.replace(
  /mediaVid\('00000000-0000-0000-0000-000000000407', 'Assembly walkthrough', '35 min ago', 64\.0, 96, 1502, \[\s*'assembly',\s*'training-data',\s*\]\),/,
  ''
);

fs.writeFileSync('src/data/devices.ts', devicesTs);

// 2. MediaGallery.tsx type KindFilter
let mediaGallery = fs.readFileSync('src/components/MediaGallery.tsx', 'utf8');
mediaGallery = mediaGallery.replace('type KindFilter = \'all\' | \'image\' | \'video\'', 'type KindFilter = \'all\' | \'image\'');
mediaGallery = mediaGallery.replace('{([\'all\', \'image\', \'video\'] as KindFilter[]).map((k) => (', '{([\'all\', \'image\'] as KindFilter[]).map((k) => (');
mediaGallery = mediaGallery.replace('{k === \'all\' ? \'All\' : k === \'image\' ? \'Photos\' : \'Clips\'}', '{k === \'all\' ? \'All\' : \'Photos\'}');
fs.writeFileSync('src/components/MediaGallery.tsx', mediaGallery);

console.log('devices.ts and MediaGallery types fixed');
