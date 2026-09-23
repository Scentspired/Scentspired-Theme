#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--headings catches what it claims
 * ============================================================================
 *
 * The guard reads the captured parity pages, so this plants a throwaway page
 * directory, points the guard at it, and asserts it fails on each defect and
 * passes on a well-formed page.
 *
 *   node tests/static/guard--headings.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--headings.cjs');

const CASES = [
  {
    name: 'two H1s on one page',
    shouldFail: true,
    html: '<h1>Real heading</h1><p>x</p><h1>Second heading</h1>',
  },
  {
    name: 'no H1 at all',
    shouldFail: true,
    html: '<h2>Only a section heading</h2>',
  },
  {
    name: 'interface label as an h2',
    shouldFail: true,
    html: '<h1>Real heading</h1><h2>YOUR CART</h2>',
  },
  {
    name: 'interface label as an h3',
    shouldFail: true,
    html: '<h1>Real heading</h1><h3>Menu</h3>',
  },
  {
    name: 'label with surrounding markup and whitespace still matched',
    shouldFail: true,
    html: '<h1>Real heading</h1><h2 class="x">\n  <span>Recent Searches</span>\n</h2>',
  },
  {
    name: 'one H1, no labels as headings',
    shouldFail: false,
    html: '<h1>Real heading</h1><h2>A section</h2><div class="ui-label">YOUR CART</div>',
  },
  {
    name: 'an H1 that happens to read like a label is allowed',
    shouldFail: false,
    html: '<h1>ORDER SUMMARY</h1><h2>A section</h2>',
  },
];

function run(html) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'headings-fixture-'));
  const pages = path.join(dir, 'tests', 'parity', 'baseline');
  fs.mkdirSync(pages, { recursive: true });
  fs.writeFileSync(path.join(pages, 'fixture.html'), html);

  // The guard resolves its page directory from its own location, so it is
  // copied into the throwaway tree alongside an empty baseline.
  const staticDir = path.join(dir, 'tests', 'static');
  fs.mkdirSync(staticDir, { recursive: true });
  fs.copyFileSync(GUARD, path.join(staticDir, 'guard--headings.cjs'));
  fs.writeFileSync(path.join(staticDir, 'baseline-headings.json'), '{"accepted":{}}\n');

  const r = spawnSync('node', [path.join(staticDir, 'guard--headings.cjs')], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   FIXTURE — guard--headings red/green verification           ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let failures = 0;
for (const c of CASES) {
  const { status, out } = run(c.html);
  const failed = status === 1;
  const ok = failed === c.shouldFail;
  console.log(`  ${ok ? '✓' : '✗'} ${c.shouldFail ? 'flags  ' : 'allows '} ${c.name}`);
  if (!ok) {
    failures++;
    console.log(`      expected ${c.shouldFail ? 'exit 1' : 'exit 0'}, got ${status}`);
    console.log(out.split('\n').map((l) => '      ' + l).join('\n'));
  }
}

console.log('');
if (failures > 0) {
  console.log(`  ❌ ${failures} fixture assertion(s) failed.\n`);
  process.exit(1);
}
console.log('  ✅ Guard verified: fails on every planted defect, passes when the outline is sound.\n');
process.exit(0);
