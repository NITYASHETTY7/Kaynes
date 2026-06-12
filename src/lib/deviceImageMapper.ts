/**
 * Maps device names to relevant image search queries and fetches real photos
 * Uses Unsplash API (free, no auth for basic usage)
 */

export interface DeviceImageConfig {
  query: string
  keywords: string[]
  description: string
}

// Map device types to search queries for real images
export const DEVICE_TYPE_MAP: Record<string, DeviceImageConfig> = {
  // Inspection & QA
  'inspector': {
    query: 'electronics inspection quality control pcb',
    keywords: ['inspection', 'quality', 'control', 'pcb', 'component', 'scan'],
    description: 'Component inspection'
  },
  'qa': {
    query: 'electronics quality assurance testing lab',
    keywords: ['qa', 'testing', 'quality', 'assurance'],
    description: 'Quality assurance'
  },
  
  // Manufacturing
  'line': {
    query: 'manufacturing assembly line production factory',
    keywords: ['production', 'assembly', 'manufacturing', 'factory', 'line'],
    description: 'Production line'
  },
  'smt': {
    query: 'smt assembly machine pcb manufacturing',
    keywords: ['smt', 'pcb', 'surface mount'],
    description: 'SMT assembly'
  },
  
  // Aerospace
  'aerospace': {
    query: 'aerospace precision engineering aircraft maintenance',
    keywords: ['aerospace', 'precision', 'aircraft', 'satellite', 'rocket'],
    description: 'Aerospace QA'
  },
  
  // Harness & Wiring
  'harness': {
    query: 'electrical wiring harness assembly industrial',
    keywords: ['wiring', 'harness', 'electrical', 'cable'],
    description: 'Harness assembly'
  },
  'connector': {
    query: 'electrical connector assembly components',
    keywords: ['connector', 'plug', 'socket'],
    description: 'Connector assembly'
  },
  
  // Testing & R&D
  'bench': {
    query: 'electronics workbench research development lab',
    keywords: ['bench', 'lab', 'research', 'development', 'experiment'],
    description: 'R&D workbench'
  },
  'camera': {
    query: 'industrial surveillance inspection camera monitoring',
    keywords: ['camera', 'monitoring', 'vision', 'video'],
    description: 'Camera monitoring'
  },
  
  // Safety & Audit
  'safety': {
    query: 'workplace safety compliance factory audit',
    keywords: ['safety', 'compliance', 'audit', 'walkthrough', 'hazard'],
    description: 'Safety audit'
  },
  'audit': {
    query: 'industrial compliance audit documentation inspection',
    keywords: ['audit', 'compliance', 'report', 'document'],
    description: 'Audit & compliance'
  },
  
  // Default
  'default': {
    query: 'industrial manufacturing electronics inspection',
    keywords: ['industrial', 'manufacturing', 'inspection'],
    description: 'Industrial inspection'
  }
}

// Cache for fetched images to avoid repeated API calls
const imageCache = new Map<string, string[]>()

/**
 * Extract device type from device name or capture label for better context
 */
export function getDeviceType(deviceName: string, context?: string): string {
  const lowerName = deviceName.toLowerCase()
  const lowerContext = context?.toLowerCase() || ''
  const combined = `${lowerName} ${lowerContext}`
  
  // Check for specific keywords in order of specificity
  for (const [type, config] of Object.entries(DEVICE_TYPE_MAP)) {
    if (type === 'default') continue
    if (config.keywords.some(k => combined.includes(k))) {
      return type
    }
  }
  
  return 'default'
}

/**
 * Get image search query for a device
 */
export function getImageQuery(deviceName: string, context?: string): string {
  const deviceType = getDeviceType(deviceName, context)
  return DEVICE_TYPE_MAP[deviceType]?.query || DEVICE_TYPE_MAP.default.query
}

/**
 * Fetch real images from Unsplash for a device type
 * Uses deterministic caching to ensure consistent results
 */
