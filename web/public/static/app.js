import { mapJoystickToCRTP, createRPYTPacket, createStopPacket, withChecksum, toHex } from '/static/crtp.js';

// ---------------------------------------------------------------- state
const state = {
  connected: false,
  armed: false,
  bridgeUrl: '',           // optional ws:// UDP bridge for REAL flight
  droneIP: '192.168.43.42',
  dronePort: 2390,
  ssid: '',
  cmd: { roll: 0, pitch: 0, yaw: 0, thrust: 0 },
  left: { x: 0, y: 0 },
  right: { x: 0, y: 0 },
  settings: { sound: true, haptics: true, autoConnect: false, logs: true },
  ws: null,
};

const $ = (s, r = document) => r.querySelector(s);
const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
function haptic() { if (state.settings.haptics && navigator.vibrate) navigator.vibrate(12); }

// ---------------------------------------------------------------- render
const app = $('#app');

function render() {
  app.innerHTML = '';
  app.appendChild(TopBar());
  app.appendChild(ViewHome());
  app.appendChild(ViewWifi());
  app.appendChild(ViewControl());
  app.appendChild(ViewCamera());
  app.appendChild(ViewSettings());
  app.appendChild(Nav());
  go(currentView);
  initJoysticks();
}

function TopBar() {
  const bar = el('header', 'topbar');
  bar.innerHTML = `
    <img class="logo" src="/static/icon.svg" alt="">
    <div><h1>FLYQ Drone Controller</h1><div class="ver">v2.1.0</div></div>
    <div class="status-pill ${state.connected ? 'on' : ''}" id="statuspill">
      <span class="dot"></span><span>${state.connected ? 'CONNECTED' : 'OFFLINE'}</span>
    </div>`;
  return bar;
}

// ---- HOME (FLYQ Drone Controller look)
function ViewHome() {
  const v = el('section', 'view'); v.id = 'view-home';
  v.appendChild(el('div', 'hero', `
    <div class="big">🚁</div>
    <div class="title">FLYQ Drone Controller</div>
    <div class="ver">v2.1.0</div>
    <div class="sub">Professional Edition</div>`));

  // Status card: Ready / Connection
  const sc = el('div', 'status-card');
  sc.innerHTML = `
    <div class="status-cell">
      <div class="k">Status</div>
      <div class="v ok">● Ready</div>
    </div>
    <div class="status-cell">
      <div class="k">Connection</div>
      <div class="v ${state.connected ? 'ok' : 'off'}" id="home-conn">● ${state.connected ? 'Connected' : 'Not Connected'}</div>
    </div>`;
  v.appendChild(sc);

  v.appendChild(el('div', 'section-title', 'Quick Access'));

  const menu = el('div', 'menu');
  [
    ['wifi', 'wifi', '📡', 'WiFi Connection', 'Connect to drone network'],
    ['control', 'control', '🎮', 'Drone Control', 'Control flight operations'],
    ['camera', 'camera', '📷', 'Camera Stream', 'View live video feed'],
    ['settings', 'settings', '⚙️', 'Settings', 'App configuration'],
  ].forEach(([id, cls, ic, t, d]) => {
    const item = el('div', 'menu-item ' + cls, `
      <div class="menu-ic">${ic}</div>
      <div class="menu-txt"><div class="t">${t}</div><div class="d">${d}</div></div>
      <div class="menu-arrow">›</div>`);
    item.onclick = () => { haptic(); go(id); };
    menu.appendChild(item);
  });
  v.appendChild(menu);

  v.appendChild(el('div', 'footer', `
    <div class="ft">FLYQ Drone Controller<br>by Passion 3D World<br>© 2026 All Rights Reserved</div>`));
  return v;
}

