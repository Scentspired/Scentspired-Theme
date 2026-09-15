#!/usr/bin/env bash
set -e

# Scentspired UK Local Development Server Launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================================="
echo "  🇬🇧  LAUNCHING SCENTSPIRED UK LOCAL THEME DEV SERVER"
echo "=================================================================="

# Detect location and ensure latest sync
if [ -f "$SCRIPT_DIR/engine/sync-regions.cjs" ]; then
  echo ">>> [1/2] Syncing latest core changes into Scentspired-UK..."
  node "$SCRIPT_DIR/engine/sync-regions.cjs" --target=uk
  UK_DIR="$(cd "$SCRIPT_DIR/../Scentspired-UK" && pwd)"
elif [ -d "$SCRIPT_DIR/../Scentspired-UK" ]; then
  UK_DIR="$(cd "$SCRIPT_DIR/../Scentspired-UK" && pwd)"
else
  UK_DIR="$SCRIPT_DIR"
fi

echo ">>> [2/2] Starting Shopify local preview dev server in $UK_DIR..."
echo "  Store:   scentspireduk.myshopify.com"
echo "  Local:   http://127.0.0.1:9292"
echo "  Browser: Opening default browser automatically..."
echo "=================================================================="
echo "Press Ctrl+C to stop the development server when finished."
echo "=================================================================="

cd "$UK_DIR"
npx shopify theme dev --store=scentspireduk.myshopify.com --open
