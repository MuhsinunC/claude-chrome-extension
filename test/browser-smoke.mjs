/**
 * browser-smoke.mjs — load the PATCHED extension in an isolated Chrome (separate
 * profile; won't touch your Chrome) and verify over the DevTools Protocol:
 *   1. the extension loads, serves our settings page, and cp-settings.js runs;
 *   2. with API mode seeded, the side panel boots PAST the login gate
 *      (login screen gone) with cp-inject.js active.
 * No mock server needed: cp-inject fakes /api/oauth/profile locally.
 *
 * Usage: node test/browser-smoke.mjs <patched-ext-dir>
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Chrome derives a keyless unpacked extension's ID from sha256(abspath): first
// 32 hex chars mapped 0-f -> a-p. Compute for both the path and its realpath
// (symlinks change what Chrome hashes).
function extIdFor(p) {
  const h = createHash('sha256').update(p).digest('hex').slice(0, 32);
  return [...h].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const extDir = process.argv[2];
const PORT = 9333;
if (!extDir || !existsSync(join(extDir, 'manifest.json'))) { console.error('need <patched-ext-dir>'); process.exit(2); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'cp-smoke-'));
const chrome = spawn(CHROME, [
  `--user-data-dir=${profile}`,
  `--load-extension=${extDir}`,
  `--disable-extensions-except=${extDir}`,
  `--remote-debugging-port=${PORT}`,
  '--no-first-run', '--no-default-browser-check',
  // Chrome 137+ ignores --load-extension unless this hardening feature is off.
  '--disable-features=DisableLoadExtensionCommandLineSwitch,DialMediaRouteProvider',
  'about:blank',
], { stdio: 'ignore' });

const watchdog = setTimeout(() => { console.error('SMOKE: watchdog timeout'); cleanup(); process.exit(1); }, 60000);
function cleanup() { try { chrome.kill('SIGKILL'); } catch {} try { rmSync(profile, { recursive: true, force: true }); } catch {} }

let ws, msgId = 0; const pending = new Map();
function send(method, params, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++msgId; pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {}, sessionId }));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(method + ' timed out')); } }, 15000);
  });
}
async function evalIn(session, expression, awaitPromise = false) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise }, session);
  if (r.exceptionDetails) throw new Error('eval: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
}
async function openAndAttach(url) {
  const t = await send('Target.createTarget', { url });
  const a = await send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await send('Runtime.enable', {}, a.sessionId);
  return a.sessionId;
}
// Probe candidate IDs by opening cp-settings.html and checking it's OUR page.
async function findOurExtId(candidates) {
  for (const id of candidates) {
    try {
      const s = await openAndAttach(`chrome-extension://${id}/cp-settings.html`);
      await sleep(700);
      const title = await evalIn(s, `document.title || ''`);
      await send('Target.closeTarget', { targetId: (await send('Target.getTargets')).targetInfos.find((t) => t.url.includes(id) && t.url.includes('cp-settings'))?.targetId }).catch(() => {});
      if (/Patched/.test(title)) return id;
    } catch (e) { /* try next */ }
  }
  return null;
}

(async function () {
  let fails = 0;
  const ck = (n, c) => { console.log((c ? '  OK  ' : ' FAIL ') + n); if (!c) fails++; };

  let ver;
  for (let i = 0; i < 60; i++) { try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(250); } }
  if (!ver) throw new Error('CDP did not come up');
  ws = new (globalThis.WebSocket)(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')); });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
  };
  await send('Target.setDiscoverTargets', { discover: true });
  console.log('Chrome:', ver.Browser);

  const candidates = [...new Set([extIdFor(extDir), extIdFor(realpathSync(extDir))])];
  console.log('  candidate ids:', candidates.join(', '));
  const ID = await findOurExtId(candidates);
  ck('patched extension loads & serves our pages', !!ID);
  if (!ID) { console.log('  -> could not reach our extension page; aborting browser checks'); clearTimeout(watchdog); cleanup(); process.exit(1); }
  console.log('  our ext id:', ID);

  // 1) settings page loads + our JS runs
  const s1 = await openAndAttach(`chrome-extension://${ID}/cp-settings.html`);
  await sleep(1200);
  const sj = JSON.parse(await evalIn(s1, `JSON.stringify({title:document.title, hasForm:!!document.getElementById('cp-form'), baseDefault:(document.getElementById('cp-base')||{}).value, hasChromeStorage: !!(globalThis.chrome&&chrome.storage&&chrome.storage.local)})`));
  ck('settings page served (title contains "Patched")', /Patched/.test(sj.title || ''));
  ck('settings form present', sj.hasForm === true);
  ck('extension-page context (chrome.storage available)', sj.hasChromeStorage === true);
  ck('cp-settings.js ran (base input defaulted)', sj.baseDefault === 'https://api.anthropic.com');

  // seed API mode (tests the gate, not the form UI)
  await evalIn(s1, `new Promise(r=>chrome.storage.local.set({useCustomApi:true,customApiBaseUrl:'http://localhost:8787',customApiKey:'sk-test',accessToken:'claude-patched',refreshToken:'claude-patched',tokenExpiry:Date.now()+1e11,anthropicApiKey:'sk-test'},()=>r(1)))`, true);

  // 2) side panel boots past the login gate
  const s2 = await openAndAttach(`chrome-extension://${ID}/sidepanel.html`);
  let gate = { cp: false, login: true, len: 0 };
  for (let i = 0; i < 12; i++) {
    await sleep(1000);
    try {
      gate = JSON.parse(await evalIn(s2, `JSON.stringify({cp:typeof window.__cpOrigFetch!=='undefined', login:/\\blog in\\b/i.test(document.body?document.body.innerText:''), len:(document.body?document.body.innerText.length:0)})`));
    } catch (e) { /* page may still be loading */ }
    if (gate.cp && !gate.login && gate.len > 0) break;
  }
  ck('cp-inject.js active in side panel (fetch wrapped)', gate.cp === true);
  ck('login gate bypassed (no "Log in" text in side panel)', gate.login === false);
  console.log('  gate detail:', JSON.stringify(gate));

  clearTimeout(watchdog); cleanup();
  console.log(fails === 0 ? '\nBROWSER SMOKE PASSED' : `\n${fails} BROWSER CHECK(S) FAILED/INCONCLUSIVE`);
  process.exit(fails === 0 ? 0 : 1);
})().catch((e) => { console.error('SMOKE ERROR:', e.message); clearTimeout(watchdog); cleanup(); process.exit(1); });
