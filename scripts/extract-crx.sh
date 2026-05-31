#!/bin/bash
#
# extract-crx.sh — download the official "Claude in Chrome" extension from the
# Chrome Web Store and unzip it (pristine; no patching, no unminification) into
# a target directory.
#
# Usage: ./scripts/extract-crx.sh <output-dir>
#   CHROME_VERSION (env) overrides the UA / prodversion (default 140.0.0.0).
#
set -euo pipefail

EXTENSION_ID="fcoeoabgfenejglbffodgkkbkcdhcgfn"
CHROME_VERSION="${CHROME_VERSION:-140.0.0.0}"
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36"

OUT_DIR="${1:-}"
if [ -z "$OUT_DIR" ]; then
  echo "usage: $0 <output-dir>" >&2
  exit 2
fi
# Guard: never clobber obviously-wrong targets (we run `rm -rf` on this).
case "$OUT_DIR" in
  ""|"/"|"."|"./"|"..") echo "extract-crx.sh: refusing to use output dir '$OUT_DIR'" >&2; exit 2 ;;
esac

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

CRX_URL="https://clients2.google.com/service/update2/crx?response=redirect&os=mac&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromiumcrx&prodchannel=stable&prodversion=${CHROME_VERSION}&acceptformat=crx2,crx3&x=id%3D${EXTENSION_ID}%26uc"
CRX_FILE="$TEMP_DIR/extension.crx"

echo "Downloading official extension (Chrome/${CHROME_VERSION})..."
curl -fsSL -A "$USER_AGENT" -o "$CRX_FILE" "$CRX_URL"
[ -s "$CRX_FILE" ] || { echo "Error: CRX download was empty" >&2; exit 1; }

# CRX3 -> ZIP: slice from the first local-file-header PK signature.
ZIP_FILE="$TEMP_DIR/extension.zip"
perl -e 'local $/; my $d=<STDIN>; my $i=index($d,"PK\x03\x04"); $i>=0 or exit 1; print substr($d,$i)' < "$CRX_FILE" > "$ZIP_FILE"
[ -s "$ZIP_FILE" ] || { echo "Error: could not extract ZIP from CRX" >&2; exit 1; }

# Clean extract into the target dir.
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
unzip -q "$ZIP_FILE" -d "$OUT_DIR"

[ -f "$OUT_DIR/manifest.json" ] || { echo "Error: manifest.json missing after extract" >&2; exit 1; }
VERSION="$(python3 -c "import json; print(json.load(open('$OUT_DIR/manifest.json'))['version'])")"
echo "Extracted official Claude in Chrome v${VERSION} -> $OUT_DIR"
