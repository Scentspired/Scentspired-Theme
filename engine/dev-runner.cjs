#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED UNIVERSAL DEV RUNNER (SSOT)
 * ============================================================================
 * Single Source of Truth for local development execution across all stores.
 * Reads configuration dynamically from engine/sync-config.json.
 * Works natively on Linux, macOS, and Windows.
 * ============================================================================
 */

const readline = require('readline');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ENGINE_DIR = __dirname;
const THEME_DIR = path.resolve(ENGINE_DIR, '..');
const CONFIG_FILE = path.join(ENGINE_DIR, 'sync-config.json');

if (!fs.existsSync(CONFIG_FILE)) {
  console.error(`❌ Configuration file not found at: ${CONFIG_FILE}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
const targets = config.downstreamTargets || [];
const targetMap = new Map();

targets.forEach(t => {
  const resolvedPath = path.resolve(THEME_DIR, t.path);
  targetMap.set(t.id.toLowerCase(), {
    id: t.id,
    name: t.name,
    path: resolvedPath,
    storeDomain: t.storeDomain || (t.id === 'uk' ? 'scentspireduk.myshopify.com' : 'scentspired.myshopify.com')
  });
});

const currentCwd = process.cwd();

function runSync(targetId = 'all') {
  console.log('\n>>> Synchronizing latest theme changes to regional directories...');
  const syncScript = path.join(ENGINE_DIR, 'sync-regions.cjs');
  if (!fs.existsSync(syncScript)) {
    console.warn('⚠️ Sync script not found at:', syncScript);
    return;
  }
  const flag = targetId === 'all' ? '' : `--target=${targetId}`;
  execSync(`node "${syncScript}" ${flag}`, { stdio: 'inherit', cwd: THEME_DIR });
}

function launchTarget(target) {
  if (!target) {
    console.error('❌ Error: Target store configuration is missing.');
    process.exit(1);
  }

  if (!fs.existsSync(target.path)) {
    console.error(`❌ Error: Target store directory not found: ${target.path}`);
    process.exit(1);
  }

  const icon = target.id === 'uk' ? '🇬🇧' : '🇺🇸';
  console.log('\n==================================================================');
  console.log(`  ${icon}  LAUNCHING ${target.name.toUpperCase()} LOCAL DEV SERVER`);
  console.log(`  Store:   ${target.storeDomain}`);
  console.log(`  Path:    ${target.path}`);
  console.log('  Local:   http://127.0.0.1:9292');
  console.log('==================================================================');
  console.log('Press Ctrl+C to exit at any time.\n');

  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npx.cmd' : 'npx';
  const args = ['shopify', 'theme', 'dev', `--store=${target.storeDomain}`, '--open'];

  const child = spawn(cmd, args, {
    cwd: target.path,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', err => {
    console.error('❌ Failed to start Shopify CLI process:', err.message);
  });

  child.on('exit', code => {
    console.log(`\nDev server stopped with code ${code || 0}.`);
    process.exit(code || 0);
  });
}

function showInteractiveMenu() {
  console.log('==================================================================');
  console.log('  🌿 SCENTSPIRED LOCAL STOREFRONT RUNNER (SSOT)');
  console.log('==================================================================');
  console.log('  Select a regional website to launch in local dev preview:');
  console.log('');
  console.log('  [1] 🇬🇧  Scentspired UK  (scentspireduk.myshopify.com)');
  console.log('  [2] 🇺🇸  Scentspired USA (scentspired.myshopify.com)');
  console.log('  [3] 🔄  Sync Core Theme to Regional Stores, then Launch');
  console.log('  [4] 🚪  Exit');
  console.log('==================================================================');
  process.stdout.write('  Enter selection [1-4]: ');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', line => {
    const choice = line.trim().toLowerCase();
    rl.close();

    if (choice === '1' || choice === 'uk') {
      launchTarget(targetMap.get('uk'));
    } else if (choice === '2' || choice === 'usa' || choice === 'us') {
      launchTarget(targetMap.get('usa'));
    } else if (choice === '3' || choice === 'sync') {
      runSync('all');
      const rlPost = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      console.log('\nSync complete. Which store would you like to launch?');
      console.log('  [1] Scentspired UK');
      console.log('  [2] Scentspired USA');
      process.stdout.write('  Enter selection [1-2]: ');
      rlPost.on('line', linePost => {
        rlPost.close();
        const p = linePost.trim().toLowerCase();
        if (p === '2' || p === 'usa' || p === 'us') {
          launchTarget(targetMap.get('usa'));
        } else {
          launchTarget(targetMap.get('uk'));
        }
      });
    } else if (choice === '4' || choice === 'exit' || choice === 'q') {
      console.log('\nExiting runner. Goodbye!');
      process.exit(0);
    } else {
      console.log('\nDefaulting to Scentspired UK...');
      launchTarget(targetMap.get('uk'));
    }
  });
}

// Argument handling
const arg = (process.argv[2] || '').trim().toLowerCase();

if (arg === 'uk' || arg === '1') {
  launchTarget(targetMap.get('uk'));
} else if (arg === 'usa' || arg === 'us' || arg === '2') {
  launchTarget(targetMap.get('usa'));
} else if (arg === 'sync') {
  runSync('all');
} else if (arg === '--menu' || arg === 'menu') {
  showInteractiveMenu();
} else {
  // Check context if no argument provided
  const ukPath = targetMap.get('uk') ? targetMap.get('uk').path : '';
  const usaPath = targetMap.get('usa') ? targetMap.get('usa').path : '';

  if (path.resolve(currentCwd) === path.resolve(ukPath)) {
    // If user ran inside UK repo with no args
    console.log('ℹ️  Auto-detected Scentspired-UK workspace.');
    launchTarget(targetMap.get('uk'));
  } else if (path.resolve(currentCwd) === path.resolve(usaPath)) {
    // If user ran inside USA repo with no args
    console.log('ℹ️  Auto-detected Scentspired-USA workspace.');
    launchTarget(targetMap.get('usa'));
  } else {
    // Default to interactive menu from Theme or Dev root
    showInteractiveMenu();
  }
}
