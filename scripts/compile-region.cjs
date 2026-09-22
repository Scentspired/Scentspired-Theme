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

fs.mkdirSync(DIST_DIR, { recursive: true });

// Every path this build intends to produce, so stale files can be removed at the
// end. The output is synced rather than wiped and rebuilt: `shopify theme dev`
// watches this directory, and a mass delete makes it strip files from the
// development theme before they are rewritten.
const emitted = new Set();

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
      const next = fs.readFileSync(from);
      if (!fs.existsSync(to) || !fs.readFileSync(to).equals(next)) {
        fs.writeFileSync(to, next);
      }
      emitted.add(path.relative(DIST_DIR, to).replace(/\\/g, '/'));
      count++;
    }
  }
  return count;
}

function removeStale(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += removeStale(p);
      if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
      continue;
    }
    const rel = path.relative(DIST_DIR, p).replace(/\\/g, '/');
    if (rel === '.compilation-metadata.json' || emitted.has(rel)) continue;
    fs.unlinkSync(p);
    removed++;
  }
  return removed;
}

const stats = {};

console.log('>>> [1/5] Copying shared core...');
for (const dir of CORE_DIRS) {
  stats[dir] = copyTree(path.join(THEME_ROOT, dir), path.join(DIST_DIR, dir));
  console.log(`  + ${dir.padEnd(12)}: ${stats[dir]} files`);
}

console.log(`\n>>> [2/5] Overlaying ${target.toUpperCase()} data payload...`);
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

// Shopify's uploader rejects any template whose `sections` contains an id that
// is absent from `order`. Live storefronts accumulate these, and regions/**
// mirrors live byte for byte, so the prune happens here on the way out. The
// pruned sections were never rendered, so output is unchanged.
console.log('\n>>> [3/5] Pruning orphan sections for upload...');
let prunedSections = 0;
let prunedFiles = 0;

function pruneOrphans(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pruneOrphans(p);
      continue;
    }
    if (!p.endsWith('.json')) continue;

    const raw = fs.readFileSync(p, 'utf8');
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/\/\*[\s\S]*?\*\//g, ''));
    } catch {
      continue;
    }
    if (!Array.isArray(parsed.order) || !parsed.sections) continue;

    const order = new Set(parsed.order);
    const orphans = Object.keys(parsed.sections).filter(id => !order.has(id));
    if (orphans.length === 0) continue;

    for (const id of orphans) delete parsed.sections[id];
    fs.writeFileSync(p, JSON.stringify(parsed, null, 2) + '\n');
    prunedSections += orphans.length;
    prunedFiles++;
  }
}

pruneOrphans(path.join(DIST_DIR, 'templates'));
console.log(
  prunedSections > 0
    ? `  - pruned ${prunedSections} orphan section(s) across ${prunedFiles} template(s)`
    : '  (no orphan sections)'
);

const staleRemoved = removeStale(DIST_DIR);
if (staleRemoved > 0) console.log(`  - removed ${staleRemoved} stale file(s)`);

console.log('\n>>> [4/5] Writing compilation metadata...');
fs.writeFileSync(
  path.join(DIST_DIR, '.compilation-metadata.json'),
  JSON.stringify(
    {
      region: target,
      compiledAt: new Date().toISOString(),
      source: 'Scentspired-Theme',
      core: stats,
      overlaid,
      prunedOrphanSections: prunedSections,
    },
    null,
    2
  ) + '\n'
);
console.log('  + .compilation-metadata.json');

console.log('\n>>> [5/5] Validating compiled output...');
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
