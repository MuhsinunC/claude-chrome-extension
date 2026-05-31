# ROADMAP

<!--
SCHEMA — this file is ONE nested checklist. Do not add prose sections.
Status glyphs:  [ ] todo   [~] in progress   [x] done
Top-level bullets are milestones; indent 2 spaces per sub-task level (sub-tasks may nest further).
Capture every new user ask here, in the right place and order, BEFORE acting on it.
Completed items stay (checked) as a permanent record. Keep it terse: one line per task.
This is the single durable source of truth for all work.
-->

- [x] Project setup & durable task tracking
  - [x] Investigate repo state (main = hand-made patches, upstream = Humanify deobfuscation, shared base v1.0.40)
  - [x] Study cocodem/claude-for-chrome method (runtime fetch/XHR override + hosted backend; zips in repo root; 0 releases)
  - [x] Decide architecture: injection-only patcher; archive branch; zip releases on 6h cron; global capture-first roadmap rule
  - [x] Create ROADMAP.md as the single durable task record
  - [x] Add global capture-first ROADMAP rule to ~/.claude/CLAUDE.md
  - [x] Review global ROADMAP rule with claude-md-improver (zero major complaints)
- [x] Design & plan (must be review-clean before building)
  - [x] Map login-gate / auth flow from deobfuscated source (storage keys, profile/account endpoints, response shapes, token format)
  - [x] Write design doc at docs/plans/2026-05-31-autonomous-patcher-design.md
  - [x] Review plan with pr-review-toolkit:code-reviewer; iterate to zero Critical/Important (rev2: 0 Critical, Importants resolved)
- [x] Repo restructure
  - [x] Create archive/reverse-engineering branch preserving all Humanify + old hand-patch work; push (origin, 309 files)
  - [x] Repurpose upstream branch as a pristine official-source mirror v1.0.74 (push, SHA 860814f; CI keeps current)
  - [x] Slim main to the patcher project (RE artifacts removed; kept in archive + history)
- [x] Injection-only patcher
  - [x] Injected override payload (patch/payload/cp-inject.js)
    - [x] Reroute api.anthropic.com model calls -> custom base URL + inject API key header
    - [x] Return synthetic /api/oauth/profile 200 response to pass the login gate (only load-bearing fake; no bundle edits)
    - [x] Seed a synthetic local token in chrome.storage so the initial auth check passes
    - [x] Discard pure-ingest telemetry only (segment / sentry / datadog / honeycomb; NOT statsig/featureassets - config-bearing)
  - [x] Options settings UI page (cp-settings.html/js; toggle useCustomApi, set base+key; seeds live on Save)
  - [x] Patch script scripts/patch.mjs (operates on an extracted official src dir)
    - [x] Strip _metadata/ (CRX signature)
    - [x] Edit manifest.json: name "Claude (Patched)", version +".1", remove key (own ID; --keep-key flag), remove update_url, broaden connect-src CSP
    - [x] Inject payload <script> into every module-booting HTML (enumerate *.html; v1.0.74 = options/pairing/sidepanel) before first module script
    - [x] Copy payload files into the output
  - [x] Refactor extract-crx.sh: output-dir arg (drop in-place rm -rf src/), remove auto-unminify call, bump Chrome UA (131 -> 140)
  - [x] Build/package script scripts/build.mjs -> dist/claude-patched-vX.Y.Z.1.zip
- [~] Local verification
  - [x] Run refactored extract-crx.sh -> pristine v1.0.74 into scratch dir
  - [x] Patch + build structural checks all pass (manifest/CSP/_metadata/inject 3-of-3 HTML/zip 5.25MB)
  - [x] Override unit test (test/override.test.mjs, Node, 18/18): reroute + header-normalize + profile fake + telemetry drop + no-op-off
  - [x] Real-Chrome load (test/browser-smoke.mjs + control): patched ext registers identically to pristine official -> patch does not break loading
  - [ ] Interactive chat round-trip: MANUAL (Chrome 148 blocks programmatic extension-page nav for pristine too; truest test needs a real Anthropic key) - steps in README
- [x] CI/CD release pipeline (GitHub Actions)
  - [x] Version-detect (check-release.mjs): read version from extracted manifest, compare to existing GH Release
  - [x] Workflow: cron every 6h + manual dispatch
    - [x] On new version: patch -> zip -> create Release tagged vX.Y.Z.1 with install notes
    - [x] Commit fresh official src to upstream branch (git worktree; continue-on-error)
    - [x] On patch failure: open a GitHub issue (deduped) and never ship broken
  - [x] Live-test via workflow_dispatch: Release "Claude (Patched) v1.0.74.1" published + artifact validated
  - [x] Idempotency verified: 2nd run no-ops (patch/build/release skipped; no duplicate release)
- [x] Docs & finalize
  - [x] Rewrite README for new scope (autonomous patcher, releases, install, disclaimer)
  - [x] Create project-level CLAUDE.md (project context + pointer to ROADMAP.md) + improver pass
  - [x] Final code-review gate: implementation reviewed to zero Critical/Important (C1/I1/I2 fixed + verified)
  - [x] Commit + push under MuhsinunC on correct branches
  - [x] Final verification + summary
- [ ] Backlog / later (optional)
  - [ ] Optional: purge large deobfuscated blob from main history (git filter-repo) to shrink clones
  - [ ] Optional: keep reverse-engineering / learning notes derived from the deobfuscated source
