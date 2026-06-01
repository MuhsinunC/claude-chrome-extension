// Pure translation between MCP tool calls and the patched extension's native-messaging
// tool protocol, plus handshake helpers and a one-in-flight request queue.
//
// Everything here keys off the extension's STABLE protocol strings (ping/pong/get_status/
// status_response/mcp_connected/mcp_disconnected/tool_request/tool_response/execute_tool)
// — never minified identifiers or hashed chunk names. See the design doc §4.

export const CLIENT_ID = "claude-code-custom";

// --- Handshake / lifecycle (host -> extension, and predicates for inbound) ---
export const isPing = (m) => m?.type === "ping";
export const isToolResponse = (m) => m?.type === "tool_response";
export const pong = () => ({ type: "pong" });
export const statusResponse = () => ({ type: "status_response" });
export const mcpConnected = () => ({ type: "mcp_connected" });
export const mcpDisconnected = () => ({ type: "mcp_disconnected" });

// --- MCP tools/call -> extension tool_request ---
export function toToolRequest({ tool, args }) {
  return {
    type: "tool_request",
    method: "execute_tool",
    params: { tool, args: args ?? {}, client_id: CLIENT_ID },
  };
}

// --- extension tool_response -> MCP tool result ---
// Returns { content, isError } where content is an MCP content-block array.
export function fromToolResponse(msg) {
  if (msg?.error) {
    return { content: normalizeContent(msg.error.content, "tool error"), isError: true };
  }
  return { content: normalizeContent(msg?.result?.content, ""), isError: false };
}

// The extension already returns an Anthropic content array (text/image blocks) on success;
// pass it through untouched. Defensively coerce the rare string/object/empty shapes.
function normalizeContent(content, fallbackText) {
  if (Array.isArray(content)) return content;
  if (typeof content === "string") return [{ type: "text", text: content }];
  if (content == null) return [{ type: "text", text: fallbackText }];
  return [{ type: "text", text: typeof content === "object" ? JSON.stringify(content) : String(content) }];
}

/**
 * One outstanding tool_request at a time. The native protocol echoes no request id, so
 * responses correlate to requests by arrival order; concurrent MCP calls therefore queue.
 */
export class RequestQueue {
  #send;
  #timeoutMs;
  #queue = [];
  #inflight = null;
  #timer = null;

  /** @param send (requestObj) => void  writes the request to the extension */
  constructor(send, { timeoutMs = 30_000 } = {}) {
    this.#send = send;
    this.#timeoutMs = timeoutMs;
  }

  /** Enqueue a request; resolves with the matching inbound tool_response message. */
  call(requestObj) {
    return new Promise((resolve, reject) => {
      this.#queue.push({ requestObj, resolve, reject });
      this.#pump();
    });
  }

  /** Feed an inbound tool_response; completes the in-flight call. Returns true if consumed. */
  resolveResponse(msg) {
    if (!this.#inflight) return false;
    const cur = this.#inflight;
    this.#clearTimer();
    this.#inflight = null;
    cur.resolve(msg);
    this.#pump();
    return true;
  }

  /** Fail the in-flight call (e.g. the native host disconnected), then advance the queue. */
  failInflight(err) {
    if (!this.#inflight) return;
    const cur = this.#inflight;
    this.#clearTimer();
    this.#inflight = null;
    cur.reject(err);
    this.#pump();
  }

  #pump() {
    if (this.#inflight || this.#queue.length === 0) return;
    const next = (this.#inflight = this.#queue.shift());
    this.#timer = setTimeout(() => {
      this.#timer = null;
      this.#inflight = null;
      next.reject(new Error("tool call timed out"));
      this.#pump();
    }, this.#timeoutMs);
    try {
      this.#send(next.requestObj);
    } catch (e) {
      this.#clearTimer();
      this.#inflight = null;
      next.reject(e);
      this.#pump();
    }
  }

  #clearTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}
