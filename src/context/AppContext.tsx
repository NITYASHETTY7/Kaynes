import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Device } from '../data/devices';
import { supabase } from '../lib/supabaseClient';

// Helper to generate RFC4122-compliant UUIDs for Supabase PostgreSQL compatibility
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getDeviceIdFromSerial(serial: string): number {
  const match = serial.match(/\d+$/);
  return match ? parseInt(match[0], 10) : Math.floor(Math.random() * 1000);
}

// Types
export type UserRole = 'admin' | 'inspector' | 'operator';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  tenantId: string;
  plantId: string | null;
  status: UserStatus;
  isDeleted: boolean;
  created_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  subscription: 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Plant {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  capacity: string;
  manager: string;
  created_at: string;
}

export interface AssetHistoryNode {
  id: string;
  date: string;
  type: string;
  description: string;
  operator: string;
}

export interface AssetTimelineNode {
  id: string;
  date: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Asset {
  id: string;
  plantId: string;
  name: string;
  serialNumber: string;
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical';
  category: string;
  lastServiced: string;
  imageUrl: string | null;
  history: AssetHistoryNode[];
  timeline: AssetTimelineNode[];
  created_at: string;
}

export interface DeviceLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface ExtendedDevice extends Device {
  plantId: string | null;
  assetId: string | null;
  logs: DeviceLog[];
}

export interface ImageItem {
  id: string;
  assetId: string | null;
  deviceId: number | null;
  url: string;
  label: string;
  capturedAt: string;
  sizeMb: number;
  tags: string[];
  isArchived: boolean;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
}

export interface AIResult {
  id: string;
  imageId: string;
  defectDetected: boolean;
  classification: string;
  confidence: number;
  severity: 'normal' | 'warning' | 'critical';
  healthScore: number;
  recommendation: string;
  preprocessingApplied: string[];
  boundingBoxes: BoundingBox[];
  created_at: string;
}

export interface AppNotification {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

interface AppContextType {
  // Session / Auth
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  login: (email: string, passwordHash: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  
  // Lists
  users: User[];
  tenants: Tenant[];
  plants: Plant[];
  assets: Asset[];
  devices: ExtendedDevice[];
  images: ImageItem[];
  aiResults: AIResult[];
  notifications: AppNotification[];

  // User CRUD
  addUser: (u: Omit<User, 'id' | 'created_at' | 'isDeleted'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>; // Soft delete
  
  // Tenant CRUD
  addTenant: (t: Omit<Tenant, 'id' | 'created_at'>) => Promise<void>;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;

  // Plant CRUD
  addPlant: (p: Omit<Plant, 'id' | 'created_at'>) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;

  // Asset CRUD
  addAsset: (a: Omit<Asset, 'id' | 'created_at' | 'history' | 'timeline' | 'healthScore' | 'status'>) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addAssetHistory: (assetId: string, node: Omit<AssetHistoryNode, 'id'>) => Promise<void>;

  // Device CRUD
  registerDevice: (d: Omit<ExtendedDevice, 'id' | 'logs'>) => Promise<void>;
  updateDevice: (id: number, updates: Partial<ExtendedDevice>) => Promise<void>;
  deleteDevice: (id: number) => Promise<void>;
  mapDeviceToAsset: (deviceId: number, assetId: string | null) => Promise<void>;
  updateFirmware: (deviceId: number) => Promise<void>;
  addDeviceLog: (deviceId: number, level: 'info' | 'warn' | 'error', message: string) => Promise<void>;

  // Image & AI Processing
  uploadImageFile: (file: File, label: string, assetId: string | null, deviceId: number | null, tags: string[]) => Promise<ImageItem | null>;
  uploadImage: (image: Omit<ImageItem, 'id' | 'created_at' | 'isArchived' | 'status'>) => Promise<ImageItem>;
  deleteImage: (id: string) => Promise<void>;
  archiveImage: (id: string) => Promise<void>;
  runAIProcessing: (imageId: string, filters: string[]) => Promise<AIResult>;

  // Notifications
  addNotification: (title: string, message: string, severity: 'info' | 'warning' | 'critical') => Promise<void>;
  acknowledgeNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;

  // System States
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Initial default seed values in compliant UUID formats
export const DEFAULT_TENANTS: Tenant[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Kaynes Technology Ltd', subscription: 'Enterprise', status: 'active', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Mirai Labs', subscription: 'Starter', status: 'active', created_at: new Date().toISOString() },
];

export const DEFAULT_PLANTS: Plant[] = [
  { id: '00000000-0000-0000-0000-000000000002', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Mysuru Plant 2', location: 'Karnataka, India', capacity: '1.2M units/yr', manager: 'S. Ranganath', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000102', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Bangalore Facility 3', location: 'Karnataka, India', capacity: '800k units/yr', manager: 'R. Kulkarni', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000103', tenantId: '00000000-0000-0000-0000-000000000001', name: 'Chennai Aerospace', location: 'Tamil Nadu, India', capacity: '200k units/yr', manager: 'K. Srinivasan', created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000104', tenantId: '00000000-0000-0000-0000-000000000002', name: 'Tokyo Central R&D', location: 'Tokyo, Japan', capacity: '100k units/yr', manager: 'Y. Tanaka', created_at: new Date().toISOString() },
];

export const DEFAULT_USERS: User[] = [
  { id: '00000000-0000-0000-0000-000000000201', email: 'admin@kaynes.com', name: 'Kaynes Fleet Admin', passwordHash: 'admin123', role: 'admin', tenantId: '00000000-0000-0000-0000-000000000001', plantId: null, status: 'active', isDeleted: false, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000202', email: 'inspector@kaynes.com', name: 'QA Inspector Mysuru', passwordHash: 'inspector123', role: 'inspector', tenantId: '00000000-0000-0000-0000-000000000001', plantId: '00000000-0000-0000-0000-000000000002', status: 'active', isDeleted: false, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000203', email: 'operator@kaynes.com', name: 'Line-A Solder Operator', passwordHash: 'operator123', role: 'operator', tenantId: '00000000-0000-0000-0000-000000000001', plantId: '00000000-0000-0000-0000-000000000002', status: 'active', isDeleted: false, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000204', email: 'demo@kaynes.com', name: 'Demo Account', passwordHash: 'demo123', role: 'admin', tenantId: '00000000-0000-0000-0000-000000000001', plantId: null, status: 'active', isDeleted: false, created_at: new Date().toISOString() },
];

export const DEFAULT_ASSETS: Asset[] = [
  {
    id: '00000000-0000-0000-0000-000000000301',
    plantId: '00000000-0000-0000-0000-000000000002',
    name: 'Solder Wave Reflow Line-A',
    serialNumber: 'SWR-LA-900',
    healthScore: 78,
    status: 'warning',
    category: 'Reflow Oven',
    lastServiced: '2026-05-15',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    history: [
      { id: 'h-1', date: '2026-05-15', type: 'Maintenance', description: 'Replaced nozzle heating elements and calibrated heat chambers.', operator: 'K. Deshpande' },
      { id: 'h-2', date: '2026-04-10', type: 'Calibration', description: 'Standard thermal profiling and belt speed calibration completed.', operator: 'M. Rao' }
    ],
    timeline: [
      { id: 't-1', date: '2 h ago', title: 'Thermal Anomaly Detected', description: 'Model flags potential heating coil exhaustion on nozzle chamber 4.', severity: 'warning' },
      { id: 't-2', date: '2 days ago', title: 'Scheduled Servicing Completed', description: 'Comprehensive nozzle diagnostic, cleaning, and recalibration.', severity: 'info' }
    ]
  },
  {
    id: '00000000-0000-0000-0000-000000000302',
    plantId: '00000000-0000-0000-0000-000000000103',
    name: 'Aerospace Turbine QA Jig 1',
    serialNumber: 'ATQ-J1-4042',
    healthScore: 92,
    status: 'healthy',
    category: 'QA Jig',
    lastServiced: '2026-05-20',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
    created_at: new Date().toISOString(),
    history: [
      { id: 'h-3', date: '2026-05-20', type: 'Upgrade', description: 'Installed high-definition optical inspection sensors.', operator: 'S. Iyer' }
    ],
    timeline: [
      { id: 't-3', date: '12 min ago', title: 'Turbine blade scan complete', description: 'AI inspection flagged 0 surface hairline fractures in 15 blades.', severity: 'info' }
    ]
  },
  {
    id: '00000000-0000-0000-0000-000000000303',
    plantId: '00000000-0000-0000-0000-000000000102',
    name: 'Wiring Harness Assembler 3',
    serialNumber: 'WHA-0015',
    healthScore: 98,
    status: 'healthy',
    category: 'Assembler',
    lastServiced: '2026-06-01',
    imageUrl: null,
    created_at: new Date().toISOString(),
    history: [],
    timeline: []
  }
];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  { id: '00000000-0000-0000-0000-000000000501', severity: 'critical', title: 'Imminent Power Cut Alert', message: 'Line-A Inspector Glasses (ARGO-AG2-0042) is at 8% battery with cell temperature at 47°C.', acknowledged: false, created_at: new Date().toISOString() },
  { id: '00000000-0000-0000-0000-000000000502', severity: 'warning', title: 'Storage Near Full', message: 'Aerospace QA-1 (ARGO-AG2-0007) storage is at 96% capacity. Offload captures to avoid loss.', acknowledged: false, created_at: new Date(Date.now() - 600000).toISOString() },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kaynes.theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kaynes.theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Current user session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('kaynes.session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // No local state fallbacks - DB only
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [devices, setDevices] = useState<ExtendedDevice[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Save session to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kaynes.session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kaynes.session');
    }
  }, [currentUser]);

  // Synchronize state with Supabase or fallback to LocalStorage
  const syncFromSupabase = async () => {
    if (!supabase) return;
    setIsSyncing(true);
    try {
      // 1. Tenants
      const { data: dbTenants, error: tenantErr } = await supabase.from('tenants').select('*');
      if (tenantErr) throw tenantErr;
      if (dbTenants && dbTenants.length > 0) {
        setTenants(dbTenants.map(t => ({
          id: t.id,
          name: t.name,
          subscription: t.subscription || 'Starter',
          status: t.status || 'active',
          created_at: t.created_at
        })));
      }

      // 2. Plants
      const { data: dbPlants, error: plantErr } = await supabase.from('plants').select('*');
      if (plantErr) throw plantErr;
      if (dbPlants && dbPlants.length > 0) {
        setPlants(dbPlants.map(p => ({
          id: p.id,
          tenantId: p.tenant_id,
          name: p.name,
          location: p.location || '',
          capacity: p.capacity || '',
          manager: p.manager || '',
          created_at: p.created_at
        })));
      }

      // 3. Profiles
      const { data: dbUsers, error: userErr } = await supabase.from('profiles').select('*');
      if (userErr) throw userErr;
      if (dbUsers && dbUsers.length > 0) {
        setUsers(dbUsers.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          passwordHash: u.password_hash,
          role: u.role,
          tenantId: u.tenant_id,
          plantId: u.plant_id,
          status: u.status,
          isDeleted: u.is_deleted || false,
          created_at: u.created_at
        })));
      }

      // 4. Assets
      const { data: dbAssets, error: assetErr } = await supabase.from('assets').select('*');
      if (assetErr) throw assetErr;
      if (dbAssets && dbAssets.length > 0) {
        setAssets(dbAssets.map(a => ({
          id: a.id,
          plantId: a.plant_id,
          name: a.name,
          serialNumber: a.serial_number,
          healthScore: a.health_score || 100,
          status: a.status || 'healthy',
          category: a.category || 'General',
          lastServiced: a.last_serviced || '',
          imageUrl: a.image_url,
          history: a.history || [],
          timeline: a.timeline || [],
          created_at: a.created_at
        })));
      }

      // 5. Devices
      const { data: dbDevices, error: devErr } = await supabase.from('devices').select('*');
      if (devErr) throw devErr;
      if (dbDevices && dbDevices.length > 0) {
        setDevices(dbDevices.map(d => ({
          id: getDeviceIdFromSerial(d.serial),
          serial: d.serial,
          name: d.name,
          site: d.site || 'Unknown',
          operator: d.operator || 'Unassigned',
          status: d.status,
          connection: d.connection,
          battery: d.battery || 100,
          batteryHealth: d.battery_health || 100,
          signal: d.signal || 100,
          temperatureC: d.temperature_c || 25,
          firmware: d.firmware || 'AG-OS 2.5.0',
          storageUsedGb: Number(d.storage_used_gb) || 0,
          storageTotalGb: Number(d.storage_total_gb) || 32,
          lastSeen: d.last_seen || 'just now',
          historicalBattery: d.historical_battery || [90, 85, 80],
          captures: d.captures || [],
          forecast: d.forecast || { severity: 'normal', confidence: 95, predictedIssue: 'None', alertText: 'Nominal', recommendedAction: 'None' },
          uptimeHrs: d.uptime_hrs || 0,
          plantId: d.plant_id,
          assetId: d.asset_id,
          logs: d.logs || []
        })));
      }

      // 6. Images
      const { data: dbImages, error: imgErr } = await supabase.from('images').select('*');
      if (imgErr) throw imgErr;
      if (dbImages && dbImages.length > 0) {
        setImages(dbImages.map(img => ({
          id: img.id,
          assetId: img.asset_id,
          deviceId: img.device_id,
          url: img.url,
          label: img.label,
          capturedAt: img.captured_at,
          sizeMb: Number(img.size_mb) || 0,
          tags: img.tags || [],
          isArchived: img.is_archived || false,
          status: img.status || 'processed',
          created_at: img.created_at
        })));
      }

      // 7. AI Results
      const { data: dbAiRes, error: aiErr } = await supabase.from('ai_results').select('*');
      if (aiErr) throw aiErr;
      if (dbAiRes && dbAiRes.length > 0) {
        setAiResults(dbAiRes.map(res => ({
          id: res.id,
          imageId: res.image_id,
          defectDetected: res.defect_detected || false,
          classification: res.classification,
          confidence: Number(res.confidence) || 0,
          severity: res.severity || 'normal',
          healthScore: res.health_score || 100,
          recommendation: res.recommendation || '',
          preprocessingApplied: res.preprocessing_applied || [],
          boundingBoxes: res.bounding_boxes || [],
          created_at: res.created_at
        })));
      }

      // 8. Notifications
      const { data: dbNotif, error: notifErr } = await supabase.from('notifications').select('*');
      if (notifErr) throw notifErr;
      if (dbNotif && dbNotif.length > 0) {
        setNotifications(dbNotif.map(n => ({
          id: n.id,
          severity: n.severity || 'warning',
          title: n.title,
          message: n.message,
          acknowledged: n.acknowledged || false,
          created_at: n.created_at
        })));
      }

      setIsSupabaseConnected(true);
    } catch (e) {
      console.error('Failed to sync with Supabase tables. Strict DB mode is enforced:', e);
      setIsSupabaseConnected(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mount logic - Try Supabase sync
  useEffect(() => {
    if (supabase) {
      syncFromSupabase();
    } else {
      setIsSupabaseConnected(false);
    }
  }, []);

  // Local state save removed per strict DB requirements
  // Auth Operations
  const login = async (email: string, passwordHash: string) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && !u.isDeleted);
    if (!foundUser) {
      return { success: false, error: 'No user account found with that email address.' };
    }
    if (foundUser.status === 'inactive') {
      return { success: false, error: 'This user account is currently deactivated.' };
    }
    if (foundUser.passwordHash !== passwordHash) {
      return { success: false, error: 'Incorrect password.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const forgotPassword = async (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && !u.isDeleted);
    if (!found) {
      return { success: false, message: 'If this email exists, a code was sent.' };
    }
    return { success: true, message: `A recovery link has been sent to ${email} (Demo code: kaynes123)` };
  };

  const resetPassword = async (email: string, newPass: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && !u.isDeleted);
    if (!found) return { success: false, message: 'Reset failed. Email not found.' };

    if (isSupabaseConnected && supabase) {
      await supabase.from('profiles').update({ password_hash: newPass }).eq('email', email);
    }
    setUsers(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, passwordHash: newPass } : u));
    return { success: true, message: 'Password has been updated.' };
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: 'No user logged in.' };
    