// ---- WIFI
const DRONE_NETS = ['LiteWing-A1B2', 'FLYQ-Drone-7F', 'ESP-Drone-22'];
function ViewWifi() {
  const v = el('section', 'view'); v.id = 'view-wifi';
  v.appendChild(el('div', 'card', `<h2>Connect to drone</h2>
    <p>Join the drone's WiFi access point, then tap Connect. Default IP <span class="kbd">192.168.43.42:2390</span>.</p>`));
  const scanCard = el('div', 'card');
  scanCard.innerHTML = `<h2>Networks</h2>`;
  const list = el('div'); list.id = 'netlist'; scanCard.appendChild(list);
  const scanBtn = el('button', 'btn cyan', '🔍 Scan networks');
  scanBtn.style.marginTop = '10px';
  scanBtn.onclick = () => scan(list, scanBtn);
  scanCard.appendChild(scanBtn);
  v.appendChild(scanCard);

  const manual = el('div', 'card');
  manual.innerHTML = `<h2>Manual / Bridge</h2>
    <label class="field" style="margin-top:8px">Drone IP : Port</label>`;
  const ipInput = el('input'); ipInput.type = 'text'; ipInput.value = `${state.droneIP}:${state.dronePort}`;
  ipInput.oninput = () => { const [ip, p] = ipInput.value.split(':'); state.droneIP = ip || state.droneIP; state.dronePort = +p || state.dronePort; };
  manual.appendChild(ipInput);
  manual.appendChild(el('label', 'field', 'UDP bridge WebSocket (optional, for REAL flight)'));
  const wsInput = el('input'); wsInput.type = 'text'; wsInput.placeholder = 'ws://192.168.1.50:8787';
  wsInput.value = state.bridgeUrl;
  wsInput.oninput = () => state.bridgeUrl = wsInput.value.trim();
  manual.appendChild(wsInput);
  const connBtn = el('button', 'btn green', state.connected ? '✓ Connected — Disconnect' : 'Connect');
  connBtn.style.marginTop = '12px';
  connBtn.onclick = () => toggleConnect(connBtn);
  manual.appendChild(connBtn);
  manual.appendChild(el('p', 'note', '<br>No bridge? You can still connect in <b>Simulator</b> mode to test the full UI on this phone.'));
  v.appendChild(manual);
  return v;
}

function scan(list, btn) {
  btn.textContent = 'Scanning…'; btn.disabled = true; list.innerHTML = '';
  const nets = [...DRONE_NETS, 'HomeWiFi_5G', 'iPhone Hotspot'];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= nets.length) { clearInterval(iv); btn.textContent = '🔍 Scan again'; btn.disabled = false; return; }
    const name = nets[i++];
    const isDrone = DRONE_NETS.includes(name);
    const row = el('div', 'net' + (isDrone ? ' drone' : ''),
      `<div><div class="nm">${name}</div><div class="meta">${isDrone ? '2.4GHz · Drone AP' : '5GHz · 🔒'}</div></div>
       ${isDrone ? '<span class="tag">DRONE</span>' : '<span class="bars">▂▄▆█</span>'}`);
    if (isDrone) row.onclick = () => { haptic(); state.ssid = name; go('wifi'); setTimeout(() => alert(`Selected ${name}. Now tap Connect below.`), 50); };
    list.appendChild(row);
  }, 220);
}

