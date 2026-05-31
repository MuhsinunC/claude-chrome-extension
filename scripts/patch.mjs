#!/usr/bin/env node
/**
 * patch.mjs — apply the injection-only patch to an extracted official extension.
 *
 * Usage: node scripts/patch.mjs <extension-dir> [--keep-key]
 *
 * Deterministic transformation (no edits to the app's minified bundles):
 *   1. manifest.json: rename, version += ".1", drop update_url, drop key
 *      (unless --keep-key), broaden connect-src CSP.
 *   2. strip _metadata/ (CRX signature folder).
 *   3. copy payload files (cp-inject.js, cp-settings.{html,js}) to the ext root.
 *   4. inject <script src="/cp-inject.js"> before the first <script type=module>
 *      in EVERY module-booting HTML (enumerated, not hardcoded).
 *
 * Fails loudly (exit 1) if no module-booting HTML is found or not all are
 * injected — so CI never ships a silently-broken build.
 */
import {
  readFileSync, writeFileSync, copyFileSync, rmSync,
  existsSync, readdirSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PAYLOAD_DIR = resolve(SCRIPT_DIR, '..', 'patch', 'payload');
const PAYLOAD_FILES = ['cp-inject.js', 'cp-settings.html', 'cp-settings.js'];
const INJECT_TAG = '<script src="/cp-inject.js"></script>';
const MODULE_RE = /<script\b[^>]*\btype\s*=\s*["']module["'][^>]*>/i;
const BROAD_CONNECT = "connect-src 'self' https: wss: http://localhost:* ws://localhost:*";

function fail(msg) {
  console.error('patch.mjs ERROR: ' + msg);
  process.exit(1);
}

const args = process.argv.slice(2);
// Keep the official `key` by DEFAULT so the extension ID stays fcoeoab… — required
// for Claude Code's browser automation (native messaging only allows the official
// ID). `--remove-key` opts into a distinct ID (coexists with the official build but
// BREAKS Claude Code's connection).
const removeKey = args.includes('--remove-key');
const OFFICIAL_ID = 'fcoeoabgfenejglbffodgkkbkcdhcgfn';
const target = args.find((a) => !a.startsWith('--'));
if (!target) fail('usage: node scripts/patch.mjs <extension-dir> [--keep-key]');

const extDir = resolve(target);
const manifestPath = join(extDir, 'manifest.json');
if (!existsSync(manifestPath)) fail('no manifest.json in ' + extDir);

// --- 1. manifest -----------------------------------------------------------
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const officialVersion = manifest.version;
if (!officialVersion) fail('manifest has no version');

// Idempotent: if already patched (re-run on a patched dir), keep name/version
// and just re-apply the rest. Fresh runs bump the version.
const alreadyPatched = manifest.name === 'Claude (Patched)';
if (!alreadyPatched) {
  const parts = String(officialVersion).split('.');
  if (parts.length >= 4) fail(`official version "${officialVersion}" already has 4+ parts; cannot append ".1"`);
  manifest.name = 'Claude (Patched)';
  manifest.version = officialVersion + '.1';
  manifest.description = 'Claude in Chrome — patched for custom API endpoint + API-key mode (unofficial).';
}
delete manifest.update_url;
if (removeKey) {
  delete manifest.key;
} else if (!manifest.key) {
  // The official build ships a `key`; if a future version drops it, fail loudly
  // rather than silently shipping a Claude-Code-incompatible build.
  fail('official manifest has no `key` to preserve — needed for the official ID (Claude Code native messaging)');
}

const cspBlock = manifest.content_security_policy;
if (cspBlock && cspBlock.extension_pages) {
  let csp = cspBlock.extension_pages;
  if (/connect-src[^;]*/i.test(csp)) {
    csp = csp.replace(/connect-src[^;]*/i, BROAD_CONNECT);
  } else {
    csp = csp.trim();
    if (csp && !csp.endsWith(';')) csp += ';';
    csp += ' ' + BROAD_CONNECT + ';';
  }
  cspBlock.extension_pages = csp;
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

// --- 2. strip _metadata/ ---------------------------------------------------
const metaDir = join(extDir, '_metadata');
if (existsSync(metaDir)) rmSync(metaDir, { recursive: true, force: true });

// --- 3. copy payload -------------------------------------------------------
for (const f of PAYLOAD_FILES) {
  const srcF = join(PAYLOAD_DIR, f);
  if (!existsSync(srcF)) fail('payload file missing: ' + srcF);
  copyFileSync(srcF, join(extDir, f));
}

// --- 4. inject into every module-booting HTML ------------------------------
const htmlFiles = readdirSync(extDir).filter((f) => f.toLowerCase().endsWith('.html'));
let moduleBooting = 0;
let injected = 0;
for (const f of htmlFiles) {
  const p = join(extDir, f);
  let html = readFileSync(p, 'utf8');
  const m = html.match(MODULE_RE);
  if (!m) continue; // not an app-booting page (e.g. blocked/offscreen/gif_viewer)
  moduleBooting++;
  if (html.includes('/cp-inject.js')) {
    injected++; // idempotent: already patched
    continue;
  }
  html = html.slice(0, m.index) + INJECT_TAG + '\n    ' + html.slice(m.index);
  writeFileSync(p, html);
  injected++;
}

if (moduleBooting === 0) fail('no module-booting HTML found (anchor missing) — refusing to ship');
if (injected !== moduleBooting) fail(`injected ${injected}/${moduleBooting} module-booting HTML files`);
if (existsSync(metaDir)) fail('_metadata/ still present after strip');

console.log(
  `patched ${officialVersion} -> ${manifest.version} | HTML injected ${injected}/${moduleBooting} | ` +
  `key ${removeKey ? 'removed (new id)' : 'kept (official id)'} | _metadata stripped | payload x${PAYLOAD_FILES.length}`
);
