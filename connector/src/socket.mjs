// Rendezvous between the two bridge halves, which are launched by DIFFERENT parents:
// `--native-host` (spawned by Chrome on connectNative) is the socket SERVER; `--mcp`
// (spawned by Claude Code) is the CLIENT and polls until the server appears. This mirrors
// the official binary's `/tmp/claude-mcp-browser-bridge-$USER/<pid>.sock` design.
//
// Frame on the socket = the same 4-byte length + JSON as Native Messaging (reused codec).
// v1 is single-peer (one browser); a multi-browser pool is deferred.

import net from "node:net";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { encodeMessage, NativeMessageDecoder } from "./native-codec.mjs";

const DIR_MODE = 0o700;
const SOCK_MODE = 0o600;

export function socketDirForUser() {
  const user = os.userInfo().username || "default";
  const base = process.env.TMPDIR || "/tmp";
  return path.join(base, `claude-custom-chrome-bridge-${user}`);
}
export function socketPathForUser() {
  return path.join(socketDirForUser(), "host.sock");
}

function currentUid() {
  return typeof process.getuid === "function" ? process.getuid() : null;
}

// Refuse to trust a socket whose dir/file aren't private to us — a world-accessible socket
// in /tmp would let any local user drive the browser. Mirrors the official hardening.
export function assertSocketSecurity(socketPath) {
  const uid = currentUid();
  const dir = path.dirname(socketPath);
  const d = fs.statSync(dir);
  if ((d.mode & 0o777) !== DIR_MODE) {
    throw new Error(`socket dir ${dir} has mode ${(d.mode & 0o777).toString(8)}, expected 700`);
  }
  if (uid != null && d.uid !== uid) {
    throw new Error(`socket dir ${dir} owned by uid ${d.uid}, expected ${uid}`);
  }
  const s = fs.statSync(socketPath);
  if ((s.mode & 0o777) !== SOCK_MODE) {
    throw new Error(`socket ${socketPath} has mode ${(s.mode & 0o777).toString(8)}, expected 600`);
  }
  if (uid != null && s.uid !== uid) {
    throw new Error(`socket ${socketPath} owned by uid ${s.uid}, expected ${uid}`);
  }
}

/**
 * Native-host side: own the socket, accept one peer, frame messages both ways.
 * @returns {{ ready: Promise<void>, send(obj): void, hasClient(): boolean, close(): void }}
 */
export function createHostServer({ socketPath = socketPathForUser(), onMessage, onClientConnect, onClientDisconnect } = {}) {
  const dir = path.dirname(socketPath);
  fs.mkdirSync(dir, { recursive: true, mode: DIR_MODE });
  fs.chmodSync(dir, DIR_MODE); // mkdir's mode is umask-masked; force private
  try { fs.unlinkSync(socketPath); } catch { /* no stale socket to clear */ }

  let client = null;
  const server = net.createServer((sock) => {
    if (client) { sock.destroy(); return; } // v1: a single browser at a time
    client = sock;
    const decoder = new NativeMessageDecoder();
    onClientConnect?.();
    sock.on("data", (chunk) => {
      let msgs;
      try { msgs = decoder.push(chunk); } catch (e) { sock.destroy(e); return; }
      for (const m of msgs) onMessage?.(m);
    });
    sock.on("error", () => { /* a 'close' event follows */ });
    sock.on("close", () => { client = null; onClientDisconnect?.(); });
  });

  let resolveReady;
  const ready = new Promise((r) => (resolveReady = r));
  server.listen(socketPath, () => { fs.chmodSync(socketPath, SOCK_MODE); resolveReady(); });

  return {
    ready,
    send(obj) { if (client && !client.destroyed) client.write(encodeMessage(obj)); },
    hasClient() { return !!client && !client.destroyed; },
    close() {
      try { server.close(); } catch { /* already closing */ }
      try { client?.destroy(); } catch { /* already gone */ }
      try { fs.unlinkSync(socketPath); } catch { /* already removed */ }
    },
  };
}

/**
 * MCP side: connect to the host socket, retry with backoff until it appears, reconnect on drop.
 * @returns {{ send(obj): boolean, isConnected(): boolean, close(): void }}
 */
export function connectMcpClient({ socketPath = socketPathForUser(), onMessage, onConnect, onDisconnect, retryMs = 1000, maxRetryMs = 30_000, validate = true } = {}) {
  let sock = null;
  let connected = false;
  let closed = false;
  let delay = retryMs;

  function scheduleRetry() {
    if (closed) return;
    const t = setTimeout(tryConnect, delay);
    if (t.unref) t.unref(); // the --mcp process is kept alive by its stdio, not by this poll
    delay = Math.min(delay * 1.5, maxRetryMs);
  }

  function tryConnect() {
    if (closed) return;
    try { if (validate) assertSocketSecurity(socketPath); } catch { scheduleRetry(); return; }
    const decoder = new NativeMessageDecoder();
    sock = net.connect(socketPath);
    sock.on("connect", () => { connected = true; delay = retryMs; onConnect?.(); });
    sock.on("data", (chunk) => {
      let msgs;
      try { msgs = decoder.push(chunk); } catch { sock.destroy(); return; }
      for (const m of msgs) onMessage?.(m);
    });
    sock.on("error", () => { /* a 'close' event follows */ });
    sock.on("close", () => { connected = false; sock = null; onDisconnect?.(); scheduleRetry(); });
  }

  tryConnect();
  return {
    send(obj) { if (sock && !sock.destroyed && connected) { sock.write(encodeMessage(obj)); return true; } return false; },
    isConnected() { return !!sock && !sock.destroyed && connected; },
    close() { closed = true; try { sock?.destroy(); } catch { /* already gone */ } },
  };
}
