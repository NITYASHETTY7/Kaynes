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
    query: 'electronics inspection quality control',
    keywords: ['inspection', 'quality', 'control', 'pcb'],
    description: 'Component inspection'
  },
  'qa': {
    query: 'electronics quality assurance testing',
    keywords: ['qa', 'testing', 'quality', 'inspection'],
    description: 'Quality assurance'
  },
  
  // Manufacturing
  'line': {
    query: 'manufacturing assembly line production',
    keywords: ['production', 'assembly', 'manufacturing', 'factory'],
    description: 'Production line'
  },
  'smt': {
    query: 'electronics assembly manufacturing pcb',
    keywords: ['smt', 'pcb', 'assembly', 'manufacturing'],
    description: 'SMT assembly'
  },
  
  // Aerospace
  'aerospace': {
    query: 'aerospace precision engineering quality',
    keywords: ['aerospace', 'precision', 'engineering', 'aircraft'],
    description: 'Aerospace QA'
  },
  
  // Harness & Wiring
  'harness': {
    query: 'electrical wiring harness assembly',
    keywords: ['wiring', 'harness', 'electrical', 'assembly'],
    description: 'Harness assembly'
  },
  'connector': {
    query: 'electrical connector assembly',
    keywords: ['connector', 'electrical', 'assembly'],
    description: 'Connector assembly'
  },
  
  // Testing & R&D
  'bench': {
    query: 'electronics workbench research development',
    keywords: ['bench', 'lab', 'research', 'development'],
    description: 'R&D workbench'
  },
  'camera': {
    query: 'surveillance inspection camera equipment',
    keywords: ['camera', 'inspection', 'monitoring'],
    description: 'Camera monitoring'
  },
  
  // Safety & Audit
  'safety': {
    query: 'workplace safety compliance audit',
    keywords: ['safety', 'compliance', 'audit', 'workplace'],
    description: 'Safety audit'
  },
  'audit': {
    query: 'compliance audit inspection',
    keywords: ['audit', 'compliance', 'inspection'],
    description: 'Audit & compliance'
  },
  
  // Default
  'default': {
    query: 'industrial manufacturing inspection',
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
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop', // Industrial electronics
    ],
    'qa': [
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop', // Quality control
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop', // Engineering
    ],
    'line': [
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', // Assembly
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', // Production
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', // Precision
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', // Industrial
    ],
    'smt': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop', // Cyber
    ],
    'aerospace': [
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop', // Rocket/Aerospace
      'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop', // Engine
      'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&h=600&fit=crop', // Satellite
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', // Tech
    ],
    'harness': [
      'https://images.unsplash.com/photo-1592659762303-90081d34b277?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', // Cables
      'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&h=600&fit=crop',
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
    ],
    'camera': [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop', // Surveillance
      'https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=800&h=600&fit=crop', // Equipment
      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop', // CCTV
    ],
    'safety': [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&h=600&fit=crop', // Industrial safety
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', // Hard hat area
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop', // Safety gear
    ],
    'audit': [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop', // Analysis
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // Documents
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    ],
    'default': [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1485083269755-a7b559a4fe5e?w=800&h=600&fit=crop', // Industry
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
  const entropy = seed + identity.length + (context?.length || 0)
  const index = entropy % images.length
  return images[index]
}