// ---- CONTROL
function ViewControl() {
  const v = el('section', 'view'); v.id = 'view-control';
  const banner = el('div', 'arm-banner safe'); banner.id = 'armbanner'; banner.textContent = 'DISARMED — SAFE';
  v.appendChild(banner);

  const top = el('div', 'ctl-top');
  top.innerHTML = `
    <div class="tele"><div class="k">THROTTLE</div><div class="v" id="t-thr">0%</div></div>
    <div class="tele"><div class="k">BATTERY</div><div class="v" id="t-bat">87%</div></div>
    <div class="tele"><div class="k">SIGNAL</div><div class="v" id="t-sig">▆</div></div>`;
  v.appendChild(top);

  const sim = el('div', 'sim', '<div class="drone" id="simdrone">🚁</div>'); v.appendChild(sim);

  const sticks = el('div', 'sticks');
  sticks.appendChild(StickWrap('left', 'THROTTLE / YAW'));
  sticks.appendChild(StickWrap('right', 'PITCH / ROLL'));
  v.appendChild(sticks);

  const grid = el('div', 'telemetry-grid');
  grid.innerHTML = `
    <div class="tele"><div class="k">YAW</div><div class="v" id="t-yaw">0</div></div>
    <div class="tele"><div class="k">PITCH</div><div class="v" id="t-pit">0</div></div>
    <div class="tele"><div class="k">ROLL</div><div class="v" id="t-rol">0</div></div>
    <div class="tele"><div class="k">THRUST</div><div class="v" id="t-raw">0</div></div>`;
  v.appendChild(grid);

  const arm = el('div', 'btn-row');
  const armBtn = el('button', 'btn amber', '🔒 ARM'); armBtn.id = 'armbtn';
  armBtn.onclick = () => toggleArm(armBtn);
  const stopBtn = el('button', 'btn red', '🛑 EMERGENCY STOP');
  stopBtn.onclick = emergencyStop;
  arm.appendChild(armBtn); arm.appendChild(stopBtn);
  v.appendChild(arm);

  const act = el('div', 'btn-row');
  const to = el('button', 'btn green', '🚀 TAKEOFF'); to.onclick = takeoff;
  const land = el('button', 'btn blue', '🛬 LAND'); land.onclick = land2;
  act.appendChild(to); act.appendChild(land);
  v.appendChild(act);
  return v;
}

function StickWrap(side, label) {
  const w = el('div', 'stick-wrap');
  w.appendChild(el('div', 'stick-label', label));
  const joy = el('div', 'joy'); joy.id = 'joy-' + side;
  joy.appendChild(el('div', 'cross'));
  joy.appendChild(el('div', 'knob'));
  w.appendChild(joy);
  return w;
}

// ---- CAMERA
function ViewCamera() {
  const v = el('section', 'view'); v.id = 'view-camera';
  v.appendChild(el('div', 'card', `<h2>Camera Stream <span class="badge">BETA</span></h2>
    <p>Live FPV preview appears here when a camera-equipped FLYQ drone is connected over the UDP bridge.</p>`));
  const prev = el('div', 'sim'); prev.style.height = '220px';
  prev.innerHTML = `<div class="drone" style="top:50%;font-size:40px">📷</div>`;
  v.appendChild(prev);
  const row = el('div', 'btn-row');
  const p = el('button', 'btn cyan', '📸 Capture'); p.onclick = () => toast('Photo captured (sim)');
  const r = el('button', 'btn ghost', '🎥 Record'); r.onclick = () => { r.classList.toggle('red'); toast('Recording toggled (sim)'); };
  row.appendChild(p); row.appendChild(r); v.appendChild(row);
  return v;
}

// ---- SETTINGS
function ViewSettings() {
  const v = el('section', 'view'); v.id = 'view-settings';
  const card = el('div', 'card'); card.innerHTML = '<h2>Preferences</h2>';
  [
    ['sound', 'Sound effects', 'Audio cues for actions'],
    ['haptics', 'Haptic feedback', 'Vibrate on controls'],
    ['autoConnect', 'Auto-connect', 'Reconnect to known drone'],
    ['logs', 'Save flight logs', 'Store telemetry history'],
  ].forEach(([key, t, d]) => {
    const row = el('div', 'row', `<div class="lbl"><div class="t">${t}</div><div class="d">${d}</div></div>`);
    const tg = el('div', 'toggle' + (state.settings[key] ? ' on' : ''), '<div class="pin"></div>');
    tg.onclick = () => { state.settings[key] = !state.settings[key]; tg.classList.toggle('on'); haptic(); };
    row.appendChild(tg); card.appendChild(row);
  });
  v.appendChild(card);
  v.appendChild(el('div', 'card', `<h2>About</h2>
    <p>LiteWing Controller (web/PWA)<br>Protocol: CRTP-over-UDP<br>Works on iOS &amp; Android via browser or "Add to Home Screen".</p>`));
  v.appendChild(el('div', 'card', `<h2>Real flight bridge</h2>
    <p class="note">Browsers can't send raw UDP. To fly a real drone, run the included
    <span class="kbd">bridge/udp-bridge.mjs</span> on a laptop joined to the drone's WiFi,
    then set its <span class="kbd">ws://</span> URL on the Connect screen.</p>`));
  return v;
}

