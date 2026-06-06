# Kaynes · Argo Glasses — IoT Fleet Console (POC)

A high-fidelity, **frontend-only** proof-of-concept for the **Kaynes Technology**
"Argo Glasses" smart-glasses ecosystem. It previews the operations console that
the proposed AWS IoT platform (see the SOW) will eventually power: centralised
device fleet monitoring, telemetry, captured-media management and operational
alerts.

> **Scope:** Intentionally a "smoke & mirrors" POC. All device telemetry, media
> and alerts come from a local **mock dataset** (`src/data/devices.ts`). There
> is **no backend, no database and no AWS wiring** — the AWS-grade architecture
> (IoT Core, Lambda, DynamoDB, S3, CloudFront, Cognito, SNS) is the **Phase-2**
> production target this console previews.

- **Frontend:** React + Vite + TypeScript + Tailwind (builds to static files)
- **Auth:** mock role-based login (Admin / User) — Amazon Cognito in production
- **AI middleware:** a single Node serverless function (`/api/analyze`) that
  keeps any model key off the client. Falls back to a pre-canned device
  diagnostic when no key is set, so the demo works **100% offline**.
- **Hosting:** static + serverless → deploys unchanged to **Vercel** or
  **AWS Amplify Hosting** via GitHub branch sync.

---

## What it demonstrates

| Screen | What it shows |
|---|---|
| **Login** | Mock Admin / User role selection (no real credentials). Admin unlocks rename / download / delete / OTA actions; User is read-only. |
| **Fleet** | Every Argo Glasses device as a card grid **or** dense table (toggle). Status, battery, connection (BLE/Wi-Fi), storage, firmware, last-seen. Sidebar filters: search, status, site, connection, min-battery. |
| **Device drawer** | Click any device → full telemetry pop-up: battery gauge + health + temperature, connectivity, storage, 12-reading battery history, firmware (+ OTA push), captured media (download/delete), and an **AI Device Diagnostic**. |
| **Media** | Fleet-wide repository of captured frames/clips (procedurally rendered POV thumbnails), tagged for **AI/ML training** — the stated business use-case. Filter by type/device; download/delete (admin). |
| **Alerts** | Derived alert feed (low battery, offline, storage full, high temp) — the Amazon SNS notifications of the production system. Click to jump to the device. |

Theme toggle (dark/light) and responsive layout throughout.

---

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — only if you want live AI
npm run dev
```

Open the printed URL (usually http://localhost:5173).

- `npm run dev` runs the UI **and** the `/api/analyze` serverless route together
  (via a small dev plugin in `vite.config.ts`) — no `vercel dev` needed.
- **No keys required to demo:** the AI Device Diagnostic returns a deterministic
  pre-canned analysis when `GEMINI_API_KEY` is absent.

### Keys (optional)

| Variable | Where | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | server only | live AI Device Diagnostic via `/api/analyze` |
| `GEMINI_MODEL` | server only | model override (default `gemini-2.5-flash`) |

---

## Deploy

**Vercel:** import the repo → it auto-detects Vite → (optionally) add
`GEMINI_API_KEY` → deploy.

**AWS Amplify Hosting:** connect the GitHub branch → build command
`npm run build`, output dir `dist` → (optionally) add the same env var → deploy.
`/api/*.js` deploys as a Node serverless function.

---

## How this maps to the SOW (Phase 2)

| This POC (mock) | Production AWS service |
|---|---|
| `devices.ts` telemetry | AWS IoT Core (telemetry ingestion) |
| Fleet grid / filters | AWS IoT Device Management |
| `/api/analyze` | API Gateway + AWS Lambda |
| Device metadata | Amazon DynamoDB |
| Captured media | Amazon S3 + CloudFront |
| Mock login | Amazon Cognito |
| Alerts feed | Amazon CloudWatch + SNS |

The UI deliberately keeps this mapping legible so Phase 2 is "wire the real
services behind the same screens", not a redesign.
