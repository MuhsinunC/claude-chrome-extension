#!/bin/bash
# Extract Claude Chrome Extension from Chrome Web Store
# Usage: ./scripts/extract-crx.sh

set -e

EXTENSION_ID="fcoeoabgfenejglbffodgkkbkcdhcgfn"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_DIR/src"
TEMP_DIR=$(mktemp -d)

# Chrome version to use in the download URL (needs to be recent)
CHROME_VERSION="131.0.0.0"
USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROME_VERSION} Safari/537.36"

# Cleanup on exit
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "Downloading Claude Chrome Extension..."

# Download CRX from Chrome Web Store
# Uses extended parameters required by modern Chrome Web Store API
CRX_URL="https://clients2.google.com/service/update2/crx?response=redirect&os=mac&arch=x64&os_arch=x86_64&nacl_arch=x86-64&prod=chromiumcrx&prodchannel=beta&prodversion=${CHROME_VERSION}&acceptformat=crx2,crx3&x=id%3D${EXTENSION_ID}%26uc"
CRX_FILE="$TEMP_DIR/extension.crx"

curl -L -A "$USER_AGENT" -o "$CRX_FILE" "$CRX_URL" 2>/dev/null

if [ ! -f "$CRX_FILE" ] || [ ! -s "$CRX_FILE" ]; then
    echo "Error: Failed to download CRX file"
    exit 1
fi

echo "Extracting CRX..."

# CRX3 format: find the ZIP content (starts with PK signature)
# The ZIP data starts after the CRX header
# We find the PK\x03\x04 signature which marks the start of a ZIP file
ZIP_FILE="$TEMP_DIR/extension.zip"

# Find offset of PK signature (0x504B0304) and extract from there
# Using perl for binary search as it's more portable than xxd variations
perl -e '
    local $/;
    my $data = <STDIN>;
    my $idx = index($data, "PK\x03\x04");
    if ($idx >= 0) {
        print substr($data, $idx);
    } else {
        exit 1;
    }
' < "$CRX_FILE" > "$ZIP_FILE"

if [ ! -s "$ZIP_FILE" ]; then
    echo "Error: Failed to extract ZIP from CRX"
    exit 1
fi

# Clear and recreate src directory
echo "Clearing src/ directory..."
rm -rf "$SRC_DIR"
mkdir -p "$SRC_DIR"

# Extract ZIP to src/
echo "Extracting to src/..."
unzip -q "$ZIP_FILE" -d "$SRC_DIR"

# Get version from manifest.json
if [ -f "$SRC_DIR/manifest.json" ]; then
    VERSION=$(python3 -c "import json; print(json.load(open('$SRC_DIR/manifest.json'))['version'])" 2>/dev/null || echo "unknown")
    echo ""
    echo "========================================="
    echo "Extracted Claude extension v${VERSION}"
    echo "========================================="
else
    echo "Warning: manifest.json not found"
fi

# Unminify source files
echo ""
echo "Unminifying source files..."
if [ -f "$SCRIPT_DIR/unminify.sh" ]; then
    "$SCRIPT_DIR/unminify.sh"
else
    echo "Warning: unminify.sh not found, skipping unminification"
fi

echo ""
echo "Files extracted to: $SRC_DIR"
echo ""
echo "Next steps:"
echo "  git add src/"
echo "  git commit -m 'Sync official extension v${VERSION}'"
