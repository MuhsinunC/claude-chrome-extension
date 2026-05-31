# Design: Autonomous Patcher + Release Pipeline for "Claude in Chrome"

Status: FINAL (rev 2, addresses code-review C1 + I1–I8 + minors) — pending re-review to zero Critical/Important before execution.
Date: 2026-05-31
Owner: Muhsinun (MuhsinunC)

Evidence provenance (important): The login/auth *logic* (gate expression, validator) was reverse-engineered from the **v1.0.40** deobfuscated source and confirmed against the **pristine `upstream` branch** (`isAuthenticated = t && !!s`, no `apiModeAuth`). The **stable anchors the patch actually depends on** (storage-key strings, endpoint paths, telemetry hosts, HTML module-script anchor, manifest shape) were **re-validated against a freshly extracted pristine v1.0.74** on 2026-05-31 (see §10). Minified symbol names (`QN`, `fj`, `Vt`, …) are v1.0.40-only and illustrative — they reshuffle every release and the patch never relies on them.

## 1. Goal (one sentence)

Every time Anthropic ships a new official "Claude in Chrome" extension, automatically produce a patched build that works with the user's own Anthropic API key + custom endpoint (no Claude account / OAuth login), and publish it as a tagged GitHub **Release** — with the patch expressed as a **version-resilient, injection-only transformation** that survives re-minification, plus a clear failure path when a release changes too much.

## 2. Scope

In scope: a deterministic injection-only patch; a scheduled CI/CD pipeline (detect new official version → patch → package → release); a repo restructure preserving existing reverse-engineering work; install docs.

Non-goals: Chrome Web Store publishing; one-click `.crx` (Chrome blocks off-store CRX install — unpacked-zip is the path); any third-party hosted backend (we are fully self-contained); extending the Humanify deobfuscation (archived, not continued).

## 3. Background

- **Official current version: 1.0.74** (verified live, 2026-05-31). Old work here targets v1.0.40; cocodem is at v1.0.66 (as of 2026-05-31, unverified beyond their repo listing).
- **Re-minification is the core problem.** Bundle names and minified identifiers change every release; even **entry-point HTML files change** (v1.0.40 `{newtab,options,sidepanel}` → v1.0.74 `{options,pairing,sidepanel}`). So the patch must depend only on stable, declarative anchors — never on bundle hashes, minified symbols, or a hardcoded list of entry filenames.

## 4. Architecture: injection-only patching

The patch only ever does four things, none dependent on bundle hashes or minified identifiers:
1. Edit `manifest.json` (declarative, stable).
2. Strip `_metadata/` (CRX signature folder — confirmed present after extraction in v1.0.74, so this is a real step).
3. Inject one `<script>` into **every** HTML file that boots a module app (enumerated programmatically).
4. Add our own self-contained files (the runtime override + a settings page).

All behavior lives in our injected code, operating at the **network + storage layer**, where the contract with Anthropic's API is far more stable than minified UI code.

### 4.0 Canonical storage schema (single source of truth; chrome.storage.local)

| Key | Written by | Read by | Purpose |
|---|---|---|---|
| `useCustomApi` | `cp-settings.js` | `cp-inject.js` | Master toggle for API mode |
| `customApiBaseUrl` | `cp-settings.js` | `cp-inject.js` (fetch override) | User's endpoint (https or http://localhost) |
| `customApiKey` | `cp-settings.js` | `cp-inject.js` (header inject; also mirrored to `anthropicApiKey`) | User's API key |
| `accessToken` | `cp-inject.js` (seed = `"claude-patched"`) | app gate (`t = !!accessToken`) | Make presence-check pass |
| `tokenExpiry` | `cp-inject.js` (seed = now+10y) | app validator | Make validity-check pass |
| `refreshToken` | `cp-inject.js` (seed = `"claude-patched"`) | app | Avoid the refresh-wipe branch |
| `anthropicApiKey` | `cp-inject.js` (seed = `customApiKey`) | app native SDK path | Feed the app's own `x-api-key` branch |

The four seeded keys use the literal sentinel `"claude-patched"` for the tokens so they're recognizable. **Toggle-off hygiene:** when `useCustomApi` is false, `cp-inject.js` is a no-op for network AND clears the keys it owns — any `accessToken`/`refreshToken` equal to our sentinel, plus `anthropicApiKey` (which we set from `customApiKey`) — so the real OAuth login still works cleanly (no leftover key silently routing the native SDK down the x-api-key branch).

