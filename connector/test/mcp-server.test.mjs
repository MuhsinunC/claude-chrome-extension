import { test } from "node:test";
import assert from "node:assert/strict";
import { loadTools, createHandlers } from "../src/mcp-server.mjs";

test("loadTools loads all 22 tools verbatim with object inputSchemas", () => {
  const tools = loadTools();
  assert.equal(tools.length, 22);
  for (const t of tools) {
    assert.equal(typeof t.name, "string");
    assert.ok(t.name.length > 0);
    assert.equal(typeof t.description, "string");
    assert.equal(t.inputSchema?.type, "object");
  }
  const names = tools.map((t) => t.name);
  for (const expected of ["navigate", "computer", "tabs_context_mcp", "javascript_tool", "browser_batch", "switch_browser"]) {
    assert.ok(names.includes(expected), `missing tool ${expected}`);
  }
});

test("listTools returns exactly the registered tools", () => {
  const tools = [{ name: "navigate", description: "x", inputSchema: { type: "object", properties: {} } }];
  const h = createHandlers({ tools, call: async () => ({}) });
  assert.deepEqual(h.listTools(), { tools });
});

test("callTool maps a successful tool_response", async () => {
  const h = createHandlers({
    tools: [],
    call: async ({ tool, args }) => {
      assert.equal(tool, "navigate");
      assert.deepEqual(args, { url: "https://x.com" });
      return { type: "tool_response", result: { content: [{ type: "text", text: "navigated" }] } };
    },
  });
  const res = await h.callTool("navigate", { url: "https://x.com" });
  assert.equal(res.isError, false);
  assert.deepEqual(res.content, [{ type: "text", text: "navigated" }]);
});

test("callTool surfaces a rejected call as an isError result", async () => {
  const h = createHandlers({ tools: [], call: async () => { throw new Error("no browser connected"); } });
  const res = await h.callTool("navigate", {});
  assert.equal(res.isError, true);
  assert.match(res.content[0].text, /no browser connected/);
});

test("callTool defaults missing arguments to {}", async () => {
  let seen;
  const h = createHandlers({
    tools: [],
    call: async ({ args }) => { seen = args; return { type: "tool_response", result: { content: [] } }; },
  });
  await h.callTool("tabs_context_mcp", undefined);
  assert.deepEqual(seen, {});
});
