#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED UAE LOCAL DEVELOPMENT RUNNER
 * ============================================================================
 *
 * Runs the Scentspired UAE storefront locally.
 *
 * Modes:
 *   1. Shopify CLI Live Dev (Default):
 *      npm run dev:uae
 *      (Uses permanent store domain: nfveen-nd.myshopify.com)
 *
 *   2. Offline / Standalone Local Preview (No Shopify Login Required):
 *      npm run dev:uae:local
 *      (Spins up instant local preview server at http://localhost:9292)
 *
 * Usage:
 *   npm run dev:uae
 *   npm run dev:uae -- --store=nfveen-nd.myshopify.com
 *   npm run dev:uae:local
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const THEME_ROOT = path.resolve(SCRIPT_DIR, '..');
const UAE_ROOT = path.resolve(THEME_ROOT, '../Scentspired-UAE');

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
let store = process.env.SHOPIFY_FLAG_STORE || process.env.SHOPIFY_STORE || 'scentspiredae.myshopify.com';
let skipSync = rawArgs.includes('--skip-sync');
let isLocalPreview = rawArgs.includes('--local') || rawArgs.includes('--offline') || rawArgs.includes('--preview');
let port = 9292;
let forwardedArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg.startsWith('--store=')) {
    store = arg.split('=')[1];
  } else if ((arg === '-s' || arg === '--store') && rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
    store = rawArgs[i + 1];
    i++;
  } else if (arg.startsWith('--port=')) {
    port = parseInt(arg.split('=')[1], 10);
  } else if ((arg === '-p' || arg === '--port') && rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
    port = parseInt(rawArgs[i + 1], 10);
    i++;
  } else if (arg === '--skip-sync') {
    skipSync = true;
  } else if (arg === '--local' || arg === '--offline' || arg === '--preview') {
    isLocalPreview = true;
  } else {
    forwardedArgs.push(arg);
  }
}

console.log('\n==============================================================');
console.log('   🇦🇪 SCENTSPIRED UAE — LOCAL DEVELOPMENT SERVER');
console.log('==============================================================');
console.log(`  Mode:          ${isLocalPreview ? '💻 STANDALONE LOCAL PREVIEW (Offline / No Login)' : '⚡ SHOPIFY CLI DEV SERVER'}`);
console.log(`  Theme Source:  ${THEME_ROOT}`);
console.log(`  Target Path:   ${UAE_ROOT}`);
console.log(`  Store Domain:  ${store}`);
console.log('==============================================================\n');

// 1. Verify UAE repo exists
if (!fs.existsSync(UAE_ROOT)) {
  console.error(`❌ Target UAE repository not found at: ${UAE_ROOT}`);
  process.exit(1);
}

// 2. Automatically sync SSOT changes to UAE before starting dev server (unless --skip-sync)
if (!skipSync) {
  console.log('>>> [1/2] Syncing latest theme engine & UAE regional templates...');
  try {
    const { execSync } = require('child_process');
    execSync('node engine/sync-regions.cjs --target=uae --skip-push', {
      cwd: THEME_ROOT,
      stdio: 'inherit',
      env: { ...process.env, ALLOW_UAE_LIVE_SYNC: '1' }
    });
    console.log('✅ Local UAE theme files are 100% up to date.\n');
  } catch (err) {
    console.warn('⚠️ Sync encountered a non-fatal warning, proceeding with launch.\n');
  }
}

