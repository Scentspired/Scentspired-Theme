#!/usr/bin/env bash
set -e

# Scentspired USA Local Development Server Launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================================="
echo "  🇺🇸  LAUNCHING SCENTSPIRED USA LOCAL THEME DEV SERVER"
echo "=================================================================="

# Detect location and ensure latest sync
if [ -f "$SCRIPT_DIR/engine/sync-regions.cjs" ]; then
  echo ">>> [1/2] Syncing latest core changes into Scentspired-USA..."
  node "$SCRIPT_DIR/engine/sync-regions.cjs" --target=usa
  USA_DIR="$(cd "$SCRIPT_DIR/../Scentspired-USA" && pwd)"
elif [ -d "$SCRIPT_DIR/../Scentspired-USA" ]; then
  USA_DIR="$(cd "$SCRIPT_DIR/../Scentspired-USA" && pwd)"
else
  USA_DIR="$SCRIPT_DIR"
fi

echo ">>> [2/2] Starting Shopify local preview dev server in $USA_DIR..."
echo "  Store:   scentspired.myshopify.com"
echo "  Local:   http://127.0.0.1:9292"
echo "  Browser: Opening default browser automatically..."
echo "=================================================================="
echo "Press Ctrl+C to stop the development server when finished."
echo "=================================================================="

cd "$USA_DIR"
npx shopify theme dev --store=scentspired.myshopify.com --open
