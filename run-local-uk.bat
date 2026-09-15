@echo off
setlocal enabledelayedexpansion

echo ==================================================================
echo   🇬🇧  LAUNCHING SCENTSPIRED UK LOCAL THEME DEV SERVER
echo ==================================================================

set SCRIPT_DIR=%~dp0

if exist "%SCRIPT_DIR%engine\sync-regions.cjs" (
  echo ^>^>^> [1/2] Syncing latest core changes into Scentspired-UK...
  node "%SCRIPT_DIR%engine\sync-regions.cjs" --target=uk
  set "UK_DIR=%SCRIPT_DIR%..\Scentspired-UK"
) else (
  set "UK_DIR=%SCRIPT_DIR%"
)

cd /d "%UK_DIR%"

echo ^>^>^> [2/2] Starting Shopify local preview dev server in %UK_DIR%...
echo   Store:   scentspireduk.myshopify.com
echo   Local:   http://127.0.0.1:9292
echo   Browser: Opening default browser automatically...
echo ==================================================================
echo Press Ctrl+C to stop the development server when finished.
echo ==================================================================

npx shopify theme dev --store=scentspireduk.myshopify.com --open
