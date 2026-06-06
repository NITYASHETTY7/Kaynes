import {
  type Device,
  type DeviceStatus,
  type Connection,
  storagePct,
} from '../data/devices'

export interface Filters {
  search: string
  statuses: Record<DeviceStatus, boolean>
  connections: Record<Connection, boolean>
  site: string // '' = all
  minBattery: number // 0–100
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  statuses: { online: true, warning: true, critical: true, offline: true },
  connections: { 'Wi-Fi': true, BLE: true, Offline: true },
  site: '',
  minBattery: 0,
}

export function applyFilters(devices: Device[], f: Filters): Device[] {
  const q = f.search.trim().toLowerCase()
  return devices.filter((d) => {
    if (!f.statuses[d.status]) return false
    if (!f.connections[d.connection]) return false
    if (f.site && d.site !== f.site) return false
    if (d.battery < f.minBattery) return false
    if (q) {
      const hay = `${d.name} ${d.serial} ${d.site} ${d.operator}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

// Convenience used by the storage filter chip (kept here so the sidebar and
// list agree on the "near full" threshold).
export const isStorageNearFull = (d: Device): boolean => storagePct(d) >= 90
