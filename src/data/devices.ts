// ─────────────────────────────────────────────────────────────────────────
// Mock fleet state for the Kaynes "Argo Glasses" IoT Fleet Console POC.
//
// 100% smoke & mirrors: there is NO live AWS IoT Core / DynamoDB / S3 / SNS.
// The SOW's AWS backend is the Phase-2 production target this console previews.
//
// A handful of "hero" devices are hand-authored (rich detail, incl. a critical
// low-battery + fault scenario). The rest of the fleet is generated
// deterministically (seeded RNG) so KPIs, filters and the media wall stay
// stable across renders.
// ─────────────────────────────────────────────────────────────────────────

export type DeviceStatus = 'online' | 'warning' | 'critical' | 'offline'
export type Connection = 'Wi-Fi' | 'BLE' | 'Offline'
export type Severity = 'normal' | 'warning' | 'critical'
export type MediaKind = 'image' | 'video'

// A captured frame/clip pulled off the glasses (Wi-Fi media transfer in the
// SDK). In production these land in Amazon S3; here they're procedural.
export interface MediaItem {
  id: string
  kind: MediaKind
  label: string
  capturedAt: string // relative, e.g. "2 h ago"
  sizeMb: number
  durationSec?: number // video only
  seed: number // drives the procedural thumbnail
  tags: string[] // ML-training context (the stated business use-case)
}

export interface DeviceForecast {
  severity: Severity
  confidence: number // 0–100
  predictedIssue: string
  alertText: string
  recommendedAction: string
}

export interface Device {
  id: number
  serial: string // ARGO-AG2-0042
  name: string // friendly / asset name — renamable by admin
  site: string
  operator: string
  status: DeviceStatus
  connection: Connection
  battery: number // %
  batteryHealth: number // state-of-health %
  signal: number // 0–100 link strength
  temperatureC: number
  firmware: string
  storageUsedGb: number
  storageTotalGb: number
  lastSeen: string // relative
  historicalBattery: number[] // last 12 readings, %
  captures: MediaItem[]
  forecast: DeviceForecast
  uptimeHrs: number
}

export const FIRMWARE_LATEST = 'AG-OS 2.5.0'
export const FIRMWARE_OLD = 'AG-OS 2.4.1'
export const MODEL_VERSION = "Argo Fleet Insight v1.2 'Lens'"
export const ORG_NAME = 'Kaynes Technology Limited'