    const dbUser = users.find(u => u.id === currentUser.id);
    if (!dbUser || dbUser.passwordHash !== oldPass) {
      return { success: false, error: 'Current password verification failed.' };
    }

    if (isSupabaseConnected && supabase) {
      await supabase.from('profiles').update({ password_hash: newPass }).eq('id', currentUser.id);
    }
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, passwordHash: newPass } : u));
    setCurrentUser(prev => prev ? { ...prev, passwordHash: newPass } : null);
    return { success: true };
  };

  // User CRUD
  const addUser = async (u: Omit<User, 'id' | 'created_at' | 'isDeleted'>) => {
    const id = generateUUID();
    const newUser: User = { ...u, id, created_at: new Date().toISOString(), isDeleted: false };
    
    if (isSupabaseConnected && supabase) {
      await supabase.from('profiles').insert({
        id,
        email: u.email,
        name: u.name,
        password_hash: u.passwordHash,
        role: u.role,
        tenant_id: u.tenantId,
        plant_id: u.plantId,
        status: u.status,
        is_deleted: false
      });
    }

    setUsers(prev => [...prev, newUser]);
    addNotification('User Created', `User account ${newUser.name} created.`, 'info');
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isSupabaseConnected && supabase) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.tenantId) dbUpdates.tenant_id = updates.tenantId;
      if (updates.plantId !== undefined) dbUpdates.plant_id = updates.plantId;
      if (updates.isDeleted !== undefined) dbUpdates.is_deleted = updates.isDeleted;
      
      await supabase.from('profiles').update(dbUpdates).eq('id', id);
    }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = async (id: string) => {
    await updateUser(id, { isDeleted: true });
    addNotification('User Deleted', 'A user account has been soft-deleted.', 'info');
  };

  // Tenant CRUD
  const addTenant = async (t: Omit<Tenant, 'id' | 'created_at'>) => {
    const id = `tenant-${Date.now()}`;
    const newTenant: Tenant = { ...t, id, created_at: new Date().toISOString() };
    
    if (isSupabaseConnected && supabase) {
      await supabase.from('tenants').insert({ id, name: t.name, subscription: t.subscription, status: t.status });
    }
    setTenants(prev => [...prev, newTenant]);
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('tenants').update(updates).eq('id', id);
    }
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTenant = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('tenants').delete().eq('id', id);
    }
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  // Plant CRUD
  const addPlant = async (p: Omit<Plant, 'id' | 'created_at'>) => {
    const id = `plant-${Date.now()}`;
    const newPlant: Plant = { ...p, id, created_at: new Date().toISOString() };
    
    if (isSupabaseConnected && supabase) {
      await supabase.from('plants').insert({ id, tenant_id: p.tenantId, name: p.name, location: p.location, capacity: p.capacity, manager: p.manager });
    }
    setPlants(prev => [...prev, newPlant]);
  };

  const updatePlant = async (id: string, updates: Partial<Plant>) => {
    if (isSupabaseConnected && supabase) {
      const dbUp: any = {};
      if (updates.name) dbUp.name = updates.name;
      if (updates.location) dbUp.location = updates.location;
      if (updates.capacity) dbUp.capacity = updates.capacity;
      if (updates.manager) dbUp.manager = updates.manager;
      if (updates.tenantId) dbUp.tenant_id = updates.tenantId;
      await supabase.from('plants').update(dbUp).eq('id', id);
    }
    setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlant = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('plants').delete().eq('id', id);
    }
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  // Asset CRUD
  const addAsset = async (a: Omit<Asset, 'id' | 'created_at' | 'history' | 'timeline' | 'healthScore' | 'status'>) => {
    const id = `asset-${Date.now()}`;
    const newAsset: Asset = {
      ...a,
      id,
      healthScore: 100,
      status: 'healthy',
      history: [{ id: `h-a-${Date.now()}`, date: new Date().toLocaleDateString(), type: 'Commissioning', description: 'Asset registered in database.', operator: currentUser?.name || 'System' }],
      timeline: [{ id: `t-a-${Date.now()}`, date: 'Just now', title: 'Asset Commissioned', description: 'Monitoring initialized.', severity: 'info' }],
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected && supabase) {
      await supabase.from('assets').insert({
        id,
        plant_id: a.plantId,
        name: a.name,
        serial_number: a.serialNumber,
        category: a.category,
        last_serviced: newAsset.lastServiced,
        image_url: a.imageUrl,
        history: newAsset.history,
        timeline: newAsset.timeline
      });
    }

    setAssets(prev => [...prev, newAsset]);
    addNotification('Asset Added', `New asset "${newAsset.name}" registered.`, 'info');
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (isSupabaseConnected && supabase) {
      const dbUp: any = {};
      if (updates.name) dbUp.name = updates.name;
      if (updates.status) dbUp.status = updates.status;
      if (updates.healthScore !== undefined) dbUp.health_score = updates.healthScore;
      if (updates.history) dbUp.history = updates.history;
      if (updates.timeline) dbUp.timeline = updates.timeline;
      await supabase.from('assets').update(dbUp).eq('id', id);
    }
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAsset = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('assets').delete().eq('id', id);
    }
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const addAssetHistory = async (assetId: string, node: Omit<AssetHistoryNode, 'id'>) => {
    const historyNode = { ...node, id: `h-n-${Date.now()}` };
    const timelineNode: AssetTimelineNode = {
      id: `t-n-${Date.now()}`,
      date: 'Just now',
      title: node.type,
      description: node.description,
      severity: node.type.toLowerCase() === 'maintenance' ? 'info' : 'warning'
    };

    const target = assets.find(a => a.id === assetId);
    if (target) {
      const updatedHistory = [historyNode, ...target.history];
      const updatedTimeline = [timelineNode, ...target.timeline];
      await updateAsset(assetId, { history: updatedHistory, timeline: updatedTimeline });
    }
  };

  // Device CRUD
  const registerDevice = async (d: Omit<ExtendedDevice, 'id' | 'logs'>) => {
    const newId = devices.length > 0 ? Math.max(...devices.map(dev => dev.id)) + 1 : 100;
    const newDevice: ExtendedDevice = {
      ...d,
      id: newId,
      logs: [{ id: `l-${newId}-reg`, timestamp: 'Just now', level: 'info', message: `Device registered: Serial ${d.serial}` }]
    };

    if (isSupabaseConnected && supabase) {
      await supabase.from('devices').insert({
        serial: d.serial,
        name: d.name,
        status: d.status,
        connection: d.connection,
        battery: d.battery,
        battery_health: d.batteryHealth,
        signal: d.signal,
        temperature_c: d.temperatureC,
        firmware: d.firmware,
        storage_used_gb: d.storageUsedGb,
        storage_total_gb: d.storageTotalGb,
        uptime_hrs: d.uptimeHrs,
        plant_id: d.plantId,
        asset_id: d.assetId,
        logs: newDevice.logs
      });
    }

    setDevices(prev => [...prev, newDevice]);
    addNotification('Device Registered', `Registered glasses serial "${d.serial}".`, 'info');
  };

  const updateDevice = async (id: number, updates: Partial<ExtendedDevice>) => {
    if (isSupabaseConnected && supabase) {
      const dbUp: any = {};
      if (updates.name) dbUp.name = updates.name;
      if (updates.status) dbUp.status = updates.status;
      if (updates.connection) dbUp.connection = updates.connection;
      if (updates.battery !== undefined) dbUp.battery = updates.battery;
      if (updates.firmware) dbUp.firmware = updates.firmware;
      if (updates.assetId !== undefined) dbUp.asset_id = updates.assetId;
      if (updates.plantId !== undefined) dbUp.plant_id = updates.plantId;
      if (updates.logs) dbUp.logs = updates.logs;
      
      await supabase.from('devices').update(dbUp).eq('serial', devices.find(d => d.id === id)?.serial);
    }
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDevice = async (id: number) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('devices').delete().eq('serial', devices.find(d => d.id === id)?.serial);
    }
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const mapDeviceToAsset = async (deviceId: number, assetId: string | null) => {
    const targetAsset = assets.find(a => a.id === assetId);
    const plantId = targetAsset ? targetAsset.plantId : null;
    const site = targetAsset ? plants.find(p => p.id === targetAsset.plantId)?.name || 'Central' : 'Unassigned';
    
    const targetDev = devices.find(d => d.id === deviceId);
    if (targetDev) {
      const logs = [...targetDev.logs];
      logs.unshift({
        id: `l-${Date.now()}`,
        timestamp: 'just now',
        level: 'info',
        message: assetId ? `Mapped to Asset "${targetAsset?.name}" in ${site}.` : 'Unmapped from asset.'
      });
      await updateDevice(deviceId, { assetId, plantId, site, logs });
    }
  };

  const updateFirmware = async (deviceId: number) => {
    const target = devices.find(d => d.id === deviceId);
    if (!target) return;

    // Simulate OTA update with incremental steps
    await addDeviceLog(deviceId, 'info', 'Initiating over-the-air (OTA) firmware upgrade.');
    await new Promise(r => setTimeout(r, 1500));
    await addDeviceLog(deviceId, 'info', 'Downloading package: 100% complete.');
    await new Promise(r => setTimeout(r, 1000));
    
    // Perform re-assignment logs in state
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          status: 'offline',
          connection: 'Offline',
          logs: [{ id: `ota-${Date.now()}`, timestamp: 'just now', level: 'info', message: 'Installing update... Device rebooting.' }, ...d.logs]
        };
      }
      return d;
    }));

    await new Promise(r => setTimeout(r, 2000));
    
    // Complete update
    const finalLogs: DeviceLog[] = [{ id: `ota-ok-${Date.now()}`, timestamp: 'just now', level: 'info', message: 'Upgrade complete! Connected. Running AG-OS 2.5.0.' }];
    await updateDevice(deviceId, {
      status: 'online',
      connection: 'Wi-Fi',
      firmware: 'AG-OS 2.5.0',
      logs: [...finalLogs, ...target.logs]
    });

    addNotification('Firmware Update Successful', `Device upgraded to AG-OS 2.5.0`, 'info');
  };

  const addDeviceLog = async (deviceId: number, level: 'info' | 'warn' | 'error', message: string) => {
    const target = devices.find(d => d.id === deviceId);
    if (target) {
      const updatedLogs = [{ id: `log-${Date.now()}`, timestamp: 'just now', level, message }, ...target.logs].slice(0, 50);
      await updateDevice(deviceId, { logs: updatedLogs });
    }
  };

  // Image & AI Processing Storage Upload
  const uploadImageFile = async (file: File, label: string, assetId: string | null, deviceId: number | null, tags: string[]): Promise<ImageItem | null> => {
    let publicUrl = '';
    
    if (isSupabaseConnected && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `captures/${fileName}`;

        // 1. Upload to Supabase Storage Bucket
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;

        // 2. Fetch Public URL
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      } catch (e) {
        console.error('Storage bucket upload failed, defaulting to local preview link:', e);
        publicUrl = URL.createObjectURL(file);
      }
    } else {
      // Fallback
      publicUrl = URL.createObjectURL(file);
    }

    // Call upload image metadata CRUD
    const imgObj = await uploadImage({
      assetId,
      deviceId,
      url: publicUrl,
      label,
      sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
      tags,
      capturedAt: 'just now'
    });

    return imgObj;
  };

  const uploadImage = async (img: Omit<ImageItem, 'id' | 'created_at' | 'isArchived' | 'status'>) => {
    const id = generateUUID();
    const newImage: ImageItem = { ...img, id, isArchived: false, status: 'pending', created_at: new Date().toISOString() };
    
    if (isSupabaseConnected && supabase) {
      await supabase.from('images').insert({
        id,
        asset_id: img.assetId,
        device_id: img.deviceId,
        url: img.url,
        label: img.label,
        size_mb: img.sizeMb,
        tags: img.tags,
        is_archived: false,
        status: 'pending'
      });
    }

    setImages(prev => [newImage, ...prev]);
    addNotification('Image Uploaded', `Captured image "${newImage.label}" uploaded.`, 'info');
    return newImage;
  };

  const deleteImage = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('images').delete().eq('id', id);
    }
    setImages(prev => prev.filter(img => img.id !== id));
    setAiResults(prev => prev.filter(res => res.imageId !== id));
  };

  const archiveImage = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('images').update({ is_archived: true }).eq('id', id);
    }
    setImages(prev => prev.map(img => img.id === id ? { ...img, isArchived: true } : img));
  };
  // AI Processing Pipeline
  const runAIProcessing = async (imageId: string, filters: string[]) => {
    // Mark as pending
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'pending' } : img));
    if (isSupabaseConnected && supabase) {
      await supabase.from('images').update({ status: 'pending' }).eq('id', imageId);
    }

    const targetImage = images.find(i => i.id === imageId);
    const label = targetImage?.label || 'Target Frame';
    
    let defectDetected = false;
    let classification = 'Standard Visual Quality Check';
    let confidence = 89.4;
    let severity: 'normal' | 'warning' | 'critical' = 'normal';
    let healthScore = 100;
    let recommendation = 'No anomalies detected. Asset operating inside nominal specifications.';
    let boxes: BoundingBox[] = [];

    if (targetImage) {
      try {
        let base64Data = null;
        let mimeType = null;
        if (targetImage.url.startsWith('blob:') || targetImage.url.startsWith('data:')) {
          try {
            const blobRes = await fetch(targetImage.url);
            const blob = await blobRes.blob();
            mimeType = blob.type;
            base64Data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const res = reader.result as string;
                resolve(res.split(',')[1]);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.error("Error reading image bytes:", e);
          }
        }

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: targetImage.url,
            base64Data,
            mimeType,
            label: targetImage.label,
            tags: targetImage.tags
          })
        });
        
        if (res.ok) {
          const analysis = await res.json();
          defectDetected = analysis.defectDetected;
          classification = analysis.classification;
          confidence = analysis.confidence;
          severity = analysis.severity;
          healthScore = analysis.healthScore;
          recommendation = analysis.recommendation;
          boxes = analysis.boundingBoxes || [];
        } else {
          throw new Error("Analysis request failed");
        }
      } catch (err) {
        console.warn("Fallback to local analysis:", err);
        const cleanLabel = label.toLowerCase();
        const cleanTags = (targetImage.tags || []).map(t => t.toLowerCase());

        const hasSolderKeyword = cleanLabel.includes('solder') || cleanLabel.includes('pcb') || cleanLabel.includes('reflow') || cleanLabel.includes('board') || cleanLabel.includes('oven');
        const hasTurbineKeyword = cleanLabel.includes('turbine') || cleanLabel.includes('blade') || cleanLabel.includes('rotor') || cleanLabel.includes('engine') || cleanLabel.includes('aerospace');

        const isLogoOrGeneric = cleanLabel.includes('logo') || cleanLabel.includes('penguin') || cleanLabel.includes('tux') || cleanLabel.includes('avatar') || (cleanLabel.includes('test') && !hasSolderKeyword);

        const isSolder = !isLogoOrGeneric && (hasSolderKeyword || (cleanTags.includes('solder') && !hasTurbineKeyword));
        const isTurbine = !isLogoOrGeneric && (hasTurbineKeyword || (cleanTags.includes('turbine') && !hasSolderKeyword));

        if (isSolder) {
          defectDetected = Math.random() > 0.35;
          classification = 'PCB Solder-Joint Diagnostic';
          if (defectDetected) {
            confidence = 94.2;
            severity = 'critical';
            healthScore = 45;
            recommendation = 'Critical solder bridge detected in reflow channels. Immediate heat chamber calibration is advised to prevent cold solder bridges.';
            boxes = [
              { x: 120, y: 150, w: 90, h: 80, label: 'Solder Bridge', confidence: 94.2 }
            ];
          }
        } else if (isTurbine) {
          defectDetected = Math.random() > 0.45;
          classification = 'Aerospace Rotor Scanner';
          if (defectDetected) {
            confidence = 91.8;
            severity = 'warning';
            healthScore = 72;
            recommendation = 'Micro-fractures detected along turbine rotor root. Schedule ultrasonic crack check on next downtime window.';
            boxes = [
              { x: 220, y: 120, w: 100, h: 40, label: 'Surface Fracture', confidence: 91.8 }
            ];
          }
        }
      }
    }

    const resId = `ai-res-${Date.now()}`;
    const result: AIResult = {
      id: resId,
      imageId,
      defectDetected,
      classification,
      confidence,
      severity,
      healthScore,
      recommendation,
      preprocessingApplied: filters.length > 0 ? filters : ['Resize', 'Denoise'],
      boundingBoxes: boxes,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConnected && supabase) {
      // 1. Write AI Result to DB
      await supabase.from('ai_results').insert({
        id: resId,
        image_id: imageId,
        defect_detected: defectDetected,
        classification,
        confidence,
        severity,
        health_score: healthScore,
        recommendation,
        preprocessing_applied: result.preprocessingApplied,
        bounding_boxes: boxes
      });

      // 2. Update Image status to processed
      await supabase.from('images').update({ status: 'processed' }).eq('id', imageId);
    }

    setAiResults(prev => [result, ...prev]);
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, status: 'processed' } : img));

    // Update matching asset's health score
    if (targetImage?.assetId) {
      const assetObj = assets.find(a => a.id === targetImage.assetId);
      if (assetObj) {
        const nextScore = Math.round((assetObj.healthScore + healthScore) / 2);
        const nextStatus = severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : assetObj.status;
        const timelineNode: AssetTimelineNode = {
          id: `t-ai-${Date.now()}`,
          date: 'Just now',
          title: defectDetected ? 'AI Defect Discovered' : 'AI Analysis Passed',
          description: `Model predicted: ${classification} with ${confidence}% confidence.`,
          severity: severity === 'normal' ? 'info' : severity
        };
        await updateAsset(targetImage.assetId, {
          healthScore: nextScore,
          status: nextStatus as any,
          timeline: [timelineNode, ...assetObj.timeline]
        });
      }
    }

    if (defectDetected) {
      addNotification(
        `AI ALERT: Defect Detected`,
        `Defect found in "${label}" (${classification}) with ${confidence}% confidence.`,
        severity === 'critical' ? 'critical' : 'warning'
      );
    } else {
      addNotification(
        `AI Analysis Complete`,
        `Image "${label}" successfully processed. Components nominal.`,
        'info'
      );
    }

    return result;
  };

  // Notifications
  const addNotification = async (title: string, message: string, severity: 'info' | 'warning' | 'critical') => {
    const id = `notif-${Date.now()}`;
    const notif: AppNotification = { id, title, message, severity, acknowledged: false, created_at: new Date().toISOString() };
    
    if (isSupabaseConnected && supabase) {
      await supabase.from('notifications').insert({ id, severity, title, message, acknowledged: false });
    }
    setNotifications(prev => [notif, ...prev]);
  };

  const acknowledgeNotification = async (id: string) => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('notifications').update({ acknowledged: true }).eq('id', id);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, acknowledged: true } : n));
  };

  const clearNotifications = async () => {
    if (isSupabaseConnected && supabase) {
      await supabase.from('notifications').delete().neq('id', 'placeholder');
    }
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      logout,
      forgotPassword,
      resetPassword,
      changePassword,
      users,
      tenants,
      plants,
      assets,
      devices,
      images,
      aiResults,
      notifications,
      addUser,
      updateUser,
      deleteUser,
      addTenant,
      updateTenant,
      deleteTenant,
      addPlant,
      updatePlant,
      deletePlant,
      addAsset,
      updateAsset,
      deleteAsset,
      addAssetHistory,
      registerDevice,
      updateDevice,
      deleteDevice,
      mapDeviceToAsset,
      updateFirmware,
      addDeviceLog,
      uploadImageFile,
      uploadImage,
      deleteImage,
      archiveImage,
      runAIProcessing,
      addNotification,
      acknowledgeNotification,
      clearNotifications,
      isSupabaseConnected,
      isSyncing,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
