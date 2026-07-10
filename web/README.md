# LiteWing Controller — Web / PWA (iOS + Android)

A lightweight, installable web app that replicates the **LiteWing / ESP32‑S3 drone
controller** UI and flight logic. Runs in any modern mobile browser (iOS Safari &
Android Chrome) and can be "Added to Home Screen" to behave like a native app — a
single URL works on **both platforms**, no App Store / Play Store build required.

## Project Overview
- **Name**: LiteWing Controller (web)
- **Goal**: Fly / test a LiteWing ESP32‑S3 drone from any phone via the browser
- **Platforms**: iOS (Safari PWA) + Android (Chrome PWA) from one URL
- **Protocol**: CRTP‑over‑UDP (ported 1:1 from the original native app)

## Features (completed)
- 🏠 **Home dashboard** with quick-access tiles
- 📡 **Connect** screen — WiFi scan (drone AP detection), manual IP:port, optional UDP-bridge URL
- 🎮 **Control** — dual virtual joysticks (Throttle/Yaw + Pitch/Roll), 50 Hz command loop,
  live telemetry (throttle %, battery, signal, yaw/pitch/roll/thrust), animated drone visualizer
- 🔒 **Safety** — ARM/DISARM gating (must connect first) + EMERGENCY STOP + Takeoff/Land
- 📷 **Camera** screen (FPV preview placeholder, capture/record stubs)
- ⚙️ **Settings** — haptics, sound, auto-connect, flight logs toggles
- 📲 **PWA**: manifest + service worker → installable & offline-capable on iOS & Android

## Functional entry points (URIs)
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | App shell (SPA) |
| GET | `/api/health` | Health check `{ ok: true }` |
| GET | `/api/drone/defaults` | Default drone IP/port + SSID hints |
| POST | `/api/control/command` | Body `{left:{x,y}, right:{x,y}}` → `{roll,pitch,yaw,thrust}` |
| GET | `/manifest.webmanifest` | PWA manifest |
| GET | `/sw.js` | Service worker |
| GET | `/static/*` | app.js, crtp.js, style.css, icon.svg |

## Real-drone flight (important)
Browsers **cannot send raw UDP**, which is how the LiteWing drone is controlled.
Two modes are supported:

1. **Simulator mode** (default) — connect with no bridge URL. The full UI, joysticks
   and telemetry work on your phone for testing. No packets hit the wire.
2. **Real flight** — run the included bridge on a laptop joined to the drone's WiFi:
   ```bash
   cd web/bridge && npm i ws && node udp-bridge.mjs   # ws://0.0.0.0:8787
   ```
   Then on the phone's **Connect** screen set the bridge URL (e.g. `ws://192.168.1.50:8787`).
   The PWA sends CRTP packets over WebSocket → the bridge forwards them as UDP to the drone.

## Data / architecture
- **Frontend**: vanilla JS SPA (`public/static/app.js`) + shared protocol (`public/static/crtp.js`)
- **Backend**: Hono on Cloudflare Pages (`src/index.tsx`)
- **No database** — controller is stateless; settings live in-memory on the client
- **Command mapping** (matches native app): thrust `(y+1)/2 * 65535`, yaw `±200°/s`, pitch/roll `±30°`

## Run locally (sandbox)
```bash
cd web
npm install
npm run build
pm2 start ecosystem.config.cjs      # wrangler pages dev on :3000
curl http://localhost:3000/api/health
```

## Testing — automated self-test loop
```bash
node tests/run-tests.mjs       # 29 protocol + HTTP API tests
node tests/browser-test.mjs    # 19 headless-browser interaction tests (iPhone viewport)
```
Current status: **48 / 48 passing**, 0 console errors.

## Deployment
- **Platform**: Cloudflare Pages
- **Tech Stack**: Hono + TypeScript + Vite + Cloudflare Pages, vanilla JS PWA frontend
- **Status**: ✅ Running locally & self-tested; ready to `npm run deploy`
- **Last Updated**: 2026-06-29

## Not yet implemented / next steps
- Real FPV video decode in Camera (needs camera-equipped LiteWing + stream endpoint)
- Telemetry parsing from drone → live battery/altitude (bridge already forwards UDP back)
- Persist settings to `localStorage`
- Optional: host the UDP bridge guidance inside the app with copy-paste commands