// ── Hero devices (hand-authored) ───────────────────────────────────────────
const HERO_DEVICES: Device[] = [
  {
    id: 42,
    serial: 'ARGO-AG2-0042',
    name: 'Line-A Inspector',
    site: 'Mysuru Plant 2',
    operator: 'R. Prakash',
    status: 'critical',
    connection: 'Wi-Fi',
    battery: 8,
    batteryHealth: 71,
    signal: 84,
    temperatureC: 47,
    firmware: FIRMWARE_OLD,
    storageUsedGb: 27.4,
    storageTotalGb: 32,
    lastSeen: 'just now',
    historicalBattery: [62, 55, 48, 42, 36, 30, 24, 19, 15, 12, 10, 8],
    uptimeHrs: 6.2,
    captures: [
      mediaImg('AG2-0042-img1', 'PCB solder-joint inspection', '4 min ago', 4.2, 4201, [
        'pcb',
        'solder',
        'defect-review',
      ]),
      mediaImg('AG2-0042-img2', 'Connector seating check', '22 min ago', 3.6, 4202, [
        'connector',
        'assembly-qa',
      ]),
      mediaVid('AG2-0042-vid1', 'Remote-assist: rework cell', '1 h ago', 88.0, 142, 4203, [
        'remote-assist',
        'rework',
      ]),
    ],
    forecast: {
      severity: 'critical',
      confidence: 96,
      predictedIssue: 'Critical battery + thermal rise',
      alertText:
        'CRITICAL: Battery at 8% with cell temperature 47°C and degraded health (71%). Device likely to power-cut mid-session within ~20 min.',
      recommendedAction:
        'Recall device to dock immediately; flag battery pack for replacement on next service.',
    },
  },
  {
    id: 7,
    serial: 'ARGO-AG2-0007',
    name: 'Aerospace QA-1',
    site: 'Chennai Aerospace',
    operator: 'S. Iyer',
    status: 'warning',
    connection: 'Wi-Fi',
    battery: 34,
    batteryHealth: 88,
    signal: 72,
    temperatureC: 39,
    firmware: FIRMWARE_OLD,
    storageUsedGb: 30.8,
    storageTotalGb: 32,
    lastSeen: '2 min ago',
    historicalBattery: [80, 74, 69, 63, 58, 54, 50, 46, 42, 39, 36, 34],
    uptimeHrs: 4.1,
    captures: [
      mediaImg('AG2-0007-img1', 'Turbine blade surface scan', '12 min ago', 5.1, 707, [
        'turbine',
        'surface-defect',
        'aerospace',
      ]),
      mediaImg('AG2-0007-img2', 'Fastener torque-mark audit', '40 min ago', 3.9, 708, [
        'fastener',
        'safety-audit',
      ]),
    ],
    forecast: {
      severity: 'warning',
      confidence: 90,
      predictedIssue: 'Storage near full (96%)',
      alertText:
        'WARNING: On-device storage at 96%. New captures may fail to save until media is offloaded.',
      recommendedAction: 'Offload captures to the media repository and clear local storage.',
    },
  },
  {
    id: 15,
    serial: 'ARGO-AG2-0015',
    name: 'Harness Cell-3',
    site: 'Manesar Unit',
    operator: 'A. Khan',
    status: 'online',
    connection: 'BLE',
    battery: 76,
    batteryHealth: 95,
    signal: 58,
    temperatureC: 34,
    firmware: FIRMWARE_LATEST,
    storageUsedGb: 11.2,
    storageTotalGb: 32,
    lastSeen: 'just now',
    historicalBattery: [98, 95, 92, 90, 88, 86, 84, 82, 80, 79, 77, 76],
    uptimeHrs: 2.5,
    captures: [
      mediaImg('AG2-0015-img1', 'Wiring-harness continuity check', '8 min ago', 3.2, 1501, [
        'wiring-harness',
        'continuity',
      ]),
      mediaVid('AG2-0015-vid1', 'Assembly walkthrough', '35 min ago', 64.0, 96, 1502, [
        'assembly',
        'training-data',
      ]),
    ],
    forecast: {
      severity: 'normal',
      confidence: 94,
      predictedIssue: 'No anomalies predicted',
      alertText: 'All systems nominal. Operating within safe envelope.',
      recommendedAction: 'Continue normal operation.',
    },
  },
  {
    id: 23,
    serial: 'ARGO-AG2-0023',
    name: 'SMT Line-1 Cam',
    site: 'Hyderabad SMT Line',
    operator: 'M. Rao',
    status: 'online',
    connection: 'Wi-Fi',
    battery: 61,
    batteryHealth: 92,
    signal: 91,
    temperatureC: 33,
    firmware: FIRMWARE_LATEST,
    storageUsedGb: 18.7,
    storageTotalGb: 32,
    lastSeen: 'just now',
    historicalBattery: [90, 86, 83, 80, 77, 74, 71, 68, 66, 64, 62, 61],
    uptimeHrs: 3.3,
    captures: [
      mediaImg('AG2-0023-img1', 'Reflow oven output sample', '15 min ago', 4.0, 2301, [
        'reflow',
        'smt',
        'sample-capture',
      ]),
    ],
    forecast: {
      severity: 'normal',
      confidence: 97,
      predictedIssue: 'No anomalies predicted',
      alertText: 'All systems nominal. Strong link, healthy battery.',
      recommendedAction: 'Continue normal operation.',
    },
  },
  {
    id: 31,
    serial: 'ARGO-AG2-0031',
    name: 'R&D Bench-2',
    site: 'Pune R&D',
    operator: 'K. Deshpande',
    status: 'offline',
    connection: 'Offline',
    battery: 0,
    batteryHealth: 84,
    signal: 0,
    temperatureC: 28,
    firmware: FIRMWARE_OLD,
    storageUsedGb: 6.5,
    storageTotalGb: 32,
    lastSeen: '3 h ago',
    historicalBattery: [44, 40, 35, 30, 24, 18, 12, 7, 3, 1, 0, 0],
    uptimeHrs: 0,
    captures: [
      mediaImg('AG2-0031-img1', 'Prototype enclosure fit-check', '3 h ago', 3.4, 3101, [
        'prototype',
        'mechanical',
      ]),
    ],
    forecast: {
      severity: 'warning',
      confidence: 86,
      predictedIssue: 'Device offline (powered down)',
      alertText:
        'OFFLINE: No telemetry for 3 h. Last seen at 0% battery — likely powered down on the bench.',
      recommendedAction: 'Dock and recharge; confirm device powers back on.',
    },
  },
  {
    id: 19,
    serial: 'ARGO-AG2-0019',
    name: 'Safety Audit-A',
    site: 'Mysuru Plant 1',
    operator: 'P. Nair',
    status: 'online',
    connection: 'Wi-Fi',
    battery: 88,
    batteryHealth: 97,
    signal: 79,
    temperatureC: 31,
    firmware: FIRMWARE_LATEST,
    storageUsedGb: 9.1,
    storageTotalGb: 32,
    lastSeen: 'just now',
    historicalBattery: [100, 99, 98, 96, 95, 94, 93, 92, 91, 90, 89, 88],
    uptimeHrs: 1.4,
    captures: [
      mediaImg('AG2-0019-img1', 'Walkway obstruction audit', '6 min ago', 3.7, 1901, [
        'safety-audit',
        'compliance',
      ]),
      mediaImg('AG2-0019-img2', 'PPE compliance snapshot', '28 min ago', 3.1, 1902, [
        'ppe',
        'safety-audit',
      ]),
    ],
    forecast: {
      severity: 'normal',
      confidence: 95,
      predictedIssue: 'No anomalies predicted',
      alertText: 'All systems nominal.',
      recommendedAction: 'Continue normal operation.',
    },
  },
]

