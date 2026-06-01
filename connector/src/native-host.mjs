// `--native-host` half: Chrome launches this (via our native-messaging manifest) when the
// extension calls connectNative. It speaks Native Messaging on stdio to the extension and
// owns the rendezvous socket the `--mcp` half connects to, relaying between the two.

import process from "node:process";
import { encodeMessage, NativeMessageDecoder } from "./native-codec.mjs";
import { createHostServer, socketPathForUser } from "./socket.mjs";
import { isPing, isToolResponse, pong, statusResponse, mcpConnected, mcpDisconnected } from "./protocol.mjs";

// Testable core: route a message that arrived FROM the extension. `writeToExtension` sends
// back over the native pipe; `sendToMcp` forwards to the connected --mcp client.
export function makeExtensionHandler({ writeToExtension, sendToMcp }) {
  return function handleFromExtension(m) {
    if (isPing(m)) { writeToExtension(pong()); return; }
    if (m?.type === "get_status") { writeToExtension(statusResponse()); return; }
    if (isToolResponse(m)) { sendToMcp(m); return; }
    // Other inbound types (e.g. initialize() side-effects) are ignored in v1.
  };
}

export function runNativeHost({ stdin = process.stdin, stdout = process.stdout, socketPath = socketPathForUser() } = {}) {
  const writeToExtension = (obj) => stdout.write(encodeMessage(obj));

  const host = createHostServer({
    socketPath,
    onMessage: (m) => writeToExtension(m),              // --mcp -> extension (tool_request envelopes)
    onClientConnect: () => writeToExtension(mcpConnected()),
    onClientDisconnect: () => writeToExtension(mcpDisconnected()),
  });

  const handle = makeExtensionHandler({ writeToExtension, sendToMcp: (m) => host.send(m) });
  const decoder = new NativeMessageDecoder();
  stdin.on("data", (chunk) => {
    let msgs;
    try { msgs = decoder.push(chunk); } catch { return; } // a malformed frame just gets dropped
    for (const m of msgs) handle(m);
  });
  stdin.on("end", () => host.close());

  return host;
}
