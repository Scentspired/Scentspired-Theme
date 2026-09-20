#!/usr/bin/env node
/**
 * ============================================================================
 * SCENTSPIRED UAE LOCAL DEVELOPMENT RUNNER
 * ============================================================================
 *
 * Runs the Scentspired UAE storefront locally via Shopify CLI theme dev server.
 * Ensures the target repository (Scentspired-UAE) is fresh with the latest
 * regional projections from Scentspired-Theme before launching.
 *
 * Usage:
 *   npm run dev:uae
 *   npm run dev:uae -- --store=scentspireduae.myshopify.com
 *   npm run dev:uae -- --port=9292 --theme-editor-sync
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCRIPT_DIR = __dirname;
const THEME_ROOT = path.resolve(SCRIPT_DIR, '..');
const UAE_ROOT = path.resolve(THEME_ROOT, '../Scentspired-UAE');

// Parse CLI arguments
const rawArgs = process.argv.slice(2);
let store = process.env.SHOPIFY_FLAG_STORE || process.env.SHOPIFY_STORE || 'scentspireduae.myshopify.com';
let skipSync = rawArgs.includes('--skip-sync');
let forwardedArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg.startsWith('--store=')) {
    store = arg.split('=')[1];
  } else if ((arg === '-s' || arg === '--store') && rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
    store = rawArgs[i + 1];
    i++;
  } else if (arg === '--skip-sync') {
    skipSync = true;
  } else {
    forwardedArgs.push(arg);
  }
}

console.log('\n==============================================================');
console.log('   🇦🇪 SCENTSPIRED UAE — LOCAL DEVELOPMENT SERVER');
console.log('==============================================================');
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

// 3. Construct Shopify CLI arguments
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
