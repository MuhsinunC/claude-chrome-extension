import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHostServer, connectMcpClient, assertSocketSecurity } from "../src/socket.mjs";

function waitFor(cond, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const iv = setInterval(() => {
      if (cond()) { clearInterval(iv); resolve(); }
      else if (Date.now() - start > timeoutMs) { clearInterval(iv); reject(new Error("waitFor timeout")); }
    }, 5);
  });
}

test("host <-> mcp client round-trip, with private dir/socket perms", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cc-sock-"));
  const socketPath = path.join(root, "nested", "host.sock"); // 'nested' is created by the server at 0700
  const fromClient = [];
  const fromHost = [];
  let resolveConn;
  const connected = new Promise((r) => (resolveConn = r));

  const host = createHostServer({ socketPath, onMessage: (m) => fromClient.push(m) });
  await host.ready;

  // perms set by the server
  assert.equal(fs.statSync(path.dirname(socketPath)).mode & 0o777, 0o700);
  assert.equal(fs.statSync(socketPath).mode & 0o777, 0o600);

  const client = connectMcpClient({ socketPath, onMessage: (m) => fromHost.push(m), onConnect: () => resolveConn() });
  await connected;

  client.send({ type: "ping" });
  await waitFor(() => fromClient.length === 1);
  assert.deepEqual(fromClient[0], { type: "ping" });

  host.send({ type: "pong" });
  await waitFor(() => fromHost.length === 1);
  assert.deepEqual(fromHost[0], { type: "pong" });

  client.close();
  host.close();
});

test("assertSocketSecurity rejects a world-accessible dir", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-bad-"));
  fs.chmodSync(dir, 0o777);
  const sock = path.join(dir, "host.sock");
  fs.writeFileSync(sock, "");
  fs.chmodSync(sock, 0o600);
  assert.throws(() => assertSocketSecurity(sock), /expected 700/);
});

test("assertSocketSecurity rejects a world-readable socket", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-bad2-"));
  fs.chmodSync(dir, 0o700);
  const sock = path.join(dir, "host.sock");
  fs.writeFileSync(sock, "");
  fs.chmodSync(sock, 0o644);
  assert.throws(() => assertSocketSecurity(sock), /expected 600/);
});
