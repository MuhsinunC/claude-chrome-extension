/**
 * Claude (Patched) — cp-inject.js
 *
 * Injected as a classic <script> before the app's deferred module scripts in
 * every module-booting HTML entry (sidepanel/options/pairing/...). It makes the
 * official extension usable with the user's OWN Anthropic API key + custom
 * endpoint, with NO OAuth login, and WITHOUT editing any of the app's minified
 * bundles — everything happens at the network + storage layer.
 *
 * See docs/plans/2026-05-31-autonomous-patcher-design.md for the full design,
 * evidence (file:line citations), and the reactive-gate reasoning.
 *
 * Storage schema (chrome.storage.local):
 *   useCustomApi      bool    master toggle (written by cp-settings.js)
 *   customApiBaseUrl  string  user endpoint (https:// or http://localhost:*)
 *   customApiKey      string  user API key
 *   accessToken/refreshToken/tokenExpiry/anthropicApiKey  seeded by us (see below)
 */
(function () {
  'use strict';

  var ANTHROPIC = 'https://api.anthropic.com';
  var SENTINEL = 'claude-patched'; // marks tokens we seeded, so toggle-off can clear only ours
  var TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;

  // Pure-ingest telemetry (fire-and-forget) — safe to drop. NOT config-bearing
  // hosts like Statsig/featureassets (those are left to pass through).
  var TELEMETRY_HOSTS = [
    'api.segment.io',
    'cdn.segment.com',
    'api.honeycomb.io',
    'browser-intake-us5-datadoghq.com',
  ];
  var TELEMETRY_SUFFIXES = ['.datadoghq.com', '.ingest.us.sentry.io'];

  // ---------------------------------------------------------------------------
  // Auth seeding. The login gate is `isAuthenticated = (accessToken present) &&
  // (GET /api/oauth/profile returns a body)`. The token is opaque (never
  // decoded), so any non-empty string passes the presence check; our fetch
  // override fakes the profile. We also mirror the key into `anthropicApiKey`
  // so the app's own SDK path uses x-api-key directly.
  // ---------------------------------------------------------------------------
  function applyAuthState(cfg) {
    try {
      if (cfg && cfg.useCustomApi && cfg.customApiKey) {
        chrome.storage.local.set({
          accessToken: SENTINEL,
          refreshToken: SENTINEL,
          tokenExpiry: Date.now() + TEN_YEARS_MS,
          anthropicApiKey: cfg.customApiKey,
        });
      } else {
        // Toggle-off hygiene: clear ONLY the keys we own, so real OAuth still works.
        chrome.storage.local.get(['accessToken', 'refreshToken'], function (r) {
          if (r && r.accessToken === SENTINEL) {
            chrome.storage.local.set({ accessToken: '', refreshToken: '', tokenExpiry: 0 });
            chrome.storage.local.remove('anthropicApiKey');
          }
        });
      }
    } catch (e) {
      /* storage not available in this context — ignore */
    }
  }

  try {
    chrome.storage.local.get(['useCustomApi', 'customApiBaseUrl', 'customApiKey'], applyAuthState);
  } catch (e) {}

  // ---------------------------------------------------------------------------
  // Synthetic profile — the single load-bearing auth fake.
  // ---------------------------------------------------------------------------
  function syntheticProfile() {
    return {
      account: {
        uuid: '00000000-0000-0000-0000-000000000000',
        email: 'api-mode@localhost',
        has_claude_max: true,
        has_claude_pro: true,
      },
      organization: {
        uuid: '00000000-0000-0000-0000-000000000001',
        organization_type: 'claude_max',
      },
    };
  }

  function jsonResponse(obj, status) {
    return new Response(JSON.stringify(obj), {
      status: status || 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  function isTelemetryHost(host) {
    if (TELEMETRY_HOSTS.indexOf(host) !== -1) return true;
    for (var i = 0; i < TELEMETRY_SUFFIXES.length; i++) {
      if (host.length >= TELEMETRY_SUFFIXES[i].length && host.slice(-TELEMETRY_SUFFIXES[i].length) === TELEMETRY_SUFFIXES[i]) {
        return true;
      }
    }
    return false;
  }

  // Reroute the WHOLE Anthropic API surface (/v1/*), not just /v1/messages, so
  // the user's key never leaks to api.anthropic.com and a custom proxy can serve
  // models/files/skills too (these endpoints exist in the SDK bundle).
  function isApiPath(pathname) {
    return pathname.indexOf('/v1/') === 0;
  }

  function readConfig() {
    return new Promise(function (resolve) {
      try {
        chrome.storage.local.get(['useCustomApi', 'customApiBaseUrl', 'customApiKey'], function (r) {
          resolve(r || {});
        });
      } catch (e) {
        resolve({});
      }
    });
  }

  // Merge headers from a Request input and/or an init object into a fresh Headers.
  function mergeHeaders(input, init) {
    var h = new Headers();
    try {
      if (input && typeof input !== 'string' && input.headers && typeof input.headers.forEach === 'function') {
        input.headers.forEach(function (v, k) { h.set(k, v); });
      }
    } catch (e) {}
    try {
      if (init && init.headers) {
        new Headers(init.headers).forEach(function (v, k) { h.set(k, v); });
      }
    } catch (e) {}
    return h;
  }

  // ---------------------------------------------------------------------------
  // fetch override. Installed synchronously so the SDK (which captures `fetch`
  // lexically at construct time) uses it. Non-Anthropic / non-telemetry requests
  // take a synchronous fast path (zero overhead). Only requests we might modify
  // read config (async — fetch is async anyway), so there is no startup race.
  // ---------------------------------------------------------------------------
  if (!globalThis.__cpOrigFetch) {
    globalThis.__cpOrigFetch = globalThis.fetch.bind(globalThis);
  }

  globalThis.fetch = function (input, init) {
    var origFetch = globalThis.__cpOrigFetch;
    var url;
    try {
      var raw = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
      url = new URL(raw, location.href);
    } catch (e) {
      return origFetch(input, init);
    }

    var isAnthropic = url.origin === ANTHROPIC;
    var isTele = isTelemetryHost(url.host);
    if (!isAnthropic && !isTele) {
      return origFetch(input, init); // fast path, unchanged behavior
    }

    return readConfig().then(function (cfg) {
      var enabled = !!(cfg && cfg.useCustomApi && cfg.customApiKey);
      if (!enabled) {
        return origFetch(input, init); // API mode off => behave exactly like official
      }

      // Drop pure-ingest telemetry quietly.
      if (isTele) {
        return new Response('', { status: 200 });
      }

      // Fake the auth gate (load-bearing) + silence other account/bootstrap calls.
      if (url.pathname.indexOf('/api/oauth/profile') === 0) {
        return jsonResponse(syntheticProfile());
      }
      if (url.pathname.indexOf('/api/oauth/') === 0 || url.pathname.indexOf('/api/bootstrap/') === 0) {
        return jsonResponse({}); // benign 200 so the app doesn't see a 401
      }

      // Reroute Anthropic API (/v1/*) calls to the user's endpoint with their key.
      if (isApiPath(url.pathname)) {
        var base = (cfg.customApiBaseUrl || ANTHROPIC).replace(/\/+$/, '');
        var target = base + url.pathname + url.search;
        var headers = mergeHeaders(input, init);
        headers.delete('authorization');
        headers.set('x-api-key', cfg.customApiKey);
        if (!headers.has('anthropic-version')) headers.set('anthropic-version', '2023-06-01');
        headers.set('anthropic-dangerous-direct-browser-access', 'true');

        // String input: body+duplex live in init (the SDK's shape) and Object.assign
        // preserves them. Request-object input: forward its body explicitly with the
        // required duplex flag (a Request doesn't expose .duplex for cloning).
        var isReq = typeof Request !== 'undefined' && input instanceof Request;
        var method = (init && init.method) || (isReq ? input.method : 'GET');
        var newInit = Object.assign({}, init, { headers: headers, method: method });
        if (!('body' in newInit) && isReq && input.body) {
          newInit.body = input.body;
          newInit.duplex = 'half';
        }
        return origFetch(target, newInit);
      }

      return origFetch(input, init);
    });
  };

  // ---------------------------------------------------------------------------
  // Inject a "Use API Key" button onto the login screen (pure DOM, anchored on
  // the visible "Log in" button text — no React/bundle dependency).
  // ---------------------------------------------------------------------------
  function injectButton() {
    if (document.getElementById('cp-api-key-btn')) return;
    var buttons = document.querySelectorAll('button');
    var login = null;
    for (var i = 0; i < buttons.length; i++) {
      var txt = (buttons[i].textContent || '').trim().toLowerCase();
      if (txt === 'log in' || txt === 'login' || txt === 'sign in') {
        login = buttons[i];
        break;
      }
    }
    if (!login) return;

    var btn = document.createElement('button');
    btn.id = 'cp-api-key-btn';
    btn.textContent = 'Use API Key';
    btn.style.cssText =
      'display:block;margin:12px auto 0;padding:10px 24px;border:1px solid rgba(127,127,127,.4);' +
      'border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;';
    btn.addEventListener('click', function () {
      var url = chrome.runtime.getURL('cp-settings.html');
      try {
        chrome.tabs.create({ url: url });
      } catch (e) {
        window.open(url, '_blank');
      }
    });
    (login.parentElement || document.body).appendChild(btn);
  }

  function startObserving() {
    try { injectButton(); } catch (e) {}
    try {
      var obs = new MutationObserver(function () {
        try { injectButton(); } catch (e) {}
      });
      obs.observe(document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserving);
    } else {
      startObserving();
    }
  }
})();
