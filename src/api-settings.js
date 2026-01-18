/**
 * Claude (Patched) - API Settings
 *
 * Self-contained settings UI for custom API endpoint configuration.
 * Renders at the top of the options page with its own styling.
 */

(function() {
  'use strict';

  // Storage keys (isolated from official extension)
  const STORAGE_KEYS = {
    USE_CUSTOM_API: 'useCustomApi',
    CUSTOM_API_BASE_URL: 'customApiBaseUrl',
    CUSTOM_API_KEY: 'customApiKey'
  };

  // Default values
  const DEFAULTS = {
    [STORAGE_KEYS.USE_CUSTOM_API]: false,
    [STORAGE_KEYS.CUSTOM_API_BASE_URL]: 'https://api.anthropic.com',
    [STORAGE_KEYS.CUSTOM_API_KEY]: ''
  };

  // Styles that respect the extension's dark/light mode
  const styles = `
    .api-settings-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border-radius: 12px;
      background: var(--bg-100, #f9fafb);
      border: 1px solid var(--border-300, #e5e7eb);
    }

    [data-mode="dark"] .api-settings-container {
      background: var(--bg-100, #1f2937);
      border-color: var(--border-300, #374151);
    }

    .api-settings-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .api-settings-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-100, #111827);
      margin: 0;
    }

    [data-mode="dark"] .api-settings-title {
      color: var(--text-100, #f9fafb);
    }

    .api-settings-description {
      font-size: 13px;
      color: var(--text-300, #6b7280);
      margin: 0 0 16px 0;
    }

    [data-mode="dark"] .api-settings-description {
      color: var(--text-300, #9ca3af);
    }

    .api-settings-toggle {
      position: relative;
      width: 44px;
      height: 24px;
      background: var(--bg-300, #d1d5db);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .api-settings-toggle.active {
      background: #c96442;
    }

    .api-settings-toggle-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .api-settings-toggle.active .api-settings-toggle-knob {
      transform: translateX(20px);
    }

    .api-settings-fields {
      display: none;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border-300, #e5e7eb);
    }

    [data-mode="dark"] .api-settings-fields {
      border-top-color: var(--border-300, #374151);
    }

    .api-settings-fields.visible {
      display: block;
    }

    .api-settings-field {
      margin-bottom: 16px;
    }

    .api-settings-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-200, #374151);
      margin-bottom: 6px;
    }

    [data-mode="dark"] .api-settings-label {
      color: var(--text-200, #e5e7eb);
    }

    .api-settings-input {
      width: 100%;
      padding: 10px 12px;
      font-size: 14px;
      border: 1px solid var(--border-300, #d1d5db);
      border-radius: 8px;
      background: var(--bg-000, white);
      color: var(--text-100, #111827);
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    [data-mode="dark"] .api-settings-input {
      background: var(--bg-000, #111827);
      border-color: var(--border-300, #4b5563);
      color: var(--text-100, #f9fafb);
    }

    .api-settings-input:focus {
      outline: none;
      border-color: #c96442;
    }

    .api-settings-input::placeholder {
      color: var(--text-400, #9ca3af);
    }

    .api-settings-button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 500;
      color: white;
      background: #c96442;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .api-settings-button:hover {
      background: #b55a3a;
    }

    .api-settings-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .api-settings-message {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 13px;
    }

    .api-settings-message.success {
      background: #d1fae5;
      color: #065f46;
    }

    [data-mode="dark"] .api-settings-message.success {
      background: #064e3b;
      color: #a7f3d0;
    }

    .api-settings-message.error {
      background: #fee2e2;
      color: #991b1b;
    }

    [data-mode="dark"] .api-settings-message.error {
      background: #7f1d1d;
      color: #fecaca;
    }

    .api-settings-key-wrapper {
      position: relative;
    }

    .api-settings-key-toggle {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-300, #6b7280);
      font-size: 12px;
      padding: 4px 8px;
    }

    .api-settings-key-toggle:hover {
      color: var(--text-200, #374151);
    }

    [data-mode="dark"] .api-settings-key-toggle:hover {
      color: var(--text-200, #e5e7eb);
    }
  `;

  // Create and inject styles
  function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  // Load settings from storage
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(Object.values(STORAGE_KEYS), (result) => {
        resolve({
          useCustomApi: result[STORAGE_KEYS.USE_CUSTOM_API] ?? DEFAULTS[STORAGE_KEYS.USE_CUSTOM_API],
          customApiBaseUrl: result[STORAGE_KEYS.CUSTOM_API_BASE_URL] ?? DEFAULTS[STORAGE_KEYS.CUSTOM_API_BASE_URL],
          customApiKey: result[STORAGE_KEYS.CUSTOM_API_KEY] ?? DEFAULTS[STORAGE_KEYS.CUSTOM_API_KEY]
        });
      });
    });
  }

  // Save settings to storage
  async function saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [STORAGE_KEYS.USE_CUSTOM_API]: settings.useCustomApi,
        [STORAGE_KEYS.CUSTOM_API_BASE_URL]: settings.customApiBaseUrl,
        [STORAGE_KEYS.CUSTOM_API_KEY]: settings.customApiKey
      }, resolve);
    });
  }

  // Helper to create elements safely
  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'textContent') {
        el.textContent = value;
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        el.setAttribute(key, value);
      }
    }
    for (const child of children) {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child) {
        el.appendChild(child);
      }
    }
    return el;
  }

  // Create the settings UI using safe DOM methods
  function createSettingsUI(settings) {
    // Toggle knob
    const toggleKnob = createElement('div', { className: 'api-settings-toggle-knob' });

    // Toggle button
    const toggle = createElement('div', {
      className: `api-settings-toggle ${settings.useCustomApi ? 'active' : ''}`,
      id: 'apiToggle'
    }, [toggleKnob]);

    // Title
    const title = createElement('h3', {
      className: 'api-settings-title',
      textContent: 'API Settings'
    });

    // Header
    const header = createElement('div', { className: 'api-settings-header' }, [title, toggle]);

    // Description
    const description = createElement('p', {
      className: 'api-settings-description',
      textContent: 'Use your own API endpoint and key instead of a Claude account'
    });

    // Base URL label
    const baseUrlLabel = createElement('label', {
      className: 'api-settings-label',
      for: 'apiBaseUrl',
      textContent: 'API Base URL'
    });

    // Base URL input
    const baseUrlInput = createElement('input', {
      type: 'url',
      id: 'apiBaseUrl',
      className: 'api-settings-input',
      placeholder: 'https://api.anthropic.com',
      value: settings.customApiBaseUrl || ''
    });

    // Base URL field
    const baseUrlField = createElement('div', { className: 'api-settings-field' }, [baseUrlLabel, baseUrlInput]);

    // API Key label
    const apiKeyLabel = createElement('label', {
      className: 'api-settings-label',
      for: 'apiKey',
      textContent: 'API Key'
    });

    // API Key input
    const apiKeyInput = createElement('input', {
      type: 'password',
      id: 'apiKey',
      className: 'api-settings-input',
      placeholder: 'sk-ant-...',
      value: settings.customApiKey || '',
      style: 'padding-right: 60px;'
    });

    // Show/Hide toggle button
    const toggleVisibility = createElement('button', {
      type: 'button',
      className: 'api-settings-key-toggle',
      id: 'toggleKeyVisibility',
      textContent: 'Show'
    });

    // API Key wrapper
    const apiKeyWrapper = createElement('div', { className: 'api-settings-key-wrapper' }, [apiKeyInput, toggleVisibility]);

    // API Key field
    const apiKeyField = createElement('div', { className: 'api-settings-field' }, [apiKeyLabel, apiKeyWrapper]);

    // Save button
    const saveButton = createElement('button', {
      className: 'api-settings-button',
      id: 'saveApiSettings',
      textContent: 'Save Settings'
    });

    // Message area
    const messageEl = createElement('div', { id: 'apiSettingsMessage' });

    // Fields container
    const fields = createElement('div', {
      className: `api-settings-fields ${settings.useCustomApi ? 'visible' : ''}`,
      id: 'apiFields'
    }, [baseUrlField, apiKeyField, saveButton, messageEl]);

    // Main container
    const container = createElement('div', { className: 'api-settings-container' }, [header, description, fields]);

    return container;
  }

  // Show message (success or error)
  function showMessage(element, message, type) {
    element.className = `api-settings-message ${type}`;
    element.textContent = message;
    setTimeout(() => {
      element.textContent = '';
      element.className = '';
    }, 3000);
  }

  // Attach event listeners
  function attachEventListeners(settings) {
    const toggle = document.getElementById('apiToggle');
    const fields = document.getElementById('apiFields');
    const baseUrlInput = document.getElementById('apiBaseUrl');
    const apiKeyInput = document.getElementById('apiKey');
    const saveButton = document.getElementById('saveApiSettings');
    const messageEl = document.getElementById('apiSettingsMessage');
    const toggleVisibility = document.getElementById('toggleKeyVisibility');

    let currentSettings = { ...settings };

    // Toggle handler
    toggle.addEventListener('click', () => {
      currentSettings.useCustomApi = !currentSettings.useCustomApi;
      toggle.classList.toggle('active', currentSettings.useCustomApi);
      fields.classList.toggle('visible', currentSettings.useCustomApi);
    });

    // Show/hide API key
    toggleVisibility.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
      toggleVisibility.textContent = isPassword ? 'Hide' : 'Show';
    });

    // Save handler
    saveButton.addEventListener('click', async () => {
      const baseUrl = baseUrlInput.value.trim();
      const apiKey = apiKeyInput.value.trim();

      // Validate if toggle is on
      if (currentSettings.useCustomApi) {
        if (!baseUrl) {
          showMessage(messageEl, 'Please enter an API Base URL', 'error');
          return;
        }
        if (!apiKey) {
          showMessage(messageEl, 'Please enter an API Key', 'error');
          return;
        }
        try {
          new URL(baseUrl);
        } catch {
          showMessage(messageEl, 'Please enter a valid URL', 'error');
          return;
        }
      }

      currentSettings.customApiBaseUrl = baseUrl;
      currentSettings.customApiKey = apiKey;

      try {
        await saveSettings(currentSettings);
        showMessage(messageEl, 'Settings saved! Reload the extension to apply.', 'success');
      } catch (err) {
        showMessage(messageEl, 'Failed to save settings', 'error');
      }
    });
  }

  // Initialize the settings UI
  async function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Inject styles
    injectStyles();

    // Load current settings
    const settings = await loadSettings();

    // Create UI
    const settingsUI = createSettingsUI(settings);

    // Wait for the React app to render, then insert our UI at the top
    const insertUI = () => {
      const root = document.getElementById('root');
      if (root && root.firstChild) {
        root.insertBefore(settingsUI, root.firstChild);
        attachEventListeners(settings);
      } else {
        // React hasn't rendered yet, wait and try again
        setTimeout(insertUI, 100);
      }
    };

    insertUI();
  }

  // Start initialization
  init();
})();
