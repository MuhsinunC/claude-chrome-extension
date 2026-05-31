/**
 * Unit test for patch/payload/cp-inject.js — exercises the fetch-override logic
 * under stubbed chrome.storage + a recording original fetch, in Node (no browser).
 * Run: node test/override.test.mjs
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// ---- browser/runtime stubs ----
let store = {};
globalThis.chrome = {
  storage: {
    local: {
      get(keys, cb) {
        const out = {};
        (Array.isArray(keys) ? keys : [keys]).forEach((k) => { if (k in store) out[k] = store[k]; });
        cb(out);
      },
      set(obj, cb) { Object.assign(store, obj); if (cb) cb(); },
      remove(keys, cb) { (Array.isArray(keys) ? keys : [keys]).forEach((k) => delete store[k]); if (cb) cb(); },
    },
  },
  runtime: { getURL: (p) => 'chrome-extension://test/' + p },
  tabs: { create() {} },
};
globalThis.document = {
  readyState: 'complete',
  addEventListener() {},
  getElementById() { return null; },
  querySelectorAll() { return []; },
  documentElement: {},
  body: { appendChild() {} },
};
globalThis.MutationObserver = class { observe() {} disconnect() {} };
globalThis.location = new URL('https://x.invalid/sidepanel.html');

// recording original fetch
let calls = [];
globalThis.fetch = async (input, init) => {
  calls.push({ url: typeof input === 'string' ? input : input.url, init });
  return new Response('ORIG', { status: 299 });
};

// load the payload (replaces globalThis.fetch with the override)
const code = readFileSync(new URL('../patch/payload/cp-inject.js', import.meta.url), 'utf8');
vm.runInThisContext(code);

let failures = 0;
function check(name, cond) {
  console.log((cond ? '  OK  ' : ' FAIL ') + name);
  if (!cond) failures++;
}

(async function () {
  // --- API mode OFF: behave exactly like official ---
  store = {};
  calls = [];
  let r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { Authorization: 'Bearer real' } });
  check('off: model call passes through to original', calls.length === 1 && calls[0].url === 'https://api.anthropic.com/v1/messages');
  check('off: returns the original response', r.status === 299);

  // --- API mode ON ---
  store = { useCustomApi: true, customApiBaseUrl: 'http://localhost:9999', customApiKey: 'sk-test' };

  calls = [];
  r = await fetch('https://api.anthropic.com/api/oauth/profile');
  check('on: profile is NOT forwarded upstream', calls.length === 0);
  check('on: profile returns 200', r.status === 200);
  let body = await r.json();
  check('on: profile has account.uuid', !!(body.account && body.account.uuid));
  check('on: profile has organization.organization_type', !!(body.organization && body.organization.organization_type));

  calls = [];
  r = await fetch('https://api.anthropic.com/v1/messages?beta=true', {
    method: 'POST',
    headers: { Authorization: 'Bearer real', 'anthropic-version': '2023-06-01' },
    body: '{"model":"x"}',
  });
  check('on: model call forwarded to original', calls.length === 1);
  if (calls.length === 1) {
    const c = calls[0];
    check('on: rerouted to custom base (path+query preserved)', c.url === 'http://localhost:9999/v1/messages?beta=true');
    const h = c.init.headers;
    check('on: x-api-key set to user key', h.get('x-api-key') === 'sk-test');
    check('on: Authorization stripped', !h.get('authorization'));
    check('on: dangerous-direct-browser-access set', h.get('anthropic-dangerous-direct-browser-access') === 'true');
    check('on: body preserved', c.init.body === '{"model":"x"}');
    check('on: method preserved', c.init.method === 'POST');
  }

  calls = [];
  r = await fetch('https://api.anthropic.com/v1/messages/count_tokens', { method: 'POST', headers: {} });
  check('on: count_tokens rerouted', calls.length === 1 && calls[0].url === 'http://localhost:9999/v1/messages/count_tokens');

  // whole /v1/* surface rerouted (I1: models/files/skills, not just messages)
  calls = [];
  await fetch('https://api.anthropic.com/v1/models?beta=true', { headers: {} });
  check('on: /v1/models rerouted (not just messages)', calls.length === 1 && calls[0].url === 'http://localhost:9999/v1/models?beta=true');

  // Request-object input with a stream body (I2: must not throw "duplex required")
  calls = [];
  let threw = false;
  try {
    const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{"m":1}')); c.close(); } });
    const req = new Request('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { Authorization: 'Bearer x' }, body: stream, duplex: 'half' });
    await fetch(req);
  } catch (e) { threw = true; }
  check('on: Request(stream body) reroutes without duplex error', !threw && calls.length === 1 && calls[0].url === 'http://localhost:9999/v1/messages');
  if (calls.length === 1) check('on: Request-input x-api-key set + Authorization stripped', calls[0].init.headers.get('x-api-key') === 'sk-test' && !calls[0].init.headers.get('authorization'));

  calls = [];
  r = await fetch('https://api.segment.io/v1/track', { method: 'POST', body: 'x' });
  check('on: telemetry dropped (not forwarded)', calls.length === 0);
  check('on: telemetry returns 200', r.status === 200);

  calls = [];
  r = await fetch('https://api.anthropic.com/api/oauth/account');
  body = await r.json();
  check('on: other oauth call returns benign {} (no upstream, no 401)', calls.length === 0 && r.status === 200 && JSON.stringify(body) === '{}');

  calls = [];
  r = await fetch('https://example.com/whatever');
  check('on: unrelated host passes through untouched', calls.length === 1 && r.status === 299);

  console.log(failures === 0 ? '\nALL OVERRIDE UNIT TESTS PASSED' : `\n${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
})();
