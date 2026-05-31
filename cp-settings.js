/**
 * Claude (Patched) — cp-settings.js
 *
 * Logic for the self-owned settings page (cp-settings.html). Reads/writes the
 * storage schema, and on Save also seeds (or clears) the auth-state keys so that
 * enabling API mode takes effect LIVE — an already-open side panel re-renders
 * via its chrome.storage.onChanged listener without needing a reload.
 *
 * Must be an external file (manifest CSP is `script-src 'self'`; inline scripts
 * are blocked). No inline event handlers for the same reason.
 */
(function () {
  'use strict';

  var SENTINEL = 'claude-patched';
  var TEN_YEARS_MS = 10 * 365 * 24 * 60 * 60 * 1000;
  var DEFAULT_BASE = 'https://api.anthropic.com';

  var enabledEl = document.getElementById('cp-enabled');
  var baseEl = document.getElementById('cp-base');
  var keyEl = document.getElementById('cp-key');
  var statusEl = document.getElementById('cp-status');
  var form = document.getElementById('cp-form');

  // Populate from storage.
  chrome.storage.local.get(['useCustomApi', 'customApiBaseUrl', 'customApiKey'], function (r) {
    r = r || {};
    enabledEl.checked = !!r.useCustomApi;
    baseEl.value = r.customApiBaseUrl || DEFAULT_BASE;
    keyEl.value = r.customApiKey || '';
  });

  function setStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.className = 'status ' + (ok ? 'ok' : 'err');
  }

  function validBase(base) {
    return /^https:\/\/\S+/i.test(base) || /^http:\/\/localhost(:\d+)?(\/\S*)?$/i.test(base);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var enabled = enabledEl.checked;
    var base = (baseEl.value || '').trim() || DEFAULT_BASE;
    var key = (keyEl.value || '').trim();

    if (enabled && !key) {
      setStatus('Enter an API key to enable API mode.', false);
      return;
    }
    if (enabled && !validBase(base)) {
      setStatus('Base URL must be https:// or http://localhost[:port].', false);
      return;
    }

    var data = { useCustomApi: enabled, customApiBaseUrl: base, customApiKey: key };

    if (enabled) {
      // Seed auth state so the login gate passes immediately (live, no reload).
      data.accessToken = SENTINEL;
      data.refreshToken = SENTINEL;
      data.tokenExpiry = Date.now() + TEN_YEARS_MS;
      data.anthropicApiKey = key;
      chrome.storage.local.set(data, function () {
        setStatus('Saved. API mode is ON — open the Claude side panel to start.', true);
      });
    } else {
      // Disable: clear only the keys we own, restoring official OAuth behavior.
      chrome.storage.local.set(data, function () {
        chrome.storage.local.get(['accessToken'], function (r) {
          if (r && r.accessToken === SENTINEL) {
            chrome.storage.local.set({ accessToken: '', refreshToken: '', tokenExpiry: 0 });
            chrome.storage.local.remove('anthropicApiKey');
          }
          setStatus('Saved. API mode is OFF — official login restored.', true);
        });
      });
    }
  });
})();