export async function fetchDeviceImages(
  deviceName: string,
  count: number = 3,
  context?: string
): Promise<string[]> {
  const query = getImageQuery(deviceName, context)
  const cacheKey = query
  
  // Return cached images if available
  if (imageCache.has(cacheKey)) {
    const cached = imageCache.get(cacheKey)!
    return cached.slice(0, count)
  }

  try {
    // Use Unsplash API (free tier: 50 requests/hour without auth)
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&count=${count}&orientation=landscape&client_id=tBTVrFMiIRKqVmREqHRPtmDEcNdCWU7CfC5DRyEHn10`
    )
    
    if (!response.ok) {
      console.warn('Unsplash API failed, using fallback images')
      return getFallbackImages(deviceName, context)
    }

    const data = await response.json()
    const urls = (data.results || []).map((img: any) => img.urls.regular)
    
    // Cache the results
    if (urls.length > 0) {
      imageCache.set(cacheKey, urls)
    }
    
    return urls.length > 0 ? urls : getFallbackImages(deviceName, context)
  } catch (error) {
    console.error('Failed to fetch images from Unsplash:', error)
    return getFallbackImages(deviceName, context)
  }
}

/**
 * Fallback images from public sources if API fails
 */
export function getFallbackImages(deviceName: string, context?: string): string[] {
  const type = getDeviceType(deviceName, context)
  
  const fallbacks: Record<string, string[]> = {
    'inspector': [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop', // PCB inspection
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop', // Microchip
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop', // Circuit board
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', // Electronics
      'https://images.unsplash.com/photo-1518770665346-3836398402b5?w=800&h=600&fit=crop', // Hardware
      'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=600&fit=crop', // Testing
    ],
    'qa': [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop', // Engineering
      'https://images.unsplash.com/photo-1504384308090-c89eececbfbc?w=800&h=600&fit=crop', // Industrial Lab
    ],
    'line': [
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', // Assembly
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', // Production
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', // Precision
      'https://images.unsplash.com/photo-1562241023-c4ec87ff3c4d?w=800&h=600&fit=crop', // Factory
      'https://images.unsplash.com/photo-1504917595217-d4dc5eed6122?w=800&h=600&fit=crop', // Assembly
    ],
    'smt': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', // Cyber
      'https://images.unsplash.com/photo-1563770660941-20978e00a470?w=800&h=600&fit=crop', // Surface mount
    ],
    'aerospace': [
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop', // Rocket/Aerospace
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop', // Engine
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop', // Aircraft
      'https://images.unsplash.com/photo-1457364887197-9150188c8f0f?w=800&h=600&fit=crop', // Engine 2
    ],
    'harness': [
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', // Cables
      'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&h=600&fit=crop', // Wiring
    ],
    'connector': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&h=600&fit=crop', // Tech board
    ],
    'bench': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop', // Lab
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop', // Work
    ],
    'camera': [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', // Surveillance
      'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800&h=600&fit=crop', // Equipment
      'https://images.unsplash.com/photo-1557855036-cd4812744412?w=800&h=600&fit=crop', // CCTV
    ],
    'safety': [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&h=600&fit=crop', // Industrial safety
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', // Hard hat area
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop', // Safety gear
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', // Safety meeting
    ],
    'audit': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop', // Analysis
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // Documents
      'https://images.unsplash.com/photo-1454165833762-0265129b0021?w=800&h=600&fit=crop', // Audit
    ],
    'default': [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800&h=600&fit=crop', // Industry
      'https://images.unsplash.com/photo-1562241023-c4ec87ff3c4d?w=800&h=600&fit=crop', // Factory 2
    ]
  }
  
  return fallbacks[type] || fallbacks.default
}

/**
 * Get a deterministic image URL for a device based on a stable identity and a seed
 * This ensures the same device always shows the same image, even if renamed
 */
export function getDeviceImageUrl(identity: string, seed: number, context?: string): string {
  const images = getFallbackImages(identity, context)
  // Use a more complex index to avoid repetition when pool is small
  // Adding context hash to the entropy
  const contextHash = context ? context.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
  const entropy = seed + identity.length + contextHash
  const index = entropy % images.length
  return images[index]
}
