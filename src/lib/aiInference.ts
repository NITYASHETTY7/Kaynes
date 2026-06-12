import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

/**
 * Object Detection Result from COCO-SSD model
 */
export interface DetectionResult {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

/**
 * AI Inference Results for an image
 */
export interface AIInferenceResult {
  detections: DetectionResult[];
  processingTime: number;
  imageUrl: string;
  timestamp: Date;
  defectsFound: number;
  confidence: number; // Average confidence score
}

let cocoModel: cocoSsd.ObjectDetection | null = null;

/**
 * Load the COCO-SSD model (called once on first inference)
 */
async function loadModel(): Promise<cocoSsd.ObjectDetection> {
  if (cocoModel) {
    return cocoModel;
  }

  try {
    console.log('Loading COCO-SSD model...');
    cocoModel = await cocoSsd.load();
    console.log('COCO-SSD model loaded successfully');
    return cocoModel;
  } catch (error) {
    console.error('Failed to load COCO-SSD model:', error);
    throw new Error('Failed to load AI model. Please check your connection.');
  }
}

/**
 * Run real-time object detection on an image
 * Works completely browser-side, no API calls needed
 */
export async function runInference(imageUrl: string): Promise<AIInferenceResult> {
  const startTime = performance.now();

  try {
    const model = await loadModel();

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          // Run detection
          const predictions = await model.detect(img);

          const endTime = performance.now();
          const processingTime = endTime - startTime;

          // Filter high-confidence detections
          const detections: DetectionResult[] = predictions
            .filter((pred) => pred.score > 0.5) // Only keep confident predictions
            .map((pred) => ({
              class: pred.class,
              score: Math.round(pred.score * 100) / 100,
              bbox: pred.bbox as [number, number, number, number],
            }))
            .sort((a, b) => b.score - a.score);

          // Calculate average confidence
          const avgConfidence =
            detections.length > 0
              ? Math.round(
                  (detections.reduce((sum, d) => sum + d.score, 0) / detections.length) * 100
                ) / 100
              : 0;

          // Classify defects by name patterns
          const defects = detections.filter(
            (d) =>
              d.class.toLowerCase().includes('defect') ||
              d.class.toLowerCase().includes('damage') ||
              d.class.toLowerCase().includes('crack') ||
              d.class.toLowerCase().includes('break') ||
              d.class.toLowerCase().includes('bent') ||
              d.class.toLowerCase().includes('scratch') ||
              d.class.toLowerCase().includes('dent')
          );

          const result: AIInferenceResult = {
            detections,
            processingTime: Math.round(processingTime),
            imageUrl,
            timestamp: new Date(),
            defectsFound: defects.length,
            confidence: avgConfidence,
          };

          resolve(result);
        } catch (error) {
          reject(new Error(`Inference failed: ${error}`));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}

/**
 * Draw detection boxes on canvas
 */
export function drawDetections(
  canvas: HTMLCanvasElement,
  detections: DetectionResult[],
  imageWidth: number,
  imageHeight: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scaleX = canvas.width / imageWidth;
  const scaleY = canvas.height / imageHeight;

  detections.forEach((detection) => {
    const [x, y, width, height] = detection.bbox;

    // Draw box
    ctx.strokeStyle = detection.score > 0.8 ? '#EF4444' : '#FBBF24'; // Red for high confidence, orange for medium
    ctx.lineWidth = 3;
    ctx.strokeRect(x * scaleX, y * scaleY, width * scaleX, height * scaleY);

    // Draw label background
    const label = `${detection.class} (${Math.round(detection.score * 100)}%)`;
    ctx.fillStyle = detection.score > 0.8 ? '#EF4444' : '#FBBF24';
    ctx.font = 'bold 12px Arial';
    const textMetrics = ctx.measureText(label);
    const textHeight = 16;
    const padding = 4;

    ctx.fillRect(
      x * scaleX - padding,
      y * scaleY - textHeight - padding,
      textMetrics.width + padding * 2,
      textHeight + padding
    );

    // Draw label text
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(label, x * scaleX, y * scaleY - padding);
  });
}

/**
 * Format inference results for display
 */
export function formatResults(result: AIInferenceResult): string {
  const lines = [
    `⏱️ Processing Time: ${result.processingTime}ms`,
    `Objects Detected: ${result.detections.length}`,
    `Defects Found: ${result.defectsFound}`,
    `Average Confidence: ${(result.confidence * 100).toFixed(1)}%`,
    '',
    'Detected Objects:',
  ];

  result.detections.slice(0, 5).forEach((det) => {
    lines.push(`  • ${det.class}: ${Math.round(det.score * 100)}%`);
  });

  if (result.detections.length > 5) {
    lines.push(`  ... and ${result.detections.length - 5} more`);
  }

  return lines.join('\n');
}

/**
 * Unload model to free memory (optional, call before component unmount)
 */
export function unloadModel(): void {
  if (cocoModel) {
    cocoModel.dispose();
    cocoModel = null;
    tf.disposeVariables();
  }
}