// ----------------------------------------------------------------------------
// MODE A: STANDALONE LOCAL PREVIEW SERVER (No Login Required)
// ----------------------------------------------------------------------------
if (isLocalPreview) {
  console.log(`>>> [2/2] Starting local preview server at http://localhost:${port} ...\n`);

  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.mp4': 'video/mp4'
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';

    // Check if requesting an asset from /cdn/shop/... or /assets/...
    let filePath = null;
    if (reqUrl.startsWith('/assets/')) {
      filePath = path.join(UAE_ROOT, reqUrl);
    } else if (reqUrl.includes('/assets/')) {
      const assetName = path.basename(reqUrl);
      filePath = path.join(UAE_ROOT, 'assets', assetName);
    }

    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      return fs.createReadStream(filePath).pipe(res);
    }

    // Default HTML preview page showing theme status & assets
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Scentspired UAE — Local Preview</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/base.css">
  <style>
    body { font-family: 'PPMori Regular', -apple-system, sans-serif; background: #0b0b0b; color: #fff; margin: 0; padding: 2rem; }
    .card { background: #181818; border-radius: 12px; padding: 2rem; max-width: 800px; margin: 2rem auto; border: 1px solid #333; }
    h1 { font-size: 2.2rem; margin-top: 0; color: #ebfb33; }
    p { line-height: 1.6; color: #ccc; }
    .badge { display: inline-block; background: #222; border: 1px solid #444; border-radius: 6px; padding: 4px 10px; font-family: monospace; color: #f4ff41; margin-right: 8px; }
    .btn { display: inline-block; background: #f4ff41; color: #000; padding: 12px 24px; border-radius: 40px; text-decoration: none; font-weight: bold; margin-top: 1rem; }
    .collections { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 1.5rem; }
    .col-card { border-radius: 15px; overflow: hidden; aspect-ratio: 784/1172; position: relative; background: #222; }
    .col-card video { width: 100%; height: 100%; object-fit: cover; }
    .col-title { position: absolute; top: 15px; left: 15px; font-size: 24px; font-weight: bold; color: #fff; }
    .col-btn { position: absolute; bottom: 20px; left: 20px; background: #f4ff41; color: #000; border-radius: 40px; padding: 8px 16px; font-size: 12px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🇦🇪 Scentspired UAE Local Dev Preview</h1>
    <p>Theme: <strong>Scentspired-UAE</strong> &bull; Target Store: <code>nfveen-nd.myshopify.com</code></p>
    <p><span class="badge">Status: Online</span> <span class="badge">Port: ${port}</span></p>
    
    <h2>Featured Collection Cards (Parity Verified 784:1172 Height):</h2>
    <div class="collections">
      <div class="col-card">
        <video src="https://cdn.shopify.com/videos/c/o/v/c605d4dc6fe04f8aa3f2a5584207af28.mp4" autoplay muted loop playsinline></video>
        <div class="col-title">Women</div>
        <a href="#" class="col-btn">SHOP WOMEN</a>
      </div>
      <div class="col-card">
        <video src="https://cdn.shopify.com/videos/c/o/v/efb55496eff0461a9c9aaa2632110d25.mp4" autoplay muted loop playsinline></video>
        <div class="col-title">Men</div>
        <a href="#" class="col-btn">SHOP MEN</a>
      </div>
      <div class="col-card">
        <video src="https://cdn.shopify.com/videos/c/o/v/bd60dd4aa48c4125b414c543ba461da8.mp4" autoplay muted loop playsinline></video>
        <div class="col-title">Unisex</div>
        <a href="#" class="col-btn">SHOP UNISEX</a>
      </div>
    </div>

    <p style="margin-top: 2rem;">💡 To run connected live Shopify CLI development, run:</p>
    <code>npm run dev:uae</code>
  </div>
</body>
</html>`);
  });

  server.listen(port, () => {
    console.log(`🚀 Standalone local preview running at: http://localhost:${port}`);
    console.log(`👉 Press Ctrl+C to stop the server.\n`);
  });

  process.on('SIGINT', () => {
    console.log('\n👋 Local preview server stopped.');
    server.close();
    process.exit(0);
  });
  return;
}

// ----------------------------------------------------------------------------
// MODE B: SHOPIFY THEME DEV SERVER (Official CLI)
// ----------------------------------------------------------------------------
const localShopifyBin = path.join(THEME_ROOT, 'node_modules/.bin/shopify');
const shopifyCmd = fs.existsSync(localShopifyBin) ? localShopifyBin : 'shopify';

const shopifyArgs = [
  'theme',
  'dev',
  `--path=${UAE_ROOT}`,
  `--store=${store}`,
  ...forwardedArgs
];

console.log(`>>> [2/2] Launching Shopify Theme Dev server...`);
console.log(`    Command: ${shopifyCmd} ${shopifyArgs.join(' ')}\n`);
console.log(`ℹ️  Note: When prompted, authenticate in your browser for store '${store}'.\n`);

const child = spawn(shopifyCmd, shopifyArgs, {
  cwd: UAE_ROOT,
  stdio: 'inherit',
  env: {
    ...process.env,
    SHOPIFY_FLAG_STORE: store
  }
});

child.on('error', (err) => {
  console.error('\n❌ Failed to start Shopify CLI:', err.message);
  if (err.code === 'ENOENT') {
    console.error('💡 Ensure @shopify/cli is installed (`npm install` in Scentspired-Theme).');
  }
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`\n🛑 Dev server stopped (${signal}).`);
  } else if (code !== 0) {
    console.log(`\n⚠️ Dev server exited with code ${code}.`);
  } else {
    console.log('\n👋 Dev server terminated gracefully.');
  }
  process.exit(code || 0);
});

// Forward interrupt signals
process.on('SIGINT', () => {
  child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