// ---- NAV
let currentView = 'home';
function Nav() {
  const nav = el('nav', 'nav');
  [['home', '🏠', 'Home'], ['wifi', '📡', 'Connect'], ['control', '🎮', 'Control'], ['camera', '📷', 'Camera'], ['settings', '⚙️', 'Settings']]
    .forEach(([id, ic, t]) => {
      const b = el('button', id === currentView ? 'active' : '', `<span class="ic">${ic}</span><span>${t}</span>`);
      b.dataset.nav = id;
      b.onclick = () => { haptic(); go(id); };
      nav.appendChild(b);
    });
  return nav;
}

function go(id) {
  currentView = id;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + id));
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.nav === id));
}

// ---------------------------------------------------------------- connect
function toggleConnect(btn) {
  if (state.connected) { disconnect(); btn.textContent = 'Connect'; btn.classList.remove('ghost'); return; }
  if (state.bridgeUrl) connectBridge(btn); else connectSim(btn);
}

function connectSim(btn) {
  state.connected = true; state.ssid = state.ssid || 'Simulator';
  refreshStatus(); toast('Connected (Simulator)'); if (btn) btn.textContent = '✓ Connected — Disconnect';
}

function connectBridge(btn) {
  try {
    const ws = new WebSocket(state.bridgeUrl);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      state.ws = ws; state.connected = true; refreshStatus();
      ws.send(JSON.stringify({ type: 'config', ip: state.droneIP, port: state.dronePort }));
      toast('Bridge connected'); if (btn) btn.textContent = '✓ Connected — Disconnect';
    };
    ws.onclose = () => { state.ws = null; state.connected = false; refreshStatus(); };
    ws.onerror = () => { toast('Bridge error — using simulator'); connectSim(btn); };
  } catch (e) { toast('Bad bridge URL — using simulator'); connectSim(btn); }
}

function disconnect() {
  if (state.ws) { try { state.ws.close(); } catch (_) {} state.ws = null; }
  state.connected = false; state.armed = false; refreshStatus(); updateArmUI();
}

function refreshStatus() {
  const pill = $('#statuspill');
  if (pill) { pill.classList.toggle('on', state.connected); pill.querySelector('span:last-child').textContent = state.connected ? 'CONNECTED' : 'OFFLINE'; }
  const hc = $('#home-conn');
  if (hc) { hc.textContent = '● ' + (state.connected ? 'Connected' : 'Not Connected'); hc.className = 'v ' + (state.connected ? 'ok' : 'off'); }
}

// ---------------------------------------------------------------- arming
function toggleArm(btn) {
  if (!state.connected) { toast('Connect to the drone first'); return; }
  state.armed = !state.armed; updateArmUI(); haptic();
}
function updateArmUI() {
  const banner = $('#armbanner'), btn = $('#armbtn');
  if (banner) { banner.className = 'arm-banner ' + (state.armed ? 'armed' : 'safe'); banner.textContent = state.armed ? 'ARMED — KEEP CLEAR' : 'DISARMED — SAFE'; }
  if (btn) { btn.textContent = state.armed ? '🔓 DISARM' : '🔒 ARM'; btn.className = 'btn ' + (state.armed ? 'green' : 'amber'); }
}
function emergencyStop() {
  state.armed = false; state.left = { x: 0, y: 0 }; state.right = { x: 0, y: 0 };
  sendStop(); updateArmUI(); resetKnobs(); haptic(); toast('EMERGENCY STOP');
}
function takeoff() { if (!ensureArmed()) return; animateTakeoff(); toast('Takeoff'); }
function land2() { state.left.y = -1; toast('Landing'); setTimeout(() => { state.left.y = 0; resetKnobs(); }, 1200); }
function ensureArmed() { if (!state.connected) { toast('Connect first'); return false; } if (!state.armed) { toast('Arm the drone first'); return false; } return true; }

