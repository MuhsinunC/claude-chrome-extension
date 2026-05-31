#!/usr/bin/env node
/**
 * build.mjs — package a patched extension dir into a release zip.
 *
 * Usage: node scripts/build.mjs <patched-dir> [out-dir=dist]
 * Produces <out-dir>/claude-patched-v<version>.zip with files at the zip root
 * (so Chrome "Load unpacked" works after unzip).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

function fail(m) {
  console.error('build.mjs ERROR: ' + m);
  process.exit(1);
}

const args = process.argv.slice(2);
const dir = args[0];
if (!dir) fail('usage: node scripts/build.mjs <patched-dir> [out-dir]');
const extDir = resolve(dir);
if (!existsSync(join(extDir, 'manifest.json'))) fail('no manifest.json in ' + extDir);

const outDir = resolve(args[1] || 'dist');
mkdirSync(outDir, { recursive: true });

const manifest = JSON.parse(readFileSync(join(extDir, 'manifest.json'), 'utf8'));
const version = manifest.version;
if (!version) fail('patched manifest has no version');

const zipPath = join(outDir, `claude-patched-v${version}.zip`);
if (existsSync(zipPath)) rmSync(zipPath);

try {
  // -r recurse, -q quiet, -X strip extra attrs (reproducible); exclude OS cruft.
  execFileSync('zip', ['-rqX', zipPath, '.', '-x', '*.DS_Store', '-x', '__MACOSX*'], {
    cwd: extDir,
    stdio: 'inherit',
  });
} catch (e) {
  fail('zip failed (is `zip` installed?): ' + e.message);
}

console.log('built ' + zipPath);
