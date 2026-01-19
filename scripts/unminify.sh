#!/bin/bash
#
# Unminify all source files in the extension
# Uses prettier to format JS, CSS, JSON, and HTML files
#
# Usage: ./scripts/unminify.sh
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"

echo "=== Unminifying source files ==="
echo "Source directory: $SRC_DIR"

# Check if npx is available
if ! command -v npx &> /dev/null; then
    echo "Error: npx is required but not installed."
    echo "Please install Node.js to get npx."
    exit 1
fi

# Count files before processing
JS_COUNT=$(find "$SRC_DIR" -name "*.js" | wc -l | tr -d ' ')
CSS_COUNT=$(find "$SRC_DIR" -name "*.css" | wc -l | tr -d ' ')
JSON_COUNT=$(find "$SRC_DIR" -name "*.json" | wc -l | tr -d ' ')
HTML_COUNT=$(find "$SRC_DIR" -name "*.html" | wc -l | tr -d ' ')

echo ""
echo "Files to process:"
echo "  JavaScript: $JS_COUNT"
echo "  CSS: $CSS_COUNT"
echo "  JSON: $JSON_COUNT"
echo "  HTML: $HTML_COUNT"
echo ""

# Run prettier on all supported file types
# Using --write to modify files in place
# Using --no-error-on-unmatched-pattern to avoid errors if no files match

echo "Running prettier..."
npx prettier --write \
    --no-error-on-unmatched-pattern \
    --print-width 100 \
    --tab-width 2 \
    --single-quote true \
    --trailing-comma es5 \
    "$SRC_DIR/**/*.js" \
    "$SRC_DIR/**/*.css" \
    "$SRC_DIR/**/*.json" \
    "$SRC_DIR/**/*.html" \
    2>&1

echo ""
echo "=== Unminification complete ==="

# Show sample of changes
echo ""
echo "Sample line counts after unminification:"
echo "  sidepanel JS: $(wc -l < "$SRC_DIR/assets/sidepanel-yURUk1gX.js" 2>/dev/null || echo 'N/A') lines"
echo "  client JS: $(wc -l < "$SRC_DIR/assets/client-BLU1RtqI.js" 2>/dev/null || echo 'N/A') lines"
echo "  Main CSS: $(wc -l < "$SRC_DIR/assets/Main-BWmGWfNh.css" 2>/dev/null || echo 'N/A') lines"
