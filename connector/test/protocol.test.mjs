import { test } from "node:test";
import assert from "node:assert/strict";
import {
  toToolRequest,
  fromToolResponse,
  RequestQueue,
  CLIENT_ID,
  pong,
  statusResponse,
  isPing,
} from "../src/protocol.mjs";

test("toToolRequest builds the execute_tool envelope", () => {
  const r = toToolRequest({ tool: "navigate", args: { url: "https://x.com" } });
  assert.equal(r.type, "tool_request");
  assert.equal(r.method, "execute_tool");
  assert.equal(r.params.tool, "navigate");
  assert.deepEqual(r.params.args, { url: "https://x.com" });
  assert.equal(r.params.client_id, CLIENT_ID);
});

test("toToolRequest defaults missing args to {}", () => {
  assert.deepEqual(toToolRequest({ tool: "tabs_context_mcp" }).params.args, {});
});

test("handshake helpers have the stable shapes", () => {
  assert.equal(isPing({ type: "ping" }), true);
  assert.equal(isPing({ type: "tool_response" }), false);
  assert.deepEqual(pong(), { type: "pong" });
  assert.deepEqual(statusResponse(), { type: "status_response" });
});

test("fromToolResponse maps a success content array", () => {
  const out = fromToolResponse({ type: "tool_response", result: { content: [{ type: "text", text: "ok" }] } });
  assert.equal(out.isError, false);
  assert.deepEqual(out.content, [{ type: "text", text: "ok" }]);
});

test("fromToolResponse preserves an image block untouched", () => {
  const img = { type: "image", source: { type: "base64", media_type: "image/png", data: "AAAA" } };
  const out = fromToolResponse({ type: "tool_response", result: { content: [img] } });
  assert.deepEqual(out.content, [img]);
});

test("fromToolResponse flags errors and coerces a string", () => {
  const out = fromToolResponse({ type: "tool_response", error: { content: "boom" } });
  assert.equal(out.isError, true);
  assert.deepEqual(out.content, [{ type: "text", text: "boom" }]);
});

test("RequestQueue serializes to one in flight, in order", async () => {
  const sent = [];
  const q = new RequestQueue((req) => sent.push(req), { timeoutMs: 1000 });
  const p1 = q.call({ id: 1 });
  const p2 = q.call({ id: 2 });
  assert.deepEqual(sent.map((r) => r.id), [1]); // only the first was sent
  q.resolveResponse({ tag: "r1" });
  assert.equal((await p1).tag, "r1");
  assert.deepEqual(sent.map((r) => r.id), [1, 2]); // second sent after first resolves
  q.resolveResponse({ tag: "r2" });
  assert.equal((await p2).tag, "r2");
});

test("RequestQueue times out a stuck call", async () => {
  const q = new RequestQueue(() => {}, { timeoutMs: 20 });
  await assert.rejects(q.call({ id: 1 }), /timed out/);
});

test("RequestQueue failInflight rejects current and advances", async () => {
  const sent = [];
  const q = new RequestQueue((r) => sent.push(r), { timeoutMs: 1000 });
  const p1 = q.call({ id: 1 });
  const p2 = q.call({ id: 2 });
  q.failInflight(new Error("disconnected"));
  await assert.rejects(p1, /disconnected/);
  assert.deepEqual(sent.map((r) => r.id), [1, 2]); // second now sent
  q.resolveResponse({ tag: "r2" });
  assert.equal((await p2).tag, "r2");
});

test("resolveResponse with no in-flight call is a no-op", () => {
  const q = new RequestQueue(() => {});
  assert.equal(q.resolveResponse({ tag: "stray" }), false);
});
