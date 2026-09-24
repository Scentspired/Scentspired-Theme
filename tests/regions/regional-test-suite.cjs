#!/usr/bin/env node
/**
 * Scentspired Regional Test Suite — one suite for every region.
 *
 *   node tests/regions/regional-test-suite.cjs <region-id>
 *
 * Everything region-specific comes from regions/<id>/region.json, so a new
 * region is tested the moment its folder exists. This replaces three copies
 * (tests/regions/uk|usa|uae) that differed only in their labels — and two of
 * which tested the repository root instead of the region's compiled theme, so
 * `npm run test:usa` had never looked at dist/usa.
 *
 * Gates, all against dist/<id> (compiled first if absent):
 *   1. JSON template & schema validation
 *   2. Locale integrity — every translation key shared code renders exists
 *   3. Live catalog probe against the region's store (optional; read-only GET)
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { readRegionFile, listRegions } = require('../../scripts/region-engine.cjs');

const ROOT = path.resolve(__dirname, '../..');
const id = (process.argv[2] || '').toLowerCase();
const region = id ? readRegionFile(id) : null;

if (!region) {
  console.error(`\n  ✗ Unknown region "${id}". Known: ${listRegions().join(', ')}\n`);
  process.exit(1);
}

const TARGET = path.join(ROOT, 'dist', id);
const label = `${region.name || id} (${id})`;

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log(`║   REGIONAL TEST SUITE: ${label.padEnd(38)}║`);
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target: ${path.relative(ROOT, TARGET)}   Store: ${region.myshopify_domain || '(none declared)'}\n`);

if (!fs.existsSync(TARGET)) {
  console.log(`>>> dist/${id} is absent — compiling it first...`);
  const c = spawnSync('node', [path.join(ROOT, 'scripts/compile-region.cjs'), id], { stdio: 'inherit' });
  if (c.status !== 0) process.exit(c.status || 1);
}

const env = { ...process.env, THEME_TARGET_DIR: TARGET };

const GATES = [
  {
    name: 'Gate 1: JSON Template & Schema Validator',
    args: [path.join(ROOT, 'tests/static/json-schema-validator.cjs')],
    // Region templates mirror live storefronts, which carry legacy shapes the
    // validator tolerates only in mirrored source; the compiler sets the same.
    env: { ...env, SCENTSPIRED_MIRROR_SOURCE: '1' },
  },
  {
    name: 'Gate 2: Locale Integrity',
    args: [path.join(ROOT, 'tests/static/locale-integrity-validator.cjs')],
    env,
  },
  {
    name: 'Gate 3: Live Catalog & Inventory Probe',
    args: [path.join(__dirname, 'catalog-probe.cjs'), id],
    env,
    optional: true,
    skip: !region.myshopify_domain && 'region declares no myshopify_domain',
  },
];

let failed = false;
for (const gate of GATES) {
  if (gate.skip) {
    console.log(`>>> SKIPPED: ${gate.name} — ${gate.skip}`);
    continue;
  }
  console.log(`>>> RUNNING: ${gate.name}...`);
  const res = spawnSync('node', gate.args, { stdio: 'inherit', env: gate.env, cwd: ROOT });
  if (res.status === 0) continue;
  if (gate.optional) {
    console.log(`⚠️  [WARN] Optional gate "${gate.name}" had a non-zero exit.`);
    continue;
  }
  console.error(`❌ [FAIL] ${gate.name} failed.`);
  failed = true;
  break;
}

console.log(failed ? `\n❌ ${label}: FAILED\n` : `\n✅ ${label}: PASSED\n`);
process.exit(failed ? 1 : 0);
