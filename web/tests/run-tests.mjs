#!/usr/bin/env node
// Self-test harness for the FLYQ web controller.
// Layer 1: pure protocol/unit tests (no browser).
// Layer 2: HTTP API tests against the running dev server.
// Exits non-zero on any failure so the build loop can detect & iterate.

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; failures.push(name + (extra ? ' — ' + extra : '')); console.log(`  ✗ ${name} ${extra}`); }
}

// ---- Layer 1: protocol math (mirrors crtp.js) -------------------------
function createRPYTPacket(roll, pitch, yaw, thrust) {
  const p = new Uint8Array(15);
  p[0] = (0x03 << 4); p[1] = 0;
  const r = Math.round(roll * 100) & 0xffff, pi = Math.round(pitch * 100) & 0xffff;
  const y = Math.round(yaw * 100) & 0xffff, t = Math.round(thrust) & 0xffff;
  p[2]=r&0xff;p[3]=(r>>8)&0xff;p[4]=pi&0xff;p[5]=(pi>>8)&0xff;
  p[6]=y&0xff;p[7]=(y>>8)&0xff;p[8]=t&0xff;p[9]=(t>>8)&0xff;
  return p;
}
function mapJoystickToCRTP(left, right) {
  const thrust = Math.max(0, Math.min(1, (left.y + 1) / 2)) * 65535;
  return { roll: right.x * 30, pitch: right.y * 30, yaw: left.x * 200, thrust };
}
function withChecksum(bytes) { let s=0; for (const b of bytes) s=(s+(b&0xff))&0xff; return new Uint8Array([...bytes,s]); }

console.log('\n[Layer 1] Protocol unit tests');
{
  const c = mapJoystickToCRTP({ x: 0, y: 0 }, { x: 0, y: 0 });
  ok('neutral sticks -> 50% thrust', Math.round(c.thrust) === 32768, `got ${c.thrust}`);
  const full = mapJoystickToCRTP({ x: 0, y: 1 }, { x: 0, y: 0 });
  ok('full throttle -> 65535', Math.round(full.thrust) === 65535, `got ${full.thrust}`);
  const min = mapJoystickToCRTP({ x: 0, y: -1 }, { x: 0, y: 0 });
  ok('min throttle -> 0', Math.round(min.thrust) === 0, `got ${min.thrust}`);
  const r = mapJoystickToCRTP({ x: 0, y: 0 }, { x: 1, y: 0 });
  ok('full right roll -> 30deg', Math.round(r.roll) === 30, `got ${r.roll}`);
  const yaw = mapJoystickToCRTP({ x: 1, y: 0 }, { x: 0, y: 0 });
  ok('full yaw -> 200deg/s', Math.round(yaw.yaw) === 200, `got ${yaw.yaw}`);

  const pkt = createRPYTPacket(0, 0, 0, 32768);
  ok('RPYT packet length 15', pkt.length === 15);
  ok('RPYT header = commander port', pkt[0] === 0x30, `got ${pkt[0]}`);
  ok('RPYT thrust LE bytes', pkt[8] === (32768 & 0xff) && pkt[9] === ((32768 >> 8) & 0xff));

  const wc = withChecksum(new Uint8Array([0x30, 0x02]));
  ok('checksum appended correctly', wc.length === 3 && wc[2] === ((0x30 + 0x02) & 0xff), `got ${wc[2]}`);

  const stop = new Uint8Array([0x30, 0x02]);
  ok('stop packet shape', stop[0] === 0x30 && stop[1] === 0x02);
}

// ---- Layer 2: HTTP API against running server -------------------------
console.log('\n[Layer 2] HTTP API tests @ ' + BASE);
async function http(path, opts) {
  const res = await fetch(BASE + path, opts);
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch (_) {}
  return { status: res.status, json, text };
}

try {
  const health = await http('/api/health');
  ok('GET /api/health 200', health.status === 200, `status ${health.status}`);
  ok('health ok:true', health.json && health.json.ok === true);

  const defs = await http('/api/drone/defaults');
  ok('GET /api/drone/defaults 200', defs.status === 200);
  ok('defaults droneIP', defs.json && defs.json.droneIP === '192.168.43.42');
  ok('defaults dronePort', defs.json && defs.json.dronePort === 2390);

  const root = await http('/');
  ok('GET / serves shell', root.status === 200 && root.text.includes('FLYQ'));
  ok('shell loads app.js', root.text.includes('/static/app.js'));
  ok('shell has manifest', root.text.includes('manifest.webmanifest'));

  const css = await http('/static/style.css');
  ok('static css served', css.status === 200 && css.text.includes('.joy'));
  const appjs = await http('/static/app.js');
  ok('static app.js served', appjs.status === 200 && appjs.text.includes('initJoysticks'));
  const crtp = await http('/static/crtp.js');
  ok('static crtp.js served', crtp.status === 200 && crtp.text.includes('mapJoystickToCRTP'));
  const man = await http('/manifest.webmanifest');
  ok('manifest served', man.status === 200 && man.json && man.json.short_name === 'FLYQ');
  const sw = await http('/sw.js');
  ok('service worker served', sw.status === 200 && sw.text.includes('flyq'));

  // command endpoint correctness
  const cmd1 = await http('/api/control/command', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ left: { x: 0, y: 1 }, right: { x: 0, y: 0 } }) });
  ok('command full throttle -> 65535', cmd1.json && cmd1.json.thrust === 65535, `got ${cmd1.json && cmd1.json.thrust}`);
  const cmd2 = await http('/api/control/command', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ left: { x: 0, y: 0 }, right: { x: 1, y: -1 } }) });
  ok('command roll 30 / pitch -30', cmd2.json && cmd2.json.roll === 30 && cmd2.json.pitch === -30, JSON.stringify(cmd2.json));
  const cmd3 = await http('/api/control/command', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ bad: true }) });
  ok('command validates bad input (400)', cmd3.status === 400);

  // favicon / unknown routes must not 500 (caused browser console error)
  const fav = await http('/favicon.ico');
  ok('favicon does not 500', fav.status !== 500, `status ${fav.status}`);
  const unknown = await http('/some/random/spa/route');
  ok('unknown route -> SPA shell (not 500)', unknown.status === 200 && unknown.text.includes('FLYQ'), `status ${unknown.status}`);
  const api404 = await http('/api/nope');
  ok('unknown API -> 404 json', api404.status === 404);
} catch (e) {
  fail++; failures.push('HTTP layer threw: ' + e.message);
  console.log('  ✗ HTTP layer error: ' + e.message);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:\n - ' + failures.join('\n - ')); process.exit(1); }
console.log('ALL GREEN ✅');
process.exit(0);
