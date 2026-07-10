// Layer 3: headless-browser interaction test for the FLYQ controller.
// Drives the real DOM/JS: navigation, connect, arm gating, joystick -> command
// mapping, takeoff/emergency-stop, and verifies NO console errors.

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let pass = 0, fail = 0; const failures = [];
const ok = (n, c, e = '') => { if (c) { pass++; console.log(`  ✓ ${n}`); } else { fail++; failures.push(n + (e ? ' — ' + e : '')); console.log(`  ✗ ${n} ${e}`); } };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

console.log('\n[Layer 3] Browser interaction tests @ ' + BASE);
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#joy-left', { state: 'attached' });

ok('app shell rendered (title)', (await page.title()) === 'FLYQ Drone Controller');
ok('home view active by default', await page.isVisible('#view-home'));
ok('both joysticks present', (await page.$('#joy-left')) && (await page.$('#joy-right')));

// navigate to control
await page.click('button[data-nav="control"]');
ok('control view shows', await page.isVisible('#view-control'));

// arm should be blocked while disconnected
await page.click('#armbtn');
let armed = await page.evaluate(() => window.__lw.state.armed);
ok('arm blocked before connect', armed === false);

// connect via simulator
await page.evaluate(() => window.__lw.connectSim());
ok('simulator connected', await page.evaluate(() => window.__lw.state.connected) === true);
ok('status pill shows CONNECTED', (await page.textContent('#statuspill')).includes('CONNECTED'));

// now arm
await page.evaluate(() => window.__lw.toggleArm());
ok('armed after connect', await page.evaluate(() => window.__lw.state.armed) === true);
ok('arm banner shows ARMED', (await page.textContent('#armbanner')).includes('ARMED'));

// move left stick to full throttle via test hook
await page.evaluate(() => document.getElementById('joy-left')._test.move(0, 1));
await page.waitForTimeout(120);
const thr = await page.textContent('#t-thr');
ok('full throttle stick -> 100%', thr === '100%', `got ${thr}`);
const cmdThrust = await page.evaluate(() => window.__lw.state.cmd.thrust);
ok('command thrust ~65535', Math.round(cmdThrust) === 65535, `got ${cmdThrust}`);

// move right stick full roll
await page.evaluate(() => document.getElementById('joy-right')._test.move(1, 0));
await page.waitForTimeout(120);
const roll = await page.evaluate(() => Math.round(window.__lw.state.cmd.roll));
ok('full right roll -> 30', roll === 30, `got ${roll}`);

// release sticks
await page.evaluate(() => { document.getElementById('joy-left')._test.release(); document.getElementById('joy-right')._test.release(); });
await page.waitForTimeout(120);
const thr0 = await page.textContent('#t-thr');
ok('release -> throttle back to 50%', thr0 === '50%', `got ${thr0}`);

// emergency stop disarms
await page.evaluate(() => window.__lw.emergencyStop());
ok('emergency stop disarms', await page.evaluate(() => window.__lw.state.armed) === false);

// navigate the rest of the tabs without error
for (const v of ['wifi', 'camera', 'settings', 'home']) {
  await page.click(`button[data-nav="${v}"]`);
  ok(`nav -> ${v}`, await page.isVisible(`#view-${v}`));
}

ok('no console/page errors', errors.length === 0, errors.join(' | '));

await browser.close();
console.log(`\nRESULT(browser): ${pass} passed, ${fail} failed`);
if (fail) { console.log('FAILURES:\n - ' + failures.join('\n - ')); process.exit(1); }
console.log('BROWSER ALL GREEN ✅');