### 4.1 Files

```
patch/payload/
  cp-inject.js      # classic script injected before app modules: storage seed + fetch override + login-button injection
  cp-settings.html  # standalone settings page we fully own
  cp-settings.js    # settings logic: read/write the storage schema above
scripts/
  extract-crx.sh    # TO BE REFACTORED (tracked in ROADMAP; not yet done on disk): take an OUTPUT DIR (replace the in-place `rm -rf src/`), drop the auto-unminify call, bump the hardcoded Chrome UA (131 -> current; 140 verified)
  check-release.mjs # read version from the freshly-extracted manifest.json; decide if a Release for vX.Y.Z.1 is still needed
  patch.mjs         # apply the injection-only transformation to an extracted source dir
  build.mjs         # zip a patched dir -> dist/claude-patched-vX.Y.Z.1.zip
.github/workflows/
  patch-release.yml # scheduled (6h) + manual pipeline
```

MVP injects only page contexts (the module-booting HTML entries). No service-worker wrapper: model calls and the auth gate are page-context (the Main bundle, imported by the SW, contains zero `/v1/messages`; model calls live in the client bundle loaded by the panel). SW wrapping (for SW-side telemetry only) is a documented optional enhancement.

### 4.2 `cp-inject.js` (the whole behavior change)

Runs as a classic `<script>` before the deferred app modules.

**Step A — seed auth state.** Only when `useCustomApi` is true. Issues the writes from §4.0 as early as possible. Note: `chrome.storage.local.set` is **asynchronous** — we cannot guarantee the write lands before the app's first read. We rely on the gate being **reactive** (see below), so the worst case is a brief login flash that auto-resolves; we do not assume a synchronous seed. Verified-in-test (§7) that a cold start with API mode on lands on chat, not a stuck login.

Why the reactive gate makes the async seed safe: the auth state `t` is updated by the app's own `chrome.storage.onChanged` listener, and the profile query is `enabled` only when `t` is true and re-runs when its result arrives. So: our async `set` lands → `onChanged` flips `t` true → profile query fires → our override returns a synthetic 200 (Step B.1) → profile data `s` becomes truthy → `isAuthenticated = t && !!s` recomputes true. No synchronous guarantee needed.

**Step B — install `globalThis.fetch` + (defensively) `XMLHttpRequest.prototype.open` overrides, synchronously at script run.** The SDK resolves `fetch` lexically at call time, so an override installed before the deferred modules is guaranteed to be used. The override reads current config from `chrome.storage.local` **at intercept time** (fetch is async anyway), so there is no startup race and settings changes take effect without reload. XHR override is defensive only — the SDK is fetch-based (no XHR in the client bundle); streaming is `ReadableStream` over fetch and is preserved transparently by returning the original `Response`. Behavior:

1. **Fake the auth gate** — intercept `GET https://api.anthropic.com/api/oauth/profile`; return a synthetic `200` JSON (§4.3). With the seeded `accessToken`, this satisfies `isAuthenticated` with no OAuth. Config-independent. (A 401/403 here is treated as fatal by the app, so it must be a real 200.)
2. **Reroute model calls** — for `https://api.anthropic.com` + path in {`/v1/messages`, `/v1/messages?beta=true`, `/v1/messages/count_tokens`, `/v1/complete`}: rewrite origin to `customApiBaseUrl`; set `x-api-key: <customApiKey>` and delete any `Authorization: Bearer` (the new client paths may send Bearer). Required because the SDK's `baseURL` arg is already truthy so a config-based fallback never fires; the network layer is the only injection-only place to reroute. Keep `anthropic-version`; add `anthropic-dangerous-direct-browser-access: true`.
3. **Drop pure-ingest telemetry only** — see §4.6 (narrowed to fire-and-forget hosts to avoid breaking config-bearing calls).
4. **No-op when API mode off** — pass through to the stashed original `fetch`/XHR; behaves exactly like the official extension.

**Step C — inject the "Use API Key" button.** A `MutationObserver` watches for the login "Log in" button; when present, append a sibling button opening `chrome.runtime.getURL('cp-settings.html')`. Pure DOM, anchored on visible text — no bundle edit.

