# Custom Claude-in-Chrome connector (Approach A)

A **subscription-free** replacement for Claude Code's official browser-automation connector.
It registers an external MCP server named `claude-in-chrome` exposing the **exact same 22
tools** Claude Code already knows, and bridges them to your **patched** Claude-in-Chrome
extension over Chrome native messaging — **reusing the extension's own tool executors**.

Because it's an *external* MCP server (external servers run on any auth mode, unlike the
subscription-gated built-in one), it drives the browser even on pure `ANTHROPIC_API_KEY`.

> Full rationale + reverse-engineering evidence: `docs/plans/2026-06-01-custom-mcp-connector-approach-a-design.md`
> (and the build plan alongside it).

## How it works

```
Claude Code ──MCP/stdio──▶ bridge.mjs --mcp ──unix socket──▶ bridge.mjs --native-host
                                                                      │ Chrome native messaging
                                                                      ▼
                                          patched Claude-in-Chrome extension (official id)
                                                                      │ runs its OWN executors
                                                                      ▼
                                                                  the page
```

One file, two modes (like the official binary): `--mcp` (Claude Code launches it) and
`--native-host` (Chrome launches it). They meet over a private unix socket. Everything keys
off the extension's **stable** protocol strings — never minified identifiers — so it survives
extension re-minification, exactly like the extension patch.

## Requirements

- Node ≥ 18.
- The **patched** Claude-in-Chrome extension installed, keeping the **official** id
  (`fcoeoabgfenejglbffodgkkbkcdhcgfn` — the patcher default). Our native-host manifest
  allow-lists only that id.
- macOS (the installer writes the macOS Chrome manifest path; other OSes are a follow-up).

## Install

```bash
cd connector
npm install                  # @modelcontextprotocol/sdk (the only dependency)
node install.mjs             # NON-DESTRUCTIVE: register the MCP server + write our manifest/wrapper
node install.mjs --activate  # route the extension to us (see the warning below) — run when present
node install.mjs --dry-run   # print every action, change nothing
```

`node install.mjs` registers the `claude-in-chrome` MCP server with Claude Code and writes
our *own* native-host manifest + wrapper. On its own it does **not** yet route the extension
to us (the extension only dials the `com.anthropic.*` host names).

`node install.mjs --activate` repoints the live `com.anthropic.*` manifests (Desktop first,
then Claude Code) to our host, **backing each up to `.bak` first**. While active it **replaces
the official connector** (Claude Desktop's browser feature included). Revert any time by
restoring the `.bak` files. Claude Code updates may reinstall Anthropic's manifest — just
re-run `--activate`.

## Manual end-to-end check (the live round-trip)

This is inherently manual — it needs real Claude Code + real Chrome + the patched extension,
and isn't CI-automatable (native messaging + a real CLI process), consistent with the
project's existing "Claude Code drives the extension" check.

1. `node install.mjs --activate` (backs up the official manifests).
2. Fully quit and reopen Chrome with the patched extension loaded; open its side panel so the
   service worker calls `connectNative` (Chrome then launches our `--native-host`).
3. In Claude Code, confirm the `claude-in-chrome` tools are listed (`/mcp` or a tool call).
4. Ask Claude Code to drive the browser (e.g. "navigate to example.com and screenshot it").
   Expect the page to actually navigate and a screenshot to return — with **no** Claude
   subscription.
5. Revert when done: restore the `*.json.bak` files in
   `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/`.

## Test

```bash
cd connector && npm test     # node --test over test/  (no deps beyond the SDK)
```

## Limitations (v1)

- **One browser / one connection** (fixed socket path); the multi-browser pool that backs
  `list/select/switch_browser` is deferred (those tools are still registered, acting on the
  single connection).
- The **`computer`/grounding** tools issue a model call **inside the service worker**, which
  self-authenticates via the seeded `anthropicApiKey` and goes straight to `api.anthropic.com`
  — so they need a **direct Anthropic key** and don't honor a custom proxy base in v1
  (deferred follow-up). All DOM/CDP tools are unaffected.
- Activation is **either/or** with the official connector and must be re-applied after Claude
  Code updates.

## Uninstall

```bash
# restore the official manifests
cd ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
for f in com.anthropic.*.json.bak; do mv -- "$f" "${f%.bak}"; done
# remove our manifest + MCP server
rm -f com.claude_custom.browser_connector.json
claude mcp remove claude-in-chrome
```
