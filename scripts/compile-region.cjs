#!/usr/bin/env node
/**
 * Scentspired Regional Theme Compiler
 * Compiles a completely standalone, deployable Shopify theme for a target region (e.g. UK)
 * into an isolated local directory (`dist/<region>`) inside Scentspired-Theme.
 * 
 * STRICT GUARANTEE:
 * Does NOT touch, modify, or sync to any external repositories (Scentspired-UK, Scentspired-USA).
 */

const fs = require('fs');
const path = require('path');

const THEME_ROOT = path.resolve(__dirname, '..');
const target = (process.argv[2] || 'uk').toLowerCase();
const DIST_DIR = path.join(THEME_ROOT, 'dist', target);

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log(`║   📦 COMPILING REGIONAL THEME: ${target.toUpperCase().padEnd(30)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Source Core:    ${THEME_ROOT}`);
console.log(`  Regional Base:  ${path.join(THEME_ROOT, 'regions', target)}`);
console.log(`  Output Dist:    ${DIST_DIR}`);
console.log('  Safety Policy:  100% Isolated (Zero modifications to external repos)\n');

const regionDir = path.join(THEME_ROOT, 'regions', target);
if (!fs.existsSync(regionDir)) {
  console.error(`❌ Regional definition not found: ${regionDir}`);
  process.exit(1);
}

// Ensure clean dist directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

function copyRecursive(src, dest, filterFn = null) {
  if (!fs.existsSync(src)) return 0;
  let count = 0;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      count += copyRecursive(path.join(src, item), path.join(dest, item), filterFn);
    }
  } else {
    if (!filterFn || filterFn(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      count++;
    }
  }
  return count;
}

const stats = {};

// 1. Copy Core theme directories (including unified templates)
const coreDirs = ['assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
console.log('>>> [1/3] Copying Unified Core Architecture...');
for (const dir of coreDirs) {
  const src = path.join(THEME_ROOT, dir);
  const dest = path.join(DIST_DIR, dir);
  const copied = copyRecursive(src, dest);
  stats[dir] = (stats[dir] || 0) + copied;
  console.log(`  + ${dir.padEnd(12)}: ${copied} files`);
}

// 2. Apply Regional Links Configuration
console.log(`\n>>> [2/3] Applying Regional Package (${target.toUpperCase()})...`);
const regLinks = path.join(regionDir, 'regional-links.json');
if (fs.existsSync(regLinks)) {
  fs.copyFileSync(regLinks, path.join(DIST_DIR, 'config', 'regional-links.json'));
  stats['regional_links'] = 1;
  console.log(`  + config/regional-links.json: applied`);
}

// 3. Write Compilation Metadata
const meta = {
  region: target,
  compiledAt: new Date().toISOString(),
  source: 'Scentspired-Theme',
  targetDist: DIST_DIR,
  fileStats: stats
};
fs.writeFileSync(path.join(DIST_DIR, '.compilation-metadata.json'), JSON.stringify(meta, null, 2));

console.log('\n>>> [3/4] Theme Assembled!');
console.log('──────────────────────────────────────────────────────────────────');
console.log(`  Target Output:   ${DIST_DIR}`);
console.log(`  Total Sections:  ${stats.sections || 0}`);
console.log(`  Total Snippets:  ${stats.snippets || 0}`);
console.log(`  Total Templates: ${stats.templates || 0}`);
console.log(`  Total Assets:    ${stats.assets || 0}`);
console.log('──────────────────────────────────────────────────────────────────\n');

// 4. Run Automated Quality Gates on the Compiled Output
console.log('>>> [4/4] Hunting Schema & Range Step Issues in Compiled Theme...');
const { spawnSync } = require('child_process');
const valScript = path.join(THEME_ROOT, 'tests/static/json-schema-validator.cjs');
const valResult = spawnSync('node', [valScript], {
  stdio: 'inherit',
  env: { ...process.env, THEME_TARGET_DIR: DIST_DIR },
  cwd: THEME_ROOT
});

if (valResult.status !== 0) {
  console.error('\n❌ Compilation Quality Gate FAILED: Schema or range errors detected in output.\n');
  process.exit(1);
} else {
  console.log('\n✅ 100% Validated: Compiled theme is ready for dev / deployment.\n');
}

