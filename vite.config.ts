import { defineConfig, loadEnv, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Dev-only: run the serverless function(s) inside the Vite dev server so plain
// `npm run dev` exercises the full AI flow without `vercel dev`. In production,
// Vercel / Amplify serve /api/*.js directly and ignore this plugin.
function devApiPlugin() {
  return {
    name: 'dev-api',
    async configureServer(server: { middlewares: Connect.Server }) {
      // Imported lazily so a syntax error in a handler doesn't crash startup.
      const { default: analyze } = await import('./api/analyze.js')
      const { default: analyzeImage } = await import('./api/analyze-image.js')
      const routes: Record<string, (req: any, res: any) => unknown> = {
        '/api/analyze': analyze,
        '/api/analyze-image': analyzeImage,
      }
      for (const [path, handler] of Object.entries(routes)) {
        server.middlewares.use(path, (req: IncomingMessage, res: ServerResponse) => {
          let raw = ''
          req.on('data', (c) => (raw += c))
          req.on('end', async () => {
            ;(req as any).body = raw
            const shim = {
              status(code: number) {
                res.statusCode = code
                return shim
              },
              json(obj: unknown) {
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify(obj))
              },
              send(t: unknown) {
                res.end(typeof t === 'string' ? t : JSON.stringify(t))
              },
            }
            try {
              await handler(req, shim)
            } catch (e) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: (e as Error).message }))
            }
          })
        })
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  // Expose .env.local vars to the dev serverless handler via process.env.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY
  if (env.GEMINI_MODEL) process.env.GEMINI_MODEL = env.GEMINI_MODEL

  return {
    plugins: [react(), devApiPlugin()],
  }
})
