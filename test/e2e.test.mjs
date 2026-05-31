// End-to-end test (Chrome for Testing): load the PRODUCTION patched build,
// confirm the login gate is bypassed, and exercise the REAL network path the
// chat uses — cp-inject overrides the side-panel page's globalThis.fetch (the
// same function the app's SDK captures), so a fetch run inside that page proves
// the reroute + key-injection + profile-fake + telemetry-drop against a mock
// Anthropic endpoint. Also cross-references the extension's tab view.
//
// (The side-panel chat *UI* can't be auto-driven: chrome.sidePanel.open needs a
// user gesture, and the app loops [React #185] when forced into a standalone
// tab. Those are product/browser limits, not patch defects — see README.)
//
// Usage: node test/e2e.test.mjs <patched-ext-dir>
import puppeteer from 'puppeteer';
import http from 'node:http';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const PORT = 8787;
const KEY = 'sk-ant-test-key';
const repo = process.cwd();
const profile = repo + '/.chrome-test-profile'; // persistent, gitignored (may hold a real key)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Resolve a patched extension dir: use the CLI arg, reuse a prior build, or build one.
let ext = process.argv[2];
if (!ext) {
  ext = repo + '/.chrome-test-ext';
  if (!existsSync(ext + '/manifest.json')) {
    console.log('preparing patched extension in .chrome-test-ext (extract + patch)...');
    execFileSync('bash', ['scripts/extract-crx.sh', ext], { stdio: 'inherit' });
    execFileSync('node', ['scripts/patch.mjs', ext], { stdio: 'inherit' });
  }
}
const ID = [...createHash('sha256').update(ext).digest('hex').slice(0, 32)].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');

