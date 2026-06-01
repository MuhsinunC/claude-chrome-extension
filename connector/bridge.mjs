#!/usr/bin/env node
// Single entry point, two run-modes (mirrors how the official binary ships one executable):
//   --mcp          : Claude Code launches this (via `claude mcp add`) — the MCP stdio server.
//   --native-host  : Chrome launches this (via our native-messaging manifest) — the bridge.
// Dynamic imports so each mode only loads what it needs (the native host skips the MCP SDK).

import process from "node:process";

const mode = process.argv[2];
if (mode === "--mcp") {
  const { runMcp } = await import("./src/mcp-server.mjs");
  await runMcp();
} else if (mode === "--native-host") {
  const { runNativeHost } = await import("./src/native-host.mjs");
  runNativeHost();
} else {
  process.stderr.write("usage: bridge.mjs --mcp | --native-host\n");
  process.exit(2);
}
