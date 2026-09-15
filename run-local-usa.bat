@echo off
setlocal enabledelayedexpansion

echo ==================================================================
echo   🇺🇸  LAUNCHING SCENTSPIRED USA LOCAL THEME DEV SERVER
echo ==================================================================

set SCRIPT_DIR=%~dp0

if exist "%SCRIPT_DIR%engine\sync-regions.cjs" (
  echo ^>^>^> [1/2] Syncing latest core changes into Scentspired-USA...
  node "%SCRIPT_DIR%engine\sync-regions.cjs" --target=usa
  set "USA_DIR=%SCRIPT_DIR%..\Scentspired-USA"
) else (
  set "USA_DIR=%SCRIPT_DIR%"
)

cd /d "%USA_DIR%"

echo ^>^>^> [2/2] Starting Shopify local preview dev server in %USA_DIR%...
echo   Store:   scentspired.myshopify.com
echo   Local:   http://127.0.0.1:9292
echo   Browser: Opening default browser automatically...
echo ==================================================================
echo Press Ctrl+C to stop the development server when finished.
echo ==================================================================

npx shopify theme dev --store=scentspired.myshopify.com --open