const received = [];
const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    received.push({ method: req.method, url: req.url, headers: req.headers });
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-headers', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.url.startsWith('/v1/messages')) {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const s = (ev, d) => res.write(`event: ${ev}\ndata: ${JSON.stringify(d)}\n\n`);
      s('message_start', { type: 'message_start', message: { id: 'msg_mock', type: 'message', role: 'assistant', model: 'claude-mock', content: [], stop_reason: null, usage: { input_tokens: 1, output_tokens: 1 } } });
      s('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
      s('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'MOCK_REPLY_OK_42' } });
      s('content_block_stop', { type: 'content_block_stop', index: 0 });
      s('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 5 } });
      s('message_stop', { type: 'message_stop' });
      return res.end();
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(req.url.startsWith('/v1/models') ? JSON.stringify({ data: [{ type: 'model', id: 'claude-mock' }], has_more: false }) : '{}');
  });
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ headless: false, userDataDir: profile, args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--no-first-run', '--no-default-browser-check'] });
let pass = 0, fail = 0;
const ck = (n, c) => { console.log((c ? '  OK  ' : ' FAIL ') + n); c ? pass++ : fail++; };
try {
  const isSW = (t) => t.type() === 'service_worker' && t.url().startsWith(`chrome-extension://${ID}`);
  const p0 = await browser.newPage();
  await p0.goto('https://example.com', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  // MV3 service workers are lazy and cycle; poll until one is actually ready.
  async function readyWorker() {
    for (let i = 0; i < 25; i++) {
      const t = browser.targets().find(isSW);
      if (t) {
        const w = await t.worker().catch(() => null);
        if (w) { const ok = await w.evaluate(() => typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.local) && !!chrome.tabs).catch(() => false); if (ok) return w; }
      }
      if (i % 3 === 2) { const pk = await browser.newPage(); await pk.goto('https://example.com/?w=' + i, { waitUntil: 'domcontentloaded' }).catch(() => {}); await pk.close().catch(() => {}); }
      await sleep(700);
    }
    return null;
  }
  const worker = await readyWorker();
  ck('extension service worker reachable + ready', !!worker);
  if (!worker) throw new Error('service worker never became ready');

  await worker.evaluate((port, key) => new Promise((r) => chrome.storage.local.set({
    useCustomApi: true, customApiBaseUrl: 'http://localhost:' + port, customApiKey: key,
    accessToken: 'claude-patched', refreshToken: 'claude-patched', tokenExpiry: Date.now() + 1e11, anthropicApiKey: key,
  }, () => r(1))), PORT, KEY);
  await worker.evaluate(() => chrome.tabs.create({ url: chrome.runtime.getURL('sidepanel.html') }));
  await sleep(2500);
  let sp;
  for (const pg of await browser.pages()) if (pg.url().includes('sidepanel.html')) sp = pg;
  ck('side panel page opened', !!sp);

  // cp-inject active + login gate bypassed
  let cp = false, login = true;
  for (let i = 0; i < 12; i++) {
    await sleep(800);
    const g = await sp.evaluate(() => ({ cp: typeof window.__cpOrigFetch !== 'undefined', login: /\blog in\b/i.test(document.body ? document.body.innerText : '') })).catch(() => ({ cp: false, login: true }));
    cp = g.cp; login = g.login;
    if (cp && !login) break;
  }
  ck('cp-inject override active in the extension page', cp);
  ck('login gate bypassed (authenticated app, not login screen)', !login);

  // ---- REAL network path, exercised inside the extension page ----
  // (a) profile is faked locally (no upstream call)
  const profileRes = await sp.evaluate(async () => { const r = await fetch('https://api.anthropic.com/api/oauth/profile'); return { status: r.status, body: await r.json() }; });
  ck('GET /api/oauth/profile returns synthetic 200 (login gate fake)', profileRes.status === 200 && !!profileRes.body?.account?.uuid);
  ck('profile fake served locally (mock NOT contacted)', !received.some((r) => r.url.includes('/api/oauth/profile')));

  // (b) model call: rerouted to the user's endpoint with their key
  const msgRes = await sp.evaluate(async () => {
    const r = await fetch('https://api.anthropic.com/v1/messages?beta=true', {
      method: 'POST',
      headers: { authorization: 'Bearer should-be-stripped', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-mock', max_tokens: 16, stream: true, messages: [{ role: 'user', content: 'hi' }] }),
    });
    const full = await r.text();
    return { status: r.status, hasReply: full.includes('MOCK_REPLY_OK_42'), sample: full.slice(0, 120) };
  });
  const got = received.find((r) => r.method === 'POST' && r.url.startsWith('/v1/messages'));
  ck('POST /v1/messages reached the mock (rerouted off api.anthropic.com)', !!got);
  if (got) {
    ck('request carried the user key as x-api-key', got.headers['x-api-key'] === KEY);
    ck('OAuth Authorization header was stripped', !got.headers['authorization']);
    ck('anthropic-dangerous-direct-browser-access set', got.headers['anthropic-dangerous-direct-browser-access'] === 'true');
  }
  ck('streamed reply received by the app fetch (SSE body intact)', msgRes.hasReply === true);

  // (c) telemetry dropped
  await sp.evaluate(async () => { try { await fetch('https://api.segment.io/v1/track', { method: 'POST', body: 'x' }); } catch {} });
  ck('telemetry (segment) dropped locally (mock NOT contacted)', !received.some((r) => r.url.includes('/v1/track')));

  // cross-reference: extension chrome.tabs vs the browser's tabs
  const x = await browser.newPage(); await x.goto('https://example.org/', { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
  await sleep(700);
  const extTabs = await worker.evaluate(() => new Promise((r) => chrome.tabs.query({}, (ts) => r(ts.map((t) => t.url)))));
  const pptr = (await browser.pages()).map((p) => p.url());
  ck('extension tab view agrees with the browser (example.org in both)', extTabs.some((u) => u.includes('example.org')) && pptr.some((u) => u.includes('example.org')));

  console.log(`\n${fail === 0 ? 'E2E PASSED' : 'E2E: ' + fail + ' FAILED'} (${pass} checks ok)`);
} finally {
  await browser.close();
  server.close();
}
process.exit(fail === 0 ? 0 : 1);
