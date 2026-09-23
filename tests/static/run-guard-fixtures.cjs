#!/usr/bin/env node

/**
 * ============================================================================
 * SCENTSPIRED THEME GUARDIAN — Guard Fixture Runner
 * ============================================================================
 *
 * Runs every *.fixture.cjs beside this file.
 *
 * A guard that returns zero is only evidence once it has been seen to return
 * one. Twice on this project a check passed for the wrong reason — an audit
 * that reported 8 unguarded image_url usages, then 74, when the real number
 * was 1 — so the fixtures are part of the gate rather than something run by
 * hand and forgotten.
 *
 * Adding a guard means adding its fixture; this picks it up with no wiring.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DIR = __dirname;

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   SCENTSPIRED THEME GUARDIAN — Guard Fixtures                ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const fixtures = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.fixture.cjs'))
  .sort();

if (fixtures.length === 0) {
  console.log('  ❌ No guard fixtures found. A guard without one is unverified.\n');
  process.exit(1);
}

let failed = 0;
for (const f of fixtures) {
  const r = spawnSync('node', [path.join(DIR, f)], { encoding: 'utf8' });
  const ok = r.status === 0;
  console.log(`  ${ok ? '✅' : '❌'} ${f}`);
  if (!ok) {
    failed++;
    console.log((r.stdout || '').split('\n').map((l) => '     ' + l).join('\n'));
    console.log((r.stderr || '').split('\n').map((l) => '     ' + l).join('\n'));
  }
}

console.log('');
if (failed > 0) {
  console.log(`  ❌ ${failed} of ${fixtures.length} guard fixture(s) failed.\n`);
  process.exit(1);
}
console.log(`  ✅ All ${fixtures.length} guard fixtures pass — each guard has been seen red and green.\n`);
process.exit(0);
