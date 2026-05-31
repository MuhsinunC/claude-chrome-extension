# Claude (Patched) — auto-patched "Claude in Chrome"

An **autonomously maintained** patched build of Anthropic's official *Claude in Chrome* extension that lets you use your **own Anthropic API key** (or a custom/compatible endpoint) with **no Claude account or login required**.

A GitHub Actions pipeline checks the Chrome Web Store every 6 hours; when Anthropic ships a new official version, it re-applies the patch and publishes a new build to the [**Releases**](../../releases) page — tagged `vX.Y.Z.1`. You always get the latest official version, patched, without doing anything.

> Unofficial; for educational/personal use. The source extension is © Anthropic. See the disclaimer below.

## Install (from Releases)

1. Download the latest `claude-patched-vX.Y.Z.1.zip` from [**Releases**](../../releases) and unzip it.
2. Open `chrome://extensions` and enable **Developer mode** (top-right).
3. Click **Load unpacked** and select the unzipped folder.
4. Turn on API mode (next section).

The patched build has its **own extension ID**, so it can coexist with the official extension.

## Enable API mode

Either click **Use API Key** on the extension's login screen, or open the extension's **Options** page. Then:

1. Toggle **Enable API mode** on.
2. **API base URL** — leave as `https://api.anthropic.com`, or point at a compatible proxy (`https://…` or `http://localhost:PORT`).
3. **API key** — your Anthropic key (`sk-ant-…`), or whatever your proxy expects.
4. **Save** — the side panel switches to API mode immediately (no reload).

Toggle it off any time to restore the normal account/login behavior.

| | Account mode (official) | API mode (this build) |
|---|---|---|
| Login required | Yes (OAuth) | No |
| Needs a Claude account | Yes | No |
| Needs an API key | No | Yes |
| Custom endpoint / proxy | No | Yes |

## How the patch works (injection-only)

The official bundles are minified and **re-hashed every release**, so editing them can't be automated reliably. Instead the patch is **injection-only** — it never touches Anthropic's app code. It only:

- edits `manifest.json` (name, `version`+`.1`, removes `key`/`update_url`, broadens `connect-src`);
- strips `_metadata/` (the CRX signature);
- injects one `<script src="/cp-inject.js">` before the first module script in **every** app HTML entry (enumerated, not hardcoded — entry files change between versions);
- adds its own files: `cp-inject.js` (a `fetch` override) and a `cp-settings` page.

At runtime, `cp-inject.js` reroutes `api.anthropic.com/v1/*` to your endpoint with your `x-api-key`, returns a synthetic `/api/oauth/profile` response so the login gate passes, drops pure-ingest telemetry, and is a complete no-op when API mode is off. Full design + reverse-engineering evidence: [`docs/plans/2026-05-31-autonomous-patcher-design.md`](docs/plans/2026-05-31-autonomous-patcher-design.md).

## Repository layout

| Branch | Contents |
|---|---|
| `main` | The patcher project: `scripts/`, `patch/payload/`, `.github/workflows/`, docs. |
| `upstream` | Pristine, unmodified official source (auto-synced by CI) — the diff baseline when a patch breaks. |
| `archive/reverse-engineering` | Frozen snapshot of the earlier reverse-engineering work (Humanify deobfuscation + the original hand-made v1.0.40 patches). |

```
patch/payload/   cp-inject.js, cp-settings.html, cp-settings.js   (added to the extension)
scripts/         extract-crx.sh, patch.mjs, build.mjs, check-release.mjs
.github/workflows/patch-release.yml
test/            override.test.mjs (unit), browser-smoke.mjs (Chrome load)
docs/plans/      design doc
```

## Run the patcher locally

Requires Node ≥ 18 and `curl`/`unzip`/`perl`/`python3` (preinstalled on macOS/Linux).

```bash
# 1. fetch the current official extension into a scratch dir
bash scripts/extract-crx.sh /tmp/official

# 2. apply the injection-only patch in place
node scripts/patch.mjs /tmp/official        # add --keep-key to keep the official ID

# 3. package it
node scripts/build.mjs /tmp/official dist    # -> dist/claude-patched-vX.Y.Z.1.zip

# load /tmp/official via chrome://extensions "Load unpacked", or install the zip
```

Tests: `node test/override.test.mjs` (fetch-override behavior) and `node test/browser-smoke.mjs <patched-dir>` (loads it in an isolated Chrome).

## CI/CD

[`.github/workflows/patch-release.yml`](.github/workflows/patch-release.yml) runs on a 6-hour cron + manual dispatch:

extract official → decide (skip if `vX.Y.Z.1` already released) → patch → build → create the Release → sync `upstream`. If patching ever fails (e.g. the official extension changes shape), it opens a tracking issue instead of shipping a broken build. Re-running on an already-released version is a no-op.

## Verification status

Automated and passing: patch correctness (manifest/CSP/`_metadata`/HTML injection), the `fetch`-override unit test, the build, a real-Chrome load (the patched build registers identically to the pristine official one), and a live CI run that published and validated a release.

Manual final step: the interactive chat round-trip (open the side panel, set a real key, send a message). Programmatic extension-page automation is blocked by recent Chrome, and a true round-trip needs a real Anthropic key — so this last check is left to you.

## Disclaimer & license

Unofficial modification of Anthropic's *Claude in Chrome*, provided as-is for **educational and personal use**. The original extension and all of its code are © Anthropic, Inc. The patch sources are obtained from the publicly available Chrome Web Store build. If you have concerns, open an issue.
