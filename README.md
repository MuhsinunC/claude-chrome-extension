# Claude (Patched)

A modified version of the official Claude Chrome Extension that supports custom API endpoints.

## Versioning & Naming Conventions

- **Name**: Always `Claude (Patched)` to distinguish from the official extension
- **Version**: Official version + `.1` suffix (e.g., official `1.0.40` → patched `1.0.40.1`)

This allows both the official and patched extensions to be installed simultaneously in Chrome.

## Features

- All features of the official Claude Chrome extension
- **Custom API endpoint support** - Route API calls to your own server or proxy
- Easy configuration via `config.js`
- Tracks upstream official releases for easy updates

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/claude-chrome-extension.git
   cd claude-chrome-extension
   ```

2. Configure your custom endpoint (optional):
   - Edit `src/config.js`
   - Set your custom API endpoint URL

3. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `src/` directory

## Configuration

Edit `src/config.js` to customize your settings:

```javascript
window.CLAUDE_CONFIG = {
  // Your custom API endpoint (leave empty for default Anthropic API)
  apiEndpoint: "https://your-custom-api.example.com",

  // Custom WebSocket endpoint (optional, auto-derived from apiEndpoint if empty)
  wsEndpoint: "",
};
```

After changing the configuration, reload the extension in `chrome://extensions`.

## Branches

- **`main`** - Custom version with API endpoint modifications
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

1. Load a `config.js` file before other scripts
2. Check for `window.CLAUDE_CONFIG.apiEndpoint` when making API calls
3. Use the custom endpoint if configured, otherwise fall back to the default Anthropic API
4. Update the Content Security Policy to allow connections to custom endpoints

### Files Modified from Official Extension

- `manifest.json` - Updated CSP, name, version; removed `key` (allows coexistence with official extension)
- `sidepanel.html` - Loads config.js
- `options.html` - Loads config.js
- `newtab.html` - Loads config.js
- `assets/client-BLU1RtqI.js` - Checks for custom baseURL
- `assets/permissions-BsMI2TUG.js` - Checks for custom API/WS URLs
- `config.js` - New file for user configuration

## Requirements

- Google Chrome browser
- (Optional) Your own API endpoint compatible with the Anthropic API format

## Disclaimer

This is an unofficial modification of the Claude Chrome extension. The original extension is developed by Anthropic. This repository is for educational and personal use purposes.

## License

The original Claude Chrome extension is copyrighted by Anthropic, Inc. The modifications in this repository are provided as-is for educational purposes.
