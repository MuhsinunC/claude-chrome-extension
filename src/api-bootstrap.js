/**
 * Claude (Patched) - API Bootstrap
 *
 * This script runs BEFORE the main modules to load custom API settings
 * from chrome.storage and populate window.CLAUDE_CONFIG.
 *
 * The module scripts are deferred, so this script completes first.
 */

(function() {
  'use strict';

  // Initialize with empty config (default behavior)
  window.CLAUDE_CONFIG = {
    apiEndpoint: '',
    wsEndpoint: '',
    apiKey: ''
  };

  // Load settings from chrome.storage
  chrome.storage.local.get(['useCustomApi', 'customApiBaseUrl', 'customApiKey'], function(result) {
    if (result.useCustomApi && result.customApiBaseUrl && result.customApiKey) {
      window.CLAUDE_CONFIG = {
        apiEndpoint: result.customApiBaseUrl,
        wsEndpoint: result.customApiBaseUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
        apiKey: result.customApiKey
      };
      console.log('[Claude Patched] API mode enabled:', result.customApiBaseUrl);
    }
  });
})();
