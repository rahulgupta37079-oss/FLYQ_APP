import { Hono } from 'hono'
import { cors } from 'hono/cors'

const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <meta name="theme-color" content="#000000" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="mobile-web-app-capable" content="yes" />
  <title>FLYQ Drone Controller</title>
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/static/icon.svg" />
  <link rel="stylesheet" href="/static/style.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/static/app.js"></script>
</body>
</html>`

const app = new Hono()

app.use('/api/*', cors())

// Favicon / apple-touch -> reuse the SVG icon (avoids 500 on browser auto-requests)
app.get('/favicon.ico', (c) => c.redirect('/static/icon.svg', 302))
app.get('/apple-touch-icon.png', (c) => c.redirect('/static/icon.svg', 302))
app.get('/apple-touch-icon-precomposed.png', (c) => c.redirect('/static/icon.svg', 302))

// ---- API ----------------------------------------------------------------

app.get('/api/health', (c) => c.json({ ok: true, service: 'flyq-drone-controller', ts: Date.now() }))

// Drone connection defaults (matches LiteWing / ESP-Drone firmware)
app.get('/api/drone/defaults', (c) =>
  c.json({
    ssidHints: ['LiteWing', 'FLYQ', 'ESP32', 'Crazyflie', 'ESP-Drone'],
    droneIP: '192.168.43.42',
    dronePort: 2390,
    appPort: 2399,
    protocol: 'CRTP-over-UDP',
  })
)

// Compute a flight command from joystick input (server-validated, also used by tests)
app.post('/api/control/command', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.left || !body.right) {
    return c.json({ error: 'left and right joystick {x,y} required' }, 400)
  }
  const left = body.left, right = body.right
  const clamp = (v: number) => Math.max(-1, Math.min(1, Number(v) || 0))
  const lx = clamp(left.x), ly = clamp(left.y), rx = clamp(right.x), ry = clamp(right.y)
  const thrust = Math.round(Math.max(0, Math.min(1, (ly + 1) / 2)) * 65535)
  const yaw = +(lx * 200).toFixed(2)
  const pitch = +(ry * 30).toFixed(2)
  const roll = +(rx * 30).toFixed(2)
  return c.json({ roll, pitch, yaw, thrust })
})

app.get('/api/*', (c) => c.json({ error: 'not found' }, 404))

// ---- App shell ----------------------------------------------------------
// Static assets in public/ are served directly by Cloudflare Pages (and by
// `wrangler pages dev`) via _routes.json exclusions — no serveStatic needed.

app.get('/', (c) => c.html(SHELL))

// SPA fallback for any other path -> return the shell (never 500)
app.get('*', (c) => c.html(SHELL))

app.onError((err, c) => c.json({ error: err.message }, 500))

export default app
