#!/usr/bin/env node
/**
 * check-release.mjs — read the official version from an extracted extension dir,
 * compute the patched tag (vX.Y.Z.1), and decide whether a Release is needed.
 *
 * Usage: node scripts/check-release.mjs <extracted-dir>
 * Env:   FORCE=true        build even if the release already exists
 *        GITHUB_OUTPUT     (set by Actions) — receives key=value outputs
 *        GH_TOKEN/gh CLI   used to check release existence
 *
 * Reading the version from the SAME bytes we patch makes a "tagged X / shipped Y"
 * mismatch impossible (no separate version probe to reconcile).
 */
import { readFileSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: check-release.mjs <extracted-dir>'); process.exit(2); }

const official = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8')).version;
if (!official) { console.error('no version in manifest'); process.exit(1); }
const tag = `v${official}.1`;

let exists = false;
try {
  // execFile (no shell) — tag is derived from the official manifest version.
  execFileSync('gh', ['release', 'view', tag], { stdio: 'ignore' });
  exists = true;
} catch { exists = false; }

const force = process.env.FORCE === 'true';
const shouldBuild = !exists || force;

const out = {
  official_version: official,
  patched_version: official + '.1',
  tag,
  release_exists: String(exists),
  should_build: String(shouldBuild),
};
console.log(JSON.stringify(out, null, 2));
if (process.env.GITHUB_OUTPUT) {
  for (const [k, v] of Object.entries(out)) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
}