### 4.3 Synthetic profile response (the only load-bearing fake)

```json
{
  "account": { "uuid": "00000000-0000-0000-0000-000000000000", "email": "api-mode@localhost", "has_claude_max": true, "has_claude_pro": true },
  "organization": { "uuid": "00000000-0000-0000-0000-000000000001", "organization_type": "claude_max" }
}
```

Account-settings / organizations endpoints are lazy/non-gate and may 404 harmlessly. If a future version blocks on `bootstrap/features`, return `{"features":{}}` too (cheap to add). Field-choice provenance: `has_claude_max`/`has_claude_pro`/`organization_type` are the fields read by the analytics-identify path (`Main:45195`, v1.0.40) — they make that call succeed and are harmless if unread.

### 4.4 `manifest.json` edits (declarative, version-independent)

- `name` → `"Claude (Patched)"`; `description` → note patched build.
- `version` → official `+ ".1"` (e.g. `1.0.74` → `1.0.74.1`).
- Remove `update_url`.
- **Remove `key`** → distinct extension ID, coexists with an official install; OAuth is irrelevant in API mode. (Patch flag `--keep-key` flips this. Settings URL uses `chrome.runtime.getURL`, so an ID change is fine.)
- `content_security_policy.extension_pages`: broaden `connect-src` to `'self' https: wss: http://localhost:* ws://localhost:*` (official CSP only allows `api.anthropic.com` + telemetry; a plain-`http` non-localhost endpoint stays CSP-blocked — documented).
- **No `web_accessible_resources` change needed** (decided, not deferred): extension-owned pages load extension-owned scripts directly; `script-src 'self'` permits the packaged `cp-inject.js`; `cp-settings.html` is opened via `chrome.runtime.getURL` from extension pages (the side panel), which needs no WAR. WAR is only for web-page/content-script access, which we don't use.

### 4.5 HTML injection (programmatic enumeration — not hardcoded)

The patcher scans **every `*.html` file in the extension root**, and for each that contains a `<script type="module">`, inserts `<script src="/cp-inject.js"></script>` immediately before the first such tag. It does **not** hardcode filenames — entry points change between versions (newtab→pairing). Files with zero module scripts (`blocked.html`, `offscreen.html`, `gif_viewer.html`) are skipped automatically. If **no** file contains a module-script anchor, the patch fails loudly (→ issue), never silently. §7 asserts injected-count == module-booting-count.

### 4.6 Telemetry (narrowed: pure fire-and-forget ingest only)

Drop (empty `200`) ONLY confirmed fire-and-forget ingest hosts present in v1.0.74: `api.segment.io`, `cdn.segment.com`, `*.ingest.us.sentry.io`, `browser-intake-us5-datadoghq.com` (`*.datadoghq.com`), `api.honeycomb.io`. **Do NOT** intercept Statsig / `featureassets.org` / `prodregistryv2.org` (config-bearing — an empty body can throw in their SDK and break e.g. the model selector). They aren't even present in v1.0.74's bundles, but the deny-list is conservative regardless. Telemetry-drop is non-load-bearing; if any host misbehaves it can be disabled without affecting auth/chat.

## 5. Repo restructure (preserves everything; untracked files are the only real risk)

- **`archive/reverse-engineering`** — frozen snapshot of ALL existing work (Humanify `src-deobfuscated/`, `deobfuscated/deobfuscated.js`, the v1.0.40 hand patches, plus the working-tree-only files: `ROADMAP.md`, `docs/`, untracked `src-deobfuscated/`). Created and pushed BEFORE any cleanup, then untouched.
- **`upstream`** — pristine official source mirror (extracted official source, no patches/deobfuscation). Auto-synced by CI; used for diffing when a patch breaks. Append-only, never force-pushed.
- **`main`** — patcher project only: `scripts/`, `patch/payload/`, `.github/workflows/`, `README.md`, `ROADMAP.md`, `CLAUDE.md`, `docs/`. No vendored official source. Heavy deobfuscated files removed from the working tree (retained in `archive` + history).

