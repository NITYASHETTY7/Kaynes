// Serverless function: POST /api/analyze
// ─────────────────────────────────────────────────────────────────────────
// The secure "AI middleware" layer for the POC. The browser never calls a
// model directly — it posts a device snapshot here, and the GEMINI_API_KEY
// (if configured) stays server-side only.
//
// Resilient for a mock-data demo: if no key is set, or the upstream call
// fails, it returns a deterministic pre-canned diagnostic so the "AI Device
// Diagnostic" always produces a polished answer on stage.
//
// Portable across Vercel and AWS Amplify (Node serverless function). In the
// Phase-2 architecture this maps to AWS Lambda behind API Gateway.
// ─────────────────────────────────────────────────────────────────────────

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function storagePct(d) {
  return d?.storageTotalGb > 0 ? Math.round((d.storageUsedGb / d.storageTotalGb) * 100) : 0
}

function cannedDiagnostic(device) {
  const f = device?.forecast || {}
  const sev = (f.severity || 'normal').toUpperCase()
  const stor = storagePct(device)

  if (f.severity === 'critical') {
    return {
      headline: `Critical condition on ${device.name} (${device.serial})`,
      summary:
        `Fleet model flags "${f.predictedIssue}" at ${f.confidence}% confidence. Battery is at ` +
        `${device.battery}% with cell temperature ${device.temperatureC}°C and ${device.batteryHealth}% ` +
        `state-of-health — a signature consistent with imminent power-cut during an active session.`,
      rootCause: 'Depleted, thermally-stressed battery pack with reduced state-of-health.',
      actions: [
        'Recall the device to its dock immediately.',
        'Auto-raise a high-priority service ticket for battery replacement.',
        'Block new recording sessions until charged above 30%.',
      ],
      confidence: f.confidence ?? 96,
      source: 'canned',
    }
  }

  if (f.severity === 'warning') {
    return {
      headline: `${sev} — ${device.name} (${device.serial})`,
      summary:
        `Model reports "${f.predictedIssue}" at ${f.confidence}% confidence. Battery ${device.battery}%, ` +
        `storage ${stor}%, link ${device.connection} @ ${device.signal}%. ${f.alertText || ''}`.trim(),
      rootCause: f.predictedIssue,
      actions: [f.recommendedAction || 'Schedule remote diagnostics.'],
      confidence: f.confidence ?? 88,
      source: 'canned',
    }
  }

  return {
    headline: `Nominal — ${device.name} (${device.serial})`,
    summary:
      `No abnormal signatures in the telemetry window. Battery ${device.battery}% ` +
      `(${device.batteryHealth}% SoH), storage ${stor}%, ${device.connection} link at ${device.signal}%.`,
    rootCause: 'No anomalies detected.',
    actions: ['Continue normal operation.'],
    confidence: f.confidence ?? 95,
    source: 'canned',
  }
}

function buildPrompt(device) {
  return `You are the predictive-maintenance AI for the Kaynes "Argo Glasses" smart-glasses fleet.
Analyse this single device's telemetry snapshot and return a concise, confident operations
diagnostic for a fleet operator.

DEVICE SNAPSHOT (JSON):
${JSON.stringify(device, null, 2)}

Return ONLY JSON with this shape:
{
  "headline": string,            // one short line
  "summary": string,             // 2-3 sentences, operator-facing
  "rootCause": string,           // likely root cause
  "actions": string[],           // 1-3 concrete recommended actions
  "confidence": number           // 0-100
}
Be specific to the numbers provided (battery, temperature, storage, signal, firmware).
Do not invent data not present in the snapshot.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  let device
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    device = body.device
  } catch {
    res.status(400).json({ error: 'Invalid JSON body.' })
    return
  }

  if (!device || typeof device !== 'object') {
    res.status(400).json({ error: 'device is required.' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY

  // No key configured → graceful pre-canned diagnostic (offline-safe demo).
  if (!apiKey) {
    res.status(200).json(cannedDiagnostic(device))
    return
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(device) }] }],
        generationConfig: {
          temperature: 0.4,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!geminiRes.ok) {
      res.status(200).json(cannedDiagnostic(device))
      return
    }

    const data = await geminiRes.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = text ? JSON.parse(text) : null
    if (!parsed) {
      res.status(200).json(cannedDiagnostic(device))
      return
    }
    res.status(200).json({ ...parsed, source: 'gemini' })
  } catch {
    res.status(200).json(cannedDiagnostic(device))
  }
}
