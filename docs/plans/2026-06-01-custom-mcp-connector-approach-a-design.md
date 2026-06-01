# Design — Custom browser-automation MCP connector (Approach A: "become the native host")

Status: DRAFT for review · Date: 2026-06-01 · Owner: Muhsinun

## 1. Goal & scope

Build a **subscription-free** replacement for Claude Code's official browser-automation
connector, so the user's Claude Code can drive the **patched** Claude-in-Chrome extension
on pure API-key auth (no Claude subscription / no Anthropic login), while presenting the
**exact same 22 tool names + schemas** to the model.

In scope (Approach A):
- An external MCP server (registered via `claude mcp add`) exposing the 22
  `mcp__claude-in-chrome__*` tools verbatim.
- A native-messaging host (our own) that the extension connects to, reusing the
  extension's **existing** tool executors over its existing wire protocol.
- A non-destructive installer + a documented manual round-trip check.

Explicitly out of scope (DEFERRED → Approach C, see ROADMAP Backlog): a fully in-house
companion extension that reimplements the tools and coexists with the official connector.

## 2. Why this works (the linchpin)

- The subscription gate lives on Claude Code's **built-in** `claude-in-chrome` MCP server,
  not on the tools. **External** MCP servers run on any auth mode (proof: `chrome-devtools-mcp`).
  So our own external server unlocks the tools on API-key auth.
- The extension's 22 tool executors are **local** (`chrome.debugger`/`scripting`/`tabs`;
  nothing fetched). The native-messaging execution path has **no auth/login/subscription
  gate** (the permission machinery only runs for `source:"bridge"`, the claude.ai WebSocket
  remote-control channel; native traffic is hard-tagged `source:"native-messaging"` and
  skips it). There is **no host-identity check** — the extension talks to whatever process
  answers `pong` under a `com.anthropic.*` host name; the only access control is the
  manifest's `allowed_origins`, which lists the official extension id the patched build
  already preserves.
- Therefore we reuse the extension's real executors and depend only on **stable strings**
  (host names, protocol words, the official id) — never on minified identifiers or
  per-release hashed chunk filenames. Same discipline as the extension patch.

## 3. Architecture

```
 Claude Code  (ANY auth, incl. pure ANTHROPIC_API_KEY)
      │  MCP over stdio        server name "claude-in-chrome" → tools surface as mcp__claude-in-chrome__*
      ▼
 connector  --mcp        (Claude Code spawns it via `claude mcp add`)         [MCP CLIENT-FACING half]
      │  local unix socket (rendezvous; the native host is the socket server, --mcp polls/connects)
      ▼
 connector  --native-host (CHROME spawns it via our native-messaging manifest) [SOCKET SERVER + bridge]
      │  Chrome native messaging (32-bit length prefix + UTF-8 JSON over stdio)
      ▼
 patched Claude-in-Chrome extension (official id fcoeoab…)  ← runs its OWN 22 executors, ungated
      │  chrome.debugger / scripting / tabs
      ▼
 the web page          → {type:"tool_response", result:{content:[…]}} bubbles back up
```

One package, two run-modes (mirrors Anthropic shipping one binary in `--chrome-native-host`
mode and REPL mode). The two halves are launched by **different parents** (Claude Code vs
Chrome) and meet over a local unix socket — exactly the pattern the official binary uses
(`/tmp/claude-mcp-browser-bridge-$USER/<pid>.sock`).

The "three pieces" framing (from brainstorming): ① the MCP server (we build), ② the bridge
(we build = native host + socket), ③ tool execution (reused from the patched extension).

## 4. Wire protocol (key off these STABLE STRINGS, never minified vars)

Extension ⇄ native host (Chrome native messaging):
- Handshake: extension sends `{type:"ping"}` → host replies `{type:"pong"}` (within 10s);
  extension sends `{type:"get_status"}` → host replies `{type:"status_response"}`.
- MCP lifecycle: host emits `{type:"mcp_connected"}` when the `--mcp` half is connected to
  the socket; `{type:"mcp_disconnected"}` when it drops.
- Tool call (host → extension):
  `{type:"tool_request", method:"execute_tool", params:{tool, args, client_id, session_scope}}`
  (`args` may carry `tabId` / `tabGroupId`).
- Tool result (extension → host):
  `{type:"tool_response", result:{content:[…]}}` on success, or
  `{type:"tool_response", error:{content:…}}` on failure.
  No request id is echoed — correlation is by order ⇒ **one request in flight at a time**.
- Images/screenshots return as a standard content block
  `{type:"image", source:{type:"base64", media_type:"image/png", data:<base64>}}`.

