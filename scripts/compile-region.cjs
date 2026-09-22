#!/usr/bin/env node
/**
 * Scentspired Regional Theme Compiler
 *
 * Assembles a standalone, deployable Shopify theme for one region into
 * dist/<region>, by overlaying that region's data payload on top of the
 * shared core.
 *
 *   core (shared code)  +  regions/<id> (pure data)  =  dist/<id>
 *
 * Never reads from or writes to the live regional repositories.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { assertCwdNotLocked } = require('./guard-live-repos.cjs');

assertCwdNotLocked();

const THEME_ROOT = path.resolve(__dirname, '..');
const target = (process.argv[2] || 'uk').toLowerCase();
const DIST_DIR = path.join(THEME_ROOT, 'dist', target);
const REGION_DIR = path.join(THEME_ROOT, 'regions', target);

// Core theme directories shared by every region.
const CORE_DIRS = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];

// Region payload directories overlaid on top of the core, in this order.
const OVERLAY_DIRS = ['templates', 'locales', 'config', 'snippets'];

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   📦 COMPILING REGIONAL THEME: ${target.toUpperCase().padEnd(30)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Core:    ${THEME_ROOT}`);
console.log(`  Region:  ${REGION_DIR}`);
console.log(`  Output:  ${DIST_DIR}\n`);

if (!fs.existsSync(REGION_DIR)) {
  console.error(`❌ Regional definition not found: ${REGION_DIR}`);
  process.exit(1);
}

fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

function copyTree(src, dest) {
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyTree(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      count++;
    }
  }
  return count;
}

const stats = {};

console.log('>>> [1/4] Copying shared core...');
for (const dir of CORE_DIRS) {
  stats[dir] = copyTree(path.join(THEME_ROOT, dir), path.join(DIST_DIR, dir));
  console.log(`  + ${dir.padEnd(12)}: ${stats[dir]} files`);
}

console.log(`\n>>> [2/4] Overlaying ${target.toUpperCase()} data payload...`);
const overlaid = {};
for (const dir of OVERLAY_DIRS) {
  const n = copyTree(path.join(REGION_DIR, dir), path.join(DIST_DIR, dir));
  if (n > 0) {
    overlaid[dir] = n;
    console.log(`  ~ ${dir.padEnd(12)}: ${n} files overridden`);
  }
}
if (Object.keys(overlaid).length === 0) {
  console.log('  (no regional overrides present)');
}

console.log('\n>>> [3/4] Writing compilation metadata...');
fs.writeFileSync(
  path.join(DIST_DIR, '.compilation-metadata.json'),
  JSON.stringify(
    {
      region: target,
      compiledAt: new Date().toISOString(),
      source: 'Scentspired-Theme',
      core: stats,
      overlaid,
    },
    null,
    2
  ) + '\n'
);
console.log('  + .compilation-metadata.json');

console.log('\n>>> [4/4] Validating compiled output...');
const result = spawnSync('node', [path.join(THEME_ROOT, 'tests/static/json-schema-validator.cjs')], {
  stdio: 'inherit',
  env: { ...process.env, THEME_TARGET_DIR: DIST_DIR, SCENTSPIRED_MIRROR_SOURCE: '1' },
  cwd: THEME_ROOT,
});

if (result.status !== 0) {
  console.error(`\n❌ Compilation gate FAILED for ${target.toUpperCase()}.\n`);
  process.exit(1);
}

console.log(`\n✅ dist/${target} compiled and validated.\n`);