M2 steps with a **hard data-loss gate**:
1. On a branch off current `main`, `git add` ALL untracked items (`src-deobfuscated/`, `docs/`, `ROADMAP.md`, anything `git status --porcelain` shows as `??`) + the already-tracked deobfuscated files; also pull in `upstream`'s `src-deobfuscated/` if it adds anything; commit as `archive/reverse-engineering`; push.
2. **Gate before any deletion:** assert `git status --porcelain` is empty AND `git cat-file -e archive/reverse-engineering:src-deobfuscated/assets/deobfuscated.js` (and the other RE files) succeed. Only then proceed.
3. Reset `upstream` to a pristine extracted source (CI keeps it current).
4. On `main`: `git rm` the heavy deobfuscated files + old patched `src/`; add the patcher project.

Optional backlog: `git filter-repo` to purge the large blob from `main` history (not done autonomously — history rewrite).

## 6. CI/CD pipeline (`patch-release.yml`)

Triggers: `schedule` (cron every 6h) + `workflow_dispatch`. Permissions: `contents: write`, `issues: write`, default `GITHUB_TOKEN`. **Assumptions (stated):** `main`/`upstream` are unprotected (personal repo); pushes made with the default `GITHUB_TOKEN` intentionally do NOT retrigger workflows, so there is no recursion even though we push to `upstream` (we only trigger on `schedule`/`dispatch`).

Steps:
1. Checkout `main`.
2. Setup Node (runner has curl/unzip/perl).
3. `extract-crx.sh <scratch-dir>`: download the full CRX **once** (current Chrome UA — 140 verified to serve 1.0.74) and unzip to a scratch dir; read the official version `V` directly from `<scratch-dir>/manifest.json`. (No separate updatecheck-XML probe: a ~5 MB download every 6h is negligible, and reading `V` from the same bytes we patch makes a "tagged X / shipped Y" mismatch structurally impossible — removing the net-new XML-parse build risk and the reconciliation step entirely.)
4. `check-release.mjs`: if a GitHub Release tagged `v{V}.1` already exists → exit no-op.
5. `patch.mjs <scratch-dir> <out-dir>`: apply the transformation.
6. `build.mjs <out-dir>` → `dist/claude-patched-v{V}.1.zip`.
7. Create GitHub Release `v{V}.1` (body = install steps + disclaimer + "based on official v{V}"), attach the zip.
8. Sync pristine source to `upstream` via a dedicated `git worktree` (avoids branch-switching the `main` checkout): add a worktree on `upstream`, copy the pristine extracted source in, commit **only if `git status` shows a diff**, push. Append-only.
9. **On any download/patch/build failure: open a GitHub issue with logs and fail the job — never publish a broken release.** Idempotent: re-running an already-released version is a no-op (step 4).

## 7. Verification (must pass before "done")

Against real pristine official v1.0.74, locally:
1. **Structural:** patch applies; output `manifest.json` valid with expected fields (name/version/no-key/no-update_url/broadened-CSP); `<script src="/cp-inject.js">` present before the first module script in **every** module-booting HTML; injected-count == module-booting-count; `_metadata/` gone; payload files present.
2. **Override unit test (Node):** load `cp-inject.js` logic under a simulated `fetch`/storage; assert: model calls reroute to `customApiBaseUrl` with `x-api-key` (and `Authorization` stripped); `/api/oauth/profile` → synthetic 200; the 5 ingest hosts → empty; Statsig/featureassets pass through; full no-op when API mode off; toggle-off clears sentinel tokens.
3. **Loaded-extension test (Chrome):** launch Chrome `--load-extension=<patched> --user-data-dir=<temp>`; confirm it loads with no manifest/console errors; open `cp-settings.html`; set a dummy key + a local mock base URL. Capture the full network request list the app fires on cold start.
4. **E2E vs a mock endpoint:** stand up a local server that responds to **every** request observed in step 3's cold-start list (model `/v1/messages` with a valid Anthropic-shaped response; `/api/oauth/profile` with §4.3; everything else with a non-fatal 200/404/`{}`). Assert: no network call returns a status the app treats as fatal; the login screen is bypassed (lands on chat, not a stuck login); a sent message round-trips and renders.

Honesty boundary: a real round-trip against `api.anthropic.com` needs a real key. If none is available, steps 1–4 (mock-based) are the automated proof and the real-key test is documented for the user. Anything that cannot be automated reliably (e.g., flaky headless extension loading) is flagged explicitly, never silently skipped.

