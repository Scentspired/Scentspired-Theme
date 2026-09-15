#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED LOCAL STOREFRONT INTERACTIVE RUNNER
 * ============================================================================
 * Allows instant selection and launching of regional stores (UK / USA)
 * directly from the central Scentspired-Theme or regional workspace.
 * ============================================================================
 */

const readline = require('readline');
const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Detect workspace roots
const cwd = process.cwd();
let baseDir = cwd;

// If inside Scentspired-Theme or a regional repo, resolve dev root
if (fs.existsSync(path.join(cwd, '..', 'Scentspired-UK'))) {
  baseDir = path.resolve(cwd, '..');
} else if (fs.existsSync(path.join(cwd, 'Scentspired-UK'))) {
  baseDir = cwd;
}

const themeDir = path.join(baseDir, 'Scentspired-Theme');
const ukDir = path.join(baseDir, 'Scentspired-UK');
const usaDir = path.join(baseDir, 'Scentspired-USA');

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function renderMenu() {
  console.log('==================================================================');
  console.log('  🌿 SCENTSPIRED LOCAL STOREFRONT RUNNER');
  console.log('==================================================================');
  console.log('  Select a regional website to launch in local dev preview:');
  console.log('');
  console.log('  [1] 🇬🇧  Scentspired UK  (scentspireduk.myshopify.com)');
  console.log('  [2] 🇺🇸  Scentspired USA (scentspired.myshopify.com)');
  console.log('  [3] 🔄  Sync Core Theme to Regional Stores, then Launch');
  console.log('  [4] 🚪  Exit');
  console.log('==================================================================');
  process.stdout.write('  Enter selection [1-4]: ');
}

function runSync(target = 'all') {
  console.log('\n>>> Synchronizing latest theme changes to regional directories...');
  const syncScript = path.join(themeDir, 'engine', 'sync-regions.cjs');
  if (!fs.existsSync(syncScript)) {
    console.warn('⚠️  Sync script not found at:', syncScript);
    return;
  }
  const flag = target === 'all' ? '' : `--target=${target}`;
  execSync(`node "${syncScript}" ${flag}`, { stdio: 'inherit', cwd: themeDir });
}

function launchStore(region) {
  let storeDomain = '';
  let targetDir = '';

  if (region === 'uk') {
    storeDomain = 'scentspireduk.myshopify.com';
    targetDir = ukDir;
    console.log('\n==================================================================');
    console.log('  🇬🇧  LAUNCHING SCENTSPIRED UK LOCAL STOREFRONT');
    console.log('  Store:   scentspireduk.myshopify.com');
    console.log('  Folder:  ' + targetDir);
    console.log('  Local:   http://127.0.0.1:9292');
    console.log('==================================================================\n');
  } else if (region === 'usa') {
    storeDomain = 'scentspired.myshopify.com';
    targetDir = usaDir;
    console.log('\n==================================================================');
    console.log('  🇺🇸  LAUNCHING SCENTSPIRED USA LOCAL STOREFRONT');
    console.log('  Store:   scentspired.myshopify.com');
    console.log('  Folder:  ' + targetDir);
    console.log('  Local:   http://127.0.0.1:9292');
    console.log('==================================================================\n');
  }

  // Check if target dir exists
  if (!fs.existsSync(targetDir)) {
    console.error(`❌ Error: Regional repository directory not found: ${targetDir}`);
    process.exit(1);
  }

  // Launch Shopify Theme Dev via npx
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npx.cmd' : 'npx';
  const args = ['shopify', 'theme', 'dev', `--store=${storeDomain}`, '--open'];

  const child = spawn(cmd, args, {
    cwd: targetDir,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', err => {
    console.error('❌ Failed to start Shopify CLI:', err.message);
  });

  child.on('exit', code => {
    console.log(`\nTheme dev server stopped with code ${code}.`);
    process.exit(code || 0);
  });
}

const directArg = process.argv[2];
if (directArg === 'uk' || directArg === '1') {
  launchStore('uk');
} else if (directArg === 'usa' || directArg === 'us' || directArg === '2') {
  launchStore('usa');
} else {
  renderMenu();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', line => {
    const choice = line.trim().toLowerCase();
    rl.close();

    switch (choice) {
      case '1':
      case 'uk':
        launchStore('uk');
        break;
      case '2':
      case 'usa':
      case 'us':
        launchStore('usa');
        break;
      case '3':
      case 'sync':
        runSync('all');
        // prompt again after sync
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
            launchStore('usa');
          } else {
            launchStore('uk');
          }
        });
        break;
      case '4':
      case 'exit':
      case 'q':
        console.log('\nExiting runner. Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('\nInvalid selection. Defaulting to Scentspired UK...');
        launchStore('uk');
        break;
    }
  });
}
