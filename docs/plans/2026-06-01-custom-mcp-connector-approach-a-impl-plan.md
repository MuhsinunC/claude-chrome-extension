# Implementation Plan — Custom MCP connector (Approach A)

Status: DRAFT for review · Date: 2026-06-01
Spec: `docs/plans/2026-06-01-custom-mcp-connector-approach-a-design.md`

## Goal (one sentence)
Ship `connector/` — a working, subscription-free bridge (our MCP server ⇄ our native host ⇄ the patched extension) that reuses the extension's existing 22 executors and presents the identical official tool surface to Claude Code.

## Module boundaries (each does one thing, testable in isolation)
- `connector/tool-schemas.json` — DONE. The 22 official tool defs (name/description/inputSchema), verbatim.
- `connector/package.json` — `type: module`, engines node ≥18, dep: `@modelcontextprotocol/sdk` (MCP stdio server). Everything else is dependency-free.
- `connector/src/native-codec.mjs` — Chrome native-messaging framing only. `encode(obj) → Buffer`, and a streaming `Decoder` that emits parsed messages. 4-byte uint32 native-order (LE on macOS arm64/x64) length prefix + UTF-8 JSON. Large-message safe (screenshots). No I/O, no globals — pure functions/class over Buffers.
- `connector/src/socket.mjs` — the rendezvous unix socket. `createHostServer(onClient)` (native-host side: mkdir 0700, listen, sock 0600) and `connectMcpClient()` (mcp side: owner+mode validation before connect, retry/backoff). Frame on the socket = 4-byte LE length + JSON (mirrors the official binary). One peer at a time (v1).
- `connector/src/protocol.mjs` — pure translation + state, no transport. `toToolRequest({tool,args}) → {type,method,params}`; `fromToolResponse(msg) → {content, isError}` (maps `result.content` / `error.content`; image blocks pass through unchanged); a `RequestQueue` enforcing one-in-flight (no id in `tool_response` ⇒ correlate by order) with per-call timeout; handshake helpers (`isPing`, `pong()`, `statusResponse()`, `mcpConnected()`, `mcpDisconnected()`).
- `connector/bridge.mjs` — entry point. Parse `--mcp` | `--native-host`. Wire the halves: `--mcp` = MCP SDK stdio server (load schemas, register 22 tools, on call → socket client → protocol → result); `--native-host` = native-codec over stdio ↔ socket server, run handshake, relay tool_request/response, emit mcp_connected on client attach.
- `connector/install.mjs` — `claude mcp add claude-in-chrome -- node <abs>/bridge.mjs --mcp` (idempotent); write our native-host manifest. **Default: NON-destructive** (writes only our own host name; never overwrites `com.anthropic.*`). `--activate` (separate, gated, backs up first) repoints the `com.anthropic.*` manifest(s) so the extension reaches us — never auto-run, never in an unattended session.
- `connector/test/*.test.mjs` — `node --test` runner (built-in, dependency-free); run via `cd connector && npm test`.
- `connector/README.md` — install/usage + the manual e2e (live round-trip) checklist.

## Build order (each step: implement → unit-verify before moving on)
1. `package.json`; `npm install`; confirm `@modelcontextprotocol/sdk` imports under Node ≥18.
2. `native-codec.mjs` + test: encode→decode round-trip for small + ~1 MB messages; split-buffer (partial frame) reassembly; multiple messages in one chunk.
3. `socket.mjs` + test: host server + mcp client over a temp dir; assert dir 0700 / sock 0600; client refuses a wrong-perms/owner socket; one round-trip frame.
4. `protocol.mjs` + test: success→content, error→isError, image block preserved; RequestQueue one-in-flight + ordering + timeout; handshake helpers shape.
5. `--mcp` half in `bridge.mjs` + test: registers exactly 22 tools (names/schemas match `tool-schemas.json`); a tools/call with a mocked socket returning a `tool_response` yields the correct MCP result; "no browser connected" error when socket absent.
6. `--native-host` half in `bridge.mjs` + test: fake stdio + fake mcp client; ping→pong, get_status→status_response, mcp_connected on attach, tool_request relayed and tool_response routed back.
7. `install.mjs` + test (dry-run): emits the correct `claude mcp add` argv + manifest JSON (allowed_origins = official id); default run touches no `com.anthropic.*` file; `--activate` enumerates the live `com.anthropic.*` manifests, writes a `.bak` for each, and repoints BOTH the Desktop-first name (`com.anthropic.claude_browser_extension`) and the Claude Code name to our host (dry-run asserts both backups + both repoints).
8. `README.md` + manual e2e checklist.
9. Full unit suite green via `cd connector && npm test` (`package.json` → `"test": "node --test test/"`). Separate package from the root suite (root stays bare `node test/*.mjs`); document the connector command in `connector/README.md` and the project CLAUDE.md Commands section.
10. `pr-review-toolkit:code-reviewer` on all new files → zero Critical/Important. Branch + commit under MuhsinunC.

## Decisions locked (from spec open questions)
- Native-messaging length prefix = 4-byte uint32 in **native byte order** (= little-endian on macOS arm64/x64; confirmed against Chrome's native-messaging doc). Codec comments it "LE because native order here is LE" (BE-host portability caveat). Size caps confirmed: host→Chrome 1 MB, Chrome→host 64 MiB.
- Socket frame (host↔mcp) = 4-byte LE length + JSON (mirror the official binary).
- `client_id` = constant `"claude-code-custom"`; `session_scope` omitted (null) unless a tool needs it.
- `get_status` → reply `{type:"status_response"}` (extension appears to refresh from its own state, ignoring payload — confirm in manual e2e).
- Default install never clobbers `com.anthropic.*`; `--activate` is the explicit, backup-first opt-in that repoints BOTH the Desktop-first name and the Claude Code name (Desktop's browser feature is disabled while active; reverted via `.bak`).

## Success criteria
- Unit suite green (codec, socket, protocol, mcp-half, native-host-half, installer dry-run).
- `node bridge.mjs --mcp` starts an MCP server exposing the 22 tools (verifiable via an MCP `tools/list`).
- Review-clean (pr-review-toolkit), committed to a feature branch under MuhsinunC.
- Manual e2e checklist written; live round-trip flagged as the user-run gate.
- This session does NOT activate (clobber) any live native-messaging manifest.

## Risks & mitigations
- Wrong framing byte order / size limit → codec unit test + cite Chrome doc.
- Extension expects extra handshake fields/`initialize()` side effects → handle the observed message types; refine via manual e2e (documented).
- Server-name collision with the built-in `claude-in-chrome` on subscription auth → documented; on API-key auth (the target) the built-in is absent, so no clash.
- Single-peer socket assumption → documented v1 limitation; multi-browser pool deferred.

## Out of scope (v1)
Multi-browser socket pool + `list/select/switch_browser` fan-out (tools still registered, operate on the one connection); auto-`--activate`; reimplementing tool execution (deferred Approach C); an SW-side reroute so `computer`/grounding model calls honor `customApiBaseUrl` (v1 requires a direct Anthropic key for those tools — design §7/C1).
