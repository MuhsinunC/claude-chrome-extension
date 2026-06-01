import { test } from "node:test";
import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runNativeHost, makeExtensionHandler } from "../src/native-host.mjs";
import { connectMcpClient } from "../src/socket.mjs";
import { encodeMessage, NativeMessageDecoder } from "../src/native-codec.mjs";

function waitFor(cond, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const iv = setInterval(() => {
      if (cond()) { clearInterval(iv); resolve(); }
      else if (Date.now() - start > timeoutMs) { clearInterval(iv); reject(new Error("waitFor timeout")); }
    }, 5);
  });
}

test("makeExtensionHandler routes ping / get_status / tool_response and ignores the rest", () => {
  const toExt = [];
  const toMcp = [];
  const handle = makeExtensionHandler({ writeToExtension: (m) => toExt.push(m), sendToMcp: (m) => toMcp.push(m) });
  const tr = { type: "tool_response", result: { content: [] } };
  handle({ type: "ping" });
  handle({ type: "get_status" });
  handle(tr);
  handle({ type: "something_else" });
  assert.deepEqual(toExt, [{ type: "pong" }, { type: "status_response" }]);
  assert.deepEqual(toMcp, [tr]);
});

test("runNativeHost bridges extension <-> mcp client end to end", async () => {
  const socketPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cc-nh-")), "host.sock");
  const stdin = new PassThrough();
  const stdout = new PassThrough();
  const outDec = new NativeMessageDecoder();
  const toExtension = [];
  stdout.on("data", (c) => { for (const m of outDec.push(c)) toExtension.push(m); });

  const host = runNativeHost({ stdin, stdout, socketPath });
  await host.ready;

  stdin.write(encodeMessage({ type: "ping" }));
  await waitFor(() => toExtension.some((m) => m.type === "pong"));

  stdin.write(encodeMessage({ type: "get_status" }));
  await waitFor(() => toExtension.some((m) => m.type === "status_response"));

  const fromHost = [];
  let resolveClient;
  const clientReady = new Promise((r) => (resolveClient = r));
  const client = connectMcpClient({ socketPath, onMessage: (m) => fromHost.push(m), onConnect: () => resolveClient() });
  await waitFor(() => toExtension.some((m) => m.type === "mcp_connected"));
  await clientReady;

  client.send({ type: "tool_request", method: "execute_tool", params: { tool: "navigate", args: {} } });
  await waitFor(() => toExtension.some((m) => m.type === "tool_request" && m.params?.tool === "navigate"));

  stdin.write(encodeMessage({ type: "tool_response", result: { content: [{ type: "text", text: "ok" }] } }));
  await waitFor(() => fromHost.some((m) => m.type === "tool_response"));

  client.close();
  host.close();
});
