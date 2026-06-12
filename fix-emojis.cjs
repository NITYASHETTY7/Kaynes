const fs = require('fs');

function update(file, replacements, icons) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
      content = content.replaceAll(r[0], r[1]);
    }
    if (icons.length > 0) {
      const imp = "import { " + icons.join(', ') + " } from 'lucide-react';\n";
      // Insert after last import
      const idx = content.lastIndexOf('import ');
      if (idx !== -1) {
        const nextLine = content.indexOf('\n', idx) + 1;
        content = content.slice(0, nextLine) + imp + content.slice(nextLine);
      } else {
        content = imp + content;
      }
    }
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  } catch (e) {
    console.log('Error updating ' + file + ': ' + e.message);
  }
}

// AIPipeline.tsx
update('src/components/AIPipeline.tsx', [
  ['<span className="text-2xl block mb-1" style={{ color: \'rgb(var(--n-500))\' }}>📸</span>', '<Camera className="mb-1 mx-auto" size={24} style={{ color: \'rgb(var(--n-500))\' }} />'],
  ['\'📤 Upload & Mount Capture\'', '\'Upload & Mount Capture\''],
  ['<span className="text-5xl mb-4">🧠</span>', '<Brain className="mb-4 mx-auto text-violet-500" size={48} />'],
  ['\'⚡ Run Detection AI\'', '\'Run Detection AI\''],
  ['<span>[✓] Check Integrity</span>', '<span className="flex items-center gap-1"><CheckCircle2 className="text-emerald-500" size={14} /> Check Integrity</span>'],
  ['<span>[✓] Resize &amp; Rescale</span>', '<span className="flex items-center gap-1"><CheckCircle2 className="text-emerald-500" size={14} /> Resize &amp; Rescale</span>'],
  ['<span>[✓] CLAHE contrast</span>', '<span className="flex items-center gap-1"><CheckCircle2 className="text-emerald-500" size={14} /> CLAHE contrast</span>'],
  ['<span className="text-2xl mb-1">⚡</span>', '<Zap className="mb-1 mx-auto text-amber-500" size={24} />']
], ['Camera', 'Brain', 'CheckCircle2', 'Zap']);

// Assets.tsx
update('src/components/Assets.tsx', [
  ['<span className="text-4xl text-slate-600 block mb-3">📦</span>', '<Package className="mb-3 mx-auto text-slate-600" size={36} />'],
  ['<span className="text-lg">🧠</span>', '<Brain className="inline" size={18} />']
], ['Package', 'Brain']);

// CloudBridge.tsx
update('src/components/CloudBridge.tsx', [
  ["icon: '📡'", "icon: Radio"],
  ["icon: '🗄'", "icon: Database"],
  ["icon: '🧠'", "icon: Brain"],
  ["icon: '⚡'", "icon: Zap"],
  ["{s.icon}", "<s.icon size={20} />"]
], ['Radio', 'Database', 'Brain', 'Zap']);

// Dashboard.tsx
update('src/components/Dashboard.tsx', [
  ["icon: '📦'", "icon: Package"],
  ["icon: '🏭'", "icon: Factory"],
  ["icon: '📡'", "icon: Radio"],
  ["icon: '⚠'", "icon: AlertTriangle"],
  ["icon: '🧠'", "icon: Brain"]
], ['Package', 'Factory', 'Radio', 'AlertTriangle', 'Brain']);

// DeviceDrawer.tsx
update('src/components/DeviceDrawer.tsx', [
  ["{isEditing ? 'Cancel' : '✎'}", "{isEditing ? 'Cancel' : <Edit2 size={14} />}"],
  ['<button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">\n            ✕\n          </button>', '<button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>'],
  ["⚡ An SNS notification", "<Zap className=\"inline mr-1 text-amber-500\" size={14} /> An SNS notification"],
  ["🗑", "<Trash2 size={14} />"],
  ["✦ AI Device Diagnostic", "<Sparkles className=\"inline mr-2\" size={16} /> AI Device Diagnostic"]
], ['Edit2', 'X', 'Zap', 'Trash2', 'Sparkles']);

// ImageViewer.tsx
update('src/components/ImageViewer.tsx', [
  ["✕", "<X size={24} />"]
], ['X']);

// Login.tsx
update('src/components/Login.tsx', [
  ['icon="🛰"', 'icon={<Satellite size={16} />}'],
  ['icon="🧠"', 'icon={<Brain size={16} />}'],
  ['icon="☁"', 'icon={<Cloud size={16} />}'],
  ['icon="🔒"', 'icon={<Lock size={16} />}'],
  ['<span className="shrink-0 mt-0.5">⚠</span>', '<AlertTriangle className="shrink-0 mt-0.5" size={14} />'],
  ['<span className="shrink-0 mt-0.5">✓</span>', '<CheckCircle2 className="shrink-0 mt-0.5" size={14} />'],
  ['<span>⚠</span>', '<AlertTriangle className="inline" size={14} />'],
  ['<span>✓</span>', '<CheckCircle2 className="inline" size={14} />']
], ['Satellite', 'Brain', 'Cloud', 'Lock', 'AlertTriangle', 'CheckCircle2']);

// MediaGallery.tsx
update('src/components/MediaGallery.tsx', [
  ["icon: '💾'", "icon: Save"],
  ["icon: '📦'", "icon: Package"],
  ["icon: '☁'", "icon: Cloud"],
  ["icon: '🌐'", "icon: Globe"],
  ['<div className="text-3xl mb-3">📂</div>', '<FolderOpen className="mb-3 mx-auto" size={30} />'],
  ['<span className="text-xl">{s.icon}</span>', '<span className="flex items-center justify-center"><s.icon size={20} /></span>'],
  ["🗑", "<Trash2 size={14} />"]
], ['Save', 'Package', 'Cloud', 'Globe', 'FolderOpen', 'Trash2']);

// Reports.tsx
update('src/components/Reports.tsx', [
  ["'📊 Export to Excel / CSV'", "'Export to Excel / CSV'"],
  ["🖨 Generate Print PDF", "Generate Print PDF"],
  ["⚠️ TRUE", "TRUE"],
  ["✓ FALSE", "FALSE"]
], []);

// lib/aiInference.ts
update('src/lib/aiInference.ts', [
  ['🎯 ', ''],
  ['⚠️ ', ''],
  ['📊 ', '']
], []);

// lib/clarifaiInference.ts
update('src/lib/clarifaiInference.ts', [
  ['🎯 ', ''],
  ['🔍 ', ''],
  ['⚠️ ', ''],
  ['📊 ', '']
], []);
