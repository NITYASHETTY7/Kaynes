const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  /const \[users, setUsers\] = useState<User\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [users, setUsers] = useState<User[]>([]);'
);
code = code.replace(
  /const \[tenants, setTenants\] = useState<Tenant\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [tenants, setTenants] = useState<Tenant[]>([]);'
);
code = code.replace(
  /const \[plants, setPlants\] = useState<Plant\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [plants, setPlants] = useState<Plant[]>([]);'
);
code = code.replace(
  /const \[assets, setAssets\] = useState<Asset\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [assets, setAssets] = useState<Asset[]>([]);'
);
code = code.replace(
  /const \[devices, setDevices\] = useState<ExtendedDevice\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [devices, setDevices] = useState<ExtendedDevice[]>([]);'
);
code = code.replace(
  /const \[notifications, setNotifications\] = useState<AppNotification\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [notifications, setNotifications] = useState<AppNotification[]>([]);'
);
code = code.replace(
  /const \[images, setImages\] = useState<ImageItem\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [images, setImages] = useState<ImageItem[]>([]);'
);
code = code.replace(
  /const \[aiResults, setAiResults\] = useState<AIResult\[\]>\(\(\) => \{[\s\S]*?\}\);/,
  'const [aiResults, setAiResults] = useState<AIResult[]>([]);'
);

// Remove the useEffect that saves to local storage
code = code.replace(
  /useEffect\(\(\) => \{[\s\S]*?if \(\!isSupabaseConnected\) \{[\s\S]*?localStorage\.setItem\('kaynes\.[^']+', JSON\.stringify\([^)]+\)\);[\s\S]*?\}[\s\S]*?\}, \[[^\]]+\]\);/g,
  ''
);

fs.writeFileSync('src/context/AppContext.tsx', code);
console.log('useState fallbacks removed');
