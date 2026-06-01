// `--mcp` half: the external MCP server Claude Code launches (via `claude mcp add`). It
// presents the 22 official tools verbatim and forwards each call over the rendezvous socket
// to the native host (which relays to the extension's real executors).

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { connectMcpClient, socketPathForUser } from "./socket.mjs";
import { RequestQueue, toToolRequest, fromToolResponse, isToolResponse } from "./protocol.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SCHEMAS = path.join(HERE, "..", "tool-schemas.json");

// Server name "claude-in-chrome" gives the model byte-identical fully-qualified tool names
// (mcp__claude-in-chrome__navigate, …). See design §6 for the subscription-auth caveat.
const SERVER_NAME = "claude-in-chrome";
const SERVER_VERSION = "1.0.0";

export function loadTools(schemasPath = DEFAULT_SCHEMAS) {
  const doc = JSON.parse(readFileSync(schemasPath, "utf8"));
  return doc.tools.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
}

// Testable core: given the tool list and `call({tool,args}) => Promise<tool_response>`,
// build the two MCP request handlers. No SDK or transport here.
export function createHandlers({ tools, call }) {
  return {
    listTools: () => ({ tools }),
    callTool: async (name, args) => {
      try {
        return fromToolResponse(await call({ tool: name, args: args ?? {} }));
      } catch (e) {
        return { content: [{ type: "text", text: `browser tool failed: ${e?.message ?? e}` }], isError: true };
      }
    },
  };
}

// Wire the MCP stdio server to the rendezvous socket and start it.
export async function runMcp({ schemasPath = DEFAULT_SCHEMAS, socketPath = socketPathForUser() } = {}) {
  const tools = loadTools(schemasPath);

  let client;
  const queue = new RequestQueue((req) => {
    if (!client || !client.isConnected()) {
      throw new Error("no browser connected — open the Claude (Patched) extension to connect");
    }
    client.send(req);
  });
  client = connectMcpClient({
    socketPath,
    onMessage: (m) => { if (isToolResponse(m)) queue.resolveResponse(m); },
    onDisconnect: () => queue.failInflight(new Error("browser disconnected mid-call")),
  });

  const handlers = createHandlers({ tools, call: (c) => queue.call(toToolRequest(c)) });
  const server = new Server({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => handlers.listTools());
  server.setRequestHandler(CallToolRequestSchema, async (req) => handlers.callTool(req.params.name, req.params.arguments));
  await server.connect(new StdioServerTransport());
  return { server, client };
}