Host names (extension tries in order): `com.anthropic.claude_browser_extension` (Desktop,
first), then `com.anthropic.claude_code_browser_extension` (Claude Code). Allowed-origins
id: `fcoeoabgfenejglbffodgkkbkcdhcgfn`.

## 5. Components

### 5.1 `--mcp` mode (client-facing MCP server)
- Use `@modelcontextprotocol/sdk` stdio server, name `claude-in-chrome`, version mirroring
  the official (e.g. `1.0.0`).
- Register the 22 tools from `connector/tool-schemas.json` (see §6). On `tools/call`,
  forward `{tool: name, args: arguments}` to the native host via the socket, await the
  matching `tool_response`, map it to an MCP tool result (content array; `isError` on error).
- Connects to the rendezvous socket; if absent, polls with backoff and reports a clear
  "no browser connected" error to Claude Code (mirrors the official `NoExtensionConnected`).

### 5.2 `--native-host` mode (Chrome-launched bridge + socket server)
- Speak Chrome native messaging on stdin/stdout via the codec (§5.3).
- Own the rendezvous socket (create dir + listen); accept one `--mcp` client.
- Answer `ping`→`pong` and `get_status`→`status_response`; on `--mcp` connect/disconnect,
  emit `mcp_connected`/`mcp_disconnected` to the extension.
- Relay: `tool_request` (from `--mcp`) → extension; `tool_response` (from extension) → `--mcp`.

### 5.3 Native-messaging codec
- Read: 4-byte uint32 length in **native byte order** (= little-endian on macOS arm64/x64),
  then that many UTF-8 bytes → `JSON.parse`. Must stream/accumulate (screenshots are
  multi-hundred-KB). Size caps (confirmed, Chrome native-messaging docs): host→Chrome ≤ **1 MB**
  (our outgoing direction — only small `tool_request`s), Chrome→host ≤ **64 MiB** (large
  `tool_response`/screenshots — ample headroom). Comment the prefix "LE because native order
  here is LE" (not "per spec") to flag the BE-host portability caveat.
- Write: serialize JSON → UTF-8 → 4-byte LE length prefix → bytes.

### 5.4 Rendezvous socket
- Path: `${TMPDIR or /tmp}/claude-custom-chrome-bridge-<user>/host.sock` (v1: single,
  fixed per-user path; multi-browser pool deferred).
- Security: create dir mode `0700` owned by the current uid; socket `0600`; the `--mcp`
  side validates ownership+perms before connecting (mirrors the official hardening — a
  world-accessible `/tmp` socket would be a real finding).

### 5.5 Installer (`connector/install.mjs`)
- `claude mcp add claude-in-chrome -- node <abs>/bridge.mjs --mcp` (user scope).
- Write our native-host manifest `{name, description, path:<wrapper that execs bridge.mjs
  --native-host>, type:"stdio", allowed_origins:["chrome-extension://fcoeoab…/"]}`.
- **Non-destructive by default**: do NOT overwrite Anthropic's existing
  `com.anthropic.*` manifests automatically. Repointing them is how the extension reaches
  us, but it disables the official connector and is hard to reverse / outward-facing — so
  it is an explicit, separately-invoked, backup-first step (`--activate`), never the default,
  and never run in an unattended session. When invoked, `--activate` enumerates the live
  `com.anthropic.*` manifests, writes a `.bak` for each, and repoints BOTH the Desktop-first
  name (`com.anthropic.claude_browser_extension`) and the Claude Code name to our host — the
  Desktop manifest also backs Claude Desktop's own browser integration, so repointing it
  disables that too (intended trade-off; reverted by restoring the `.bak`s).

## 6. Tool surface (faithful replica)
- Names (22): `tabs_context_mcp, tabs_create_mcp, tabs_close_mcp, navigate, computer,
  javascript_tool, read_console_messages, read_network_requests, read_page, get_page_text,
  find, form_input, file_upload, upload_image, resize_window, gif_creator,
  list_connected_browsers, select_browser, switch_browser, shortcuts_list,
  shortcuts_execute, browser_batch`.
- Schemas: captured verbatim from the live `mcp__claude-in-chrome__*` tool definitions
  (loaded via ToolSearch) into `connector/tool-schemas.json`. The model then sees identical
  fully-qualified tools (`mcp__claude-in-chrome__navigate`, …).
- Server name `claude-in-chrome` gives byte-identical fully-qualified names. Caveat: if the
  subscription-gated built-in server is ALSO active (subscription auth), two servers share
  the name → conflict. The target scenario is subscription-free (built-in absent), so this
  is a non-issue there; documented for the coexistence case.