## 8. Risks & fallbacks

- **Gate needs more than profile** (unlikely per evidence; gate is `t && !!s`): also fake `bootstrap`/account; last resort, ONE minimal anchored bundle edit (documented) — the user's #3 "hybrid", last-resort only.
- **Async seed loses the cold-start race** (I2): mitigated by the reactive gate; if a stuck-login flash is observed in §7, fall back to also clearing+reseeding on `onChanged` or a 1-line bundle edit.
- **Anchor/structure drift** (HTML module tag, manifest shape, SW type): robust declarative anchors + programmatic enumeration; any miss triggers issue-on-failure, not a broken release.
- **Custom `http` non-localhost endpoint**: CSP-blocked by design; documented.
- **Statsig/config telemetry**: left passthrough to avoid breakage (I7).
- **Legal/ToS:** unofficial, educational/personal-use; README disclaimer mirrors cocodem's framing; sources from the public Web Store.

## 9. Evidence — auth logic (v1.0.40 deobfuscated + pristine `upstream`)

- Gate `isAuthenticated = t && !!s`, `t = !!accessToken`, `s = GET /api/oauth/profile` body — pristine `git show origin/upstream:src/assets/Main-DIS361Sg.js` (the local working-tree copy is already bundle-patched with `apiModeAuth` and must NOT be used as the reference). 401/403 are no-retry → the fake must be a real 200.
- Token is opaque (no JWT decode; presence + separate `tokenExpiry` only): `src-deobfuscated/assets/deobfuscated.js:980-1037` (validator), `:1161-1218` (Bearer client). No `atob`/`jwtDecode`/`iss` in the auth path.
- Storage keys (chrome.storage.local literals): `deobfuscated.js:861-868`. Profile shape read: `deobfuscated.js:1972-1980`. Model API + `X-Api-Key`/`Bearer` header + baseURL precedence: client bundle (v1.0.40 `client-BLU1RtqI.js:2294-2382`).
- Minified symbol names cited in the research (`QN`,`XN`,`fj`,`Vt`,`F`) are **v1.0.40-only, illustrative**; they reshuffle every release and the patch does not use them.

## 10. Evidence — stable anchors re-validated on pristine v1.0.74 (2026-05-31)

Freshly extracted from the Web Store (Chrome/140 stable; CRX 5.26 MB; `manifest.json` version `1.0.74`, name `Claude`). Reproducibility note (deliberate deferral): this was an extraction validated on 2026-05-31 on a personal repo; the pristine v1.0.74 bytes are committed to the `upstream` branch during the restructure (§5 / §6 step 8), after which this section is pinned to that commit SHA so the validation below is independently reproducible rather than a point-in-time assertion.
- **Storage keys present:** `accessToken`, `refreshToken`, `tokenExpiry`, `anthropicApiKey`, `codeVerifier`, `oauthState`, `selectedModel`.
- **Endpoints present:** `/api/oauth/profile`, `/v1/messages`, `/v1/messages/count_tokens`, `/v1/complete`.
- **Auth header anchors present:** `x-api-key`, `X-Api-Key`, `anthropic-dangerous-direct-browser-access`, `dangerouslyAllowBrowser`.
- **Manifest:** has `key` (we remove), has `update_url` (we remove), `background = {service_worker: "service-worker-loader.js", type: "module"}`, `options_page = options.html`, restrictive `connect-src` (we broaden). `_metadata/` present after extraction (strip is real).
- **Module-booting HTML entries:** `options.html`, `pairing.html`, `sidepanel.html` (1 module script each). `blocked.html`, `gif_viewer.html`, `offscreen.html` have zero (skipped). NB: v1.0.40's `newtab.html` is gone and `pairing.html` is new — hence programmatic enumeration (§4.5).
- **Telemetry host literals found:** `api.segment.io`, `cdn.segment.com`, `*.ingest.us.sentry.io`, `*.datadoghq.com`, `api.honeycomb.io`. No `statsigapi.net`/`featureassets.org` literal strings were found in 1.0.74 bundles — but absence of a literal host string in minified code does not prove the SDK is absent (it may be renamed/bundled), so §4.6 leaves them passthrough regardless.
