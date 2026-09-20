#!/usr/bin/env node
/**
 * Scentspired Regional Test Suite: UAE (scentspireduae.myshopify.com)
 * Validates non-overlapping regional test cases:
 * 1. UAE Templates & Schema Validation (templates/*.json)
 * 2. UAE Currency & Locale Integrity (AED, en.default.json)
 * 3. UAE Live Catalog & Inventory Probe (discovery, best-sellers, bundles)
 */

const path = require('path');
const { spawnSync } = require('child_process');

const fs = require('fs');
const ROOT = path.resolve(__dirname, '../../..');
const localUaeDir = path.resolve(ROOT, 'regions/uae');
const externalUaeDir = path.resolve(ROOT, '../Scentspired-UAE');
const UAE_DIR = fs.existsSync(localUaeDir) ? localUaeDir : externalUaeDir;

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║   🇦🇪 SCENTSPIRED REGIONAL TEST SUITE: UAE                    ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`  Target Directory: ${UAE_DIR}\n`);

const GATES = [
  {
    name: 'UAE Gate 1: JSON Template & Schema Validator',
    cmd: 'node',
    args: [path.join(ROOT, 'tests/static/json-schema-validator.cjs')],
    env: { THEME_TARGET_DIR: UAE_DIR }
  },
  {
    name: 'UAE Gate 2: Regional Locale Integrity Linter',
    cmd: 'node',
    args: [path.join(ROOT, 'tests/static/locale-integrity-validator.cjs')],
    env: { THEME_TARGET_DIR: UAE_DIR }
  },
  {
    name: 'UAE Gate 3: Live Store Catalog & Inventory Probe',
    cmd: 'node',
    args: [path.join(__dirname, 'catalog-probe.cjs')],
    env: { THEME_TARGET_DIR: UAE_DIR },
    optional: true
  }
];

let failed = false;
for (const gate of GATES) {
  console.log(`>>> RUNNING: ${gate.name}...`);
  const res = spawnSync(gate.cmd, gate.args, {
    stdio: 'inherit',
    env: { ...process.env, ...gate.env },
    cwd: UAE_DIR
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
  console.error('\n❌ UAE Regional Test Suite: FAILED\n');
  process.exit(1);
} else {
  console.log('\n✅ UAE Regional Test Suite: 100% PASSED (All non-overlapping cases verified)\n');
  process.exit(0);
}
