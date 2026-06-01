// Chrome Native Messaging wire framing.
//
// Each message is a 4-byte uint32 length prefix in the host's NATIVE byte order,
// followed by that many UTF-8 bytes of JSON. We use little-endian explicitly because
// the only supported host platform here is macOS arm64/x64, where native order IS
// little-endian. (On a big-endian host this would need os.endianness() — flagged so a
// future port doesn't silently corrupt the length.)
//
// Size caps (Chrome docs): host->Chrome <= 1 MB (our outgoing direction, only small
// tool_request envelopes); Chrome->host <= 64 MiB (carries large tool_response payloads
// such as screenshots). We only guard the read side against an absurd declared length so
// a malformed header can't make us buffer unbounded memory.

const LENGTH_BYTES = 4;
const MAX_MESSAGE_BYTES = 64 * 1024 * 1024; // 64 MiB — the Chrome->host ceiling

/** Frame a JS value as a Native Messaging message Buffer. */
export function encodeMessage(obj) {
  const json = Buffer.from(JSON.stringify(obj), "utf8");
  const header = Buffer.allocUnsafe(LENGTH_BYTES);
  header.writeUInt32LE(json.length, 0); // LE: native order on macOS arm64/x64
  return Buffer.concat([header, json]);
}

/**
 * Streaming decoder. Feed arbitrary chunks via push(); get back zero or more fully
 * parsed messages. Holds a partial frame across chunks (a screenshot easily spans many).
 */
export class NativeMessageDecoder {
  #buf = Buffer.alloc(0);

  /** @param {Buffer} chunk @returns {object[]} complete messages decoded from the stream so far */
  push(chunk) {
    this.#buf = this.#buf.length ? Buffer.concat([this.#buf, chunk]) : chunk;
    const out = [];
    for (;;) {
      if (this.#buf.length < LENGTH_BYTES) break; // not even a full header yet
      const len = this.#buf.readUInt32LE(0);
      if (len > MAX_MESSAGE_BYTES) {
        throw new Error(`native message length ${len} exceeds cap ${MAX_MESSAGE_BYTES}`);
      }
      if (this.#buf.length < LENGTH_BYTES + len) break; // body not fully arrived
      const payload = this.#buf.subarray(LENGTH_BYTES, LENGTH_BYTES + len);
      this.#buf = this.#buf.subarray(LENGTH_BYTES + len);
      out.push(JSON.parse(payload.toString("utf8")));
    }
    return out;
  }
}