## 7. Error handling
- Extension not connected (no socket / no native host running): `tools/call` returns a clear
  MCP error ("no browser connected — open the extension"). `--mcp` keeps polling.
- Tool error from the extension (`error.content`) → MCP result with `isError:true`, content preserved.
- Timeout per tool call (default 30s, mirror official) → MCP error; reset the in-flight slot.
- Native-host disconnect mid-call → fail the in-flight call, emit `mcp_disconnected`, allow re-handshake.
- `computer`/grounding tools may issue an internal Anthropic model call. **Correction (plan review C1):** that call runs in the **service worker** (the executor chunk's own `Anthropic` SDK client), NOT in page context — so `cp-inject.js`'s `/v1/*` reroute does **not** apply to it. The SW client self-authenticates from the seeded `chrome.storage.local.anthropicApiKey` and calls `api.anthropic.com` directly. Consequence: those tools work **subscription-free for a direct Anthropic API key** (the common case), but v1 does **not** honor a custom `customApiBaseUrl`/proxy for that call (SW SDK base defaults to api.anthropic.com), and the key reaches Anthropic regardless of the configured base. Proxy-base support = a deferred extension-patch follow-up (an SW-side fetch/base override). All DOM/CDP tools (navigate, click, screenshot capture, read_page, …) need no model call and are unaffected.

## 8. Security
- Socket is localhost-only, dir `0700` / file `0600`, owner-checked before use.
- `allowed_origins` restricts the native channel to the official extension id (Chrome-enforced).
- No secrets in code or manifests; nothing logged that contains page content by default.

## 9. Testing
- **Unit (Node, no deps; must stay green):** codec round-trip incl. large (≈1MB) messages;
  protocol translation (success/error/image encoding); MCP tool registration matches
  `tool-schemas.json` (count + names + schema shape); handshake sequence; request
  serialization (one in flight).
- **Manual e2e (inherently manual):** real Claude Code + real Chrome + patched extension;
  `--activate` the manifest (backup first), reconnect the extension, call a tool from Claude
  Code, confirm the page action + result. Not CI-automatable (native messaging + real CLI +
  Chrome), consistent with the existing "Claude Code drives the extension" manual check.
- **Safety:** the build/test in an unattended session stops short of `--activate` (would
  clobber the live manifest and could break the user's working browser feature). Activation
  + live round-trip are surfaced for the user to run when present.

## 10. Limitations (v1)
- Single browser / single connection (fixed socket path); multi-browser pool + per-pid
  sockets + `list/select/switch_browser` fan-out deferred (tools still registered; they
  operate on the one connection).
- `computer`/grounding tools that issue an internal model call run in the service worker and
  use a direct Anthropic key (api.anthropic.com); v1 does NOT honor a custom proxy base for
  that SW call, and the key reaches Anthropic regardless of the configured base (see §7).
  DOM/CDP tools are unaffected; the proxy-base SW reroute is a deferred follow-up.
- Activating it repoints a `com.anthropic.*` manifest → replaces the official connector
  while active (intended for the subscription-free goal); reversible by restoring the backup.
- Claude Code updates may reinstall Anthropic's manifest → re-run `--activate` (fits the
  project's "patch in lockstep with each release" model).

## 11. Deferred — Approach C (future)
Fully in-house companion extension: keep the exact official tool names/schemas in Claude
Code (reuse piece ① ~as-is), swap piece ③ for our own MV3 extension implementing the 22
tools via CDP, talking WebSocket (`ws://localhost:*`) to our MCP server. Coexists with the
official connector; zero dependence on Anthropic's minified internals. End-state = a
self-contained, fully-functional in-house Claude-in-Chrome equivalent — the market gap this
project exists to fill.

## 12. Open questions to confirm during live manual e2e
- Exact `get_status`/`status_response` payload (extension appears to ignore the payload and
  refresh from its own state — confirm it tolerates an empty `{type:"status_response"}`).
- `client_id` / `session_scope` values (using constant `client_id="claude-code-custom"`,
  `session_scope` omitted) — confirm the extension accepts them.
- What the extension's `initialize()` (fired on `mcp_connected`) does, and whether it posts
  anything back the host must handle.

Resolved during plan review (no longer open):
- Native-messaging size caps (Chrome docs): host→Chrome 1 MB, Chrome→host 64 MiB — large
  `tool_response`/screenshots flow Chrome→host with ample headroom (§5.3).
- Desktop-first host ordering: `--activate` repoints the Desktop-first name (and the Claude
  Code name) with `.bak` backups; Desktop's browser feature is disabled while active (§5.5).
