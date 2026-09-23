#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--region-literals catches what it claims
 * ============================================================================
 *
 * A green check is not evidence until it has been seen red. This builds a
 * throwaway theme containing one known violation per rule, runs the guard
 * against it, and asserts the guard fails and names the right rule. It then
 * runs the guard against a clean theme and asserts it passes.
 *
 * Nothing here touches the real theme: every file is written under the OS temp
 * directory and removed afterwards.
 *
 *   node tests/static/guard--region-literals.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--region-literals.cjs');
const POUND = '£';

// Each case: what we plant, and the rule id that must catch it.
const CASES = [
  {
    rule: 'R1',
    name: 'identity domain',
    file: 'sections/fixture-domain.liquid',
    body: '<a href="https://scentspired.co.uk">home</a>\n',
  },
  {
    rule: 'R1c',
    name: 'CDN asset URL',
    file: 'sections/fixture-cdn.liquid',
    body: '<img src="https://scentspired.com/cdn/shop/files/x.png">\n',
  },
  {
    rule: 'R2',
    name: 'currency symbol concatenated onto a price',
    file: 'assets/fixture-currency.js',
    body: 'const label = `' + POUND + '${total.toFixed(2)}`;\n',
  },
  {
    rule: 'R2',
    name: 'currency symbol concatenated onto a price (string form)',
    file: 'assets/fixture-currency-concat.js',
    body: "const label = '$' + amount;\n",
  },
  {
    rule: 'R3',
    name: 'hardcoded hreflang',
    file: 'snippets/fixture-hreflang.liquid',
    body: '<link rel="alternate" hreflang="en-gb" href="/">\n',
  },
];

// A literal that must NOT trip the guard: schema blocks cannot hold Liquid.
const SCHEMA_EXEMPT = {
  file: 'sections/fixture-schema.liquid',
  body:
    '<div>clean</div>\n{% schema %}\n' +
    '{ "name": "x", "presets": [{ "name": "x", "settings": { "c": "mail@scentspired.com" } }] }\n' +
    '{% endschema %}\n',
};

function makeTheme(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-fixture-'));
  for (const [rel, body] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, body);
  }
  return dir;
}

function runGuard(dir) {
  const r = spawnSync('node', [GUARD, '--list'], {
    env: { ...process.env, THEME_TARGET_DIR: dir },
    encoding: 'utf8',
  });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   FIXTURE — guard--region-literals must fail on planted bugs ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let failures = 0;
const dirs = [];

// 1. Each planted violation must be caught, on its own.
for (const c of CASES) {
  const dir = makeTheme({ [c.file]: c.body });
  dirs.push(dir);
  const { status, out } = runGuard(dir);

  const caught = status === 1 && out.includes(c.file) && out.includes(`(${c.rule} `);
  console.log(`  ${caught ? '✓' : '✗'} ${c.rule.padEnd(4)} ${c.name}`);
  if (!caught) {
    failures++;
    console.log(`      expected exit 1 naming ${c.file} and rule ${c.rule}; got exit ${status}`);
    console.log(out.split('\n').map((l) => '      ' + l).join('\n'));
  }
}

// 2. A literal inside {% schema %} must NOT be reported — it cannot hold Liquid.
{
  const dir = makeTheme({ [SCHEMA_EXEMPT.file]: SCHEMA_EXEMPT.body });
  dirs.push(dir);
  const { status, out } = runGuard(dir);
  const ok = status === 0;
  console.log(`  ${ok ? '✓' : '✗'} exempt  literal inside {% schema %} is not reported`);
  if (!ok) {
    failures++;
    console.log(out.split('\n').map((l) => '      ' + l).join('\n'));
  }
}

// 3. A clean theme must pass.
{
  const dir = makeTheme({
    'sections/fixture-clean.liquid':
      "{% render 'region--active', key: 'home_url' %}\n<div>clean</div>\n",
  });
  dirs.push(dir);
  const { status } = runGuard(dir);
  const ok = status === 0;
  console.log(`  ${ok ? '✓' : '✗'} clean   a theme with no literals passes`);
  if (!ok) failures++;
}

for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });

console.log('');
if (failures > 0) {
  console.log(`  ❌ ${failures} fixture assertion(s) failed — the guard does not catch what it claims.\n`);
  process.exit(1);
}
console.log('  ✅ Guard verified: fails on every planted violation, passes when clean.\n');
process.exit(0);
