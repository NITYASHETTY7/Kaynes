/**
 * Google Cloud Vision AI Inference Integration
 * Uses Google Cloud Vision API for industrial image analysis
 */

export interface GoogleVisionConcept {
  name: string
  value: number // confidence 0-1
}

export interface GoogleVisionDetection {
  name: string
  confidence: number
  boundingBox?: {
    top_row: number
    left_column: number
    bottom_row: number
    right_column: number
  }
}

export interface GoogleVisionResult {
  detections: GoogleVisionDetection[]
  concepts: GoogleVisionConcept[]
  processingTime: number
  imageUrl: string
  timestamp: Date
  defectsFound: number
  confidence: number
  summary?: string
}

// Provided API Key
const GOOGLE_VISION_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY;

/**
 * Analyze image using Google Cloud Vision API
 */
export async function runGoogleVisionInference(imageUrl: string): Promise<GoogleVisionResult> {
  const startTime = performance.now();

  try {
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

    // For web URLs, we can use imageUri. 
    // If it's a blob/data URL, we'd need to convert to base64.
    // Assuming imageUrl is a public URL or we handle base64 conversion if needed.
    
    let imageSource: any = { imageUri: imageUrl };
    
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
      // If it's a local blob or data URL, we need to fetch it and convert to base64
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
      imageSource = { content: base64 };
    }

    const body = {
      requests: [
        {
          image: imageSource,
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'SAFE_SEARCH_DETECTION' }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Google Vision API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const endTime = performance.now();

    const responseData = data.responses[0];
    
    // Filter for accurate detections (> 0.7 confidence as requested "only those it can detect accurately")
    const ACCURACY_THRESHOLD = 0.7;

    // Map Labels to Concepts
    const concepts: GoogleVisionConcept[] = (responseData.labelAnnotations || [])
      .filter((label: any) => label.score >= ACCURACY_THRESHOLD)
      .map((label: any) => ({
        name: label.description,
        value: label.score,
      }));

    // Map Localized Objects to Detections
    const detections: GoogleVisionDetection[] = (responseData.localizedObjectAnnotations || [])
      .filter((obj: any) => obj.score >= ACCURACY_THRESHOLD)
      .map((obj: any) => {
        const vertices = obj.boundingPoly?.normalizedVertices || [];
        // Google Vision provides 4 vertices. We need top_row, left_column, bottom_row, right_column
        const left = Math.min(...vertices.map((v: any) => v.x ?? 0));
        const top = Math.min(...vertices.map((v: any) => v.y ?? 0));
        const right = Math.max(...vertices.map((v: any) => v.x ?? 0));
        const bottom = Math.max(...vertices.map((v: any) => v.y ?? 0));

        return {
          name: obj.name,
          confidence: obj.score,
          boundingBox: {
            top_row: top,
            left_column: left,
            bottom_row: bottom,
            right_column: right,
          },
        };
      });

    // Detect defects (simple keyword matching for now, similar to Clarifai implementation)
    const defectKeywords = [
      'defect', 'damage', 'crack', 'scratch', 'broken', 'bent', 'dent', 
      'fail', 'corrosion', 'oxide', 'stain', 'contamination'
    ];
    const defectsFound = concepts.filter((c) =>
      defectKeywords.some((kw) => c.name.toLowerCase().includes(kw))
    ).length + detections.filter((d) => 
      defectKeywords.some((kw) => d.name.toLowerCase().includes(kw))
    ).length;

    const avgConfidence =
      concepts.length > 0
        ? concepts.reduce((sum, c) => sum + c.value, 0) / concepts.length
        : 0;

    // Generate Summary
    const topLabels = concepts.slice(0, 3).map(c => c.name).join(', ');
    const objectCount = detections.length;
    const summary = concepts.length > 0 
      ? `Analysis complete. Detected ${topLabels} with ${Math.round(avgConfidence * 100)}% confidence. ${objectCount} significant objects localized.`
      : "Analysis complete. No high-confidence industrial features detected.";

    return {
      detections,
      concepts,
      processingTime: Math.round(endTime - startTime),
      imageUrl,
      timestamp: new Date(),
      defectsFound,
      confidence: avgConfidence,
      summary
    };
  } catch (error) {
    console.error('Google Vision inference error:', error);
    throw error;
  }
}
