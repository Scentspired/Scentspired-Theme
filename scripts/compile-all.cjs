#!/usr/bin/env node
/**
 * Compiles every region found under regions/.
 *
 * Discovery is dynamic on purpose: onboarding a storefront means adding
 * regions/<id>/region.json and nothing else. No script, npm alias or CI entry
 * needs editing, which is what keeps the cost of region #101 the same as #4.
 */

const path = require('path');
const { spawnSync } = require('child_process');
const { listRegions } = require('./region-engine.cjs');

const regions = listRegions();

if (regions.length === 0) {
  console.error('❌ No regions found under regions/ (expected regions/<id>/region.json)');
  process.exit(1);
}

console.log(`\n🌍 Compiling ${regions.length} region(s): ${regions.join(', ')}\n`);

const failed = [];
for (const id of regions) {
  const result = spawnSync('node', [path.join(__dirname, 'compile-region.cjs'), id], {
    stdio: 'inherit',
  });
  if (result.status !== 0) failed.push(id);
}

console.log('==================================================================');
if (failed.length === 0) {
  console.log(`   ✅ All ${regions.length} region(s) compiled and validated.`);
} else {
  console.log(`   ❌ Failed: ${failed.join(', ')}`);
}
console.log('==================================================================\n');

process.exit(failed.length > 0 ? 1 : 0);