// ── Media constructors ─────────────────────────────────────────────────────
function mediaImg(
  id: string,
  label: string,
  capturedAt: string,
  sizeMb: number,
  seed: number,
  tags: string[],
): MediaItem {
  return { id, kind: 'image', label, capturedAt, sizeMb, seed, tags }
}
function mediaVid(
  id: string,
  label: string,
  capturedAt: string,
  sizeMb: number,
  durationSec: number,
  seed: number,
  tags: string[],
): MediaItem {
  return { id, kind: 'video', label, capturedAt, sizeMb, durationSec, seed, tags }
}

// ── Deterministic generator for the wider fleet ────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SITES = [
  'Mysuru Plant 1',
  'Mysuru Plant 2',
  'Hyderabad SMT Line',
  'Manesar Unit',
  'Chennai Aerospace',
  'Pune R&D',
]

const OPERATORS = [
  'R. Prakash', 'S. Iyer', 'A. Khan', 'M. Rao', 'K. Deshpande', 'P. Nair',
  'V. Menon', 'D. Joshi', 'N. Reddy', 'T. Pillai', 'H. Gupta', 'L. Bose',
  'G. Kulkarni', 'B. Shetty', 'C. Verma', 'J. Thomas', 'F. Ansari', 'O. Patel',
]

const CAPTURE_LABELS = [
  'Line inspection frame', 'Defect capture', 'Assembly QA snapshot',
  'Wiring-harness check', 'Component scan', 'Solder-joint review',
  'Torque-mark audit', 'Surface-defect scan', 'Remote-assist clip',
  'Enclosure fit-check', 'Label / serial OCR', 'Safety walkthrough',
]
const CAPTURE_TAGS = [
  'defect-review', 'assembly-qa', 'training-data', 'safety-audit',
  'solder', 'connector', 'ocr', 'remote-assist', 'surface-defect',
]

