#!/usr/bin/env node
// LiteWing real-flight bridge.
// Browsers cannot send raw UDP, so run this on a laptop/PC that is joined to
// the drone's WiFi access point. The PWA connects to it over WebSocket and
// every binary frame is forwarded verbatim as a UDP datagram to the drone.
//
//   node bridge/udp-bridge.mjs
//   -> WebSocket server on ws://0.0.0.0:8787
//   -> put that URL in the PWA "Connect" screen (use the laptop's LAN IP)
//
// Requires: npm i ws   (only on the machine running the bridge)

import { WebSocketServer } from 'ws';
import dgram from 'node:dgram';

const WS_PORT = process.env.WS_PORT || 8787;
let DRONE_IP = process.env.DRONE_IP || '192.168.43.42';
let DRONE_PORT = +(process.env.DRONE_PORT || 2390);

const udp = dgram.createSocket('udp4');
const wss = new WebSocketServer({ host: '0.0.0.0', port: WS_PORT });

console.log(`[bridge] WebSocket  ws://0.0.0.0:${WS_PORT}`);
console.log(`[bridge] UDP target ${DRONE_IP}:${DRONE_PORT}`);

wss.on('connection', (ws) => {
  console.log('[bridge] client connected');
  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'config') {
          if (msg.ip) DRONE_IP = msg.ip;
          if (msg.port) DRONE_PORT = +msg.port;
          console.log(`[bridge] target -> ${DRONE_IP}:${DRONE_PORT}`);
        }
      } catch (_) {}
      return;
    }
    const buf = Buffer.from(data);
    udp.send(buf, DRONE_PORT, DRONE_IP, (err) => { if (err) console.error('[bridge] udp send error', err.message); });
  });
  ws.on('close', () => console.log('[bridge] client disconnected'));
});

// forward telemetry back to the browser
udp.on('message', (msg) => {
  for (const c of wss.clients) if (c.readyState === 1) c.send(msg);
});
udp.bind(2399, () => console.log('[bridge] UDP listening on :2399'));
