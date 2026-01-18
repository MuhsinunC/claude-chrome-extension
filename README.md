# Claude (Patched)

A modified version of the official Claude Chrome Extension that supports custom API endpoints and API-only mode (no login required).

## Versioning & Naming Conventions

- **Name**: Always `Claude (Patched)` to distinguish from the official extension
- **Version**: Official version + `.1` suffix (e.g., official `1.0.40` → patched `1.0.40.1`)

This allows both the official and patched extensions to be installed simultaneously in Chrome.

## Features

- All features of the official Claude Chrome extension
- **API Mode** - Use your own API key without requiring a Claude account login
- **Custom API endpoint support** - Route API calls to your own server or proxy
- Settings UI in the Options page (no code editing required)
- Tracks upstream official releases for easy updates

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/claude-chrome-extension.git
   cd claude-chrome-extension
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `src/` directory

3. Configure API settings:
   - Right-click the extension icon → "Options" (or click the gear icon in the sidepanel)
   - Enable "Use Custom API" toggle
   - Enter your API Base URL (e.g., `https://api.anthropic.com`)
   - Enter your API Key
   - Click "Save Settings"

## Configuration

### Using the Settings UI

1. Open the extension Options page
2. Under "API Settings", enable the "Use Custom API" toggle
3. Enter your settings:
   - **API Base URL**: Your API endpoint (e.g., `https://api.anthropic.com`)
   - **API Key**: Your Anthropic API key (starts with `sk-ant-`)
4. Click "Save Settings"

When API Mode is enabled:
- No OAuth login is required
- The extension uses your API key directly
- All requests go to your specified endpoint

### Account Mode vs API Mode

| Feature | Account Mode | API Mode |
|---------|-------------|----------|
| Login required | Yes (OAuth) | No |
| Uses Claude account | Yes | No |
| API Key needed | No | Yes |
| Custom endpoint | No | Yes |

## Branches

- **`main`** - Custom version with API mode and endpoint modifications
- **`upstream`** - Pristine official extension source (for tracking updates)

## Updating to New Official Versions

When Anthropic releases a new version of the official extension:

```bash
# 1. Update upstream branch with latest official source
git checkout upstream
./scripts/extract-crx.sh
git add src/
git commit -m "Sync official extension vX.X.XX"

# 2. Rebase main onto upstream
git checkout main
git rebase upstream
# Resolve any conflicts if needed

# 3. Update version in manifest.json (add .1 suffix to official version)
# e.g., if official is 1.0.41, set version to "1.0.41.1"

# 4. Tag the new release
git tag vX.X.XX.1
```

## How It Works

This extension modifies the official Claude Chrome extension to:

1. Add a settings UI for API configuration (Options page)
2. Store settings in `chrome.storage.local` (isolated keys to avoid conflicts)
3. Load settings before modules via `api-bootstrap.js`
4. Bypass OAuth when API mode is enabled
5. Use custom endpoint and API key for all requests
6. Update the Content Security Policy to allow connections to custom endpoints

### Files Modified from Official Extension

- `manifest.json` - Updated CSP, name, version; removed `key` (allows coexistence with official extension)
- `sidepanel.html` - Loads api-bootstrap.js
- `options.html` - Loads api-settings.js
- `newtab.html` - Loads api-bootstrap.js
- `assets/client-BLU1RtqI.js` - Checks for custom baseURL from `window.CLAUDE_CONFIG`
- `assets/permissions-BsMI2TUG.js` - Bypasses OAuth when API mode enabled
- `assets/sidepanel-yURUk1gX.js` - Uses custom API key from `window.CLAUDE_CONFIG`

### New Files

- `api-settings.js` - Settings UI for the Options page
- `api-bootstrap.js` - Loads settings from storage before modules initialize

### Storage Keys

The extension uses its own isolated storage keys to avoid conflicts:

| Key | Type | Purpose |
|-----|------|---------|
| `useCustomApi` | boolean | Toggle for API mode |
| `customApiBaseUrl` | string | Custom API endpoint URL |
| `customApiKey` | string | User's API key |

## Requirements

- Google Chrome browser
- For API Mode: An Anthropic API key or compatible endpoint

## Disclaimer

This is an unofficial modification of the Claude Chrome extension. The original extension is developed by Anthropic. This repository is for educational and personal use purposes.

## License

The original Claude Chrome extension is copyrighted by Anthropic, Inc. The modifications in this repository are provided as-is for educational purposes.
