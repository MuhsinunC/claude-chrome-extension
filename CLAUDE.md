# CLAUDE.md — claude-chrome-extension

Autonomously patches Anthropic's official *Claude in Chrome* extension so it runs on the user's own API key (no login), and publishes each patched version to GitHub **Releases** via CI.

## Durable task record

`ROADMAP.md` (repo root) is the single source of truth for all work — done, in progress, planned. Per the global rule, capture every new ask there (right place, in order) **before** acting, and keep it current. It is one nested checklist; glyphs `[ ]` `[~]` `[x]`.

## The one hard invariant: injection-only

Never edit the app's minified bundles — they re-minify and re-hash every release, which breaks automation. The patch only: edits `manifest.json`, strips `_metadata/`, injects `<script src="/cp-inject.js">` into every module-booting HTML, and adds our own files (`patch/payload/cp-*`). All behavior lives in `cp-inject.js` (a `fetch` override) keyed off **stable strings** (`/api/oauth/profile`, `/v1/`, storage keys) — never minified identifiers. Keep it that way.

## Commands (Node ≥ 18; curl/unzip/perl/python3 on PATH)

```bash
bash scripts/extract-crx.sh <out-dir>     # download pristine official extension
node scripts/patch.mjs <ext-dir>          # apply patch in place (--keep-key optional)
node scripts/build.mjs <ext-dir> <dist>   # -> dist/claude-patched-vX.Y.Z.1.zip
node test/override.test.mjs               # override unit test (no deps; must stay green)
node test/e2e.test.mjs                     # full round-trip in Chrome for Testing (run `npm install` first)
```

## Branches

- `main` — the patcher project (this branch).
- `upstream` — pristine official source, auto-synced by CI (diff baseline when a patch breaks).
- `archive/reverse-engineering` — frozen earlier RE work (Humanify + v1.0.40 hand patches). Don't revive it on `main`.

## CI

`.github/workflows/patch-release.yml`: 6h cron + dispatch → extract → decide → patch → build → Release `vX.Y.Z.1` → sync `upstream`. Idempotent (skips an already-released version); opens a deduped issue on failure instead of shipping broken. Manually run: `gh workflow run patch-release.yml`.

## Conventions & gotchas

- Patched `version` = official `+ ".1"`; `name` = `Claude (Patched)`; `key` removed (own ID, coexists with official).
- **Git account: `MuhsinunC` (personal).** macOS osxkeychain misroutes `git push` to the work account → 404. Push with the helper cleared: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push …`. Confirm `gh api user --jq .login` is `MuhsinunC` first.
- Testing: `node test/e2e.test.mjs` runs the full network round-trip in Chrome for Testing (stable Chrome blocks `--load-extension`; CfT permits it). The literal side-panel WIDGET click isn't drivable on CfT 148 (no CDP `Extensions` domain → no `triggerExtensionAction`); it uses the same fetch the e2e drives, so the patch is covered — revisit when CfT ships that domain. A real-key round-trip against `api.anthropic.com` is the only inherently-manual check.
- **Keep the official manifest `key`** (default): the extension ID must stay `fcoeoabgfenejglbffodgkkbkcdhcgfn` or Claude Code's browser automation (native messaging allow-list) can't connect. `--remove-key` opts into a distinct ID (coexists with the official build, but breaks Claude Code). Claude Code's browser feature also needs a Claude subscription (separate from the extension's API-key chat).
- Full design + reverse-engineering evidence (storage keys, endpoints, the login gate): `docs/plans/2026-05-31-autonomous-patcher-design.md`.
- Never commit secrets (`.env` is gitignored) or vendor official source onto `main`.
