#!/usr/bin/env node

/**
 * ============================================================================
 * FIXTURE — proves guard--image-url catches what it claims
 * ============================================================================
 *
 * The guard reports zero unguarded usages across 73 real ones, which is only
 * believable if it has been seen to fail. This plants each shape of unguarded
 * usage and asserts the guard reports it, then plants each shape of legitimate
 * guard and asserts it does NOT — a guard that flags correct code gets
 * switched off, so the false-positive half matters as much.
 *
 * Everything is written under the OS temp directory and removed afterwards.
 *
 *   node tests/static/guard--image-url.fixture.cjs
 * ============================================================================
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const GUARD = path.join(__dirname, 'guard--image-url.cjs');

const MUST_FLAG = [
  {
    name: 'bare usage in markup',
    body: '<img src="{{ section.settings.hero | image_url: width: 100 }}">\n',
  },
  {
    name: 'inside an unrelated conditional',
    body:
      '{% if section.settings.show_banner %}\n' +
      '  <img src="{{ section.settings.hero | image_url: width: 100 }}">\n' +
      '{% endif %}\n',
  },
  {
    name: 'after a closed guard for the same setting',
    body:
      '{% if section.settings.hero %}<span>ok</span>{% endif %}\n' +
      '<img src="{{ section.settings.hero | image_url: width: 100 }}">\n',
  },
  {
    name: 'block setting, bare',
    body: '<img src="{{ block.settings.icon | image_url: width: 40 }}">\n',
  },
];

const MUST_NOT_FLAG = [
  {
    name: 'wrapped in {% if setting %}',
    body:
      '{% if section.settings.hero %}\n' +
      '  <img src="{{ section.settings.hero | image_url: width: 100 }}">\n' +
      '{% endif %}\n',
  },
  {
    name: 'wrapped in {% unless setting == blank %}',
    body:
      '{% unless section.settings.hero == blank %}\n' +
      '  <img src="{{ section.settings.hero | image_url: width: 100 }}">\n' +
      '{% endunless %}\n',
  },
  {
    name: 'an {% elsif setting %} branch',
    body:
      '{% if section.settings.video %}\n' +
      '  <video></video>\n' +
      '{% elsif section.settings.hero %}\n' +
      '  <img src="{{ section.settings.hero | image_url: width: 100 }}">\n' +
      '{% endif %}\n',
  },
  {
    name: 'a | default: fallback on the same line',
    body:
      '<img src="{{ section.settings.hero | default: settings.logo | image_url: width: 100 }}">\n',
  },
  {
    name: 'commented-out usage',
    body:
      '{% comment %}\n' +
      '<img src="{{ section.settings.hero | image_url: width: 100 }}">\n' +
      '{% endcomment %}\n',
  },
];

function makeTheme(rel, body) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'imgurl-fixture-'));
  const full = path.join(dir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body);
  return dir;
}

function runGuard(dir) {
  const r = spawnSync('node', [GUARD, '--root=' + dir, '--list'], { encoding: 'utf8' });
  return { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   FIXTURE — guard--image-url red/green verification          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

let failures = 0;
const dirs = [];

console.log('  Must be flagged:');
for (const c of MUST_FLAG) {
  const dir = makeTheme('sections/fixture.liquid', c.body);
  dirs.push(dir);
  const { status } = runGuard(dir);
  const ok = status === 1;
  console.log(`    ${ok ? '✓' : '✗'} ${c.name}`);
  if (!ok) {
    failures++;
    console.log('        expected exit 1, got ' + status);
  }
}

console.log('\n  Must NOT be flagged:');
for (const c of MUST_NOT_FLAG) {
  const dir = makeTheme('sections/fixture.liquid', c.body);
  dirs.push(dir);
  const { status, out } = runGuard(dir);
  const ok = status === 0;
  console.log(`    ${ok ? '✓' : '✗'} ${c.name}`);
  if (!ok) {
    failures++;
    console.log(out.split('\n').map((l) => '        ' + l).join('\n'));
  }
}

for (const d of dirs) fs.rmSync(d, { recursive: true, force: true });

console.log('');
if (failures > 0) {
  console.log(`  ❌ ${failures} fixture assertion(s) failed.\n`);
  process.exit(1);
}
console.log('  ✅ Guard verified: flags every unguarded shape, allows every guarded one.\n');
process.exit(0);