const WARN_ISSUES = [
  'Storage near full', 'Weak link / packet loss', 'Battery health degrading',
  'Elevated device temperature', 'Firmware update available',
]
const CRIT_ISSUES = [
  'Critical battery level', 'Thermal shutdown risk', 'Camera module fault',
  'Repeated capture write failures',
]

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function makeCaptures(rng: () => number, idBase: string, n: number): MediaItem[] {
  const out: MediaItem[] = []
  for (let i = 0; i < n; i++) {
    const isVid = rng() < 0.25
    const label = pick(rng, CAPTURE_LABELS)
    const tags = [pick(rng, CAPTURE_TAGS), pick(rng, CAPTURE_TAGS)].filter(
      (t, k, a) => a.indexOf(t) === k,
    )
    const mins = 4 + Math.floor(rng() * 600)
    const when = mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} h ago`
    const seed = Math.floor(rng() * 100000)
    if (isVid) {
      const dur = 20 + Math.floor(rng() * 160)
      out.push(mediaVid(`${idBase}-v${i}`, label, when, +(dur * 0.6).toFixed(1), dur, seed, tags))
    } else {
      out.push(mediaImg(`${idBase}-i${i}`, label, when, +(2.5 + rng() * 3.5).toFixed(1), seed, tags))
    }
  }
  return out
}

function generateDevices(target: number): Device[] {
  const rng = mulberry32(20260606)
  const out: Device[] = []
  let id = 100

  while (out.length < target) {
    const site = SITES[out.length % SITES.length]
    const operator = pick(rng, OPERATORS)

    const roll = rng()
    let status: DeviceStatus
    if (roll < 0.05) status = 'critical'
    else if (roll < 0.2) status = 'warning'
    else if (roll < 0.32) status = 'offline'
    else status = 'online'

    const battery =
      status === 'critical' ? 2 + Math.floor(rng() * 12)
      : status === 'offline' ? Math.floor(rng() * 30)
      : status === 'warning' ? 20 + Math.floor(rng() * 45)
      : 45 + Math.floor(rng() * 55)

    const connection: Connection =
      status === 'offline' ? 'Offline' : rng() < 0.6 ? 'Wi-Fi' : 'BLE'

    const signal = connection === 'Offline' ? 0 : 40 + Math.floor(rng() * 60)
    const batteryHealth = 70 + Math.floor(rng() * 30)
    const temperatureC =
      status === 'critical' ? 44 + Math.floor(rng() * 6) : 28 + Math.floor(rng() * 12)
    const firmware = rng() < 0.45 ? FIRMWARE_OLD : FIRMWARE_LATEST
    const storageTotalGb = 32
    const storageUsedGb = +(rng() * storageTotalGb).toFixed(1)

    const lastSeen =
      status === 'offline'
        ? rng() < 0.5 ? `${1 + Math.floor(rng() * 9)} h ago` : `${1 + Math.floor(rng() * 3)} d ago`
        : rng() < 0.6 ? 'just now' : `${1 + Math.floor(rng() * 9)} min ago`

    const historicalBattery = Array.from({ length: 12 }, (_, k) => {
      const drift = (rng() - 0.5) * 6
      return Math.max(0, Math.min(100, Math.round(battery + (11 - k) * 2.5 + drift)))
    })

    const severity: Severity =
      status === 'critical' ? 'critical' : status === 'online' ? 'normal' : 'warning'
    const confidence = 80 + Math.floor(rng() * 19)
    const predictedIssue =
      severity === 'normal' ? 'No anomalies predicted'
      : severity === 'critical' ? pick(rng, CRIT_ISSUES)
      : pick(rng, WARN_ISSUES)
    const alertText =
      severity === 'normal'
        ? 'All systems nominal. Operating within safe envelope.'
        : `${severity.toUpperCase()}: ${predictedIssue}. Model confidence ${confidence}%.`
    const recommendedAction =
      severity === 'critical' ? 'Recall device to dock; raise a service ticket.'
      : severity === 'warning' ? 'Monitor; schedule remote diagnostics or offload media.'
      : 'Continue normal operation.'

    const serial = `ARGO-AG2-${String(id).padStart(4, '0')}`
    const captures = makeCaptures(rng, serial, Math.floor(rng() * 4))

    out.push({
      id,
      serial,
      name: `${site.split(' ')[0]} Unit ${id}`,
      site,
      operator,
      status,
      connection,
      battery,
      batteryHealth,
      signal,
      temperatureC,
      firmware,
      storageUsedGb,
      storageTotalGb,
      lastSeen,
      historicalBattery,
      captures,
      forecast: { severity, confidence, predictedIssue, alertText, recommendedAction },
      uptimeHrs: status === 'offline' ? 0 : +(rng() * 8).toFixed(1),
    })
    id++
  }
  return out
}

export const DEVICES: Device[] = [...HERO_DEVICES, ...generateDevices(72)]

export const ALL_SITES = SITES

// ── Helpers ────────────────────────────────────────────────────────────────
export const storagePct = (d: Device): number =>
  Math.round((d.storageUsedGb / d.storageTotalGb) * 100)

export const isLowBattery = (d: Device): boolean => d.status !== 'offline' && d.battery < 15

export const needsFirmwareUpdate = (d: Device): boolean => d.firmware !== FIRMWARE_LATEST

export const STATUS_LABEL: Record<DeviceStatus, string> = {
  online: 'Online',
  warning: 'Warning',
  critical: 'Critical',
  offline: 'Offline',
}

export const STATUS_COLOR: Record<DeviceStatus, string> = {
  online: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  offline: '#64748b',
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  normal: 'Nominal',
  warning: 'Attention',
  critical: 'Critical',
}

export const batteryColor = (pct: number): string =>
  pct < 15 ? '#ef4444' : pct < 35 ? '#f59e0b' : '#10b981'

export interface FleetStats {
  total: number
  online: number
  warning: number
  critical: number
  offline: number
  lowBattery: number
  needUpdate: number
  totalCaptures: number
  avgBattery: number
}

export function fleetStats(devices: Device[]): FleetStats {
  let online = 0, warning = 0, critical = 0, offline = 0
  let lowBattery = 0, needUpdate = 0, totalCaptures = 0, batterySum = 0
  for (const d of devices) {
    if (d.status === 'online') online++
    else if (d.status === 'warning') warning++
    else if (d.status === 'critical') critical++
    else offline++
    if (isLowBattery(d)) lowBattery++
    if (needsFirmwareUpdate(d)) needUpdate++
    totalCaptures += d.captures.length
    batterySum += d.battery
  }
  return {
    total: devices.length,
    online,
    warning,
    critical,
    offline,
    lowBattery,
    needUpdate,
    totalCaptures,
    avgBattery: Math.round(batterySum / (devices.length || 1)),
  }
}

// ── Alerts feed (derived — mirrors what Amazon SNS would push) ─────────────
export interface Alert {
  id: string
  deviceId: number
  deviceName: string
  serial: string
  site: string
  severity: Severity
  type: string
  message: string
  time: string
}

export function buildAlerts(devices: Device[]): Alert[] {
  const out: Alert[] = []
  for (const d of devices) {
    if (isLowBattery(d)) {
      out.push({
        id: `${d.serial}-batt`,
        deviceId: d.id,
        deviceName: d.name,
        serial: d.serial,
        site: d.site,
        severity: 'critical',
        type: 'Low battery',
        message: `Battery at ${d.battery}% — below the 15% threshold.`,
        time: d.lastSeen,
      })
    }
    if (d.status === 'offline') {
      out.push({
        id: `${d.serial}-off`,
        deviceId: d.id,
        deviceName: d.name,
        serial: d.serial,
        site: d.site,
        severity: 'warning',
        type: 'Device offline',
        message: `No telemetry received — last seen ${d.lastSeen}.`,
        time: d.lastSeen,
      })
    }
    if (storagePct(d) >= 90 && d.status !== 'offline') {
      out.push({
        id: `${d.serial}-stor`,
        deviceId: d.id,
        deviceName: d.name,
        serial: d.serial,
        site: d.site,
        severity: 'warning',
        type: 'Storage near full',
        message: `On-device storage at ${storagePct(d)}% (${d.storageUsedGb}/${d.storageTotalGb} GB).`,
        time: d.lastSeen,
      })
    }
    if (d.temperatureC >= 44 && d.status !== 'offline') {
      out.push({
        id: `${d.serial}-temp`,
        deviceId: d.id,
        deviceName: d.name,
        serial: d.serial,
        site: d.site,
        severity: 'critical',
        type: 'High temperature',
        message: `Device temperature ${d.temperatureC}°C — thermal limit approaching.`,
        time: d.lastSeen,
      })
    }
  }
  // Critical first, then warning.
  const rank: Record<Severity, number> = { critical: 0, warning: 1, normal: 2 }
  return out.sort((a, b) => rank[a.severity] - rank[b.severity])
}