// ---------------------------------------------------------------- joysticks
function initJoysticks() {
  setupStick('left', (x, y) => { state.left = { x, y }; });
  setupStick('right', (x, y) => { state.right = { x, y }; });
}
function setupStick(side, cb) {
  const joy = document.getElementById('joy-' + side);
  if (!joy) return;
  const knob = joy.querySelector('.knob');
  const R = 45;
  let active = false, id = null;
  const center = () => { const r = joy.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
  function move(px, py) {
    const { cx, cy } = center();
    let dx = px - cx, dy = py - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > R) { dx = dx / dist * R; dy = dy / dist * R; }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    cb(+(dx / R).toFixed(3), +(-dy / R).toFixed(3));
  }
  function release() { active = false; id = null; knob.style.transform = 'translate(-50%,-50%)'; cb(0, 0); }
  joy.addEventListener('pointerdown', (e) => { active = true; id = e.pointerId; joy.setPointerCapture(id); move(e.clientX, e.clientY); });
  joy.addEventListener('pointermove', (e) => { if (active && e.pointerId === id) move(e.clientX, e.clientY); });
  joy.addEventListener('pointerup', release);
  joy.addEventListener('pointercancel', release);
  // expose for tests
  joy._test = { move: (nx, ny) => { const r = joy.getBoundingClientRect(); move(r.left + r.width / 2 + nx * R, r.top + r.height / 2 - ny * R); }, release };
}
function resetKnobs() { ['left', 'right'].forEach((s) => { const j = document.getElementById('joy-' + s); if (j) j.querySelector('.knob').style.transform = 'translate(-50%,-50%)'; }); }

// ---------------------------------------------------------------- control loop (50Hz)
let simY = 60;
function loop() {
  const cmd = mapJoystickToCRTP(state.left, state.right);
  state.cmd = cmd;
  if (state.connected && state.armed) sendCommand(cmd);
  // UI
  set('#t-thr', Math.round((cmd.thrust / 65535) * 100) + '%');
  set('#t-yaw', Math.round(cmd.yaw));
  set('#t-pit', Math.round(cmd.pitch));
  set('#t-rol', Math.round(cmd.roll));
  set('#t-raw', Math.round(cmd.thrust));
  // sim viz
  const sd = $('#simdrone');
  if (sd) {
    const targetY = state.armed ? 60 - (cmd.thrust / 65535) * 45 : 60;
    simY += (targetY - simY) * 0.15;
    sd.style.top = simY + '%';
    sd.style.left = (50 + state.right.x * 22) + '%';
    sd.style.transform = `translate(-50%,-50%) rotate(${state.right.x * 18}deg)`;
  }
  requestAnimationFrame(loop);
}
function animateTakeoff() { state.left.y = 0.6; setTimeout(() => { state.left.y = 0.1; resetKnobs(); }, 1500); }
function set(sel, val) { const e = $(sel); if (e) e.textContent = val; }

// ---------------------------------------------------------------- send (real or sim)
function sendCommand(cmd) {
  if (!state.ws || state.ws.readyState !== 1) return; // sim: nothing on the wire
  const pkt = withChecksum(createRPYTPacket(cmd.roll, cmd.pitch, cmd.yaw, cmd.thrust));
  state.ws.send(pkt);
}
function sendStop() {
  if (state.ws && state.ws.readyState === 1) state.ws.send(withChecksum(createStopPacket()));
}

// ---------------------------------------------------------------- misc
let toastTimer;
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = el('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#000;border:1px solid var(--line);color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;z-index:99;transition:.2s;'; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.style.opacity = '0', 1600);
}

// expose hooks for the headless self-test harness
window.__lw = { state, go, toggleArm: () => { state.armed = !state.armed; updateArmUI(); }, connectSim: () => connectSim(), emergencyStop, mapJoystickToCRTP };

render();
requestAnimationFrame(loop);

// register service worker (PWA installability on iOS & Android)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
