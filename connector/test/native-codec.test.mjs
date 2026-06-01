import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeMessage, NativeMessageDecoder } from "../src/native-codec.mjs";

test("round-trips a small message", () => {
  const msg = { type: "ping", n: 1 };
  const out = new NativeMessageDecoder().push(encodeMessage(msg));
  assert.deepEqual(out, [msg]);
});

test("round-trips a large (~1MB) message", () => {
  const msg = {
    type: "tool_response",
    result: { content: [{ type: "text", text: "x".repeat(1_000_000) }] },
  };
  const out = new NativeMessageDecoder().push(encodeMessage(msg));
  assert.equal(out.length, 1);
  assert.equal(out[0].result.content[0].text.length, 1_000_000);
});

test("reassembles a message split across chunks", () => {
  const msg = { type: "tool_request", params: { tool: "navigate" } };
  const framed = encodeMessage(msg);
  const dec = new NativeMessageDecoder();
  assert.deepEqual(dec.push(framed.subarray(0, 2)), []); // partial header
  assert.deepEqual(dec.push(framed.subarray(2, 6)), []); // rest of header + a couple body bytes
  assert.deepEqual(dec.push(framed.subarray(6)), [msg]); // remainder completes it
});

test("emits multiple messages from one chunk", () => {
  const a = { type: "pong" };
  const b = { type: "status_response" };
  const out = new NativeMessageDecoder().push(
    Buffer.concat([encodeMessage(a), encodeMessage(b)]),
  );
  assert.deepEqual(out, [a, b]);
});

test("rejects an oversized declared length", () => {
  const bad = Buffer.allocUnsafe(4);
  bad.writeUInt32LE(0xfffffff0, 0); // ~4 GB, well past the 64 MiB cap
  assert.throws(() => new NativeMessageDecoder().push(bad), /exceeds cap/);
});
