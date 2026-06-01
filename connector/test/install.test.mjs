import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  mcpAddArgv,
  ourManifest,
  wrapperScript,
  planActivation,
  OFFICIAL_EXT_ID,
  OUR_HOST_NAME,
  SERVER_NAME,
  ANTHROPIC_HOST_NAMES,
} from "../install.mjs";

test("mcpAddArgv registers our server name + bridge --mcp", () => {
  assert.deepEqual(
    mcpAddArgv("/abs/bridge.mjs", "/usr/bin/node"),
    ["mcp", "add", SERVER_NAME, "--", "/usr/bin/node", "/abs/bridge.mjs", "--mcp"],
  );
});

test("ourManifest allow-lists exactly the official extension id and is stdio", () => {
  const m = ourManifest("/abs/chrome-native-host");
  assert.equal(m.name, OUR_HOST_NAME);
  assert.equal(m.type, "stdio");
  assert.equal(m.path, "/abs/chrome-native-host");
  assert.deepEqual(m.allowed_origins, [`chrome-extension://${OFFICIAL_EXT_ID}/`]);
});

test("wrapperScript execs node bridge --native-host", () => {
  const s = wrapperScript("/usr/bin/node", "/abs/bridge.mjs");
  assert.match(s, /^#!\/bin\/sh/);
  assert.match(s, /exec "\/usr\/bin\/node" "\/abs\/bridge\.mjs" --native-host/);
});

test("planActivation backs up + repoints only existing manifests, mutating nothing", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-nm-"));
  const present = path.join(dir, `${ANTHROPIC_HOST_NAMES[0]}.json`); // Desktop present
  const original = {
    name: ANTHROPIC_HOST_NAMES[0],
    path: "/Applications/Claude.app/Contents/Helpers/chrome-native-host",
    type: "stdio",
    allowed_origins: ["chrome-extension://aaa/", "chrome-extension://bbb/"],
  };
  fs.writeFileSync(present, JSON.stringify(original));
  const before = fs.readFileSync(present, "utf8");

  const plan = planActivation(dir, "/abs/chrome-native-host");

  assert.equal(plan.length, 1, "only the present manifest is planned");
  assert.equal(plan[0].name, ANTHROPIC_HOST_NAMES[0]);
  assert.equal(plan[0].bakPath, present + ".bak");
  assert.equal(plan[0].repointed.path, "/abs/chrome-native-host");
  assert.deepEqual(plan[0].repointed.allowed_origins, original.allowed_origins, "preserves the allow-list");
  // purity: the live manifest is untouched and no .bak was written
  assert.equal(fs.readFileSync(present, "utf8"), before);
  assert.equal(fs.existsSync(present + ".bak"), false);
});

test("planActivation handles a dir with no anthropic manifests", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cc-nm-empty-"));
  assert.deepEqual(planActivation(dir, "/abs/w"), []);
});
