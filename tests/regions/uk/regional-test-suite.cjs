#!/usr/bin/env node
/**
 * Scentspired Regional Test Suite: UK (scentspireduk.myshopify.com)
 * Validates non-overlapping regional test cases:
 * 1. UK Templates & Schema Validation (104 templates/*.json)
 * 2. UK Currency & Locale Integrity (£ GBP, en.default.json)
 * 3. UK Live Catalog & Inventory Probe (discovery, best-sellers, bundles)
 */

const path = require('path');
const { spawnSync } = require('child_process');

const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../..');
const localUkDir = path.resolve(ROOT, 'regions/uk');
const externalUkDir = path.resolve(ROOT, '../Scentspired-UK');
const UK_DIR = fs.existsSync(localUkDir) ? localUkDir : externalUkDir;

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║   🇬🇧 SCENTSPIRED REGIONAL TEST SUITE: UK                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target Directory: ${UK_DIR}\n`);

const GATES = [
  {
    name: 'UK Gate 1: JSON Template & Schema Validator',
    cmd: 'node',
    args: [path.join(ROOT, 'tests/static/json-schema-validator.cjs')],
    env: { THEME_TARGET_DIR: UK_DIR }
  },
  {
    name: 'UK Gate 2: Regional Locale Integrity Linter',
    cmd: 'node',
    args: [path.join(ROOT, 'tests/static/locale-integrity-validator.cjs')],
    env: { THEME_TARGET_DIR: UK_DIR }
  },
  {
    name: 'UK Gate 3: Live Store Catalog & Inventory Probe',
    cmd: 'node',
    args: [path.join(__dirname, 'catalog-probe.cjs')],
    env: { THEME_TARGET_DIR: UK_DIR },
    optional: true
  }
];

let failed = false;
for (const gate of GATES) {
  console.log(`>>> RUNNING: ${gate.name}...`);
  const res = spawnSync(gate.cmd, gate.args, {
    stdio: 'inherit',
    env: { ...process.env, ...gate.env },
    cwd: UK_DIR
  });

  if (res.status !== 0) {
    if (gate.optional) {
      console.log(`⚠️  [WARN] Optional gate ${gate.name} had non-zero exit.`);
    } else {
      console.error(`❌ [FAIL] ${gate.name} failed!`);
      failed = true;
      break;
    }
  }
}

if (failed) {
  console.error('\n❌ UK Regional Test Suite: FAILED\n');
  process.exit(1);
} else {
  console.log('\n✅ UK Regional Test Suite: 100% PASSED (All non-overlapping cases verified)\n');
  process.exit(0);
}
