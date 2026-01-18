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

  /**
   * Inject "Use API Key" button on the login screen
   */
  function injectApiKeyButton() {
    // Check if button already exists
    if (document.getElementById('claude-patched-api-btn')) return;

    // Find the login button by looking for button with "Log in" text
    const buttons = document.querySelectorAll('button');
    let loginButton = null;
    for (const btn of buttons) {
      if (btn.textContent.trim() === 'Log in') {
        loginButton = btn;
        break;
      }
    }

    if (!loginButton) return;

    // Create "Use API Key" button with matching styles
    const apiButton = document.createElement('button');
    apiButton.id = 'claude-patched-api-btn';
    apiButton.textContent = 'Use API Key';
    apiButton.style.cssText = `
      margin-top: 12px;
      padding: 10px 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: transparent;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    apiButton.onmouseenter = function() {
      this.style.background = 'rgba(255, 255, 255, 0.1)';
      this.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    };
    apiButton.onmouseleave = function() {
      this.style.background = 'transparent';
      this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    };
    apiButton.onclick = function() {
      // Open the options page
      chrome.runtime.openOptionsPage();
    };

    // Insert after login button's parent container
    const container = loginButton.parentElement;
    if (container) {
      container.appendChild(apiButton);
      console.log('[Claude Patched] Added "Use API Key" button to login screen');
    }
  }

  // Watch for DOM changes to detect when login screen appears
  const observer = new MutationObserver(function(mutations) {
    injectApiKeyButton();
  });

  // Start observing once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      observer.observe(document.body, { childList: true, subtree: true });
      injectApiKeyButton();
    });
  } else {
    observer.observe(document.body, { childList: true, subtree: true });
    injectApiKeyButton();
  }
})();
